import { getSupabaseClient } from '../supabase-client';

export type BalanceTransaction = {
	id: string;
	created_at: string;
	balance_id?: string | null;
	date?: string | null;
	amount?: number | null;
	usd?: number | null;
	payment_method?: string | null;
	notes?: string | null;
};

const TABLE = 'balance_transactions';

// No va a hacer falta seguramente
export async function listTransactions(): Promise<{ data: BalanceTransaction[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.order('created_at', { ascending: false });
	return { data, error };
}

// No va a hacer falta seguramente
export async function getTransactionById(id: string): Promise<{ data: BalanceTransaction | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.eq('id', id)
		.single();
	return { data, error };
}

export async function getTransactionsByBalanceId(balanceId: string): Promise<{ data: BalanceTransaction[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.eq('balance_id', balanceId)
		.order('date', { ascending: false });
	return { data, error };
}

export async function createTransaction(
	transaction: Omit<BalanceTransaction, 'id' | 'created_at'>
): Promise<{ data: BalanceTransaction | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.insert(transaction)
		.select()
		.single();
	return { data, error };
}

export async function updateTransaction(
	id: string,
	changes: Partial<Omit<BalanceTransaction, 'id' | 'created_at'>>
): Promise<{ data: BalanceTransaction | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.update(changes)
		.eq('id', id)
		.select()
		.single();
	return { data, error };
}

export async function deleteTransaction(id: string): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { error } = await supabase
		.from(TABLE)
		.delete()
		.eq('id', id);
	return { data: null, error };
}

export async function getTotalByBalanceId(balanceId: string): Promise<{
	data: { totalAmount: number} | null;
	error: any;
}> {
	const supabase = getSupabaseClient();
	const { data: transactions, error } = await supabase
		.from(TABLE)
		.select('amount')
		.eq('balance_id', balanceId);
	
	if (error) {
		return { data: null, error };
	}
	
	const totalAmount = transactions?.reduce((sum, t) => sum + (Number(t.amount) || 0), 0) || 0;
	
	return { data: { totalAmount }, error: null };
}
