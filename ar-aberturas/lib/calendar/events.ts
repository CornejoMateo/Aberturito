// Helper para crear evento y asociar date_id correctamente
import { getSupabaseClient } from '../supabase-client';
import { CalendarDate } from '../calendar/dates';

export type Event = {
	id: string;
	created_at?: string;
	date_id?: string | null;
	date?: string | null;
	type?: string | null;
	description?: string | null;
	work_id?: string | null;
};

const TABLE = 'events';

// It's a method that shouldn't be used, but I'm adding it just in case.
export async function listEvents(): Promise<{ data: Event[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('id, created_at, date_id, type, description, work_id')
		.order('created_at', { ascending: false });
	return { data, error };
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

	const { data: dateData, error: dateError } = await supabase
		.from('dates')
		.select('id')
		.eq('date', event.date)
		.single();

	let dateId: string;

	if (dateData && dateData.id) {
		dateId = dateData.id;
	} else {
		const { data: newDate, error: newDateError } = await supabase
			.from('dates')
			.insert({ date: event.date })
			.select('id')
			.single();
		if (newDate && newDate.id) {
			dateId = newDate.id;
		} else {
			return { data: null, error: newDateError || dateError };
		}
	}

	const payload = {
		...event,
		date_id: dateId,
		created_at: new Date().toISOString(),
	};
	delete payload.date;

	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
	return { data, error };
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
