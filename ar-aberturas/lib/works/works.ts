import { getSupabaseClient } from '../supabase-client';

export type Work = {
	id: string;
	created_at?: string;
	locality?: string | null;
	address?: string | null;
	client_id?: string | null;
	status?: string | null;
	architect?: string | null;
  notes?: string[] | null;
};

const TABLE = 'works';

export async function listWorks(): Promise<{ data: Work[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('id, created_at, locality, address, client_id, status, architect, notes') // Eliminar los campos que no van a ser usados
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getWorkById(id: string): Promise<{ data: Work | null; error: any }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();

	return { data, error };
}

export async function createWork(
  work: Omit<Work, 'id' | 'created_at'>
): Promise<{ data: Work | null; error: any }> {

	const supabase = getSupabaseClient();
	const payload = {
		...work,
	};
	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
	return { data, error };

}

export async function updateWork(
	id: string,
	changes: Partial<Work>
): Promise<{ data: Work | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).update(changes).eq('id', id).select().single();
	return { data, error };
}

export async function deleteWork(id: string): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}

export async function getWorksByClientId(
  clientId: string
): Promise<{ data: Work[] | null; error: any }> {
  try {
    console.log('Buscando obras para el cliente ID:', clientId);
    const supabase = getSupabaseClient();
    
    // Realizar la consulta directamente
    const { data, error } = await supabase
      .from('works')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error en la consulta de obras:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error inesperado en getWorksByClientId:', {
      error,
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}
