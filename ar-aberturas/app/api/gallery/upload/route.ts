import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
	api_key: process.env.CLOUDINARY_API_KEY!,
	api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
	try {
		const formData = await req.formData();
		const file = formData.get('file') as File;
		const material_type = formData.get('material_type') as string;
		const name_line = formData.get('name_line') as string;
		const name_code = formData.get('name_code') as string;

		if (!file || !material_type || !name_line || !name_code) {
			return NextResponse.json(
				{ success: false, error: 'Faltan campos obligatorios' },
				{ status: 400 }
			);
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const result = await new Promise((resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						folder: 'gallery',
						public_id: `${material_type}_${name_line}_${name_code}`,
					},
					(error, result) => {
						if (error) reject(error);
						else resolve(result);
					}
				)
				.end(buffer);
		});

		const uploadResult = result as { secure_url: string };

		const supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.SUPABASE_SERVICE_ROLE_KEY!
		);

		const { data, error } = await supabase
			.from('gallery_images')
			.insert({
				image_url: uploadResult.secure_url,
				material_type,
				name_line,
				name_code,
			})
			.select()
			.single();

		if (error) {
			console.error('Supabase error:', error);
			throw error;
		}

		return NextResponse.json({ success: true, data });
	} catch (error: any) {
		console.error('Error uploading image:', error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
