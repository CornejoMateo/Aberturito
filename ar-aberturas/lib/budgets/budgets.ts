import { getSupabaseClient } from '../supabase-client';

export type Budget = {
  id: string;
  created_at: string;
  folder_budget_id?: string | null;
  accepted?: boolean | null;
  pdf_url?: string | null;
  pdf_path?: string | null;
  number?: number | null;
  amount_ars?: number | null;
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
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

export async function getBudgetsByFolderBudgetId(folderBudgetId: string): Promise<{ data: Budget[] | null; error: any }> {
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
): Promise<{ data: Budget[] | null; error: any }> {
  const supabase = getSupabaseClient();
  if (folderBudgetIds.length === 0) return { data: [], error: null };
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .in('folder_budget_id', folderBudgetIds)
    .order('created_at', { ascending: false });
  return { data, error };
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
  const { data: { publicUrl } } = supabase.storage
    .from('clients')
    .getPublicUrl(filePath);

  // Create the budget in the database
  const payload = {
    ...budget,
    pdf_url: publicUrl,
    pdf_path: filePath,
  };

  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();

  return { data, error };
}

export async function updateBudget(
  id: string,
  changes: Partial<Omit<Budget, 'id' | 'created_at'>>
): Promise<{ data: Budget | null; error: any }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update(changes)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deleteBudget(id: string): Promise<{ data: null; error: any }> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id);
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
