import { getSupabaseClient } from '../supabase-client';

export type Client = {
	id: number;
	created_at?: string;
	name?: string | null;
	last_name?: string | null;
	phone_number?: string | null;
	locality?: string | null;
	email?: string | null;
	cover?: string | null;
	contact_method?: string | null;
	seller_id?: number | null;
};

const TABLE = 'clients';

export async function getClientsCount(): Promise<{ data: number; error: any }> {
	const supabase = getSupabaseClient();
	const { count, error } = await supabase.from(TABLE).select('*', { count: 'exact', head: true });
	return { data: count || 0, error };
}

export async function listClients(): Promise<{ data: Client[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('name, last_name, id, phone_number, locality, email, contact_method, seller_id')
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getClientById(id: number): Promise<{ data: Client | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	return { data, error };
}

export async function createClient(
	client: Omit<Client, 'id' | 'created_at'>
): Promise<{ data: Client | null; error: any }> {
	const supabase = getSupabaseClient();
	const payload = {
		...client,
		created_at: new Date().toISOString(),
	};
	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
	return { data, error };
}

export async function updateClient(
	id: number,
	changes: Partial<Client>
): Promise<{ data: Client | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).update(changes).eq('id', id).select().single();
	return { data, error };
}

export async function deleteClient(id: number): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();

	// First, delete all files in the client's folder
	try {
		const { data: files, error: listError } = await supabase.storage.from('clients').list(String(id));

		if (!listError && files && files.length > 0) {
			const filePaths = files.map((file) => `${id}/${file.name}`);
			await supabase.storage.from('clients').remove(filePaths);
		}
	} catch (err) {
		console.error('Error deleting client folder:', err);
	}

	// Then delete the client record
	const { error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}

export async function createClientFolder(clientId: number) {
	const supabase = getSupabaseClient();

	const filePath = `${clientId}/.keep.txt`;

	const blob = new Blob(['Cliente creado correctamente'], {
		type: 'text/plain',
	});

	try {
		const { data, error } = await supabase.storage.from('clients').upload(filePath, blob);

		if (error) {
			console.error('Storage upload error:', error);
		}

		return { data, error };
	} catch (err) {
		console.error('Unexpected error creating folder:', err);
		return { data: null, error: err };
	}
}

export type ClientWithFirstBudget = Client & {
	first_budget_date?: string | null;
	budget_count?: number;
	sold_budgets_count?: number;
	sold_amount_ars?: number;
	sold_amount_usd?: number;
};

export async function getClientsWithFirstBudget(): Promise<{ data: ClientWithFirstBudget[] | null; error: any }> {
	const supabase = getSupabaseClient();
	
	// Get all clients with their budgets
	const { data: clients, error: clientsError } = await supabase
		.from(TABLE)
		.select('id, name, last_name, phone_number, locality, email, contact_method, created_at, seller_id');
	
	if (clientsError) return { data: null, error: clientsError };
	if (!clients) return { data: [], error: null };
	
	// Get all budgets with client info
	const { data: budgets, error: budgetsError } = await supabase
		.from('budgets')
		.select(`
			created_at,
			amount_ars,
			amount_usd,
			sold,
			folder_budget:folder_budgets!inner (
				client_id
			)
		`)
		.order('created_at', { ascending: true });
	
	if (budgetsError) return { data: null, error: budgetsError };
	if (!budgets) return { data: [], error: null };
	
	// Group budgets by client_id
	const budgetsByClient = new Map<number, typeof budgets>();
	
	budgets.forEach((budget: any) => {
		const clientId = budget.folder_budget?.client_id;
		if (clientId) {
			if (!budgetsByClient.has(clientId)) {
				budgetsByClient.set(clientId, []);
			}
			budgetsByClient.get(clientId)!.push(budget);
		}
	});
	
	// Build client data with first budget date and stats
	const result: ClientWithFirstBudget[] = clients.map((client) => {
		const clientBudgets = budgetsByClient.get(client.id) || [];
		const firstBudget = clientBudgets[0];
		
		const soldBudgets = clientBudgets.filter((b: any) => b.sold);
		const soldArs = soldBudgets.reduce((sum: number, b: any) => sum + (b.amount_ars || 0), 0);
		const soldUsd = soldBudgets.reduce((sum: number, b: any) => sum + (b.amount_usd || 0), 0);
		
		return {
			...client,
			first_budget_date: firstBudget?.created_at || null,
			budget_count: clientBudgets.length,
			sold_budgets_count: soldBudgets.length,
			sold_amount_ars: soldArs,
			sold_amount_usd: soldUsd,
		};
	});
	
	return { data: result, error: null };
}
