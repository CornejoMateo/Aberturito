import { Event } from '../calendar/events';
import { NotificationSettings } from './types';

export function filterEvents(events: Event[], settings: NotificationSettings): Event[] {
  if (!settings.enabled || !settings.filters || settings.filters.length === 0) {
    return [];
  }

  const enabledFilters = settings.filters.filter(f => f.enabled);
  
  if (enabledFilters.length === 0) {
    return [];
  }

  return events.filter(event => {
    return enabledFilters.some(filter => {
      switch (filter.type) {
        case 'type':
          return event.type?.toLowerCase() === filter.value.toLowerCase();
        case 'title':
          return event.title?.toLowerCase().includes(filter.value.toLowerCase());
        default:
          return false;
      }
    });
  });
}

export function getEventsForDate(date: string): Promise<{ data: Event[] | null; error: any }> {
  // Importar dinámicamente para evitar dependencias circulares
  return import('../calendar/events').then(({ listEvents }) => {
    return listEvents().then(result => {
      if (result.error || !result.data) {
        return { data: null, error: result.error };
      }

      const filteredEvents = result.data.filter(event => {
        // Comparar solo la fecha (ignorar hora)
        const eventDate = new Date(event.date).toISOString().split('T')[0];
        const targetDate = new Date(date).toISOString().split('T')[0];
        return eventDate === targetDate;
      });

      return { data: filteredEvents, error: null };
    });
  });
}

export function getEventTypes(events: Event[]): string[] {
  const types = events
    .map(event => event.type)
    .filter((type): type is string => type !== null && type !== undefined && type.trim() !== '');
  
  return [...new Set(types)].sort();
}

export function validateNotificationSettings(settings: Partial<NotificationSettings>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!settings.emails || settings.emails.length === 0) {
    errors.push('Debes agregar al menos un email');
  }

  if (settings.emails) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    settings.emails.forEach(email => {
      if (!emailRegex.test(email)) {
        errors.push(`El email "${email}" no es válido`);
      }
    });
  }

  if (!settings.time) {
    errors.push('Debes especificar una hora para las notificaciones');
  } else {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(settings.time)) {
      errors.push('La hora debe tener formato HH:MM (ej: 09:00)');
    }
  }

  if (!settings.filters || settings.filters.length === 0) {
    errors.push('Debes agregar al menos un filtro de eventos');
  }

  if (settings.filters) {
    settings.filters.forEach((filter, index) => {
      if (!filter.type || !['type', 'title'].includes(filter.type)) {
        errors.push(`El filtro #${index + 1} debe tener un tipo válido (tipo o título)`);
      }
      if (!filter.value || filter.value.trim() === '') {
        errors.push(`El filtro #${index + 1} debe tener un valor`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
