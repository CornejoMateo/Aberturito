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
		let tableImages = 'gallery_stock';
		let columnCode = '';
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
			columnCode = 'accessory_code';
		}
		if (categoryState === 'Herrajes') {
			table = 'ironworks_category';
			columnCode = 'ironwork_code';
		}
		if (categoryState === 'Perfiles') {
			table = 'profiles';
			tableImages = 'gallery_profiles';
		}
		if (categoryState === 'Insumos') {
			table = 'supplies_category';
			columnCode = 'supply_code';
		}

		let rows: Array<{ id: string; image_path: string | null }> = [];
		let ids: string[] = [];

		if (categoryState === 'Perfiles') {
			const [
				{ data: galleryRows, error: galleryError },
				{ data: profileRows, error: profileError },
			] = await Promise.all([
				supabase
					.from(tableImages)
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
			const [{ data: galleryRows, error: galleryError }, { data: stockRows, error: stockError }] =
				await Promise.all([
					supabase
						.from(tableImages)
						.select('id, image_path')
						.eq('category', categoryState)
						.eq('code', code_name),
					supabase.from(table).select('id').eq(columnCode, code_name),
				]);

			if (galleryError) throw galleryError;
			if (stockError) throw stockError;

			rows = galleryRows ?? [];
			ids = (stockRows ?? []).map((row) => row.id);
			imagePath = rows[0]?.image_path ?? null;

			const { error: deleteGalleryError } = await supabase
				.from(tableImages)
				.delete()
				.eq('code', code_name)
				.eq('category', categoryState);

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
