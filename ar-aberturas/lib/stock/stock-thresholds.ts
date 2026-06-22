import { getSupabaseClient } from '../supabase-client';

export type StockThreshold = {
	id: number;
	item_id: number;
	item_category: string;
	yellow_threshold: number;
	red_threshold: number;
	created_at?: string;
};

const TABLE = 'stock_thresholds';

export async function listStockThresholds(): Promise<{ data: StockThreshold[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false });
	return { data, error };
}

export async function getStockThresholdByItem(
	itemId: number,
	itemCategory: string
): Promise<{ data: StockThreshold | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.eq('item_id', itemId)
		.eq('item_category', itemCategory)
		.maybeSingle();
	return { data, error };
}

export async function createStockThreshold(
	threshold: Omit<StockThreshold, 'id' | 'created_at'>
): Promise<{ data: StockThreshold | null; error: any }> {
	const supabase = getSupabaseClient();
	const payload = {
		...threshold,
		created_at: new Date().toISOString(),
	};
	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
	return { data, error };
}

export async function updateStockThreshold(
	id: number,
	changes: Partial<StockThreshold>
): Promise<{ data: StockThreshold | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).update(changes).eq('id', id).select().single();
	return { data, error };
}

export async function deleteStockThreshold(id: number): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}

export async function upsertStockThreshold(
	itemId: number,
	itemCategory: string,
	yellowThreshold: number,
	redThreshold: number
): Promise<{ data: StockThreshold | null; error: any }> {
	const supabase = getSupabaseClient();
	
	// First check if threshold exists
	const { data: existing, error: checkError } = await getStockThresholdByItem(itemId, itemCategory);
	
	if (checkError) {
		return { data: null, error: checkError };
	}
	
	if (existing) {
		// Update existing
		return await updateStockThreshold(existing.id, {
			yellow_threshold: yellowThreshold,
			red_threshold: redThreshold,
		});
	} else {
		// Create new
		return await createStockThreshold({
			item_id: itemId,
			item_category: itemCategory,
			yellow_threshold: yellowThreshold,
			red_threshold: redThreshold,
		});
	}
}
