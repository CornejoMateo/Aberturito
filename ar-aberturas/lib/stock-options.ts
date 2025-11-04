import { getSupabaseClient } from './supabase-client';

export type LineOption = {
	id?: number;
	name_line?: string | null;
	opening?: string | null;
	created_at?: string | null;
};

export type ColorOption = {
	id?: number;
	name_color?: string | null;
	created_at?: string | null;
	line_name?: string | null;
};

export type CodeOption = {
	id?: number;
	name_code?: string | null;
	created_at?: string | null;
	line_name?: string | null;
};

export type SiteOption = {
	id?: number;
	name_site?: string | null;
	created_at?: string | null;
};

export async function listOptions<T>(table: string): Promise<{ data: T[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(table)
		.select('*')
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function createOption<T>(
	table: string,
	item: Partial<T>
): Promise<{ data: T | null; error: any }> {
	const supabase = getSupabaseClient();
	const now = new Date().toISOString();
	const payload: any = { ...item };
	if (!('created_at' in payload) || payload.created_at == null) {
		payload.created_at = now;
	}
	const { data, error } = await supabase.from(table).insert(payload).select().single();
	return { data, error };
}

export async function deleteOption(table: string, id: number): Promise<{ success: boolean; error?: any }> {
    try {
        const res = await fetch(`/api/options/delete?table=${table}&id=${id}`, {
            method: 'DELETE',
        });
        const data = await res.json();
        return data;
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
