import { getSupabaseClient } from '../supabase-client';
import { BudgetWithWork } from '../works/balances';

export type Budget = {
  id: string;
  created_at: string;
  folder_budget_id?: string | null;
  accepted?: boolean | null;
  sold?: boolean | null;
  pdf_url?: string | null;
  pdf_path?: string | null;
  number?: string | null;
  amount_ars?: number | null;
  amount_usd?: number | null;
  version?: string | null;
  type?: string | null;
};

const TABLE = 'budgets';

export async function getBudgetsCount(): Promise<{ data: number; error: any }> {
	const supabase = getSupabaseClient();
	const { count, error } = await supabase
		.from(TABLE)
		.select('*', { count: 'exact', head: true });
	return { data: count || 0, error };
}

export async function getBudgetsTotalAmount(): Promise<{ data: { totalArs: number; totalUsd: number }; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('amount_ars, amount_usd');
	
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

export async function getChosenBudgetsCount(): Promise<{ data: number; error: any }> {
	const supabase = getSupabaseClient();
	const { count, error } = await supabase
		.from(TABLE)
		.select('*', { count: 'exact', head: true })
		.eq('accepted', true);
	return { data: count || 0, error };
}

export async function getSoldBudgetsTotalAmount(): Promise<{ data: { totalArs: number; totalUsd: number }; error: any }> {
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

export async function getChosenBudgetsTotalAmount(): Promise<{ data: { totalArs: number; totalUsd: number }; error: any }> {
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

export async function getBudgetById(id: string): Promise<{ data: Budget | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	return { data, error };
}

export async function getBudgetsByFolderBudgetId(
	folderBudgetId: string
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
	folderBudgetIds: string[]
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
				accepted,
				sold,
				pdf_url,
				pdf_path,
				number,
				version,
				type,
				folder_budget:folder_budgets!inner (
					id,
					work_id,
					work:works!inner (
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
			if (!work) return null;

			return {
				id: b.id,
				created_at: b.created_at,
				amount_ars: b.amount_ars,
				amount_usd: b.amount_usd,
				accepted: b.accepted,
				sold: b.sold,
				pdf_url: b.pdf_url,
				pdf_path: b.pdf_path,
				number: b.number,
				version: b.version,
				type: b.type,
				folder_budget: {
					id: folderBudget.id,
					work_id: folderBudget.work_id,
					work: {
						address: work.address,
						locality: work.locality,
					},
				},
			} as BudgetWithWork;
		})
		.filter((b): b is BudgetWithWork => b !== null);

	return { data: result, error: null };
}

export async function createBudget(
	budget: Omit<Budget, 'id' | 'created_at' | 'pdf_url' | 'pdf_path'>,
	pdfFile: File | null,
	clientId: string
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
	id: string,
	changes: Partial<Omit<Budget, 'id' | 'created_at'>>
): Promise<{ data: Budget | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).update(changes).eq('id', id).select().single();
	return { data, error };
}

export async function editBudget(
	id: string,
	changes: Partial<Omit<Budget, 'id' | 'created_at'>>,
	pdfFile: File | null,
	clientId: string
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

export async function deleteBudget(id: string): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}

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

export async function getBudgetsByMonth(): Promise<{ data: Array<{ month: string; presupuestos: number; vendidos: number }> | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('created_at, sold');

	if (error) return { data: null, error };
	if (!data) return { data: [], error: null };

	// Group by month and count presupuestos and vendidos
	const monthMap = new Map<string, { presupuestos: number; vendidos: number }>();
	const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

	// Inizialize monthMap with all months to ensure they appear in the result even if they have 0 presupuestos/vendidos
	months.forEach(month => {
		monthMap.set(month, { presupuestos: 0, vendidos: 0 });
	});

	// Contact data and populate monthMap
	data.forEach((budget: any) => {
		if (budget.created_at) {
			const date = new Date(budget.created_at);
			const monthIndex = date.getMonth();
			const monthName = months[monthIndex];

			const current = monthMap.get(monthName) || { presupuestos: 0, vendidos: 0 };
			current.presupuestos += 1;
			if (budget.sold) {
				current.vendidos += 1;
			}
			monthMap.set(monthName, current);
		}
	});

	// Convert monthMap to an array and ensure all months are included in the result
	const result = months.map(month => ({
		month,
		...monthMap.get(month)!
	}));

	return { data: result, error: null };
}

export async function getBudgetsByLocation(): Promise<{ data: Array<{ location: string; count: number }> | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from('folder_budgets')
		.select('works!inner(locality)');

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
		count
	})).sort((a, b) => b.count - a.count);

	return { data: result, error: null };
}

export async function getClientsByContactMethod(): Promise<{ data: Array<{ method: string; count: number }> | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from('clients')
		.select('contact_method');

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
		count
	})).sort((a, b) => b.count - a.count);

	return { data: result, error: null };
}

export async function getBudgetsByMaterial(): Promise<{ data: Array<{ material: string; count: number }> | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('type');

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
		count
	})).sort((a, b) => b.count - a.count);

	return { data: result, error: null };
}

export async function getSoldBudgetsByMaterial(): Promise<{ data: Array<{ material: string; count: number }> | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('type')
		.eq('sold', true);

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
		count
	})).sort((a, b) => b.count - a.count);

	return { data: result, error: null };
}

export async function chooseBudgetForClient(
	budgetId: string,
	folderBudgetIds: string[]
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
