import { getSupabaseClient } from '../supabase-client';

export type BalanceTransaction = {
	id: number;
	created_at: string;
	balance_id?: number | null;
	date?: string | null;
	amount?: number | null;
	quote_usd?: number | null;
	usd_amount?: number | null;
	payment_method?: string | null;
	notes?: string | null;
	is_extra_amount?: boolean | null;
};

const TABLE = 'balance_transactions';

// No va a hacer falta seguramente
export async function listTransactions(): Promise<{
	data: BalanceTransaction[] | null;
	error: any;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.order('created_at', { ascending: false });
	return { data, error };
}

// No va a hacer falta seguramente
export async function getTransactionById(
	id: number
): Promise<{ data: BalanceTransaction | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	return { data, error };
}

export async function getTransactionsByBalanceId(
	balanceId: number
): Promise<{ data: BalanceTransaction[] | null; error: any }> {
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
	const { data, error } = await supabase.from(TABLE).insert(transaction).select().single();
	return { data, error };
}

export async function updateTransaction(
	id: number,
	changes: Partial<Omit<BalanceTransaction, 'id' | 'created_at'>>
): Promise<{ data: BalanceTransaction | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).update(changes).eq('id', id).select().single();
	return { data, error };
}

export async function deleteTransaction(id: number): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();

	// Fetch and delete associated files first
	const { data: files } = await supabase
		.from('files_client')
		.select('id, path')
		.eq('balance_transaction_id', id);

	if (files && files.length > 0) {
		const paths = files.map((f: { path: string | null }) => f.path).filter(Boolean) as string[];
		if (paths.length > 0) {
			await supabase.storage.from('clients').remove(paths);
		}
		const fileIds = files.map((f: { id: number }) => f.id);
		await supabase.from('files_client').delete().in('id', fileIds);
	}

	const { error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}

type TotalsRow = {
	amount?: number | null;
	usd_amount?: number | null;
	is_extra_amount?: boolean | null;
};

type BalanceTotals = {
	totalAmount: number;
	totalAmountUSD: number;
	totalExtraAmount: number;
	totalExtraAmountUSD: number;
};

function splitTotals(rows: TotalsRow[]): BalanceTotals {
	let totalAmount = 0;
	let totalAmountUSD = 0;
	let totalExtraAmount = 0;
	let totalExtraAmountUSD = 0;
	for (const r of rows) {
		if (r.is_extra_amount) {
			totalExtraAmount += Number(r.amount) || 0;
			totalExtraAmountUSD += Number(r.usd_amount) || 0;
		} else {
			totalAmount += Number(r.amount) || 0;
			totalAmountUSD += Number(r.usd_amount) || 0;
		}
	}
	return { totalAmount, totalAmountUSD, totalExtraAmount, totalExtraAmountUSD };
}

export async function getTotalByBalanceId(balanceId: number): Promise<{
	data: BalanceTotals | null;
	error: any;
}> {
	const supabase = getSupabaseClient();
	const { data: transactions, error } = await supabase
		.from(TABLE)
		.select('amount, usd_amount, is_extra_amount')
		.eq('balance_id', balanceId);

	if (error) {
		return { data: null, error };
	}

	return {
		data: splitTotals(transactions || []),
		error: null,
	};
}

export async function getTotalsByBalanceIds(balanceIds: number[]): Promise<{
	data: Record<string, BalanceTotals> | null;
	error: any;
}> {
	if (!balanceIds.length) return { data: {}, error: null };
	const supabase = getSupabaseClient();
	const { data: transactions, error } = await supabase
		.from(TABLE)
		.select('balance_id, amount, usd_amount, is_extra_amount')
		.in('balance_id', balanceIds);

	if (error) {
		return { data: null, error };
	}

	const groups: Record<string, TotalsRow[]> = {};
	for (const t of transactions || []) {
		const id = String(t.balance_id ?? '');
		if (!id) continue;
		if (!groups[id]) groups[id] = [];
		groups[id].push(t);
	}

	const totals: Record<string, BalanceTotals> = {};
	for (const [id, rows] of Object.entries(groups)) {
		totals[id] = splitTotals(rows);
	}

	return { data: totals, error: null };
}

export async function getLastTransactionUSD(
	id: number
): Promise<{ data: number | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('quote_usd')
		.eq('balance_id', id)
		.order('created_at', { ascending: false })
		.limit(1)
		.single();

	return { data: data?.quote_usd || null, error };
}
