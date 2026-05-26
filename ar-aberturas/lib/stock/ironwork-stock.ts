import { getSupabaseClient } from '../supabase-client';

export type IronworkItemStock = {
	id: number;
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
	image_id?: number | null;
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
		.select(
			`
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
			image_id,
			last_update
		`
		)
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getIronworkById(
	id: number
): Promise<{ data: IronworkItemStock | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	return { data, error };
}

export async function createIronworkStock(
	item: Partial<IronworkItemStock>
): Promise<{ data: IronworkItemStock | null; error: any }> {
	const supabase = getSupabaseClient();

	const { data: galleryStock, error: galleryStockError } = await supabase
		.from('gallery_stock')
		.select('id')
		.eq('category', 'Herrajes')
		.eq('code', item.ironwork_code)
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

export async function updateIronworkStock(
	id: number,
	changes: Partial<IronworkItemStock>
): Promise<{ data: IronworkItemStock | null; error: any }> {
	if (!id) {
		return {
			data: null,
			error: new Error('El herraje no pudo ser actualizado.'),
		};
	}

	const supabase = getSupabaseClient();

	const needsImageCheck = changes.ironwork_code !== undefined;

	if (needsImageCheck) {
		const { data: currentIronwork, error: currentIronworkError } = await supabase
			.from(TABLE)
			.select('ironwork_code')
			.eq('id', id)
			.single();

		if (currentIronworkError) {
			return { data: null, error: currentIronworkError };
		}

		const nextCode = changes.ironwork_code ?? currentIronwork.ironwork_code;
		const changedCode = nextCode !== currentIronwork.ironwork_code;

		if (changedCode) {
			const { data: galleryStock, error: galleryStockError } = await supabase
				.from('gallery_stock')
				.select('id')
				.eq('category', 'Herrajes')
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

export async function deleteIronworkStock(id: number): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}

export async function updateIronworkQuantity(
	id: number,
	newQuantity: number
): Promise<{ data: IronworkItemStock | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.update({ ironwork_quantity: newQuantity, last_update: new Date().toISOString().split('T')[0] })
		.eq('id', id)
		.select()
		.single();
	return { data, error };
}
