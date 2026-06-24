import { toast } from '@/components/ui/use-toast';
import { createEvent } from '@/lib/calendar/events';
import { translateError } from '@/lib/error-translator';

interface EventData {
	title?: string;
	type: string;
	description?: string;
	client: string;
	location?: string;
	address?: string;
	date: string | Date;
	remember?: boolean;
}

export async function handleCreateEventFromSurveyItem(
	eventData: EventData,
): Promise<boolean> {
	try {
		const dateStr =
			typeof eventData.date === 'string'
				? eventData.date
				: eventData.date instanceof Date
					? `${eventData.date.getDate()}-${eventData.date.getMonth() + 1}-${eventData.date.getFullYear()}`
					: '';

		const [day, month, year] = dateStr.split('-').map(Number);
		const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

		const { data: newEvent, error } = await createEvent({
			title: eventData.title || 'Sin título',
			type: eventData.type,
			description: eventData.description,
			client: eventData.client,
			location: eventData.location,
			address: eventData.address,
			date: formattedDate,
			remember: eventData.remember,
		});

		if (error) {
			console.error('Error al crear el evento:', error);
			toast({
				title: 'Error',
				description: translateError(error),
				variant: 'destructive',
			});
			return false;
		}

		if (newEvent) {
			toast({
				title: 'Evento creado',
				description: 'El evento se ha creado correctamente',
			});
			return true;
		}

		return false;
	} catch (error) {
		console.error('Error inesperado al crear el evento:', error);
		toast({
			title: 'Error',
			description: translateError(error),
			variant: 'destructive',
		});
		return false;
	}
}
