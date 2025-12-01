import { getSupabaseClient } from './supabase-client';

export type ProfileItemStock = {
	id: string;
	category: string;
	code: string;
	line: string;
	color: string;
	status: string;
	quantity: number;
	site: string;
	width: number;
	material: string;
	image_url: string | null;
	created_at: string | null;
	last_update: string | null;
};

const TABLE = 'profiles';

export async function listStock(): Promise<{ data: ProfileItemStock[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select(`
			id,
			category,
			code,
			line,
			color,
			status,
			quantity,
			site,
			width,
			material,
			created_at,
			last_update
		`)
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getProfileById(
	id: string
): Promise<{ data: ProfileItemStock | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	return { data, error };
}

export async function createProfileStock(
	item: Partial<ProfileItemStock>
): Promise<{ data: ProfileItemStock | null; error: any }> {
	// Validación runtime de campos obligatorios
	const requiredFields = [
		'code',
		'material',
		'category',
		'line',
		'color',
		'status',
		'quantity',
		'site',
		'width',
	];
	for (const field of requiredFields) {
		if (
			item[field as keyof ProfileItemStock] === undefined ||
			item[field as keyof ProfileItemStock] === null
		) {
			return { data: null, error: new Error(`Falta el campo obligatorio: ${field}`) };
		}
	}

	const supabase = getSupabaseClient();

	// Fetch matching image from gallery_images table
	const { data: rows, error: imageError } = await supabase
		.from('gallery_images')
		.select('image_url')
		.ilike('material_type', item.material || '')
		.ilike('name_line', item.line || '')
		.ilike('name_code', item.code || '')
		.maybeSingle();

	const payload = {
		...item,
		image_url: rows?.image_url ?? null,
		last_update: item.created_at ?? new Date().toISOString().split('T')[0],
	};

	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();

	return { data, error };
}

export async function updateProfileStock(
	id: string,
	changes: Partial<ProfileItemStock>
): Promise<{ data: ProfileItemStock | null; error: any }> {
	if (!id) {
		return {
			data: null,
			error: new Error('El accesorio no pudo ser actualizado.'),
		};
	}
	const supabase = getSupabaseClient();
	const payload = { ...changes, last_update: new Date().toISOString().split('T')[0] };
	const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select().single();
	return { data, error };
}

export async function updateImageForMatchingProfiles(
	supabase: any,
	material: string,
	name_line: string,
	name_code: string,
	image_url: string | null
): Promise<{ data: ProfileItemStock[] | null; error: any }> {
	const { data, error } = await supabase
		.from(TABLE)
		.update({ image_url, last_update: new Date().toISOString().split('T')[0] })
		.eq('material', material)
		.eq('line', name_line)
		.eq('code', name_code)
		.select();

	return { data, error };
}

export async function deleteProfileStock(id: string): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}
