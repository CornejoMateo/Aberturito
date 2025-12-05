import { getSupabaseClient } from './supabase-client';

export type SupplyItemStock = {
	id: string;
	supply_category: string;
	supply_line: string | null;
	supply_brand: string | null;
	supply_code: string;
	supply_description?: string | null;
	supply_color: string;
	supply_quantity_for_lump: number;
	supply_quantity_lump: number;
	supply_quantity: number;
	supply_site: string;
	supply_material: string;
	image_url?: string | null;
	image_path?: string | null;
	supply_price: number | null;
	created_at?: string | null;
	last_update?: string | null;
};

const TABLE = 'supplies_category';

export async function listSuppliesStock(): Promise<{ data: SupplyItemStock[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select(
			`
			id,
			supply_category,
			supply_line,
			supply_brand,
			supply_code,
			supply_description,
			supply_color,
			supply_quantity_for_lump,
			supply_quantity_lump,
			supply_quantity,
			supply_site,
			supply_material,
			supply_price,
			image_url,
			image_path,
			created_at,
			last_update
		`
		)
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getSupplyById(
	id: string
): Promise<{ data: SupplyItemStock | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	return { data, error };
}

export async function createSupplyStock(
	item: Partial<SupplyItemStock>
): Promise<{ data: SupplyItemStock | null; error: any }> {
	const supabase = getSupabaseClient();

	const { data: existing, error: searchError } = await supabase
		.from(TABLE)
		.select('image_url, image_path')
		.eq('supply_code', item.supply_code)
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

export async function updateSupplyStock(
	id: string,
	changes: Partial<SupplyItemStock>
): Promise<{ data: SupplyItemStock | null; error: any }> {
	const supabase = getSupabaseClient();

	// if the supply code is being changed, check for existing image
	if (changes.supply_code) {
		const { data: existing, error: searchError } = await supabase
			.from(TABLE)
			.select('image_url, image_path')
			.eq('supply_code', changes.supply_code)
			.not('image_url', 'is', null)
			.limit(1);

		if (existing && existing.length > 0) {
			changes.image_url = existing[0].image_url;
			changes.image_path = existing[0].image_path;
		} else {
			changes.image_url = null;
			changes.image_path = null;
		}
	}

	const payload = { ...changes, last_update: new Date().toISOString().split('T')[0] };
	const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select().single();
	return { data, error };
}

export async function deleteSupplyStock(id: string): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}
