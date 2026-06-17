import { getSupabaseClient } from '../supabase-client';

export type Seller = {
	id: string;
	name: string;
	created_at?: string;
};

const TABLE = 'sellers';

export async function listSellers(): Promise<{ data: Seller[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.order('name', { ascending: true });
	return { data, error };
}

export async function getSellerById(id: string): Promise<{ data: Seller | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	return { data, error };
}

export async function createSeller(
	seller: Omit<Seller, 'id' | 'created_at'>
): Promise<{ data: Seller | null; error: any }> {
	const supabase = getSupabaseClient();
	const payload = {
		...seller,
		created_at: new Date().toISOString(),
	};
	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
	return { data, error };
}

export async function updateSeller(
	id: string,
	changes: Partial<Seller>
): Promise<{ data: Seller | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).update(changes).eq('id', id).select().single();
	return { data, error };
}

export async function deleteSeller(id: string): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}
