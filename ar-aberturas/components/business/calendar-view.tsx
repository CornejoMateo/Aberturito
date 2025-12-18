'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EventFormModal } from '../../utils/calendar/event-form-modal';
import { EventDetailsModal } from '../../utils/calendar/event-details-modal';
import { createEvent, deleteEvent } from '@/lib/calendar/events';
import {
	Calendar as CalendarIcon,
	ChevronLeft,
	ChevronRight,
	Clock as ClockIcon,
	MapPin,
	Package,
	Trash2,
} from 'lucide-react';
import { monthNames, dayNames } from '@/constants/date';
import { typeConfig } from '@/constants/type-config';
import { Event } from '@/lib/calendar/events';
import { useLoadEvents } from '@/hooks/use-load-events';
import { useToast } from '@/components/ui/use-toast';
import { is } from 'date-fns/locale';
import { deleteLastYearEvents } from '@/lib/calendar/events';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function CalendarView() {
	const { toast } = useToast();
	const { events, isLoading, refresh } = useLoadEvents();
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [activeFilter, setActiveFilter] = useState<
		'todos' | 'colocacion' | 'produccionOK' | 'medicion'
	>('todos');
	const [searchTerm, setSearchTerm] = useState('');
	const maxVisibleEvents = 5; // Show only 5 events by default
	const [showAllEvents, setShowAllEvents] = useState(false);

	const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
	const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

	const formatDateString = (year: number, month: number, day: number) => {
		return `${String(day).padStart(2, '0')}-${String(month + 1).padStart(2, '0')}-${year}`;
	};

	const getEventsForDate = (day: number) => {
		const dateStr = formatDateString(currentDate.getFullYear(), currentDate.getMonth(), day);
		let dayEvents = events.filter((event) => {
			const [eventDay, eventMonth, eventYear] = event.date?.split('-') ?? [];
			const formattedEventDate = `${eventDay.padStart(2, '0')}-${eventMonth.padStart(2, '0')}-${eventYear}`;
			return formattedEventDate === dateStr;
		});

		if (activeFilter !== 'todos') {
			dayEvents = dayEvents.filter((event) => event.type === activeFilter);
		}

		const eventsByType = dayEvents.reduce(
			(acc, event) => {
				if (event.type && !acc[event.type]) {
					acc[event.type] = [];
				}
				if (event.type) acc[event.type].push(event);
				return acc;
			},
			{} as Record<string, Event[]>
		);

		return eventsByType;
	};

	const handleDeleteEvent = async (eventId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
			const { error } = await deleteEvent(eventId);
			if (!error) {
				toast({
					title: 'Evento eliminado',
					description: 'El evento ha sido eliminado correctamente.',
				});
				await refresh();
				if (selectedEvent?.id === eventId) {
					setIsDetailsModalOpen(false);
					setSelectedEvent(null);
				}
			} else {
				console.error('Error al eliminar el evento:', error);
			}
		}
	};

	const handleEventClick = (event: Event) => {
		setSelectedEvent(event);
		setIsDetailsModalOpen(true);
	};

	const filteredEvents = selectedDate
		? events.filter((event) => {
				const [eventDay, eventMonth, eventYear] = event.date?.split('-') ?? [];
				const formattedEventDate = `${eventDay.padStart(2, '0')}-${eventMonth.padStart(2, '0')}-${eventYear}`;
				const matchesDate = formattedEventDate === selectedDate;
				const matchesFilter = activeFilter === 'todos' || event.type === activeFilter;
				const matchesSearch =
					searchTerm === '' ||
					event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					event.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					event.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					event.address?.toLowerCase().includes(searchTerm.toLowerCase());
				return matchesDate && matchesFilter && matchesSearch;
			})
		: events
				.filter((event) => {
					const matchesFilter = activeFilter === 'todos' || event.type === activeFilter;
					const matchesSearch =
						searchTerm === '' ||
						event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
						event.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
						event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
						event.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
						event.address?.toLowerCase().includes(searchTerm.toLowerCase());
					return matchesFilter && matchesSearch;
				})
				.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

	const currentEvents = showAllEvents ? filteredEvents : filteredEvents.slice(0, maxVisibleEvents);

	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDeleteLastYearEvents = async () => {
		setIsDeleting(true);
		const { error } = await deleteLastYearEvents();
		setIsDeleting(false);
		setIsDeleteDialogOpen(false);
		if (!error) {
			toast({
				title: 'Eventos eliminados',
				description: 'Se eliminaron los eventos del año pasado.',
			});
			await refresh();
		} else {
			toast({
				title: 'Error',
				description: 'No se pudieron eliminar los eventos.',
				variant: 'destructive',
			});
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground text-balance">Calendario</h2>
					<p className="text-muted-foreground mt-1">Colocaciones, mediciones y más.</p>
				</div>

				<EventFormModal
					onSave={async (eventData) => {
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
							});

							if (error) {
								console.error('Error al crear el evento:', error);
								toast({
									title: 'Error',
									description: 'No se pudo crear el evento.',
									variant: 'destructive',
								});
								return false;
							}

							if (newEvent) {
								await refresh();
								setShowAllEvents(false);
								return true;
							}

							return false;
						} catch (error) {
							console.error('Error inesperado al crear el evento:', error);
							toast({
								title: 'Error',
								description: 'No se pudo crear el evento.',
								variant: 'destructive',
							});
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
						<div className="flex gap-2 flex-wrap">
							<Button
								variant={activeFilter === 'todos' ? 'default' : 'outline'}
								size="sm"
								onClick={() => setActiveFilter('todos')}
							>
								Todos
							</Button>
							<Button
								variant={activeFilter === 'colocacion' ? 'default' : 'outline'}
								size="sm"
								onClick={() => setActiveFilter('colocacion')}
							>
								Colocación
							</Button>
							<Button
								variant={activeFilter === 'produccionOK' ? 'default' : 'outline'}
								size="sm"
								onClick={() => setActiveFilter('produccionOK')}
							>
								Producción OK
							</Button>
							<Button
								variant={activeFilter === 'medicion' ? 'default' : 'outline'}
								size="sm"
								onClick={() => setActiveFilter('medicion')}
							>
								Medición
							</Button>
						</div>

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
						<div className="grid grid-cols-7 gap-1">
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
								const isToday =
									new Date().toDateString() ===
									new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

								return (
									<div
										key={day}
										onClick={() => {
											const dateStr = formatDateString(
												currentDate.getFullYear(),
												currentDate.getMonth(),
												day
											);
											setSelectedDate(selectedDate === dateStr ? null : dateStr);
										}}
										className={`aspect-square p-2 rounded-lg border transition-colors cursor-pointer ${
											isToday
												? 'border-green-300 bg-green-300/10'
												: selectedDate ===
													  formatDateString(currentDate.getFullYear(), currentDate.getMonth(), day)
													? 'border-primary bg-primary/10'
													: Object.keys(dayEvents).length > 0
														? 'border-border bg-secondary hover:bg-secondary/80'
														: 'border-border hover:bg-secondary/50'
										}`}
									>
										<div className="flex flex-col h-full">
											<span
												className={`text-sm font-medium ${isToday ? 'text-green-600' : Object.keys(dayEvents).length > 0 ? 'text-foreground' : 'text-muted-foreground'}`}
											>
												{day}
											</span>
											{Object.keys(dayEvents).length > 0 && (
												<div className="flex-1 flex items-center justify-center mt-1">
													<div className="flex flex-wrap gap-1">
														{Object.entries(dayEvents).map(([type, typeEvents]) => {
															const safeType =
																type && typeConfig[type as keyof typeof typeConfig]
																	? (type as keyof typeof typeConfig)
																	: 'otros';
															const typeInfo = typeConfig[safeType];

															const dotsToShow = Math.min(typeEvents.length, 3);
															const hasOverdue = typeEvents.some((ev) => ev.is_overdue);

															return (
																<div
																	key={type}
																	className="flex items-center gap-1"
																	title={`${typeEvents.length} ${typeInfo.label.toLowerCase()}${typeEvents.length > 1 ? 's' : ''}`}
																>
																	<div
																		className={`h-2 w-2 rounded-full ${hasOverdue ? 'bg-red-500' : typeInfo.color.split(' ')[0]}`}
																	/>
																	{typeEvents.length > 1 && (
																		<span className="text-[10px] text-muted-foreground">
																			{typeEvents.length}
																		</span>
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
					<div className="flex justify-between items-center">
						<h3 className="text-sm font-semibold text-foreground">Próximos eventos</h3>
						{selectedDate && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setSelectedDate(null);
									setShowAllEvents(false); // Reset to show only first 5 events when clearing date filter
								}}
								className="text-sm text-muted-foreground"
							>
								Mostrar todos los eventos
							</Button>
						)}
					</div>
					{/* Search Bar */}
					<Card className="p-2 bg-card border-border">
						<div className="flex items-center gap-2">
							<input
								type="text"
								placeholder="Buscar eventos por cliente, ubicación, tipo, etc..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="flex-1 px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
							/>
						</div>
					</Card>
					<div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
						{currentEvents.length > 0 ? (
							<>
								{currentEvents.map((event) => {
									const typeInfo =
										typeConfig[(event.type ?? 'produccionOK') as keyof typeof typeConfig];
									const TypeIcon = typeInfo.icon;
									const isOverdue = event.is_overdue || false;

									return (
										<div
											key={event.id}
											className={`p-3 rounded-lg border space-y-2 cursor-pointer transition-colors ${
												isOverdue
													? 'border-red-500 bg-red-500/10 hover:bg-red-500/20'
													: 'border-border bg-secondary hover:bg-secondary/80'
											}`}
											onClick={() => handleEventClick(event)}
										>
											<div className="flex items-start justify-between gap-2">
												<div className="flex items-start gap-2 min-w-0">
													<div
														className={`p-1.5 rounded ${typeInfo.color.split(' ')[0]}/10 mt-0.5 flex-shrink-0`}
													>
														<div
															className={`h-2 w-2 rounded-full ${isOverdue ? 'bg-red-500' : typeInfo.color.split(' ')[0]}`}
														/>
													</div>
													<div className="min-w-0 flex-1">
														<div className="flex items-center gap-2">
															<h4 className="text-sm font-medium text-foreground break-words">
																{event.title}
															</h4>
															{isOverdue && (
																<div className="flex items-center gap-1 flex-shrink-0">
																	<div
																		className="h-2 w-2 rounded-full bg-red-500"
																		title="Evento atrasado"
																	/>
																</div>
															)}
														</div>
														{event.client && (
															<p className="text-xs text-muted-foreground break-words">
																{event.client}
															</p>
														)}
													</div>
												</div>
												<div className="flex items-start flex-shrink-0">
													<Button
														variant="ghost"
														size="icon"
														onClick={(e) => handleDeleteEvent(event.id, e)}
														className="h-6 w-6 -mr-2"
														aria-label="Eliminar evento"
													>
														<Trash2 className="h-3.5 w-3.5" />
													</Button>
												</div>
											</div>
											<div className="space-y-1 text-xs text-muted-foreground">
												<div className="flex items-center gap-1.5">
													<CalendarIcon className="h-3.5 w-3.5 flex-shrink-0" />
													<span>{event.date}</span>
												</div>
												{event.location && (
													<div className="flex items-start gap-1.5">
														<MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
														<span className="break-words line-clamp-1">{event.location}</span>
													</div>
												)}
												{event.address && (
													<div className="flex items-start gap-1.5">
														<Package className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
														<span className="break-words line-clamp-1">{event.address}</span>
													</div>
												)}
											</div>
										</div>
									);
								})}
								{filteredEvents.length > maxVisibleEvents && (
									<Button
										variant="outline"
										size="sm"
										className="w-full mt-2"
										onClick={() => setShowAllEvents(!showAllEvents)}
									>
										{showAllEvents
											? 'Mostrar menos'
											: `Mostrar más (${filteredEvents.length - maxVisibleEvents})`}
									</Button>
								)}
							</>
						) : (
							<p className="text-sm text-muted-foreground">
								{selectedDate
									? 'No hay eventos programados para esta fecha'
									: 'No hay eventos próximos'}
							</p>
						)}
					</div>
				</Card>
			</div>

			{/* Legend */}
			<Card className="p-4 bg-card border-border">
				<div className="flex flex-wrap gap-4">
					<div className="flex items-center gap-2">
						<div className="h-3 w-3 rounded-full bg-chart-1" />
						<p className="text-sm text-muted-foreground">Producción OK</p>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-3 w-3 rounded-full bg-chart-2" />
						<span className="text-sm text-muted-foreground">Colocaciones</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-3 w-3 rounded-full bg-chart-3" />
						<span className="text-sm text-muted-foreground">Mediciones</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-3 w-3 rounded-full bg-gray-400" />
						<span className="text-sm text-muted-foreground">Otros</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-3 w-3 rounded-full bg-red-500" />
						<span className="text-sm text-muted-foreground">Vencidos</span>
					</div>
				</div>
			</Card>

			<div className="flex justify-center my-4">
				<Button
					variant="destructive"
					className="w-full max-w-xs"
					onClick={() => setIsDeleteDialogOpen(true)}
				>
					Eliminar eventos del año pasado
				</Button>
				<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>¿Eliminar eventos de años anteriores?</DialogTitle>
						</DialogHeader>
						<p className="py-2">Esta acción eliminará todos los eventos (finalizados) anteriores al 1 de enero del presente año. ¿Estás seguro?</p>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
								Cancelar
							</Button>
							<Button variant="destructive" onClick={handleDeleteLastYearEvents} disabled={isDeleting}>
								Eliminar
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Event details */}
			{selectedEvent && (
				<EventDetailsModal
					isOpen={isDetailsModalOpen}
					onClose={() => {
						setIsDetailsModalOpen(false);
						setSelectedEvent(null);
					}}
					event={{
						...selectedEvent,
						title: selectedEvent?.title ?? 'Sin título',
						type: (selectedEvent?.type as 'produccionOK' | 'colocacion' | 'medicion') ?? 'otros',
						date: selectedEvent?.date ?? '',
						client: selectedEvent?.client ?? '',
						location: selectedEvent?.location ?? '',
						address: selectedEvent?.address ?? '',
						description: selectedEvent?.description ?? '',
					}}
					onEventUpdated={refresh}
				/>
			)}
		</div>
	);
}
