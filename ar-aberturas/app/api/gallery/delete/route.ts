import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { updateImageForMatchingProfiles } from '@/lib/stock/profile-stock';
import { updateImageForMatchingAccesories } from '@/lib/stock/accesorie-stock';
import { updateImageForMatchingIronworks } from '@/lib/stock/ironwork-stock';
import { updateImageForMatchingSupplies } from '@/lib/stock/supplies-stock';

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
	api_key: process.env.CLOUDINARY_API_KEY!,
	api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function DELETE(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const categoryState = searchParams.get('categoryState')!;
		const table =
			categoryState === 'Accesorios'
				? 'gallery_images_accesories'
				: categoryState === 'Herrajes'
					? 'gallery_images_ironworks'
					: categoryState === 'Insumos'
						? 'gallery_images_supplies'
					: 'gallery_images';
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

		// search for associated images in gallery_images
		if (categoryState === 'Accesorios' || categoryState === 'Herrajes' || categoryState === 'Insumos') {
			if (code_name && line_name && name_category && name_brand) {
				const { data: galleryImages } = await supabase
					.from(table)
					.select('public_id')
					.eq('name_code', code_name)
					.eq('name_line', line_name)
					.eq('name_category', name_category)
					.eq('name_brand', name_brand);

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
						.from(table)
						.delete()
						.eq('name_code', code_name)
						.eq('name_line', line_name)
						.eq('name_category', name_category)
						.eq('name_brand', name_brand);

					if (error) throw error;
				}
			}
		} else {
			if (code_name && line_name) {
				const { data: galleryImages } = await supabase
					.from(table)
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
						.from(table)
						.delete()
						.eq('name_code', code_name)
						.eq('name_line', line_name);

					if (error) throw error;
				}
			}
		}
		let updateError;
		if (categoryState === 'Accesorios') {
			const res = await updateImageForMatchingAccesories(
				supabase,
				name_category,
				line_name,
				code_name,
				name_brand,
				null
			);
			updateError = res.error;
		}
		if (categoryState === 'Herrajes') {
			const res = await updateImageForMatchingIronworks(
				supabase,
				name_category,
				line_name,
				code_name,
				name_brand,
				null
			);
			updateError = res.error;
		}
		if (categoryState === 'Perfiles') {
			const res = await updateImageForMatchingProfiles(
				supabase,
				material_type,
				line_name,
				code_name,
				null
			);
			updateError = res.error;
		}
		if (categoryState === 'Insumos') {
			const res = await updateImageForMatchingSupplies(
				supabase,
				name_category,
				line_name,
				code_name,
				name_brand,
				null
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

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error('Error deleting option:', error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
