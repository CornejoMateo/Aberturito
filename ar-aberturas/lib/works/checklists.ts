import { getSupabaseClient } from '../supabase-client';

export type ChecklistItem = {
	key: number; // lo dejo por las dudas, pero para identificar usamos el index
	name: string;
	done: boolean;
};

export type Checklist = {
	id: string;
	created_at?: string;
	work_id?: string | null;
	items?: ChecklistItem[] | null;
	description?: string | null;
	progress?: number | null;
	width?: number | null;
	height?: number | null;
	name?: string | null;
	opening?: string | null;
};

const TABLE = 'checklists';

export async function listChecklists(): Promise<{ data: Checklist[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('id, created_at, work_id, items, description, progress, width, height, name, opening')
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getChecklistById(
	id: string
): Promise<{ data: Checklist | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	return { data, error };
}

export async function createChecklist(
	checklist: Omit<Checklist, 'id' | 'created_at'>
): Promise<{ data: Checklist | null; error: any }> {
	const supabase = getSupabaseClient();
	const payload = {
		...checklist,
		created_at: new Date().toISOString(),
		items: checklist.items ? checklist.items.map((item, idx) => ({ ...item, key: idx })) : null,
	};
	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
	return { data, error };
}

export async function updateChecklist(
	id: string,
	changes: Partial<Checklist>
): Promise<{ data: Checklist | null; error: any }> {
	const supabase = getSupabaseClient();
	const payload = {
		...changes,
		items: changes.items ? changes.items.map((item, idx) => ({ ...item, key: idx })) : undefined,
	};
	const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select().single();
	return { data, error };
}

export async function deleteChecklist(id: string): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}

export async function getChecklistsByWorkId(
	workId: string
): Promise<{ data: Checklist[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.eq('work_id', workId)
		.order('created_at', { ascending: false });
	return { data, error };
}
