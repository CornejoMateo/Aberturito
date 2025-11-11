import { getSupabaseClient } from './supabase-client';

export type HerrajeItemStock = {
	id: string;
	created_at: string;
	herraje_line: string;
	herraje_code: string;
	herraje_description: string;
	herraje_color: string;
	herraje_quantity_for_lump: number;
	herraje_quantity_lump: number;
	herraje_quantity: number;
	herraje_site: string;
	herraje_material: string;
	herraje_image_url: string | null;
	herraje_price?: number | null;
};

const TABLE = 'herrajes';

export async function listHerrajesStock(): Promise<{
	data: HerrajeItemStock[] | null;
	error: any;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getHerrajeById(
	id: string
): Promise<{ data: HerrajeItemStock | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	return { data, error };
}

export async function createHerrajeStock(
	item: Partial<HerrajeItemStock>
): Promise<{ data: HerrajeItemStock | null; error: any }> {
	const supabase = getSupabaseClient();

	const payload = {
		...item,
		last_update: item.created_at ?? new Date().toISOString().split('T')[0],
	};

	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();

	return { data, error };
}

export async function updateHerrajeStock(
	id: string,
	changes: Partial<HerrajeItemStock>
): Promise<{ data: HerrajeItemStock | null; error: any }> {
	const supabase = getSupabaseClient();
	const payload = { ...changes, last_update: new Date().toISOString().split('T')[0] };
	const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select().single();
	return { data, error };
}

export async function deleteHerrajeStock(id: string): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}

