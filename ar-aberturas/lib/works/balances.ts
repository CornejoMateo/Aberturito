import { getSupabaseClient } from '../supabase-client';

export type Balance = {
	id: number;
	created_at: string;
	start_date?: string;
	budget_id?: number | null;
	balance_amount_ars?: number | null;
	balance_amount_usd?: number | null;
	contract_date_usd?: number | null;
	usd_current?: number | null;
	client_id?: number | null;
	notes?: string | null;
};

export type BalanceWithBudget = Balance & {
	budget?: {
		id: number;
		created_at: string;
		amount_ars: number;
		amount_usd: number;
		usd_quote?: number | null;
		number?: string | null;
		type?: string | null;
		version?: string | null;
		folder_budget: {
			id: number;
			work: {
				address: string;
				locality: string;
				zone?: string;
			};
		};
	} | null;
};

export type BalanceWithBudgetAndClient = BalanceWithBudget & {
	client?: {
		id: number;
		name?: string | null;
		last_name?: string | null;
		seller_id?: number | null;
		seller?: {
			id: number;
			name: string;
		} | null;
	} | null;
};

export type BudgetWithWork = {
	id: number;
	created_at: string;
	amount_ars: number;
	amount_usd: number;
	usd_quote?: number | null;
	date_of_sale?: string | null;
	accepted?: boolean | null;
	sold?: boolean | null;
	lost?: boolean | null;
	pdf_url?: string | null;
	pdf_path?: string | null;
	number?: string | null;
	version?: string | null;
	type?: string | null;
	folder_budget: {
		id: number;
		work_id: number | null;
		work: {
			address: string | null;
			locality: string | null;
			zone: string | null;
			hood: string | null;
		} | null;
	};
};

const TABLE = 'balances';

export async function listBalances(): Promise<{ data: BalanceWithBudget[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select(
			'*, budget:budgets(id, created_at, amount_ars, amount_usd, usd_quote, number, type, version, folder_budget:folder_budgets(work:works(address, locality)))'
		)
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function listBalancesForReport(): Promise<{
	data: BalanceWithBudgetAndClient[] | null;
	error: any;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select(
			`*,
			client:clients(id, name, last_name, seller_id),
			budget:budgets(id, created_at, amount_ars, amount_usd, usd_quote, number, type, version, folder_budget:folder_budgets(work:works(address, locality)))`
		)
		.order('created_at', { ascending: false });

	if (error) return { data: null, error };
	if (!data) return { data: [], error: null };

	// Get all seller IDs from clients
	const sellerIds = data
		.map((b: any) => {
			const client = b.client
				? Array.isArray(b.client)
					? b.client[0]
					: b.client
				: null;
			return client?.seller_id;
		})
		.filter(Boolean);

	// Fetch sellers
	let sellersMap: Record<number, string> = {};
	if (sellerIds.length > 0) {
		const { data: sellers } = await supabase.from('sellers').select('id, name').in('id', sellerIds);
		if (sellers) {
			sellersMap = sellers.reduce(
				(acc, s) => {
					acc[s.id] = s.name;
					return acc;
				},
				{} as Record<number, string>
			);
		}
	}

	const result: BalanceWithBudgetAndClient[] = data.map((b: any) => {
		// Handle client - it can be null, array, or object
		let client = null;
		if (b.client) {
			client = Array.isArray(b.client) ? b.client[0] : b.client;
		}

		// Handle budget - it can be null, array, or object
		let budget = null;
		if (b.budget) {
			budget = Array.isArray(b.budget) ? b.budget[0] : b.budget;
		}

		// Handle folder_budget in budget
		let folderBudget = null;
		if (budget?.folder_budget) {
			folderBudget = Array.isArray(budget.folder_budget) ? budget.folder_budget[0] : budget.folder_budget;
		}

		// Handle work in folder_budget
		let work = null;
		if (folderBudget?.work) {
			work = Array.isArray(folderBudget.work) ? folderBudget.work[0] : folderBudget.work;
		}

		// Add seller info to client
		let seller = null;
		if (client?.seller_id && sellersMap[client.seller_id]) {
			seller = {
				id: client.seller_id,
				name: sellersMap[client.seller_id],
			};
		}

		return {
			...b,
			budget: budget
				? {
						...budget,
						folder_budget: folderBudget
							? {
									...folderBudget,
									work: work || null,
								}
							: null,
					}
				: null,
			client: client
				? {
						...client,
						seller: seller,
					}
				: null,
		} as BalanceWithBudgetAndClient;
	});

	return { data: result, error: null };
}

export async function getBalanceById(
	id: number
): Promise<{ data: BalanceWithBudget | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select(
			'*, budget:budgets(id, amount_ars, amount_usd, usd_quote, number, type, version, folder_budget:folder_budgets(work:works(address, locality)))'
		)
		.eq('id', id)
		.single();
	return { data, error };
}

export async function getBalancesByClientId(
	clientId: number
): Promise<{ data: BalanceWithBudget[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select(
			`
			*,
			budget:budgets (
				id,
				created_at,
				amount_ars,
				amount_usd,
				usd_quote,
				number,
				type,
				version,
				folder_budget:folder_budgets (
					work:works (
						address,
						locality,
						zone
					)
				)
			)
		`
		)
		.eq('client_id', clientId)
		.order('created_at', { ascending: false });

	return { data, error };
}

export async function getBudgetsByClientId(
	clientId: number
): Promise<{ data: BudgetWithWork[] | null; error: any }> {
	const supabase = getSupabaseClient();

	const { data, error } = await supabase
		.from('budgets')
		.select(
			`
				id,
				created_at,
				amount_ars,
				amount_usd,
				folder_budget:folder_budgets!inner (
					id,
					work_id,
					work:works!inner (
						address,
						locality,
						zone,
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
				created_at: b.created_at,
				amount_ars: b.amount_ars,
				amount_usd: b.amount_usd,
				folder_budget: {
					id: folderBudget.id,
					work_id: folderBudget.work_id,
					work: {
						address: work.address,
						locality: work.locality,
						zone: work.zone,
					},
				},
			} as BudgetWithWork;
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
