import { getSupabaseClient } from '../supabase-client';

// Crea una "carpeta" en el bucket `clientes` creando un archivo placeholder
export async function createClientFolder(clientId: string): Promise<{ data: any; error: any }> {
    const supabase = getSupabaseClient();

    // Subimos un archivo vacío `.keep` dentro de la carpeta del cliente.
    // En Supabase Storage, crear/colocar un objeto en una ruta creará la "carpeta" implícita.
    const filePath = `${clientId}/.keep`;
    try {
        const blob = new Blob([]);
        const { data, error } = await supabase.storage.from('clientes').upload(filePath, blob, {
            upsert: true,
        });
        return { data, error };
    } catch (error) {
        return { data: null, error };
    }
}
