import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

export async function POST(req: Request) {
	try {
		const formData = await req.formData();
		const file = formData.get('file') as File;
		const categoryState = formData.get('categoryState') as string;
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
		} else if (
			categoryState === 'Accesorios' ||
			categoryState === 'Herrajes' ||
			categoryState === 'Insumos'
		) {
			name_code = formData.get('name_code') as string;

			if (!file || !name_code) {
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
		let path = '';
		let table = '';
		let matchingRows;
		if (categoryState === 'Accesorios') {
			path = 'accesories';
			table = 'accesories_category';
			const { data, error } = await supabase
				.from('accesories_category')
				.select('id')
				.eq('accessory_code', name_code)
			if (error) throw error;
			matchingRows = data;
		} else if (categoryState === 'Herrajes') {
			path = 'ironworks';
			table = 'ironworks_category';
			const { data, error } = await supabase
				.from('ironworks_category')
				.select('id')
				.eq('ironwork_code', name_code)
			if (error) throw error;
			matchingRows = data;
		} else if (categoryState === 'Perfiles') {
			path = 'profiles';
			table = 'profiles';
			const { data, error } = await supabase
				.from('profiles')
				.select('id')
				.eq('material', material_type)
				.eq('line', name_line)
				.eq('code', name_code);
			if (error) throw error;
			matchingRows = data;
		} else if (categoryState === 'Insumos') {
			path = 'supplies'
			table = 'supplies_category';
			const { data, error } = await supabase
				.from('supplies_category')
				.select('id')
				.eq('supply_code', name_code)
			if (error) throw error;
			matchingRows = data;
		}

		// If no matching rows found, don't upload
		if (!matchingRows || matchingRows.length === 0) {
			return NextResponse.json(
				{
					success: false,
					error: 'No se encontraron registros que coincidan con los campos proporcionados.',
				},
				{ status: 404 }
			);
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const compressed = await sharp(buffer)
			.resize({ width: 1200, withoutEnlargement: true })
			.jpeg({ quality: 75, mozjpeg: true })
			.toBuffer();

		const ext = 'jpg';
		const fileName = `${crypto.randomUUID()}.${ext}`;

		const filePath = `${path}/${fileName}`;

		const { error: uploadError } = await supabase.storage
			.from('images')
			.upload(filePath, compressed, {
				contentType: 'image/jpeg',
				upsert: true,
			});

		if (uploadError) throw uploadError;

		const { data: publicUrl } = supabase.storage.from('images').getPublicUrl(filePath);

		const image_url = publicUrl.publicUrl;
		const image_path = filePath;

		// Update the matching rows with the new image URL (reuse matchingRows from earlier check)
		const idsToUpdate = matchingRows.map((row: any) => row.id);

		const { error } = await supabase
			.from(table)
			.update({
				image_url,
				image_path,
				last_update: new Date().toISOString().split('T')[0],
			})
			.in('id', idsToUpdate);

		if (error) {
			if (categoryState === 'Accesorios') {
				console.error('Error updating accessories with new image URL:', error);
			} else if (categoryState === 'Herrajes') {
				console.error('Error updating ironworks with new image URL:', error);
			} else if (categoryState === 'Insumos') {
				console.error('Error updating supplies with new image URL:', error);
			} else {
				console.error('Error updating profiles with new image URL:', error);
			}
			throw error;
		}

		return NextResponse.json({
			success: true,
			image_url,
			image_path,
		});
	} catch (err) {
		console.error(err);
		return NextResponse.json({ success: false, error: 'Error al subir imagen' }, { status: 500 });
	}
}
