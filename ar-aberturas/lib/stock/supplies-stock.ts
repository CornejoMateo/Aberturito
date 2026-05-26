import { getSupabaseClient } from '../supabase-client';

export type SupplyItemStock = {
	id: number;
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
	image_id: number | null;
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
			image_id,
			created_at,
			last_update
		`
		)
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getSupplyById(
	id: number
): Promise<{ data: SupplyItemStock | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	return { data, error };
}

export async function createSupplyStock(
	item: Partial<SupplyItemStock>
): Promise<{ data: SupplyItemStock | null; error: any }> {
	const supabase = getSupabaseClient();

	const { data: galleryStock, error: galleryStockError } = await supabase
		.from('gallery_stock')
		.select('id')
		.eq('category', 'Insumos')
		.eq('code', item.supply_code)
		.maybeSingle();

	if (galleryStockError) {
		return { data: null, error: galleryStockError };
	}

	const payload = {
		...item,
		image_id: galleryStock?.id ?? null,
		last_update: new Date().toISOString().split('T')[0],
	};

	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
	return { data, error };
}

export async function updateSupplyStock(
	id: number,
	changes: Partial<SupplyItemStock>
): Promise<{ data: SupplyItemStock | null; error: any }> {
	if (!id) {
		return {
			data: null,
			error: new Error('El insumo no pudo ser actualizado.'),
		};
	}

	const supabase = getSupabaseClient();

	const needsImageCheck = changes.supply_code !== undefined;

	if (needsImageCheck) {
		const { data: currentSupply, error: currentSupplyError } = await supabase
			.from(TABLE)
			.select('supply_code')
			.eq('id', id)
			.single();

		if (currentSupplyError) {
			return { data: null, error: currentSupplyError };
		}

		const nextCode = changes.supply_code ?? currentSupply.supply_code;
		const changedCode = nextCode !== currentSupply.supply_code;

		if (changedCode) {
			const { data: galleryStock, error: galleryStockError } = await supabase
				.from('gallery_stock')
				.select('id')
				.eq('category', 'Insumos')
				.eq('code', nextCode)
				.maybeSingle();

			if (galleryStockError) {
				return { data: null, error: galleryStockError };
			}

			changes.image_id = galleryStock?.id ?? null;
		}
	}

	const payload = { ...changes, last_update: new Date().toISOString().split('T')[0] };
	const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select().single();
	return { data, error };
}

export async function deleteSupplyStock(id: number): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}

export async function updateSupplyQuantity(
	id: number,
	newQuantity: number
): Promise<{ data: SupplyItemStock | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.update({ supply_quantity: newQuantity, last_update: new Date().toISOString().split('T')[0] })
		.eq('id', id)
		.select()
		.single();
	return { data, error };
}
