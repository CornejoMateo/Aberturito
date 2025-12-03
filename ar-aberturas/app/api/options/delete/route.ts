import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const table = searchParams.get('table');
		const id = searchParams.get('id');
		const material_type = searchParams.get('material_type');
	
		if (!table || !id || !material_type) {
			return NextResponse.json(
				{ success: false, error: 'Faltan parámetros: tabla o identificador' },
				{ status: 400 }
			);
		}

		const supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.SUPABASE_SERVICE_ROLE_KEY!
			
		);

		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

		// if the table is 'codes', we need to delete associated images from Cloudinary
		if (table === 'codes') {
			// get name_code and line_name for the given id
			const { data: codeData } = await supabase
				.from(table)
				.select('name_code, line_name')
				.eq('id', id)
				.single();

			await fetch(
  				`${baseUrl}/api/gallery/delete?categoryState=Perfiles&code_name=${codeData?.name_code}&line_name=${codeData?.line_name}&material_type=${material_type}`,
				{ method: 'DELETE' }
			);
		}

		// 5. Delete the option from the specified table
		const { error } = await supabase.from(table).delete().eq('id', id);

		if (error) throw error;

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error('Error deleting option:', error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
