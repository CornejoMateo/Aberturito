import { getSupabaseClient } from '../supabase-client';

export type FolderBudget = {
	id: string;
	created_at: string;
	work_id?: number | null;
	client_id?: number | null;
	works?: {
		locality: string | null;
		address: string | null;
		status: string | null;
	} | null;
};

const TABLE = 'folder_budgets';

// Dudo que usemos este metodo
export async function listFolderBudgets(): Promise<{ data: FolderBudget[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select(`
			*,
			works:work_id (locality, address, status)
		`)
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getFolderBudgetById(id: string): Promise<{ data: FolderBudget | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select(`
			*,
			works:work_id (locality, address, status)
		`)  // La informaciòn de works no deberia hacer falta a menos que la mostremos en el modal
		.eq('id', id)
		.single();
	return { data, error };
}

// Este tampoco se va a usar probablemente
export async function getFolderBudgetsByWorkId(workId: number): Promise<{ data: FolderBudget[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select(`
			*,
			works:work_id (locality, address, status)		`)
		.eq('work_id', workId)
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getFolderBudgetsByClientId(clientId: number): Promise<{ data: FolderBudget[] | null; error: any }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from(TABLE)
        .select(`
            *,
            works:work_id (locality, address, status)		`)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
    return { data, error };
}
export async function createFolderBudget(
	folderBudget: Omit<FolderBudget, 'id' | 'created_at'>
): Promise<{ data: FolderBudget | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.insert(folderBudget)
		.select()
		.single();
	return { data, error };
}

export async function updateFolderBudget(
	id: number,
	changes: Partial<Omit<FolderBudget, 'id' | 'created_at'>>
): Promise<{ data: FolderBudget | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.update(changes)
		.eq('id', id)
		.select()
		.single();
	return { data, error };
}

export async function deleteFolderBudget(id: number): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { error } = await supabase
		.from(TABLE)
		.delete()
		.eq('id', id);
	return { data: null, error };
}
