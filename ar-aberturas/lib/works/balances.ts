import { getSupabaseClient } from '../supabase-client';
import { updateWork } from './works';

export type Balance = {
	id: string;
	created_at?: string;
	date?: string | null;
	budget?: number | null;
	debits?: number | null;
	credits?: number | null;
	type_balance?: string | null;
	amount?: number | null;
	contract_date_usd?: number | null;
	notes?: string[] | null;
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

// La idea seria que al momento de crear un saldo se listen las posibles obras del cliente, y 
// luego pasar el id de esa obra como parametro
export async function createBalance(
    work_id: string,
	balance: Omit<Balance, 'id' | 'created_at'>
): Promise<{ data: Balance | null; error: any }> {
	const supabase = getSupabaseClient();
	const payload = {
		...balance,
	};

	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
	
	if (error) {
		return { data: null, error };
	}

	await updateWork(work_id, { balance_id: data.id });

	return { data, error: null };
}

export async function updateBalance(
	id: string,
	changes: Partial<Balance>
): Promise<{ data: Balance | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).update(changes).eq('id', id).select().single();
	return { data, error };
}

export async function deleteBalance(id: string): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}
