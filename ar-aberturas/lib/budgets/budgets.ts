import { getSupabaseClient } from '../supabase-client';
import { BudgetWithWork } from '../works/balances';

export type Budget = {
	id: number;
	created_at: string;
	folder_budget_id?: number | null;
	accepted?: boolean | null;
	sold?: boolean | null;
	lost?: boolean | null;
	date_of_sale?: string | null;
	pdf_url?: string | null;
	pdf_path?: string | null;
	number?: string | null;
	amount_ars?: number | null;
	amount_usd?: number | null;
	usd_quote?: number | null;
	version?: string | null;
	type?: string | null;
};

export type BudgetWithWorkAndClient = BudgetWithWork & {
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

const TABLE = 'budgets';

export async function getBudgetsCount(): Promise<{ data: number; error: any }> {
	const supabase = getSupabaseClient();
	const { count, error } = await supabase.from(TABLE).select('*', { count: 'exact', head: true });
	return { data: count || 0, error };
}

export async function getBudgetsTotalAmount(): Promise<{
	data: { totalArs: number; totalUsd: number };
	error: any;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('amount_ars, amount_usd');

	if (error) return { data: { totalArs: 0, totalUsd: 0 }, error };
	if (!data) return { data: { totalArs: 0, totalUsd: 0 }, error: null };

	const totalArs = data.reduce((sum, budget) => sum + (budget.amount_ars || 0), 0);
	const totalUsd = data.reduce((sum, budget) => sum + (budget.amount_usd || 0), 0);

	return { data: { totalArs, totalUsd }, error: null };
}

export async function getAcceptedBudgetsCount(): Promise<{ data: number; error: any }> {
	const supabase = getSupabaseClient();
	const { count, error } = await supabase
		.from(TABLE)
		.select('*', { count: 'exact', head: true })
		.eq('accepted', true);
	return { data: count || 0, error };
}

export async function getSoldBudgetsCount(): Promise<{ data: number; error: any }> {
	const supabase = getSupabaseClient();
	const { count, error } = await supabase
		.from(TABLE)
		.select('*', { count: 'exact', head: true })
		.eq('sold', true);
	return { data: count || 0, error };
}

export async function getLostBudgetsCount(): Promise<{ data: number; error: any }> {
	const supabase = getSupabaseClient();
	const { count, error } = await supabase
		.from(TABLE)
		.select('*', { count: 'exact', head: true })
		.eq('lost', true);
	return { data: count || 0, error };
}

export async function getChosenBudgetsCount(): Promise<{ data: number; error: any }> {
	const supabase = getSupabaseClient();
	const { count, error } = await supabase
		.from(TABLE)
		.select('*', { count: 'exact', head: true })
		.eq('accepted', true);
	return { data: count || 0, error };
}

export async function getSoldBudgetsTotalAmount(): Promise<{
	data: { totalArs: number; totalUsd: number };
	error: any;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('amount_ars, amount_usd')
		.eq('sold', true);

	if (error) return { data: { totalArs: 0, totalUsd: 0 }, error };
	if (!data) return { data: { totalArs: 0, totalUsd: 0 }, error: null };

	const totalArs = data.reduce((sum, budget) => sum + (budget.amount_ars || 0), 0);
	const totalUsd = data.reduce((sum, budget) => sum + (budget.amount_usd || 0), 0);

	return { data: { totalArs, totalUsd }, error: null };
}

export async function getLostBudgetsTotalAmount(): Promise<{
	data: { totalArs: number; totalUsd: number };
	error: any;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('amount_ars, amount_usd')
		.eq('lost', true);

	if (error) return { data: { totalArs: 0, totalUsd: 0 }, error };
	if (!data) return { data: { totalArs: 0, totalUsd: 0 }, error: null };

	const totalArs = data.reduce((sum, budget) => sum + (budget.amount_ars || 0), 0);
	const totalUsd = data.reduce((sum, budget) => sum + (budget.amount_usd || 0), 0);

	return { data: { totalArs, totalUsd }, error: null };
}

export async function getChosenBudgetsTotalAmount(): Promise<{
	data: { totalArs: number; totalUsd: number };
	error: any;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('amount_ars, amount_usd')
		.eq('accepted', true);

	if (error) return { data: { totalArs: 0, totalUsd: 0 }, error };
	if (!data) return { data: { totalArs: 0, totalUsd: 0 }, error: null };

	const totalArs = data.reduce((sum, budget) => sum + (budget.amount_ars || 0), 0);
	const totalUsd = data.reduce((sum, budget) => sum + (budget.amount_usd || 0), 0);

	return { data: { totalArs, totalUsd }, error: null };
}

// Este metodo tampoco se va a usar probablemente
export async function listBudgets(): Promise<{ data: Budget[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getBudgetById(id: number): Promise<{ data: Budget | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	return { data, error };
}

export async function getBudgetsByFolderBudgetId(
	folderBudgetId: number
): Promise<{ data: Budget[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.eq('folder_budget_id', folderBudgetId)
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getBudgetsByFolderBudgetIds(
	folderBudgetIds: number[]
): Promise<{ data: BudgetWithWork[] | null; error: any }> {
	const supabase = getSupabaseClient();
	if (folderBudgetIds.length === 0) return { data: [], error: null };

	const { data, error } = await supabase
		.from(TABLE)
		.select(
			`
				id,
				created_at,
				amount_ars,
				amount_usd,
				usd_quote,
				accepted,
				sold,
				lost,
				pdf_url,
				pdf_path,
				number,
				version,
				type,
				folder_budget:folder_budgets!inner (
					id,
					work_id,
					work:works (
						address,
						locality
					)
				)
			`
		)
		.in('folder_budget_id', folderBudgetIds)
		.order('created_at', { ascending: false });

	if (error) return { data: null, error };
	if (!data) return { data: [], error: null };

	const result: BudgetWithWork[] = data
		.map((b: any) => {
			const folderBudget = Array.isArray(b.folder_budget) ? b.folder_budget[0] : b.folder_budget;
			if (!folderBudget) return null;

			const work = Array.isArray(folderBudget.work) ? folderBudget.work[0] : folderBudget.work;

			return {
				id: b.id,
				created_at: b.created_at,
				amount_ars: b.amount_ars,
				amount_usd: b.amount_usd,
				usd_quote: b.usd_quote,
				accepted: b.accepted,
				sold: b.sold,
				lost: b.lost,
				pdf_url: b.pdf_url,
				pdf_path: b.pdf_path,
				number: b.number,
				version: b.version,
				type: b.type,
				folder_budget: {
					id: folderBudget.id,
					work_id: folderBudget.work_id,
					work: work
						? {
								address: work.address || '',
								locality: work.locality || '',
							}
						: null,
				},
			} as BudgetWithWork;
		})
		.filter((b): b is BudgetWithWork => b !== null);

	return { data: result, error: null };
}

export async function listBudgetsForReport(): Promise<{
	data: BudgetWithWorkAndClient[] | null;
	error: any;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from('budgets')
		.select(
			`
			*,
			folder_budget:folder_budgets(
				client:clients(id, name, last_name, seller_id),
				work:works(address, locality, zone, hood)
			)
		`
		)
		.order('created_at', { ascending: false });

	if (error) return { data: null, error };
	if (!data) return { data: [], error: null };

	// Get all seller IDs from clients
	const sellerIds = data
		.map((b: any) => {
			const folderBudget = Array.isArray(b.folder_budget) ? b.folder_budget[0] : b.folder_budget;
			const client = folderBudget?.client
				? Array.isArray(folderBudget.client)
					? folderBudget.client[0]
					: folderBudget.client
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

	const result: BudgetWithWorkAndClient[] = data.map((b: any) => {
		// Handle folder_budget - it can be null, array, or object
		let folderBudget = null;
		if (b.folder_budget) {
			folderBudget = Array.isArray(b.folder_budget) ? b.folder_budget[0] : b.folder_budget;
		}

		// Handle work - it can be null, array, or object
		let work = null;
		if (folderBudget?.work) {
			work = Array.isArray(folderBudget.work) ? folderBudget.work[0] : folderBudget.work;
		}

		// Handle client - it can be null, array, or object
		let client = null;
		if (folderBudget?.client) {
			client = Array.isArray(folderBudget.client) ? folderBudget.client[0] : folderBudget.client;
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
			amount_ars: b.amount_ars || 0,
			amount_usd: b.amount_usd || 0,
			usd_quote: b.usd_quote || 0,
			folder_budget: folderBudget
				? {
						id: folderBudget.id,
						work_id: folderBudget.work_id,
						work: work
							? {
									address: work.address || '',
									locality: work.locality || '',
									zone: work.zone || '',
									hood: work.hood || '',
								}
							: {
									address: '',
									locality: '',
									zone: '',
									hood: '',
								},
					}
				: {
						id: 0,
						work_id: 0,
						work: {
							address: '',
							locality: '',
						},
					},
			client: client
				? {
						...client,
						seller: seller,
					}
				: null,
		} as BudgetWithWorkAndClient;
	});

	return { data: result, error: null };
}

export async function createBudget(
	budget: Omit<Budget, 'id' | 'pdf_url' | 'pdf_path'>,
	pdfFile: File | null,
	clientId: number
): Promise<{ data: Budget | null; error: any }> {
	const supabase = getSupabaseClient();
	let payload: any = { ...budget };
	let publicUrl: string | null = null;
	let filePath: string | null = null;

	if (pdfFile) {
		const sanitizePart = (value: string | null | undefined, fallback: string) => {
			const cleaned = (value ?? '')
				.trim()
				.replace(/\s+/g, '_')
				.replace(/[^a-zA-Z0-9._-]/g, '');
			return cleaned || fallback;
		};

		const sanitizedName = sanitizePart(pdfFile.name, 'archivo.pdf');
		const typePart = sanitizePart(budget.type, 'sin_tipo');
		const numberPart = sanitizePart(budget.number, 'sin_numero');
		const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
		const fileName = `budget_${typePart}_${numberPart}_${uniqueSuffix}_${sanitizedName}`;
		filePath = `${clientId}/${fileName}`;

		// Load the PDF file to Supabase Storage
		const { error: uploadError } = await supabase.storage
			.from('clients')
			.upload(filePath, pdfFile, { upsert: false });

		if (uploadError) {
			console.error('Error uploading PDF:', uploadError);
			return { data: null, error: uploadError };
		}

		// Get the public URL of the uploaded PDF
		const {
			data: { publicUrl: url },
		} = supabase.storage.from('clients').getPublicUrl(filePath);
		publicUrl = url;
	}

	payload = {
		...payload,
		pdf_url: publicUrl,
		pdf_path: filePath,
	};

	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();

	return { data, error };
}

export async function updateBudget(
	id: number,
	changes: Partial<Omit<Budget, 'id' | 'created_at'>>
): Promise<{ data: Budget | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).update(changes).eq('id', id).select().single();
	return { data, error };
}

export async function editBudget(
	id: number,
	changes: Partial<Omit<Budget, 'id'>>,
	pdfFile: File | null,
	clientId: number
): Promise<{ data: Budget | null; error: any }> {
	const supabase = getSupabaseClient();
	let payload: any = { ...changes };
	let publicUrl: string | null = null;
	let filePath: string | null = null;

	// Handle PDF update if provided
	if (pdfFile) {
		const sanitizedName = pdfFile.name.replace(/\s+/g, '_');
		const fileName = `budget_${changes.type || 'edit'}_${Date.now()}_${sanitizedName}`;
		filePath = `${clientId}/${fileName}`;

		// Upload the new PDF file to Supabase Storage
		const { data: uploadData, error: uploadError } = await supabase.storage
			.from('clients')
			.upload(filePath, pdfFile);

		if (uploadError) {
			console.error('Error uploading PDF:', uploadError);
			return { data: null, error: uploadError };
		}

		// Get the public URL of the uploaded PDF
		const {
			data: { publicUrl: url },
		} = supabase.storage.from('clients').getPublicUrl(filePath);
		publicUrl = url;

		payload = {
			...payload,
			pdf_url: publicUrl,
			pdf_path: filePath,
		};
	}

	const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select().single();

	return { data, error };
}

export async function deleteBudget(id: number): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}

export const months = [
	'Ene',
	'Feb',
	'Mar',
	'Abr',
	'May',
	'Jun',
	'Jul',
	'Ago',
	'Sep',
	'Oct',
	'Nov',
	'Dic',
];

export async function getClientsWithBudgetCount(): Promise<{ data: number; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from('folder_budgets')
		.select('client_id', { count: 'exact' });

	if (error) return { data: 0, error };
	if (!data) return { data: 0, error: null };

	// Obtain unique client IDs from the folder_budgets table and count them
	const uniqueClients = new Set(data.map((item: any) => item.client_id).filter(Boolean));
	return { data: uniqueClients.size, error: null };
}

export async function getBudgetsByMonth(): Promise<{
	data: Array<{
		month: string;
		presupuestos: number;
		vendidos: number;
		date_sale: number;
		perdidos: number;
		presupuestosValue: number;
		vendidosValue: number;
		date_saleValue: number;
		perdidosValue: number;
	}> | null;
	error: any;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('created_at, sold, lost, date_of_sale, amount_ars');

	if (error) return { data: null, error };
	if (!data) return { data: [], error: null };

	// Group by month and count presupuestos and vendidos
	const monthMap = new Map<
		string,
		{ presupuestos: number; vendidos: number; date_sale: number; perdidos: number; presupuestosValue: number; vendidosValue: number; date_saleValue: number; perdidosValue: number }
	>();

	// Inizialize monthMap with all months to ensure they appear in the result even if they have 0 presupuestos/vendidos
	months.forEach((month) => {
		monthMap.set(month, { presupuestos: 0, vendidos: 0, date_sale: 0, perdidos: 0, presupuestosValue: 0, vendidosValue: 0, date_saleValue: 0, perdidosValue: 0 });
	});

	// Contact data and populate monthMap
	data.forEach((budget: any) => {
		const amount = typeof budget.amount_ars === 'number' && !Number.isNaN(budget.amount_ars) ? budget.amount_ars : 0;

		if (budget.created_at) {
			const date = new Date(budget.created_at);
			const monthIndex = date.getMonth();
			const monthName = months[monthIndex];

			const current = monthMap.get(monthName) || {
				presupuestos: 0,
				vendidos: 0,
				date_sale: 0,
				perdidos: 0,
				presupuestosValue: 0,
				vendidosValue: 0,
				date_saleValue: 0,
				perdidosValue: 0,
			};
			current.presupuestos += 1;
			current.presupuestosValue += amount;
			if (budget.sold) {
				current.vendidos += 1;
				current.vendidosValue += amount;
			}
			if (budget.lost) {
				current.perdidos += 1;
				current.perdidosValue += amount;
			}
			monthMap.set(monthName, current);
		}

		// Count sold by date sale
		if (budget.sold && budget.date_of_sale) {
			const date = new Date(budget.date_of_sale);
			const monthIndex = date.getMonth();
			const monthName = months[monthIndex];

			const current = monthMap.get(monthName) || {
				presupuestos: 0,
				vendidos: 0,
				date_sale: 0,
				perdidos: 0,
				presupuestosValue: 0,
				vendidosValue: 0,
				date_saleValue: 0,
				perdidosValue: 0,
			};
			current.date_sale += 1;
			current.date_saleValue += amount;
			monthMap.set(monthName, current);
		}
	});

	// Convert monthMap to an array and ensure all months are included in the result
	const result = months.map((month) => ({
		month,
		...monthMap.get(month)!,
	}));

	return { data: result, error: null };
}

export async function getAverageSaleDelayDays(): Promise<{ data: number; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('created_at, date_of_sale')
		.eq('sold', true)
		.not('date_of_sale', 'is', null);

	if (error) return { data: 0, error };
	if (!data || data.length === 0) return { data: 0, error: null };

	let totalDays = 0;
	let count = 0;

	data.forEach((b: any) => {
		if (b.created_at && b.date_of_sale) {
			const created = new Date(b.created_at).getTime();
			const soldAt = new Date(b.date_of_sale).getTime();
			const diffDays = (soldAt - created) / (1000 * 60 * 60 * 24);
			if (!Number.isNaN(diffDays)) {
				totalDays += diffDays;
				count += 1;
			}
		}
	});

	if (count === 0) return { data: 0, error: null };

	const avg = totalDays / count;
	// keep one decimal
	return { data: Number(avg.toFixed(1)), error: null };
}

const AMOUNT_INTERVALS = [
	{ label: '0 a 1.000.000', min: 0, max: 1_000_000 },
	{ label: '1.000.000 a 10.000.000', min: 1_000_000, max: 10_000_000 },
	{ label: '10.000.000 a 30.000.000', min: 10_000_000, max: 30_000_000 },
	{ label: '30.000.000 a 50.000.000', min: 30_000_000, max: 50_000_000 },
	{ label: 'Mayor a 50.000.000', min: 50_000_000, max: Number.POSITIVE_INFINITY },
];

export async function getBudgetsByAmountRange(): Promise<{
	data: Array<{ amountRange: string; count: number }> | null;
	error: any;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('amount_ars');

	if (error) return { data: null, error };
	if (!data) return { data: [], error: null };

	const amounts = data
		.map((budget: any) => Number(budget.amount_ars || 0))
		.filter((amount: number) => Number.isFinite(amount) && amount >= 0);

	if (amounts.length === 0) {
		return {
			data: AMOUNT_INTERVALS.map((interval) => ({ amountRange: interval.label, count: 0 })),
			error: null,
		};
	}

	const intervalCounts = AMOUNT_INTERVALS.map((interval) => ({
		amountRange: interval.label,
		count: 0,
	}));

	amounts.forEach((amount) => {
		const intervalIndex = AMOUNT_INTERVALS.findIndex((interval, index) => {
			if (index === AMOUNT_INTERVALS.length - 1) {
				return amount >= interval.min;
			}

			return amount >= interval.min && amount < interval.max;
		});

		if (intervalIndex >= 0) {
			intervalCounts[intervalIndex].count += 1;
		}
	});

	return { data: intervalCounts, error: null };
}

export async function getBudgetsByAmountRangeChosen(): Promise<{
	data: Array<{ amountRange: string; count: number }> | null;
	error: any;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('amount_ars').eq('accepted', true);

	if (error) return { data: null, error };
	if (!data) return { data: [], error: null };

	const amounts = data
		.map((budget: any) => Number(budget.amount_ars || 0))
		.filter((amount: number) => Number.isFinite(amount) && amount >= 0);

	if (amounts.length === 0) {
		return {
			data: AMOUNT_INTERVALS.map((interval) => ({ amountRange: interval.label, count: 0 })),
			error: null,
		};
	}

	const intervalCounts = AMOUNT_INTERVALS.map((interval) => ({
		amountRange: interval.label,
		count: 0,
	}));

	amounts.forEach((amount) => {
		const intervalIndex = AMOUNT_INTERVALS.findIndex((interval, index) => {
			if (index === AMOUNT_INTERVALS.length - 1) {
				return amount >= interval.min;
			}

			return amount >= interval.min && amount < interval.max;
		});

		if (intervalIndex >= 0) {
			intervalCounts[intervalIndex].count += 1;
		}
	});

	return { data: intervalCounts, error: null };
}

export async function getBudgetsByAmountRangeSold(): Promise<{
	data: Array<{ amountRange: string; count: number }> | null;
	error: any;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('amount_ars').eq('sold', true);

	if (error) return { data: null, error };
	if (!data) return { data: [], error: null };

	const amounts = data
		.map((budget: any) => Number(budget.amount_ars || 0))
		.filter((amount: number) => Number.isFinite(amount) && amount >= 0);

	if (amounts.length === 0) {
		return {
			data: AMOUNT_INTERVALS.map((interval) => ({ amountRange: interval.label, count: 0 })),
			error: null,
		};
	}

	const intervalCounts = AMOUNT_INTERVALS.map((interval) => ({
		amountRange: interval.label,
		count: 0,
	}));

	amounts.forEach((amount) => {
		const intervalIndex = AMOUNT_INTERVALS.findIndex((interval, index) => {
			if (index === AMOUNT_INTERVALS.length - 1) {
				return amount >= interval.min;
			}

			return amount >= interval.min && amount < interval.max;
		});

		if (intervalIndex >= 0) {
			intervalCounts[intervalIndex].count += 1;
		}
	});

	return { data: intervalCounts, error: null };
}

export async function getBudgetsByAmountRangeLost(): Promise<{
	data: Array<{ amountRange: string; count: number }> | null;
	error: any;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('amount_ars').eq('lost', true);

	if (error) return { data: null, error };
	if (!data) return { data: [], error: null };

	const amounts = data
		.map((budget: any) => Number(budget.amount_ars || 0))
		.filter((amount: number) => Number.isFinite(amount) && amount >= 0);

	if (amounts.length === 0) {
		return {
			data: AMOUNT_INTERVALS.map((interval) => ({ amountRange: interval.label, count: 0 })),
			error: null,
		};
	}

	const intervalCounts = AMOUNT_INTERVALS.map((interval) => ({
		amountRange: interval.label,
		count: 0,
	}));

	amounts.forEach((amount) => {
		const intervalIndex = AMOUNT_INTERVALS.findIndex((interval, index) => {
			if (index === AMOUNT_INTERVALS.length - 1) {
				return amount >= interval.min;
			}

			return amount >= interval.min && amount < interval.max;
		});

		if (intervalIndex >= 0) {
			intervalCounts[intervalIndex].count += 1;
		}
	});

	return { data: intervalCounts, error: null };
}

export async function getBudgetsByLocation(): Promise<{
	data: Array<{ location: string; count: number }> | null;
	error: any;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from('folder_budgets').select('works!inner(locality)');

	if (error) return { data: null, error };
	if (!data) return { data: [], error: null };

	// Group by location
	const locationMap = new Map<string, number>();

	data.forEach((item: any) => {
		if (item.works && item.works.locality) {
			const locality = item.works.locality;
			locationMap.set(locality, (locationMap.get(locality) || 0) + 1);
		}
	});

	// Convert to array and sort by count descending
	const result = Array.from(locationMap, ([location, count]) => ({
		location,
		count,
	})).sort((a, b) => b.count - a.count);

	return { data: result, error: null };
}

export async function getClientsByContactMethod(): Promise<{
	data: Array<{ method: string; count: number }> | null;
	error: any;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from('clients').select('contact_method');

	if (error) return { data: null, error };
	if (!data) return { data: [], error: null };

	// Group by contact method
	const methodMap = new Map<string, number>();

	data.forEach((item: any) => {
		const method = item.contact_method || 'WHATSAPP';
		methodMap.set(method, (methodMap.get(method) || 0) + 1);
	});

	// Convert to array and sort by count descending
	const result = Array.from(methodMap, ([method, count]) => ({
		method,
		count,
	})).sort((a, b) => b.count - a.count);

	return { data: result, error: null };
}

export async function getBudgetsByMaterial(): Promise<{
	data: Array<{ material: string; count: number }> | null;
	error: any;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('type');

	if (error) return { data: null, error };
	if (!data) return { data: [], error: null };

	// Group by material type
	const materialMap = new Map<string, number>();

	data.forEach((item: any) => {
		const material = item.type || 'Sin especificar';
		materialMap.set(material, (materialMap.get(material) || 0) + 1);
	});

	// Convert to array and sort by count descending
	const result = Array.from(materialMap, ([material, count]) => ({
		material,
		count,
	})).sort((a, b) => b.count - a.count);

	return { data: result, error: null };
}

export async function getSoldBudgetsByMaterial(): Promise<{
	data: Array<{ material: string; count: number }> | null;
	error: any;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('type').eq('sold', true);

	if (error) return { data: null, error };
	if (!data) return { data: [], error: null };

	// Group by material type
	const materialMap = new Map<string, number>();

	data.forEach((item: any) => {
		const material = item.type || 'Sin especificar';
		materialMap.set(material, (materialMap.get(material) || 0) + 1);
	});

	// Convert to array and sort by count descending
	const result = Array.from(materialMap, ([material, count]) => ({
		material,
		count,
	})).sort((a, b) => b.count - a.count);

	return { data: result, error: null };
}

export async function getSoldBudgetsByMaterialByMonth(): Promise<{
	data: Array<{ month: string; pvc: number; aluminio: number; pvcValue: number; aluminioValue: number }> | null;
	error: any;
}> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('created_at, type, amount_ars').eq('sold', true);

	if (error) return { data: null, error };
	if (!data) return { data: [], error: null };

	const monthMap = new Map<string, { pvc: number; aluminio: number; pvcValue: number; aluminioValue: number }>();

	months.forEach((month) => {
		monthMap.set(month, { pvc: 0, aluminio: 0, pvcValue: 0, aluminioValue: 0 });
	});

	data.forEach((budget: any) => {
		if (!budget.created_at) return;

		const monthName = months[new Date(budget.created_at).getMonth()];
		const current = monthMap.get(monthName) || { pvc: 0, aluminio: 0, pvcValue: 0, aluminioValue: 0 };
		const material = String(budget.type || '')
			.trim()
			.toLowerCase();
		const amount = typeof budget.amount_ars === 'number' && !Number.isNaN(budget.amount_ars) ? budget.amount_ars : 0;

		if (material.includes('pvc')) {
			current.pvc += 1;
			current.pvcValue += amount;
		}

		if (material.includes('aluminio')) {
			current.aluminio += 1;
			current.aluminioValue += amount;
		}

		monthMap.set(monthName, current);
	});

	const result = months.map((month) => ({
		month,
		...monthMap.get(month)!,
	}));

	return { data: result, error: null };
}

export async function chooseBudgetForClient(
	budgetId: number,
	folderBudgetIds: number[]
): Promise<{ error: any }> {
	const supabase = getSupabaseClient();
	if (folderBudgetIds.length === 0) return { error: null };

	const { error: clearError } = await supabase
		.from(TABLE)
		.update({ accepted: false })
		.in('folder_budget_id', folderBudgetIds);

	if (clearError) return { error: clearError };

	const { error: setError } = await supabase
		.from(TABLE)
		.update({ accepted: true })
		.eq('id', budgetId);

	if (setError) return { error: setError };
	return { error: null };
}
