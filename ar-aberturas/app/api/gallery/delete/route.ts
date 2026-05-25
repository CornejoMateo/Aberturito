import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const categoryState = searchParams.get('categoryState')!;
		const code_name = searchParams.get('code_name')!;
		const line_name = searchParams.get('line_name')!;
		let material_type = '';
		let imagePath: string | null = null;
		if (categoryState !== 'Perfiles') {
			if (!code_name) {
				return NextResponse.json(
					{ success: false, error: 'Código no completado' },
					{ status: 400 }
				);
			}
		} else {
			material_type = searchParams.get('material_type')!;
			if (!code_name || !line_name) {
				return NextResponse.json(
					{ success: false, error: 'Faltan parámetros: código o linea' },
					{ status: 400 }
				);
			}
		}

		const supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.SUPABASE_SERVICE_ROLE_KEY!
		);

		let table = '';
		if (categoryState === 'Accesorios') {
			table = 'accesories_category';
		}
		if (categoryState === 'Herrajes') {
			table = 'ironworks_category';
		}
		if (categoryState === 'Perfiles') {
			table = 'profiles';
		}
		if (categoryState === 'Insumos') {
			table = 'supplies_category';
		}

		let rows: Array<{ id: string; image_path: string | null }> = [];
		let ids: string[] = [];

		if (categoryState === 'Perfiles') {
			const [
				{ data: galleryRows, error: galleryError },
				{ data: profileRows, error: profileError },
			] = await Promise.all([
				supabase
					.from('gallery_profiles')
					.select('id, image_path')
					.eq('line', line_name)
					.eq('code', code_name)
					.eq('material_type', material_type),
				supabase
					.from(table)
					.select('id')
					.eq('line', line_name)
					.eq('code', code_name)
					.eq('material', material_type),
			]);

			if (galleryError) throw galleryError;
			if (profileError) throw profileError;

			rows = galleryRows ?? [];
			ids = (profileRows ?? []).map((row) => row.id);
			imagePath = rows[0]?.image_path ?? null;

			const { error: deleteGalleryError } = await supabase
				.from('gallery_profiles')
				.delete()
				.eq('line', line_name)
				.eq('code', code_name)
				.eq('material_type', material_type);

			if (deleteGalleryError) throw deleteGalleryError;

			if (ids.length > 0) {
				const { error: updateError } = await supabase
					.from(table)
					.update({ image_id: null })
					.in('id', ids);

				if (updateError) {
					return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
				}
			}
		} else {
			const query = supabase.from(table).select('id, image_path');

			if (categoryState === 'Accesorios') {
				query.eq('accessory_code', code_name);
			} else if (categoryState === 'Herrajes') {
				query.eq('ironwork_code', code_name);
			} else if (categoryState === 'Insumos') {
				query.eq('supply_code', code_name);
			}

			const { data: fetchedRows, error } = await query;

			if (error) throw error;

			if (!fetchedRows || fetchedRows.length === 0) {
				return NextResponse.json({ success: true });
			}

			rows = fetchedRows;
			imagePath = rows[0].image_path;
			ids = rows.map((row) => row.id);

			const { error: updateError } = await supabase
				.from(table)
				.update({ image_url: null, image_path: null })
				.in('id', ids);

			if (updateError) {
				return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
			}
		}

		if (imagePath) {
			const { error: bucketError } = await supabase.storage.from('images').remove([imagePath]);
			if (bucketError) {
				return NextResponse.json({ success: false, error: bucketError.message }, { status: 500 });
			}
		}

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error('Error deleting option:', error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
