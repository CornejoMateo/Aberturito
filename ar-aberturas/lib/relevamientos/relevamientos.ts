import { getSupabaseClient } from '../supabase-client';

export type Relevamiento = {
	id: string;
	created_at: string;
	budget_id: string;
	client_id: string;
	notes?: string | null;
};

export type RelevamientoItem = {
	id: string;
	created_at: string;
	relevamiento_id: string;
	label: string;
	completed: boolean;
	order: number;
};

const TABLE = 'relevamientos';
const ITEMS_TABLE = 'relevamiento_items';

export async function getRelevamientosByClientId(
	clientId: string
): Promise<{ data: Relevamiento[] | null; error: unknown }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.eq('client_id', clientId)
		.order('created_at', { ascending: true });
	return { data, error };
}

export async function createRelevamiento(
	relevamiento: Omit<Relevamiento, 'id' | 'created_at'>
): Promise<{ data: Relevamiento | null; error: unknown }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.insert(relevamiento)
		.select()
		.single();
	return { data, error };
}

export async function deleteRelevamiento(
	id: string
): Promise<{ data: null; error: unknown }> {
	const supabase = getSupabaseClient();
	const { error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}

export async function getRelevamientoItemsByRelevamientoIds(
	relevamientoIds: string[]
): Promise<{ data: RelevamientoItem[] | null; error: unknown }> {
	const supabase = getSupabaseClient();
	if (relevamientoIds.length === 0) return { data: [], error: null };
	const { data, error } = await supabase
		.from(ITEMS_TABLE)
		.select('*')
		.in('relevamiento_id', relevamientoIds)
		.order('order', { ascending: true });
	return { data, error };
}

export async function createRelevamientoItem(
	item: Omit<RelevamientoItem, 'id' | 'created_at'>
): Promise<{ data: RelevamientoItem | null; error: unknown }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(ITEMS_TABLE)
		.insert(item)
		.select()
		.single();
	return { data, error };
}

export async function updateRelevamientoItem(
	id: string,
	changes: Partial<Pick<RelevamientoItem, 'label' | 'completed' | 'order'>>
): Promise<{ error: unknown }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(ITEMS_TABLE)
		.update(changes)
		.eq('id', id)
		.select('id');
	if (error) return { error };
	if (!data?.length) {
		return { error: new Error('Update did not affect any rows. Check RLS policies on relevamiento_items.') };
	}
	return { error: null };
}

export async function deleteRelevamientoItem(
	id: string
): Promise<{ data: null; error: unknown }> {
	const supabase = getSupabaseClient();
	const { error } = await supabase.from(ITEMS_TABLE).delete().eq('id', id);
	return { data: null, error };
}
