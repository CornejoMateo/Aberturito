import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { updateImageForMatchingProfiles } from '@/lib/stock/profile-stock';
import { updateImageForMatchingAccesories } from '@/lib/stock/accesorie-stock';
import { updateImageForMatchingIronworks } from '@/lib/stock/ironwork-stock';
import { updateImageForMatchingSupplies } from '@/lib/stock/supplies-stock';
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
		const categoryState = formData.get('categoryState') as string;
		let name_category = '';
		let name_brand = '';
		let name_code = '';
		let material_type = '';
		let name_line = '';
		if (categoryState === 'Perfiles') {
			material_type = formData.get('material_type') as string;
			name_line = formData.get('name_line') as string;
			name_code = formData.get('name_code') as string;

			if (!file || !material_type || !name_line || !name_code) {
				return NextResponse.json(
					{ success: false, error: 'Faltan campos obligatorios' },
					{ status: 400 }
				);
			}
		} else if (categoryState === 'Accesorios' || categoryState === 'Herrajes' || categoryState === 'Insumos') {
			name_category = formData.get('name_category') as string;
			name_brand = formData.get('name_brand') as string;
			name_line = formData.get('name_line') as string;
			name_code = formData.get('name_code') as string;

			if (!file || !name_category || !name_brand || !name_line || !name_code) {
				return NextResponse.json(
					{ success: false, error: 'Faltan campos obligatorios' },
					{ status: 400 }
				);
			}
		}

		const supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.SUPABASE_SERVICE_ROLE_KEY!
		);

		// Check if there are matching rows BEFORE uploading
		let matchingRows;
		if (categoryState === 'Accesorios') {
			const { data, error } = await supabase
				.from('accesories_category')
				.select('id')
				.eq('accessory_category', name_category)
				.eq('accessory_line', name_line)
				.eq('accessory_code', name_code)
				.eq('accessory_brand', name_brand);
			if (error) throw error;
			matchingRows = data;
		} else if (categoryState === 'Herrajes') {
			const { data, error } = await supabase
				.from('ironworks_category')
				.select('id')
				.eq('ironwork_category', name_category)
				.eq('ironwork_line', name_line)
				.eq('ironwork_code', name_code)
				.eq('ironwork_brand', name_brand);
			if (error) throw error;
			matchingRows = data;
		} else if (categoryState === 'Perfiles') {
			const { data, error } = await supabase
				.from('profiles')
				.select('id')
				.eq('material', material_type)
				.eq('line', name_line)
				.eq('code', name_code);
			if (error) throw error;
			matchingRows = data;
		} else if (categoryState === 'Insumos') {
			const { data, error } = await supabase
				.from('supplies_category')
				.select('id')
				.eq('supply_category', name_category)
				.eq('supply_line', name_line)
				.eq('supply_code', name_code)
				.eq('supply_brand', name_brand);
			if (error) throw error;
			matchingRows = data;
		}

		// If no matching rows found, don't upload
		if (!matchingRows || matchingRows.length === 0) {
			return NextResponse.json(
				{ success: false, error: 'No se encontraron registros que coincidan con los campos proporcionados.' },
				{ status: 404 }
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

		let result: unknown;
		if (categoryState === 'Accesorios' || categoryState === 'Herrajes' || categoryState === 'Insumos') {
			result = await new Promise((resolve, reject) => {
				cloudinary.uploader
					.upload_stream(
						{
							folder: categoryState === 'Accesorios' ? 'gallery_accesories' : categoryState === 'Herrajes' ? 'gallery_ironworks' : 'gallery_supplies',
							public_id: `${name_category}_${name_brand}_${name_line}_${name_code}`,
							format: 'jpg',
						},
						(error, result) => {
							if (error) reject(error);
							else resolve(result);
						}
					)
					.end(compressedBuffer);
			});
		} else {
			result = await new Promise((resolve, reject) => {
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
		}
		const uploadResult = result as { secure_url: string; public_id: string };
		uploadedPublicId = uploadResult.public_id; // Save for potential rollback

		let data;
		let error;
		if (categoryState === 'Accesorios' || categoryState === 'Herrajes' || categoryState === 'Insumos') {
			const table =
				categoryState === 'Accesorios' ? 'gallery_images_accesories' : categoryState === 'Herrajes' ? 'gallery_images_ironworks' : 'gallery_images_supplies';
			({ data, error } = await supabase
				.from(table)
				.insert({
					image_url: uploadResult.secure_url,
					public_id: uploadResult.public_id,
					name_category,
					name_brand,
					name_line,
					name_code,
				})
				.select()
				.single());
		} else {
			({ data, error } = await supabase
				.from('gallery_images')
				.insert({
					image_url: uploadResult.secure_url,
					public_id: uploadResult.public_id,
					material_type,
					name_line,
					name_code,
				})
				.select()
				.single());
		}

		if (error) {
			console.error('Supabase error:', error);
			throw error;
		}

		// Update the matching rows with the new image URL (reuse matchingRows from earlier check)
		const idsToUpdate = matchingRows.map((row: any) => row.id);
		let updateError;
		
		if (categoryState === 'Accesorios') {
			const { error: err } = await supabase
				.from('accesories_category')
				.update({ accessory_image_url: uploadResult.secure_url, last_update: new Date().toISOString().split('T')[0] })
				.in('id', idsToUpdate);
			updateError = err;
		} else if (categoryState === 'Herrajes') {
			const { error: err } = await supabase
				.from('ironworks_category')
				.update({ ironwork_image_url: uploadResult.secure_url, last_update: new Date().toISOString().split('T')[0] })
				.in('id', idsToUpdate);
			updateError = err;
		} else if (categoryState === 'Perfiles') {
			const { error: err } = await supabase
				.from('profiles')
				.update({ image_url: uploadResult.secure_url, last_update: new Date().toISOString().split('T')[0] })
				.in('id', idsToUpdate);
			updateError = err;
		}
		if (categoryState === 'Insumos') {
			const res = await updateImageForMatchingSupplies(
				supabase,
				name_category,
				name_line,
				name_code,
				name_brand,
				uploadResult.secure_url
			);
			updateError = res.error;
		}

		if (updateError) {
			if (categoryState === 'Accesorios') {
				console.error('Error updating accessories with new image URL:', updateError);
			} else if (categoryState === 'Herrajes') {
				console.error('Error updating ironworks with new image URL:', updateError);
			} else if (categoryState === 'Insumos') {
				console.error('Error updating supplies with new image URL:', updateError);
			} else {
				console.error('Error updating profiles with new image URL:', updateError);
			}
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

		return NextResponse.json(
			{ success: false, error: 'Ya existe una imagen para estos campos.' },
			{ status: 500 }
		);
	}
}
