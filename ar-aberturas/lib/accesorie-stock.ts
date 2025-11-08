import { getSupabaseClient } from './supabase-client';

export type AccessoryItemStock = {
	id?: string;
	created_at?: string;
	accessory_line: string;
	accessory_code: string;
	accessory_description?: string;
	accessory_color: string;
	accessory_quantity_for_lump: number;
	accessory_quantity_lump: number;
	accessory_quantity: number;
	accessory_site: string;
	accessory_material: string;
	accessory_image_url?: string | null;
};

const TABLE = 'accesories';

export async function listAccesoriesStock(): Promise<{ data: AccessoryItemStock[] | null; error: any }> {
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

	const payload = {
		...item,
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

// Falta lo de las imagenes