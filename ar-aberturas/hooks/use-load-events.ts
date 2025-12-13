import { listEvents, Event } from '@/lib/calendar/events';
import { useRealtimeEvents } from '@/hooks/use-realtime-events';

export function useLoadEvents() {
	const {
		data: rawEvents,
		loading: isLoading,
		error,
		refresh,
	} = useRealtimeEvents<Event>(
		'events',
		async () => {
			const { data } = await listEvents();
			return data ?? [];
		},
		'events_cache'
	);

	const events = rawEvents.map((event) => {
		const [year, month, day] = (event.date || '').split('-');
		const formattedDate = event.date
			? `${day}-${month}-${year}`
			: new Date().toISOString().split('T')[0];

		return {
			id: event.id,
			date: formattedDate,
			type: (event.type as 'produccionOK' | 'colocacion' | 'medicion') || 'otros',
			title: event.title || 'Sin título',
			description: event.description || '',
			client: event.client || 'Sin cliente',
			location: event.location || 'Sin ubicación',
			address: event.address || 'Sin dirección',
			status: event.status,
			is_overdue: event.is_overdue || false,
		};
	});

	return { events, isLoading, refresh };
}
