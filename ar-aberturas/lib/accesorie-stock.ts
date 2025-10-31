import { getSupabaseClient } from './supabase-client';

export type AccesorieItemStock = {
	id?: string;
};

const TABLE = 'profiles';

export async function listStock(): Promise<{ data: AccesorieItemStock[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.order('created_at', { ascending: false });
	return { data, error };
}
