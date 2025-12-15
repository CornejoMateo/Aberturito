import { getSupabaseClient } from '../supabase-client';

export type Client = {
	id: string;
	created_at?: string;
	name?: string | null;
    last_name?: string| null;
	phone_number?: string | null;
	locality?: string | null;
    email?: string | null;
    notes?: string[] | null;
};

const TABLE = 'clients';

export async function listClients(): Promise<{ data: Client[] | null; error: any }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from(TABLE)
        .select('name, last_name, id, phone_number, locality, email, notes')
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
    
    // First, delete all files in the client's folder
    try {
        const { data: files, error: listError } = await supabase.storage
            .from('clients')
            .list(id);
        
        if (!listError && files && files.length > 0) {
            const filePaths = files.map(file => `${id}/${file.name}`);
            await supabase.storage
                .from('clients')
                .remove(filePaths);
        }
    } catch (err) {
        console.error('Error deleting client folder:', err);
    }
    
    // Then delete the client record
    const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq('id', id);
    return { data: null, error };
}

export async function createClientFolder(clientId: string) {
  const supabase = getSupabaseClient();

  const filePath = `${clientId}/.keep.txt`;

  const blob = new Blob(["Cliente creado correctamente"], {
    type: "text/plain",
  });

  try {
    const { data, error } = await supabase.storage
      .from("clients")
      .upload(filePath, blob);

    if (error) {
      console.error('Storage upload error:', error);
    }

    return { data, error };
  } catch (err) {
    console.error('Unexpected error creating folder:', err);
    return { data: null, error: err };
  }
}
