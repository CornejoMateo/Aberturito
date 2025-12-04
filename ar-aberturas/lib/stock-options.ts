import { getSupabaseClient } from './supabase-client';

export type LineOption = {
	id: number;
	name_line: string;
	opening: string;
	created_at: string | null;
};

export type ColorOption = {
	id: number;
	name_color: string;
	created_at: string | null;
	line_name: string;
};

export type CodeOption = {
	id: number;
	name_code: string;
	created_at: string | null;
	line_name: string;
};

export type SiteOption = {
	id: number;
	name_site: string;
	created_at: string | null;
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
	let requiredFields: string[] = [];
	if (table === 'lines') requiredFields = ['name_line', 'opening'];
	if (table === 'colors') requiredFields = ['name_color', 'line_name'];
	if (table === 'codes') requiredFields = ['name_code', 'line_name'];
	if (table === 'sites') requiredFields = ['name_site'];
	for (const field of requiredFields) {
		if (item[field as keyof T] === undefined || item[field as keyof T] === null) {
			return { data: null, error: new Error(`Falta el campo obligatorio: ${field}`) };
		}
	}

	const supabase = getSupabaseClient();
	const now = new Date().toISOString();
	const payload: any = { ...item };
	if (!('created_at' in payload) || payload.created_at == null) {
		payload.created_at = now;
	}
	const { data, error } = await supabase.from(table).insert(payload).select().single();
	return { data, error };
}

export async function deleteOption(
	table: string,
	id: number,
	material_type?: string
): Promise<{ success: boolean; error?: any; data?: any }> {
	try {
		const res = await fetch(
			`/api/options/delete?table=${table}&id=${id}&material_type=${material_type}`,
			{
				method: 'DELETE',
			}
		);
		const data = await res.json();
		return {
			success: data.success ?? true,
			error: data.error ?? null,
			data: data.data ?? null,
		};
	} catch (error: any) {
		return { success: false, error: error.message, data: null };
	}
}
