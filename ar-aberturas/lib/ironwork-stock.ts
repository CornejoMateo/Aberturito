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
	image_url?: string | null;
	image_path?: string | null;
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
		.select(`
			id,
			created_at,
			ironwork_category,
			ironwork_line,
			ironwork_brand,
			ironwork_code,
			ironwork_description,
			ironwork_color,
			ironwork_quantity_for_lump,
			ironwork_quantity_lump,
			ironwork_quantity,
			ironwork_site,
			ironwork_material,
			ironwork_price,
			last_update
		`)
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
	// Validación de campos obligatorios
	const requiredFields = [
		'ironwork_category',
		'ironwork_code',
		'ironwork_color',
		'ironwork_material',
		'ironwork_site',
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
		.eq('ironwork_category', item.ironwork_category)
		.eq('ironwork_line', item.ironwork_line)
		.eq('ironwork_brand', item.ironwork_brand)
		.eq('ironwork_code', item.ironwork_code)
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

export async function updateIronworkStock(
	id: string,
	changes: Partial<IronworkItemStock>
): Promise<{ data: IronworkItemStock | null; error: any }> {
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

export async function deleteIronworkStock(id: string): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}
