import { listEvents, Event } from '@/lib/calendar/events';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';
import { status } from '@/constants/stock-constants';

export function useLoadEvents() {
	const {
		data: rawEvents,
		loading: isLoading,
		error,
		refresh,
	} = useOptimizedRealtime<Event>(
		'calendar_events',
		async () => {
			const { data } = await listEvents();
			return data ?? [];
		},
		'calendar_events_cache'
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
		};
	});

	return { events, isLoading, refresh };
}
