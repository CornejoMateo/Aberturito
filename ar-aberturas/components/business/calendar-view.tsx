'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EventFormModal } from '../../utils/calendar/event-form-modal';
import { createEvent, listEvents, deleteEvent } from '@/lib/calendar/events';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock as ClockIcon, MapPin, User, Package, Wrench, Loader2, Trash2 } from 'lucide-react';
import { monthNames, dayNames } from '@/constants/date';
import { typeConfig } from '@/constants/type-config';
import { statusConfigCalendar } from '@/constants/status-config';

type Event = {
	id: string;
	title: string;
	type: 'entrega' | 'instalacion' | 'medicion';
	date: string;
	client: string;
	location: string;
	installer?: string;
	status: 'programado' | 'confirmado' | 'completado';
};


export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 2, 11)); // March 11, 2025
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Cargar eventos al montar el componente
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
              title: event.title || 'Sin título',
              type: (event.type as 'entrega' | 'instalacion' | 'medicion') || 'entrega',
              date: formattedDate,
              client: event.client || 'Sin cliente',
              location: event.location || 'Sin ubicación',
              status: (event.status as 'programado' | 'confirmado' | 'completado') || 'programado',
              installer: undefined
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

	const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
	const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

	const getEventsForDate = (day: number) => {
		const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
		const dayEvents = events.filter((event) => event.date === dateStr);
		
		// Agrupar eventos por tipo
		const eventsByType = dayEvents.reduce((acc, event) => {
			if (!acc[event.type]) {
				acc[event.type] = [];
			}
			acc[event.type].push(event);
			return acc;
		}, {} as Record<string, Event[]>);
		
		return eventsByType;
	};

	const handleDeleteEvent = async (id: string) => {
		const confirmed = confirm('¿Eliminar este evento? Esta acción no se puede deshacer.');
		if (!confirmed) return;

		try {
			const { data, error } = await deleteEvent(id);
			if (error) {
				console.error('Error al eliminar el evento:', error);
				alert('No se pudo eliminar el evento');
				return;
			}

			setEvents((prev) => prev.filter((e) => e.id !== id));
			alert('Evento eliminado');
		} catch (err) {
			console.error('Error inesperado al eliminar evento:', err);
			alert('Error inesperado al eliminar el evento');
		}
	};

	const upcomingEvents = events.filter((event) => {
		const eventDate = new Date(event.date);
		return eventDate >= new Date(2025, 2, 11);
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground text-balance">Calendario</h2>
					<p className="text-muted-foreground mt-1">
						Entregas, instalaciones y eventos programados
					</p>
				</div>
        <EventFormModal 
          onSave={async (eventData) => {
            try {
              // Crear el evento en la base de datos
              const { data: newEvent, error } = await createEvent({
                title: eventData.title,
                type: eventData.type,
                description: eventData.title, // Usamos el título como descripción por defecto
                client: eventData.client,
                location: eventData.location,
                status: 'programado',
                date: eventData.date as unknown as string,
              });              if (error) {
                console.error('Error al crear el evento:', error);
                alert(`Error al crear el evento: ${error.message}`);
                return false;
              }

              // Actualizar el estado local con el nuevo evento
              if (newEvent) {
                const formattedEvent: Event = {
                  id: newEvent.id,
                  title: newEvent.title || '',
                  type: (newEvent.type as 'entrega' | 'instalacion' | 'medicion') || 'entrega',
                  date: newEvent.date || '',
                  client: newEvent.client || '',
                  location: newEvent.location || '',
                  status: (newEvent.status as 'programado' | 'confirmado' | 'completado') || 'programado'
                };
                
                setEvents(prev => [...prev, formattedEvent]);
                alert('Evento creado correctamente');
                return true;
              }
              
              return false;
            } catch (error) {
              console.error('Error inesperado al crear el evento:', error);
              alert('Error inesperado al crear el evento');
              return false;
            }
          }}
        >
          <Button className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            Nuevo evento
          </Button>
        </EventFormModal>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Calendar */}
				<Card className="p-6 bg-card border-border lg:col-span-2">
					<div className="space-y-4">
						{/* Calendar header */}
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold text-foreground">
								{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
							</h3>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="icon"
									onClick={() =>
										setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
									}
								>
									<ChevronLeft className="h-4 w-4" />
								</Button>
								<Button
									variant="outline"
									size="icon"
									onClick={() =>
										setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
									}
								>
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>

						{/* Calendar grid */}
						<div className="grid grid-cols-7 gap-2">
							{/* Day names */}
							{dayNames.map((day) => (
								<div
									key={day}
									className="text-center text-xs font-medium text-muted-foreground py-2"
								>
									{day}
								</div>
							))}

							{/* Empty cells for days before month starts */}
							{Array.from({ length: firstDayOfMonth }).map((_, index) => (
								<div key={`empty-${index}`} className="aspect-square" />
							))}

							{/* Calendar days */}
							{Array.from({ length: daysInMonth }).map((_, index) => {
								const day = index + 1;
								const dayEvents = getEventsForDate(day);
								const isToday = day === 11; // Demo: March 11 is today

								return (
									<div
										key={day}
										className={`aspect-square p-2 rounded-lg border transition-colors ${
											isToday
												? 'border-primary bg-primary/5'
												: Object.keys(dayEvents).length > 0
													? 'border-border bg-secondary hover:bg-secondary/80'
													: 'border-border hover:bg-secondary/50'
										}`}
									>
										<div className="flex flex-col h-full">
											<span
												className={`text-sm font-medium ${isToday ? 'text-primary' : Object.keys(dayEvents).length > 0 ? 'text-foreground' : 'text-muted-foreground'}`}
											>
												{day}
											</span>
											{Object.keys(dayEvents).length > 0 && (
												<div className="flex-1 flex items-center justify-center mt-1">
													<div className="flex flex-wrap gap-1 justify-center">
														{Object.entries(dayEvents).map(([type, typeEvents]) => {
															const typeInfo = typeConfig[type as 'entrega' | 'instalacion' | 'medicion'];
															// Mostrar hasta 3 eventos por tipo
															const dotsToShow = Math.min(typeEvents.length, 3);
															
															return (
																<div key={type} className="flex flex-col items-center">
																	<div className="flex gap-0.5">
																		{Array.from({ length: dotsToShow }).map((_, i) => (
																			<div
																				key={i}
																				className={`h-2 w-2 rounded-full ${typeInfo.color.split(' ')[0]}`}
																				title={`${typeEvents.length} ${typeInfo.label.toLowerCase()}${typeEvents.length > 1 ? 's' : ''}`}
																			/>
																		))}
																	</div>
																	{typeEvents.length > 3 && (
																		<span className="text-[8px] text-muted-foreground">+{typeEvents.length - 3}</span>
																	)}
																</div>
															);
														})}
													</div>
												</div>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</Card>

				{/* Upcoming events */}
				<Card className="p-6 bg-card border-border">
					<h3 className="text-lg font-semibold text-foreground mb-4">Próximos eventos</h3>
					<div className="space-y-3">
						{upcomingEvents.slice(0, 5).map((event) => {
							const typeInfo = typeConfig[event.type];
							const statusInfo = statusConfigCalendar[event.status];
							const TypeIcon = typeInfo.icon;

							return (
								<div
									key={event.id}
									className="p-3 rounded-lg bg-secondary border border-border space-y-2"
								>
																		<div className="flex items-start justify-between gap-2">
																				<div className="flex items-center gap-2 min-w-0">
																						<div className={`p-1.5 rounded ${typeInfo.color.split(' ')[0]}/10 flex-shrink-0`}>
																								<TypeIcon className={`h-3.5 w-3.5 ${typeInfo.color.split(' ')[1]}`} />
																						</div>
																						<div className="min-w-0">
																								<p className="text-sm font-medium text-foreground truncate">
																										{event.title}
																								</p>
																								<p className="text-xs text-muted-foreground truncate">{event.client}</p>
																						</div>
																				</div>
																				<div className="flex items-center gap-2 flex-shrink-0">
																					<Badge variant="outline" className={`text-xs ${statusInfo.color} whitespace-nowrap`}>
																						{statusInfo.label}
																					</Badge>
																					<Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)} aria-label="Eliminar evento">
																						<Trash2 className="h-4 w-4" />
																					</Button>
																				</div>
																		</div>
									<div className="space-y-1 text-xs text-muted-foreground">
										<div className="flex items-center gap-1.5">
											<CalendarIcon className="h-3 w-3" />
											<span>{event.date}</span>
										</div>
										<div className="flex items-center gap-1.5">
											<MapPin className="h-3 w-3" />
											<span className="truncate">{event.location}</span>
										</div>
										{event.installer && (
											<div className="flex items-center gap-1.5">
												<User className="h-3 w-3" />
												<span>{event.installer}</span>
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</Card>
			</div>

			{/* Legend */}
			<Card className="p-4 bg-card border-border">
				<div className="flex flex-wrap gap-4">
					<div className="flex items-center gap-2">
						<div className="h-3 w-3 rounded-full bg-chart-1" />
						<span className="text-sm text-muted-foreground">Entregas</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-3 w-3 rounded-full bg-chart-2" />
						<span className="text-sm text-muted-foreground">Instalaciones</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-3 w-3 rounded-full bg-chart-3" />
						<span className="text-sm text-muted-foreground">Mediciones</span>
					</div>
				</div>
			</Card>
		</div>
	);
}
