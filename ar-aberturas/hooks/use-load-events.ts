import { useState, useEffect } from 'react';
import { listEvents } from '@/lib/calendar/events';
import { Event } from '@/lib/calendar/events';

export function useLoadEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const result = await listEvents();
        
        if (result.error) {
          console.error('Error al cargar los eventos:', result.error);
          setEvents([]);
          return;
        }
        
        if (result.data) {
          const formattedEvents = result.data.map(event => {
            // Convertir la fecha de yyyy-MM-dd a dd-MM-yyyy
            const [year, month, day] = (event.date || '').split('-');
            const formattedDate = event.date ? `${day}-${month}-${year}` : new Date().toISOString().split('T')[0];
            
            return {
              id: event.id,
              date: formattedDate,
              type: (event.type as 'entrega' | 'instalacion' | 'medicion') || 'otros',
              title: event.title || 'Sin título',
              description: event.description || '',
              client: event.client || 'Sin cliente',
              location: event.location || 'Sin ubicación',
            };
          });
          setEvents(formattedEvents);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error('Error inesperado al cargar los eventos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  return { events, isLoading, setEvents };
}
