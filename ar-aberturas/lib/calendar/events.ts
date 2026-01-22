import { getSupabaseClient } from '../supabase-client';

export type Event = {
  id: string;
  created_at?: string;
  date: string;
  type?: string | null;
  title?: string | null;
  description?: string | null;
  client?: string | null;
  location?: string | null;
  address?: string | null;
  status?: string | null;
  is_overdue?: boolean;
  remember?: boolean;
};

const TABLE = 'events';

// It's a method that shouldn't be used, but I'm adding it just in case.
export async function listEvents(): Promise<{ data: Event[] | null; error: any }> {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error al cargar eventos:', error);
      return { data: null, error };
    }

    return { data , error: null };

  } catch (error) {
    console.error('Error inesperado al listar eventos:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Error desconocido al listar eventos')
    };
  }
}

export async function getEventById(id: string): Promise<{ data: Event | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	return { data, error };
}

export async function createEvent(
  event: Omit<Event, 'id' | 'created_at'>
): Promise<{ data: Event | null; error: any }> {
  const supabase = getSupabaseClient();

  try {

    const payload: any = {
      title: event.title,
      type: event.type,
      description: event.description,
      client: event.client,
      location: event.location,
      date: event.date,
      address: event.address,
      status: 'Pendiente',
      is_overdue: false,
      remember: event.remember,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error al crear el evento:', error);
      return { data: null, error };
    }

    const { data: createdEvent, error: fetchError } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', data.id)
      .single();

    if (fetchError) {
      console.error('Error al obtener el evento creado:', fetchError);
      return { data: null, error: fetchError };
    }

    const formattedEvent: Event = {
      ...createdEvent,
      date: createdEvent.dates?.date
    };

    return { data: formattedEvent, error: null };
  } catch (error) {
    console.error('Error inesperado al crear el evento:', error);
    return { data: null, error };
  }
}

export async function updateEvent(
  id: string,
  changes: Partial<Event>
): Promise<{ data: Event | null; error: any }> {
  const supabase = getSupabaseClient();

  let updatePayload = { ...changes };
  if (Object.prototype.hasOwnProperty.call(changes, 'status')) {
    if (changes.status) {
      if (changes.status !== 'Pendiente') {
        updatePayload.is_overdue = false;
      } else {
        const currentDate = new Date();
        let eventDate: Date;
        const { data: currentEvent, error: fetchError } = await supabase.from(TABLE).select('date').eq('id', id).single();
        if (fetchError || !currentEvent?.date) {
          eventDate = currentDate;
        } else {
          eventDate = new Date(currentEvent.date);
        }
        updatePayload.is_overdue = eventDate < currentDate;
      }
    }
  }

  const { data, error } = await supabase.from(TABLE).update(updatePayload).eq('id', id).select().single();
  return { data, error };
}

export async function deleteEvent(id: string): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { error } = await supabase.from(TABLE).delete().eq('id', id);



	return { data: null, error };
}

export async function deleteLastYearEvents(): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	
	const date = new Date();
	const year = date.getFullYear();

	const { error } = await supabase
		.from(TABLE)
		.delete()
		.eq('status', 'Finalizado')
		.lt('date', `${year}-01-01`);

	return { data: null, error };
}
