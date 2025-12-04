import { getSupabaseClient } from '../supabase-client';

// Create bucket 'clients' in Supabase Storage beforehand.
export async function createClientFolder(clientId: string): Promise<{ data: any; error: any }> {
    const supabase = getSupabaseClient();

    // Upload a placeholder file to create the folder
    
    const filePath = `${clientId}/.keep`;
    try {
        const blob = new Blob([]);
        const { data, error } = await supabase.storage.from('clients').upload(filePath, blob, {
            upsert: true,
        });
        return { data, error };
    } catch (error) {
        return { data: null, error };
    }
}
