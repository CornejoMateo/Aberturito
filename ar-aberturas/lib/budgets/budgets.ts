import { getSupabaseClient } from '../supabase-client';
import { BudgetWithWork } from '../works/balances';

export type Budget = {
  id: string;
  created_at: string;
  folder_budget_id?: string | null;
  accepted?: boolean | null;
  pdf_url?: string | null;
  pdf_path?: string | null;
  number?: string | null;
  amount_ars?: number | null;
  amount_usd?: number | null;
  version?: string | null;
  type?: string | null;
};

const TABLE = 'budgets';

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
				amount_ars,
				amount_usd,
				accepted,
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
				amount_ars: b.amount_ars,
				amount_usd: b.amount_usd,
				accepted: b.accepted,
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
	pdfFile: File,
	clientId: string
): Promise<{ data: Budget | null; error: any }> {
	const supabase = getSupabaseClient();

	const fileName = `budget_${budget.type}_${budget.number}_${pdfFile.name}`;
	const filePath = `${clientId}/${fileName}`;

	// Load the PDF file to Supabase Storage
	const { data: uploadData, error: uploadError } = await supabase.storage
		.from('clients')
		.upload(filePath, pdfFile);

	if (uploadError) {
		console.error('Error uploading PDF:', uploadError);
		return { data: null, error: uploadError };
	}

	// Get the public URL of the uploaded PDF
	const {
		data: { publicUrl },
	} = supabase.storage.from('clients').getPublicUrl(filePath);

	// Create the budget in the database
	const payload = {
		...budget,
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

export async function deleteBudget(id: string): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
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
