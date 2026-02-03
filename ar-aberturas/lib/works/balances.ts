import { getSupabaseClient } from '../supabase-client';

export type Balance = {
	id: string;
	created_at: string;
	start_date?: string;
	budget?: number | null;
	budget_usd?: number | null;
	contract_date_usd?: number | null;
	usd_current?: number | null;
	client_id?: number | null;
	notes?: string[] | null;
	work_id?: number | null;
};

const TABLE = 'balances';

export async function listBalances(): Promise<{ data: Balance[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getBalanceById(id: string): Promise<{ data: Balance | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.eq('id', id)
		.single();
	return { data, error };
}

export async function getBalancesByClientId(clientId: number): Promise<{ data: Balance[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.eq('client_id', clientId)
		.order('created_at', { ascending: false });
	return { data, error };
}

// No va a hacer falta seguramente
export async function getBalancesByWorkId(workId: number): Promise<{ data: Balance[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.eq('work_id', workId)
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function createBalance(
	balance: Omit<Balance, 'id' | 'created_at'>
): Promise<{ data: Balance | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.insert(balance)
		.select()
		.single();
	return { data, error };
}

export async function updateBalance(
	id: number,
	changes: Partial<Omit<Balance, 'id' | 'created_at'>>
): Promise<{ data: Balance | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.update(changes)
		.eq('id', id)
		.select()
		.single();
	return { data, error };
}

export async function deleteBalance(id: number): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { error } = await supabase
		.from(TABLE)
		.delete()
		.eq('id', id);
	return { data: null, error };
}
