import { getSupabaseClient } from '../supabase-client';

export type Work = {
  id: string;
  created_at?: string;
  locality?: string | null;
  address?: string | null;
  client_id?: string | null;
  client_name?: string | null;
  client_last_name?: string | null;
  status?: string | null;
  architect?: string | null;
  notes?: string[] | null;
  balance_id?: string | null;
  clients?: {
    name: string;
    last_name: string;
  } | null;
};

const TABLE = 'works';

export async function listWorks(): Promise<{ data: Work[] | null; error: any }> {
  try {
    const supabase = getSupabaseClient();
    
    // Hacer un JOIN con la tabla clients para obtener los nombres
    const { data, error } = await supabase
      .from('works')
      .select(`
        *,
        clients:client_id (name, last_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error en la consulta de obras con JOIN:', {
        message: error.message,
        details: error.details
      });
      return { data: null, error };
    }

    // Mapear los datos para incluir los nombres de los clientes
    const worksWithClientNames = data.map(work => ({
      ...work,
      client_name: work.clients?.name || null,
      client_last_name: work.clients?.last_name || null
    }));

    console.log('Obras con nombres de clientes:', worksWithClientNames);
    return { data: worksWithClientNames, error: null };
    
  } catch (error) {
    console.error('Error inesperado en listWorks:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Error desconocido') 
    };
    return { data: null, error };
  }
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
