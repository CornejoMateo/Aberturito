import { getSupabaseClient } from '../supabase-client';

export type FolderBudget = {
	id: string;
	created_at: string;
	work_id?: string | null;
	client_id?: string | null;
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
export async function getFolderBudgetsByWorkId(workId: string): Promise<{ data: FolderBudget[] | null; error: any }> {
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

export async function getFolderBudgetsByClientId(clientId: string): Promise<{ data: FolderBudget[] | null; error: any }> {
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
	id: string,
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

export async function deleteFolderBudget(id: string): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { error } = await supabase
		.from(TABLE)
		.delete()
		.eq('id', id);
	return { data: null, error };
}

export async function deleteFolderBudgetWithBudgets(folderId: string): Promise<{ error: any }> {
	const supabase = getSupabaseClient();
	
	// First, delete all budgets in the folder
	const { error: budgetsError } = await supabase
		.from('budgets')
		.delete()
		.eq('folder_budget_id', folderId);
	
	if (budgetsError) {
		return { error: budgetsError };
	}
	
	// Then delete the folder
	const { error: folderError } = await supabase
		.from(TABLE)
		.delete()
		.eq('id', folderId);
	
	return { error: folderError };
}
