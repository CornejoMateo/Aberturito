import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { updateImageForMatchingProfiles } from '@/lib/profile-stock';
import sharp from 'sharp';

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
	api_key: process.env.CLOUDINARY_API_KEY!,
	api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {

	let uploadedPublicId: string | null = null;
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

		const compressedBuffer = await sharp(buffer)
		.resize({
			width: 1200,              
			withoutEnlargement: true, 
		})
		.jpeg({
			quality: 75,             
			mozjpeg: true,          
		})
		.toBuffer();

		const result = await new Promise((resolve, reject) => {
		cloudinary.uploader
			.upload_stream(
			{
				folder: 'gallery',
				public_id: `${material_type}_${name_line}_${name_code}`,
				format: 'jpg', 
			},
			(error, result) => {
				if (error) reject(error);
				else resolve(result);
			}
			)
			.end(compressedBuffer);
		});

		const uploadResult = result as { secure_url: string; public_id: string };
		uploadedPublicId = uploadResult.public_id; // Save for potential rollback

		const supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.SUPABASE_SERVICE_ROLE_KEY!
		);

		const { data, error } = await supabase
			.from('gallery_images')
			.insert({
				image_url: uploadResult.secure_url,
				public_id: uploadResult.public_id, 
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

		// Update profiles with the new image URL
		const { error: updateError } = await updateImageForMatchingProfiles(
			supabase,
			material_type,
			name_line,
			name_code,
			uploadResult.secure_url
		);

		if (updateError) {
			console.error('Error updating profiles with new image URL:', updateError);
			throw updateError;
		}

		return NextResponse.json({ success: true, data });
	} catch (error: any) {
		console.error('Error uploading image:', error);

		if (uploadedPublicId) {
			try {
				await cloudinary.uploader.destroy(uploadedPublicId);
				console.log('Imagen eliminada de Cloudinary por rollback:', uploadedPublicId);
			} catch (deleteError) {
				console.error('Error al eliminar imagen de Cloudinary:', deleteError);
			}
		}
		
		return NextResponse.json({ success: false, error: 'Ya existe una imagen con este código y línea.' },  { status: 500 });
	}
}
