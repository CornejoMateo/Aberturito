import { getSupabaseClient } from './supabase-client';

export type ProfileItemStock = {
	id?: string;
	category?: string | null;
	type?: string | null;
	line?: string | null;
	color?: string | null;
	status?: string | null;
	quantity?: number | null;
	site?: string | null;
	width?: number | null;
	material?: string | null;
	created_at?: string | null;
	last_update?: string | null;
};

const TABLE = 'profiles';

export async function listStock(): Promise<{ data: ProfileItemStock[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getProfileById(
	id: string
): Promise<{ data: ProfileItemStock | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	return { data, error };
}

export async function createProfileStock(
	item: Partial<ProfileItemStock>
): Promise<{ data: ProfileItemStock | null; error: any }> {
	const supabase = getSupabaseClient();
	const payload = {
		...item,
		last_update: item.created_at ?? new Date().toISOString().split('T')[0],
	};
	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
	return { data, error };
}

export async function updateProfileStock(
	id: string,
	changes: Partial<ProfileItemStock>
): Promise<{ data: ProfileItemStock | null; error: any }> {
	const supabase = getSupabaseClient();
	const payload = { ...changes, last_update: new Date().toISOString().split('T')[0] };
	const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select().single();
	return { data, error };
}

export async function deleteProfileStock(id: string): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}
