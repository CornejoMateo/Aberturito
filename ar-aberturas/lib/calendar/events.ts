// Helper para crear evento y asociar date_id correctamente
import { getSupabaseClient } from '../supabase-client';
import { createDate } from '../calendar/dates';

export type Event = {
  id: string;
  created_at?: string;
  date_id?: string | null;
  date?: string | null;
  type?: string | null;
  title?: string | null;
  description?: string | null;
  client?: string | null;
  location?: string | null;
  status?: 'programado' | 'confirmado' | 'completado';
  time?: string | null;
  work_id?: number | null;
};

const TABLE = 'events';

// It's a method that shouldn't be used, but I'm adding it just in case.
export async function listEvents(): Promise<{ data: Event[] | null; error: any }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select(`
      id, 
      created_at, 
      date_id, 
      type, 
      title,
      description, 
      client,
      location,
      status,
      time,
      work_id,
      dates (date)
    `)
    .order('created_at', { ascending: false });

  // Mapear los datos para incluir la fecha directamente en el evento
  const events = data?.map(event => ({
    ...event,
    date: event.dates?.[0]?.date
  })) || null;

  return { data: events, error };
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
    // 1. Verificar si la fecha ya existe en la tabla dates
    const { data: dateData, error: dateError } = await supabase
      .from('dates')
      .select('id')
      .eq('date', event.date)
      .single();

    let dateId: string;

    if (dateData?.id) {
      dateId = dateData.id;
    } else {
      // 2. Si la fecha no existe, crearla
      const { data: newDateData, error: newDateError } = await createDate({ date: event.date! });
      if (newDateError) {
        console.error('Error al crear la fecha:', newDateError);
        return { data: null, error: newDateError };
      }
      dateId = newDateData!.id;
    }

    // 3. Preparar el payload para el evento
    const payload: any = {
      title: event.title,
      type: event.type,
      description: event.description,
      client: event.client,
      location: event.location,
      status: event.status || 'programado',
      time: event.time,
      work_id: event.work_id,
      date_id: dateId,
      created_at: new Date().toISOString(),
    };

    // 4. Insertar el evento
    const { data, error } = await supabase
      .from(TABLE)
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error al crear el evento:', error);
      return { data: null, error };
    }

    // 5. Obtener el evento recién creado con los datos relacionados
    const { data: createdEvent, error: fetchError } = await supabase
      .from(TABLE)
      .select(`
        *,
        dates (date)
      `)
      .eq('id', data.id)
      .single();

    if (fetchError) {
      console.error('Error al obtener el evento creado:', fetchError);
      return { data: null, error: fetchError };
    }

    // 6. Formatear la respuesta
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

export async function createEventForWork(
	workId: string,
	event: Omit<Event, 'id' | 'created_at' | 'work_id'>
): Promise<{ data: Event | null; error: any }> {
	const supabase = getSupabaseClient();
	const payload = {
		...event,
		work_id: workId,
		created_at: new Date().toISOString(),
	};
	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
	return { data, error };
}

export async function updateEvent(
	id: string,
	changes: Partial<Event>
): Promise<{ data: Event | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).update(changes).eq('id', id).select().single();
	return { data, error };
}

export async function deleteEvent(id: string): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();
	const { error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}

export async function getEventsByDateId(
	dateId: string
): Promise<{ data: Event[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.eq('date_id', dateId)
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getEventsByWorkId(
	workId: string
): Promise<{ data: Event[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.eq('work_id', workId)
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getEventsByType(type: string): Promise<{ data: Event[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.eq('type', type)
		.order('created_at', { ascending: false });
	return { data, error };
}
