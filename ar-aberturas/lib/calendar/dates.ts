import { getSupabaseClient } from '../supabase-client';

export type CalendarDate = {
	id: string;
	created_at?: string;
	date: string;
};

const TABLE = 'dates';

export async function listDates(): Promise<{ data: CalendarDate[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('id, created_at, date')
		.order('date', { ascending: true });
	return { data, error };
}

export async function getDateById(id: string): Promise<{ data: CalendarDate | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	return { data, error };
}

export async function createDate(
	date: Omit<CalendarDate, 'id' | 'created_at'>
): Promise<{ data: CalendarDate | null; error: any }> {
	const supabase = getSupabaseClient();
	const payload = {
		...date,
		created_at: new Date().toISOString(),
	};
	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
	return { data, error };
}

export async function updateDate(
	id: string,
	changes: Partial<CalendarDate>
): Promise<{ data: CalendarDate | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).update(changes).eq('id', id).select().single();
	return { data, error };
}

export async function deleteDate(id: string): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}

export async function deleteDateByDate(date: string): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { error } = await supabase.from(TABLE).delete().eq('date', date);
	return { data: null, error };
}
