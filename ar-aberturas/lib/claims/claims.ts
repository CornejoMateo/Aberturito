import { getSupabaseClient } from '../supabase-client';

export type Claim = {
	id: string;
	created_at?: string;
	client_name?: string | null;
	client_phone?: string | null;
	work_zone?: string | null;
	work_locality?: string | null;
	work_address?: string | null;
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
		.order('date', { ascending: false })
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getClaimById(id: string): Promise<{ data: Claim | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	return { data, error };
}

export async function getClaimsByClientName(
	clientName: string
): Promise<{ data: Claim[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.ilike('client_name', `%${clientName}%`)
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getClaimsByWorkZone(
	workZone: string
): Promise<{ data: Claim[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.ilike('work_zone', `%${workZone}%`)
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

export async function createClaim(
	claim: Omit<Claim, 'id' | 'created_at'>
): Promise<{ data: Claim | null; error: any }> {
	const supabase = getSupabaseClient();
	const payload = {
		...claim,
		created_at: new Date().toISOString(),
	};
	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
	return { data, error };
}

export async function updateClaim(
	id: string,
	changes: Partial<Claim>
): Promise<{ data: Claim | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).update(changes).eq('id', id).select().single();
	return { data, error };
}

export async function resolveClaim(
	id: string,
	resolutionDate?: string
): Promise<{ data: Claim | null; error: any }> {
	const supabase = getSupabaseClient();
	const payload = {
		resolved: true,
		resolution_date: resolutionDate || new Date().toISOString(),
	};
	const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select().single();
	return { data, error };
}

export async function reopenClaim(id: string): Promise<{ data: Claim | null; error: any }> {
	const supabase = getSupabaseClient();
	const payload = {
		resolved: false,
		resolution_date: null,
		attend: null,
	};
	const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select().single();
	return { data, error };
}

export async function deleteClaim(id: string): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}

// method to delete claims that were resolved more than a month ago
export async function deleteOldClaims(): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	
	const oneMonthAgo = new Date();
	oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
	
	const { error } = await supabase
		.from(TABLE)
		.delete()
		.eq('resolved', true)
		.lt('resolution_date', oneMonthAgo.toISOString());
	
	return { data: null, error };
}