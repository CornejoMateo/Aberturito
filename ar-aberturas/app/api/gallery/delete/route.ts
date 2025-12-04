import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const categoryState = searchParams.get('categoryState')!;
		const code_name = searchParams.get('code_name')!;
		const line_name = searchParams.get('line_name')!;
		let material_type = '';
		let name_category = '';
		let name_brand = '';
		if (categoryState !== 'Perfiles') {
			name_category = searchParams.get('name_category')!;
			name_brand = searchParams.get('name_brand')!;

			if (!code_name || !line_name || !name_category || !name_brand) {
				return NextResponse.json(
					{ success: false, error: 'Faltan parámetros: categoría, código, linea o marca' },
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

		const query = supabase.from(table).select("id, image_path");

		if (categoryState === "Perfiles") {
		query
			.eq("line", line_name)
			.eq("code", code_name)
			.eq("material", material_type);
		} else if (categoryState === "Accesorios") {
			query
				.eq("accessory_category", name_category)
				.eq("accessory_brand", name_brand)
				.eq("accessory_line", line_name)
				.eq("accessory_code", code_name);
		} else if (categoryState === "Herrajes") {
			query
				.eq("ironwork_category", name_category)
				.eq("ironwork_brand", name_brand)
				.eq("ironwork_line", line_name)
				.eq("ironwork_code", code_name);
		} else if (categoryState === "Insumos") {
			query
				.eq("supply_category", name_category)
				.eq("supply_brand", name_brand)
				.eq("supply_line", line_name)
				.eq("supply_code", code_name);
		}

		const { data: rows, error } = await query;

		if (error) throw error;

		if (!rows || rows.length === 0) {
			return NextResponse.json({ success: true });
		}

		const imagePath = rows[0].image_path;

		if (imagePath) {
			await supabase.storage.from("images").remove([imagePath]);
		}

		const ids = rows.map(r => r.id);

		const { error: updateError } = await supabase
			.from(table)
			.update({ image_url: null, image_path: null })
			.in("id", ids);

		if (updateError) {
			return NextResponse.json(
				{ success: false, error: updateError.message },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error('Error deleting option:', error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
