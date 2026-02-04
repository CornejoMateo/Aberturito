import { getSupabaseClient } from '../supabase-client';

export type Balance = {
	id: string;
	created_at: string;
	start_date?: string;
	budget_id?: string | null;
	contract_date_usd?: number | null;
	usd_current?: number | null;
	client_id?: number | null;
	notes?: string[] | null;
};

export type BalanceWithBudget = Balance & {
	budget?: {
		id: string;
		amount_ars: number;
		amount_usd: number;
		folder_budget: {
			work: {
				address: string;
				locality: string;
			};
		};
	} | null;
};

export type BudgetWithWork = {
	id: string;
	amount_ars: number;
	amount_usd: number;
	folder_budget: {
		work_id: string;
		work: {
			address: string;
			locality: string;
		};
	};
};

const TABLE = 'balances';

export async function listBalances(): Promise<{ data: BalanceWithBudget[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select(
			'*, budget:budgets(id, amount_ars, amount_usd, folder_budget:folder_budgets(work:works(address, locality)))'
		)
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getBalanceById(
	id: string
): Promise<{ data: BalanceWithBudget | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select(
			'*, budget:budgets(id, amount_ars, amount_usd, folder_budget:folder_budgets(work:works(address, locality)))'
		)
		.eq('id', id)
		.single();
	return { data, error };
}

export async function getBalancesByClientId(
	clientId: string
): Promise<{ data: BalanceWithBudget[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select(
			'*, budget:budgets(id, amount_ars, amount_usd, folder_budget:folder_budgets(work:works(address, locality)))'
		)
		.eq('client_id', clientId)
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getBudgetsByClientId(
	clientId: string
): Promise<{ data: BudgetWithWork[] | null; error: any }> {
	const supabase = getSupabaseClient();

	const { data, error } = await supabase
		.from('budgets')
		.select(
			`
				id,
				amount_ars,
				amount_usd,
				folder_budget:folder_budgets!inner (
					work_id,
					work:works!inner (
					address,
					locality,
					client_id
					)
				)
			`
		)
		.eq('folder_budgets.works.client_id', clientId)
		.eq('accepted', true);

	if (error) return { data: null, error };
	if (!data) return { data: [], error: null };

	const result: BudgetWithWork[] = data
		.map((b) => {
			const folderBudget = Array.isArray(b.folder_budget) ? b.folder_budget[0] : b.folder_budget;
			if (!folderBudget) return null;

			const work = Array.isArray(folderBudget.work) ? folderBudget.work[0] : folderBudget.work;
			if (!work) return null;

			return {
				id: b.id,
				amount_ars: b.amount_ars,
				amount_usd: b.amount_usd,
				folder_budget: {
					work_id: folderBudget.work_id,
					work: {
						address: work.address,
						locality: work.locality,
					},
				},
			};
		})
		.filter((b): b is BudgetWithWork => b !== null);

	return { data: result, error: null };
}

export async function createBalance(
	balance: Omit<Balance, 'id' | 'created_at'>
): Promise<{ data: Balance | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).insert(balance).select().single();
	return { data, error };
}

export async function updateBalance(
	id: number,
	changes: Partial<Omit<Balance, 'id' | 'created_at'>>
): Promise<{ data: Balance | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).update(changes).eq('id', id).select().single();
	return { data, error };
}

export async function deleteBalance(id: number): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}
