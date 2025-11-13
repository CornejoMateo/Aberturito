import { getSupabaseClient } from './supabase-client';

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
	accessory_image_url: string | null;
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
		.select('*')
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
	const supabase = getSupabaseClient();

	const { data: rows, error: imageError } = await supabase
		.from('gallery_images_accesories')
		.select('accessory_image_url')
		.ilike('name_category', item.accessory_category || '')
		.ilike('name_line', item.accessory_line || '')
		.ilike('name_code', item.accessory_code || '')
		.ilike('name_brand', item.accessory_brand || '')
		.maybeSingle();

	const payload = {
		...item,
		accessory_image_url: rows?.accessory_image_url ?? null,
		last_update: item.created_at ?? new Date().toISOString().split('T')[0],
	};

	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();

	return { data, error };
}

export async function updateAccessoryStock(
	id: string,
	changes: Partial<AccessoryItemStock>
): Promise<{ data: AccessoryItemStock | null; error: any }> {
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

export async function updateImageForMatchingAccesories(
	supabase: any,
	accessory_category: string,
	accessory_line: string,
	accessory_code: string,
	accessory_brand: string,
	accessory_image_url: string | null
): Promise<{ data: AccessoryItemStock[] | null; error: any }> {
	const { data, error } = await supabase
		.from(TABLE)
		.update({ accessory_image_url, last_update: new Date().toISOString().split('T')[0] })
		.eq('accessory_category', accessory_category)
		.eq('accessory_line', accessory_line)
		.eq('accessory_code', accessory_code)
		.eq('accessory_brand', accessory_brand)
		.select();

	return { data, error };
}
