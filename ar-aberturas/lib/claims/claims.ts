import { getSupabaseClient } from '../supabase-client';

export type Claim = {
  id: string;
  created_at?: string;
  client_id?: number | null;
  work_id?: string | null;
  daily?: boolean | null;
  alum_pvc?: string | null;
  attend?: string | null;
  description?: string | null;
  date?: string | null;
  resolved?: boolean | null;
  resolution_date?: string | null;
};

const TABLE = 'claims';

export async function listClaims(): Promise<{ data: Claim[] | null; error: any }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getClaimById(id: string): Promise<{ data: Claim | null; error: any }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

export async function getClaimsByClient(clientId: number): Promise<{ data: Claim[] | null; error: any }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getClaimsByWork(workId: string): Promise<{ data: Claim[] | null; error: any }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('work_id', workId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getPendingClaims(): Promise<{ data: Claim[] | null; error: any }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('resolved', false)
    .order('date', { ascending: true });
  return { data, error };
}

export async function getResolvedClaims(): Promise<{ data: Claim[] | null; error: any }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('resolved', true)
    .order('resolution_date', { ascending: false });
  return { data, error };
}

export async function createClaim(claim: Omit<Claim, 'id' | 'created_at'>): Promise<{ data: Claim | null; error: any }> {
  const supabase = getSupabaseClient();
  const payload = {
    ...claim,
    created_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();
  return { data, error };
}

export async function updateClaim(id: string, changes: Partial<Claim>): Promise<{ data: Claim | null; error: any }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update(changes)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function resolveClaim(id: string, resolutionDate?: string): Promise<{ data: Claim | null; error: any }> {
  const supabase = getSupabaseClient();
  const payload = {
    resolved: true,
    resolution_date: resolutionDate || new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deleteClaim(id: string): Promise<{ data: null; error: any }> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id);
  return { data: null, error };
}
