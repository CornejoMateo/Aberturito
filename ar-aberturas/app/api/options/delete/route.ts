import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
	api_key: process.env.CLOUDINARY_API_KEY!,
	api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function DELETE(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const table = searchParams.get('table');
		const id = searchParams.get('id');

		if (!table || !id) {
			return NextResponse.json(
				{ success: false, error: 'Faltan parámetros: tabla o identificador' },
				{ status: 400 }
			);
		}

		const supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.SUPABASE_SERVICE_ROLE_KEY!
		);

		// if the table is 'codes', we need to delete associated images from Cloudinary
		if (table === 'codes') {
			// get name_code and line_name for the given id
			const { data: codeData } = await supabase
				.from(table)
				.select('name_code, line_name')
				.eq('id', id)
				.single();

			// search for associated images in gallery_images
			if (codeData?.name_code && codeData?.line_name) {
				const { data: galleryImages } = await supabase
					.from('gallery_images')
					.select('public_id')
					.eq('name_code', codeData.name_code)
					.eq('name_line', codeData.line_name);

				// Delete images from Cloudinary
				if (galleryImages && galleryImages.length > 0) {
					for (const image of galleryImages) {
						if (image.public_id) {
							try {
								const result = await cloudinary.uploader.destroy(image.public_id);
								console.log('Resultado:', result);
							} catch (cloudErr) {
								console.error('Error:', cloudErr);
							}
						}
					}

					// 4. Delete image from gallery_images table
					await supabase
						.from('gallery_images')
						.delete()
						.eq('name_code', codeData.name_code)
						.eq('name_line', codeData.line_name);
				}
			}
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
