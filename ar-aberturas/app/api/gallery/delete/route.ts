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
		const code_name = searchParams.get('code_name');
		const line_name = searchParams.get('line_name');

		if (!code_name || !line_name) {
			return NextResponse.json(
				{ success: false, error: 'Faltan parámetros: código o linea' },
				{ status: 400 }
			);
		}

		const supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.SUPABASE_SERVICE_ROLE_KEY!
		);

		// search for associated images in gallery_images
		if (code_name && line_name) {
			const { data: galleryImages } = await supabase
				.from('gallery_images')
				.select('public_id')
				.eq('name_code', code_name)
				.eq('name_line', line_name);

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
				const { error } = await supabase
					.from('gallery_images')
					.delete()
					.eq('name_code', code_name)
					.eq('name_line', line_name);

				if (error) throw error;
			}
		}

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error('Error deleting option:', error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
