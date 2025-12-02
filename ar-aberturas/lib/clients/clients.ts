import { getSupabaseClient } from '../supabase-client';

export type Client = {
	id: string;
	created_at?: string;
	name: string;
    last_name: string;
	phone_number?: string | null;
	locality?: string | null;
    email?: string | null;
};

const TABLE = 'clients';

export async function listClients(): Promise<{ data: Client[] | null; error: any }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from(TABLE)
        .select('name, last_name, id, email, phone_number, email')
        .order('created_at', { ascending: false });
    return { data, error };
}

export async function getClientById(id: string): Promise<{ data: Client | null; error: any }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('id', id)
        .single();
    return { data, error };
}

export async function createClient(client: Omit<Client, 'id' | 'created_at'>): Promise<{ data: Client | null; error: any }> {
    const supabase = getSupabaseClient();
    const payload = {
        ...client,
        created_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
        .from(TABLE)
        .insert(payload)
        .select()
        .single();
    return { data, error };
}

export async function updateClient(id: string, changes: Partial<Client>): Promise<{ data: Client | null; error: any }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from(TABLE)
        .update(changes)
        .eq('id', id)
        .select()
        .single();
    return { data, error };
}

export async function deleteClient(id: string): Promise<{ data: null; error: any }> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq('id', id);
    return { data: null, error };
}
