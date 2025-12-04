import { getSupabaseClient } from '../supabase-client';

export type AccessoryItemStock = {
	id: string;
	created_at: string;
	accessory_category: string;
	accessory_line: string | null;
	accessory_brand: string | null;
	accessory_code: string;
	accessory_description?: string | null;
	accessory_color: string;
	accessory_quantity_for_lump: number;
	accessory_quantity_lump: number;
	accessory_quantity: number;
	accessory_site: string;
	accessory_material: string;
	image_url?: string | null;
	image_path?: string | null;
	accessory_price: number | null;
	last_update: string | null;
};

const TABLE = 'accesories_category';

export async function listAccesoriesStock(): Promise<{
	data: AccessoryItemStock[] | null;
	error: any;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select(`
			id,
			created_at,
			accessory_category,
			accessory_line,
			accessory_brand,
			accessory_code,
			accessory_description,
			accessory_color,
			accessory_quantity_for_lump,
			accessory_quantity_lump,
			accessory_quantity,
			accessory_site,
			accessory_material,
			accessory_price,
			image_url,
			image_path,
			last_update
		`)
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getAccesoryById(
	id: string
): Promise<{ data: AccessoryItemStock | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	return { data, error };
}


export async function createAccessoryStock(
	item: Partial<AccessoryItemStock>
): Promise<{ data: AccessoryItemStock | null; error: any }> {
	// Validación de campos obligatorios
	const requiredFields = [
		'accessory_category',
		'accessory_code',
		'accessory_color',
		'accessory_material',
		'accessory_site',
	];
	for (const field of requiredFields) {
		if (!(item as any)[field]) {
			return {
				data: null,
				error: new Error(`Falta el campo obligatorio: ${field}`),
			};
		}
	}

	const supabase = getSupabaseClient();

	const { data: existing, error: searchError } = await supabase
		.from(TABLE)
		.select('image_url, image_path')
		.eq('accessory_code', item.accessory_code)
		.not('image_url', 'is', null)
		.limit(1);

	let image_url = null;
	let image_path = null;
	if (existing && existing.length > 0) {
		image_url = existing[0].image_url;
		image_path = existing[0].image_path;
	}

	const payload = {
		...item,
		image_url,
		image_path,
		last_update: new Date().toISOString().split('T')[0],
	};

	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();

	return { data, error };
}

export async function updateAccessoryStock(
	id: string,
	changes: Partial<AccessoryItemStock>
): Promise<{ data: AccessoryItemStock | null; error: any }> {
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

export async function deleteAccesoryStock(id: string): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}
