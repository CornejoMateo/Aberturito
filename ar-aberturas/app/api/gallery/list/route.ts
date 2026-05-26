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
			const categoryState = url.searchParams.get('categoryState');
			const code = url.searchParams.get('name_code');

			let query = supabase.from('gallery_stock').select('*').limit(1);

			if (categoryState) query = query.eq('category', categoryState);
			if (code) query = query.eq('code', code);

			const { data, error } = await query;
			if (error) throw error;

			return NextResponse.json({ success: true, images: data });
		}

		const material_type = url.searchParams.get('material_type');
		const name_line = url.searchParams.get('name_line');
		const name_code = url.searchParams.get('name_code');

		let query = supabase.from('gallery_profiles').select('*').limit(1);

		if (material_type) query = query.eq('material_type', material_type);
		if (name_line) query = query.eq('line', name_line);
		if (name_code) query = query.eq('code', name_code);

		const { data, error } = await query;
		if (error) throw error;

		return NextResponse.json({ success: true, images: data });
	} catch (error: any) {
		console.error('Error fetching gallery images:', error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
