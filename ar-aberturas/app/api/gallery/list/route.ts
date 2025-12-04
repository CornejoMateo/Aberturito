import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
	try {
		const url = new URL(req.url);
		const mode = url.searchParams.get('mode');

		const supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.SUPABASE_SERVICE_ROLE_KEY!
		);

		// Modo de búsqueda para accesorios/herrajes
		if (mode === 'accs_iron_supply') {
			const categoryState = url.searchParams.get("categoryState");
			const code = url.searchParams.get("name_code");

			let table = "";

			if (categoryState === "Accesorios") table = "accesories_category";
			if (categoryState === "Herrajes") table = "ironworks_category";
			if (categoryState === "Insumos") table = "supplies_category";

			let query = supabase.from(table).select("*").limit(1);

			if (categoryState === "Accesorios") {
				if (code) query = query.eq("accessory_code", code);
			}
			
			if (categoryState === "Herrajes") {
				if (code) query = query.eq("ironwork_code", code);
			}

			if (categoryState === "Insumos") {
				if (code) query = query.eq("supply_code", code);
			}

			const { data, error } = await query;
			if (error) throw error;

			return NextResponse.json({ success: true, images: data });
		}


		const material_type = url.searchParams.get("material_type");
		const name_line = url.searchParams.get("name_line");
		const name_code = url.searchParams.get("name_code");

		let query = supabase.from("profiles").select("*").limit(1);

		if (material_type) query = query.eq("material", material_type);
		if (name_line) query = query.eq("line", name_line);
		if (name_code) query = query.eq("code", name_code);

		const { data, error } = await query;
		if (error) throw error;

		return NextResponse.json({ success: true, images: data });
	} catch (error: any) {
		console.error('Error fetching gallery images:', error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
