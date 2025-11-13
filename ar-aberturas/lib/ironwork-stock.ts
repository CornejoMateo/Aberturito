import { getSupabaseClient } from './supabase-client';

export type IronworkItemStock = {
	id: string;
	created_at: string;
	ironwork_category: string;
	ironwork_line: string;
	ironwork_brand: string | null;
	ironwork_code: string;
	ironwork_description: string | null;
	ironwork_color: string;
	ironwork_quantity_for_lump: number;
	ironwork_quantity_lump: number;
	ironwork_quantity: number;
	ironwork_site: string;
	ironwork_material: string;
	ironwork_image_url: string | null;
	ironwork_price: number | null;
	last_update: string | null;
};

const TABLE = 'ironworks_category';

export async function listIronworksStock(): Promise<{
	data: IronworkItemStock[] | null;
	error: any;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getIronworkById(
	id: string
): Promise<{ data: IronworkItemStock | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	return { data, error };
}

export async function createIronworkStock(
	item: Partial<IronworkItemStock>
): Promise<{ data: IronworkItemStock | null; error: any }> {
	const supabase = getSupabaseClient();

	const { data: rows, error: imageError } = await supabase
		.from('gallery_images_ironworks')
		.select('ironwork_image_url')
		.ilike('name_category', item.ironwork_category || '')
		.ilike('name_line', item.ironwork_line || '')
		.ilike('name_code', item.ironwork_code || '')
		.ilike('name_brand', item.ironwork_brand || '')
		.maybeSingle();

	const payload = {
		...item,
		ironwork_image_url: rows?.ironwork_image_url ?? null,
		last_update: item.created_at ?? new Date().toISOString().split('T')[0],
	};
	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();

	return { data, error };
}

export async function updateIronworkStock(
	id: string,
	changes: Partial<IronworkItemStock>
): Promise<{ data: IronworkItemStock | null; error: any }> {
	const supabase = getSupabaseClient();
	const payload = { ...changes, last_update: new Date().toISOString().split('T')[0] };
	const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select().single();
	return { data, error };
}

export async function deleteIronworkStock(id: string): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}

export async function updateImageForMatchingIronworks(
	supabase: any,
	ironwork_category: string,
	ironwork_line: string,
	ironwork_code: string,
	ironwork_brand: string,
	ironwork_image_url: string | null
): Promise<{ data: IronworkItemStock[] | null; error: any }> {
	const { data, error } = await supabase
		.from(TABLE)
		.update({ ironwork_image_url, last_update: new Date().toISOString().split('T')[0] })
		.eq('ironwork_category', ironwork_category)
		.eq('ironwork_line', ironwork_line)
		.eq('ironwork_code', ironwork_code)
		.eq('ironwork_brand', ironwork_brand)
		.select();

	return { data, error };
}
