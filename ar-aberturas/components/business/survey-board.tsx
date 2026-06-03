'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { ClipboardList, CheckCircle, ArrowRight, Calendar, Tag as TagIcon, Settings } from 'lucide-react';
import { Client, listClients } from '@/lib/clients/clients';
import {
	Survey,
	SurveyItem,
	getAllSurveys,
	getSurveyItemsBySurveyIds,
	updateSurveyItem,
} from '@/lib/survey/survey';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';
import { translateError } from '@/lib/error-translator';
import { DEFAULT_SURVEY_STEPS } from '@/constants/survey';
import { ClientDetailsDialog } from '@/utils/clients/client-details-dialog';
import { formatCreatedAt } from '@/helpers/date/format-date';
import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns';
import { TagSelector } from '@/components/tags/tag-selector';
import { TagManagerDialog } from '@/components/tags/tag-manager-dialog';
import { SurveyTag, getTagsForSurvey } from '@/lib/tags/tags';
import { TAG_COLORS } from '@/constants/tags';

interface ClientWithSurvey {
	client: Client;
	survey: Survey;
	items: SurveyItem[];
	currentStep: string | null;
	tags: SurveyTag[];
}

interface Column {
	stepName: string;
	clients: ClientWithSurvey[];
}

export function SurveyBoard() {
	const {
		data: clients,
		loading,
		error,
		refresh,
	} = useOptimizedRealtime<Client>(
		'clients',
		async () => {
			const { data } = await listClients();
			return data ?? [];
		},
		'clients_cache'
	);

	const [clientsWithSurveys, setClientsWithSurveys] = useState<ClientWithSurvey[]>([]);
	const [columns, setColumns] = useState<Column[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedClient, setSelectedClient] = useState<Client | null>(null);
	const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
	const [draggedClient, setDraggedClient] = useState<ClientWithSurvey | null>(null);
	const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
	const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

	const loadSurveys = async () => {
		if (!clients.length) {
			setClientsWithSurveys([]);
			return;
		}
		setIsLoading(true);
		try {
			// Fetch all surveys at once instead of per client
			const { data: allSurveys, error: surveysError } = await getAllSurveys();
			if (surveysError) throw surveysError;

			if (!allSurveys || allSurveys.length === 0) {
				setClientsWithSurveys([]);
				return;
			}

			// Filter surveys for current clients
			const clientIds = clients.map((c) => c.id);
			const relevantSurveys = allSurveys.filter((s) => clientIds.includes(s.client_id));

			if (relevantSurveys.length === 0) {
				setClientsWithSurveys([]);
				return;
			}

			// Fetch all items at once
			const surveyIds = relevantSurveys.map((s) => s.id);
			const { data: allItems, error: itemsError } = await getSurveyItemsBySurveyIds(surveyIds);
			if (itemsError) throw itemsError;

			// Fetch all tags for surveys at once
			const tagsPromises = surveyIds.map((id) => getTagsForSurvey(id));
			const tagsResults = await Promise.all(tagsPromises);

			const surveyData: ClientWithSurvey[] = [];

			for (let i = 0; i < relevantSurveys.length; i++) {
				const survey = relevantSurveys[i];
				const client = clients.find((c) => c.id === survey.client_id);
				if (!client) continue;

				const surveyItems = allItems?.filter((i) => i.survey_id === survey.id) ?? [];
				const sortedItems = surveyItems.sort((a, b) => a.order - b.order);

				// Find the first uncompleted step
				const currentStep = sortedItems.find((item) => !item.completed)?.label ?? null;

				const surveyTags = tagsResults[i].data ?? [];

				surveyData.push({
					client,
					survey,
					items: sortedItems,
					currentStep,
					tags: surveyTags,
				});
			}

			setClientsWithSurveys(surveyData);
		} catch (err) {
			console.error('Error loading surveys:', err);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: translateError(err) || 'No se pudieron cargar los relevamientos.',
			});
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadSurveys();
	}, [clients]);

	// Group clients by current step
	useEffect(() => {
		const stepMap = new Map<string, ClientWithSurvey[]>();

		clientsWithSurveys.forEach((clientWithSurvey) => {
			const step = clientWithSurvey.currentStep || 'Sin pasos pendientes';
			if (!stepMap.has(step)) {
				stepMap.set(step, []);
			}
			stepMap.get(step)?.push(clientWithSurvey);
		});

		// Create columns with fixed order for default steps
		const columnData: Column[] = [];

		// First, always add default steps in fixed order (even if empty)
		DEFAULT_SURVEY_STEPS.forEach((stepName) => {
			columnData.push({
				stepName,
				clients: stepMap.get(stepName) ?? [],
			});
			stepMap.delete(stepName);
		});

		// Always add "Sin pasos pendientes" column (even if empty)
		columnData.push({
			stepName: 'Sin pasos pendientes',
			clients: stepMap.get('Sin pasos pendientes') ?? [],
		});
		stepMap.delete('Sin pasos pendientes');

		// Then, add any additional steps dynamically (only if they have clients)
		Array.from(stepMap.entries()).forEach(([stepName, clients]) => {
			if (clients.length > 0) {
				columnData.push({
					stepName,
					clients,
				});
			}
		});

		setColumns(columnData);
	}, [clientsWithSurveys]);

	const handleClientClick = (client: Client) => {
		setSelectedClient(client);
		setIsClientDialogOpen(true);
	};

	const getDueDateStatus = (survey: Survey, allItemsCompleted: boolean) => {
		if (allItemsCompleted || !survey.due_date) {
			return { color: 'text-foreground', daysRemaining: null };
		}

		const today = startOfDay(new Date());
		const dueDate = parseISO(survey.due_date.split('T')[0]);
		const daysRemaining = differenceInCalendarDays(dueDate, today);

		if (daysRemaining <= 3) {
			return { color: 'text-red-500', daysRemaining };
		} else if (daysRemaining <= 7) {
			return { color: 'text-yellow-500', daysRemaining };
		}
		return { color: 'text-foreground', daysRemaining };
	};

	const getColorClass = (colorValue: string) => {
		const color = TAG_COLORS.find((c) => c.value === colorValue);
		return color?.bg ?? 'bg-gray-500';
	};

	const handleDragStart = (e: React.DragEvent, clientWithSurvey: ClientWithSurvey) => {
		setDraggedClient(clientWithSurvey);
		e.dataTransfer.effectAllowed = 'move';
	};

	const handleDragOver = (e: React.DragEvent, stepName: string) => {
		e.preventDefault();
		setDragOverColumn(stepName);
	};

	const handleDragLeave = () => {
		setDragOverColumn(null);
	};

	const handleDrop = async (e: React.DragEvent, targetStep: string) => {
		e.preventDefault();
		setDragOverColumn(null);

		if (!draggedClient) return;

		try {
			// Special case: "Sin pasos pendientes" - mark all steps as completed
			if (targetStep === 'Sin pasos pendientes') {
				const itemsToUpdate = draggedClient.items
					.filter((item) => !item.completed)
					.map((item) => ({ id: item.id, completed: true, originalCompleted: item.completed }));

				if (itemsToUpdate.length === 0) {
					toast({
						title: 'Información',
						description: 'El cliente ya no tiene pasos pendientes.',
					});
					return;
				}

				// Store original states for rollback
				const originalStates = itemsToUpdate.map((item) => ({
					id: item.id,
					completed: item.originalCompleted,
				}));

				// Update each item with rollback on failure
				const successfulUpdates: string[] = [];
				try {
					for (const item of itemsToUpdate) {
						const { error } = await updateSurveyItem(item.id, { completed: true });
						if (error) throw error;
						successfulUpdates.push(item.id);
					}

					toast({
						title: 'Relevamiento actualizado',
						description: `El cliente se movió a "Sin pasos pendientes" y ${itemsToUpdate.length} paso(s) fueron marcados como completados.`,
					});

					loadSurveys();
				} catch (err) {
					// Rollback successful updates
					for (const itemId of successfulUpdates) {
						const original = originalStates.find((s) => s.id === itemId);
						if (original) {
							await updateSurveyItem(itemId, { completed: original.completed });
						}
					}
					throw err;
				}
				return;
			}

			// Find the target step in the client's survey items
			const targetItem = draggedClient.items.find((item) => item.label === targetStep);

			if (!targetItem) {
				toast({
					variant: 'destructive',
					title: 'Error',
					description: 'El paso de destino no existe en este relevamiento.',
				});
				return;
			}

			const targetOrder = targetItem.order;

			// Find the current step (first uncompleted item)
			const currentUncompletedItem = draggedClient.items.find((item) => !item.completed);
			const currentOrder = currentUncompletedItem
				? currentUncompletedItem.order
				: Number.POSITIVE_INFINITY;

			let itemsToUpdate: Array<{ id: string; completed: boolean; originalCompleted: boolean }>;
			let message: string;

			if (targetOrder > currentOrder) {
				// Moving forward: mark items up to target as completed
				itemsToUpdate = draggedClient.items
					.filter((item) => item.order <= targetOrder && !item.completed)
					.map((item) => ({ id: item.id, completed: true, originalCompleted: item.completed }));

				if (itemsToUpdate.length === 0) {
					toast({
						title: 'Información',
						description: 'El cliente ya está en este paso o uno posterior.',
					});
					return;
				}

				message = `El cliente se movió a "${targetStep}" y ${itemsToUpdate.length} paso(s) fueron marcados como completados.`;
			} else if (targetOrder < currentOrder) {
				// Moving backward: unmark items after target
				itemsToUpdate = draggedClient.items
					.filter((item) => item.order > targetOrder)
					.map((item) => ({ id: item.id, completed: false, originalCompleted: item.completed }));

				// Also ensure the target step is unmarked if it was marked
				const targetItemAlreadyUnmarked = !draggedClient.items.find(
					(item) => item.order === targetOrder
				)?.completed;
				if (!targetItemAlreadyUnmarked) {
					const targetItem = draggedClient.items.find((item) => item.order === targetOrder);
					if (targetItem) {
						itemsToUpdate.push({
							id: targetItem.id,
							completed: false,
							originalCompleted: targetItem.completed,
						});
					}
				}

				if (itemsToUpdate.length === 0) {
					toast({
						title: 'Información',
						description: 'El cliente ya está en este paso o uno anterior.',
					});
					return;
				}

				message = `El cliente se movió a "${targetStep}" y ${itemsToUpdate.length} paso(s) fueron desmarcados.`;
			} else {
				// Same step, no change needed
				toast({
					title: 'Información',
					description: 'El cliente ya está en este paso.',
				});
				return;
			}

			// Store original states for rollback
			const originalStates = itemsToUpdate.map((item) => ({
				id: item.id,
				completed: item.originalCompleted,
			}));

			// Update each item with rollback on failure
			const successfulUpdates: string[] = [];
			try {
				for (const item of itemsToUpdate) {
					const { error } = await updateSurveyItem(item.id, { completed: item.completed });
					if (error) throw error;
					successfulUpdates.push(item.id);
				}

				toast({
					title: 'Relevamiento actualizado',
					description: message,
				});

				// Reload surveys to reflect changes
				loadSurveys();
			} catch (err) {
				// Rollback successful updates
				for (const itemId of successfulUpdates) {
					const original = originalStates.find((s) => s.id === itemId);
					if (original) {
						await updateSurveyItem(itemId, { completed: original.completed });
					}
				}
				throw err;
			}
		} catch (err) {
			console.error('Error updating survey:', err);
			toast({
				variant: 'destructive',
				title: 'Error',
				description: translateError(err) || 'No se pudo actualizar el relevamiento.',
			});
		} finally {
			setDraggedClient(null);
		}
	};

	if (loading && !clients.length) {
		return (
			<div className="flex items-center justify-center h-64">
				<p className="text-muted-foreground">Cargando...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-64">
				<p className="text-destructive">Error al cargar los datos</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold text-foreground text-balance">Relevamiento</h2>
						<p className="text-muted-foreground mt-1">Estado de relevamientos por cliente</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setIsTagManagerOpen(true)}
					>
						<Settings className="h-4 w-4 mr-2" />
						Gestionar etiquetas
					</Button>
				</div>
			</div>

			{/* Stats */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card className="p-6 bg-card border-border">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								Total clientes con relevamiento
							</p>
							<p className="text-2xl font-bold text-foreground mt-2">{clientsWithSurveys.length}</p>
						</div>
						<div className="rounded-lg bg-secondary p-3 text-chart-1">
							<ClipboardList className="h-6 w-6" />
						</div>
					</div>
				</Card>
				<Card className="p-6 bg-card border-border">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Columnas activas</p>
							<p className="text-2xl font-bold text-foreground mt-2">{columns.length}</p>
						</div>
						<div className="rounded-lg bg-secondary p-3 text-chart-2">
							<CheckCircle className="h-6 w-6" />
						</div>
					</div>
				</Card>
			</div>

			{/* Board */}
			{isLoading ? (
				<div className="flex items-center justify-center h-64">
					<p className="text-muted-foreground">Cargando relevamientos...</p>
				</div>
			) : columns.length === 0 ? (
				<Card className="p-12">
					<div className="text-center space-y-4">
						<ClipboardList className="h-12 w-12 text-muted-foreground mx-auto" />
						<div>
							<p className="text-lg font-medium text-foreground">Sin relevamientos</p>
							<p className="text-sm text-muted-foreground mt-1">
								No hay clientes con relevamientos activos en este momento.
							</p>
						</div>
					</div>
				</Card>
			) : (
				<div className="flex gap-4 overflow-x-auto pb-4">
					{columns.map((column, columnIndex) => (
						<Card
							key={column.stepName}
							className={`min-w-[300px] max-w-[300px] flex flex-col bg-card border-border transition-colors ${
								dragOverColumn === column.stepName ? 'border-primary bg-primary/5' : ''
							}`}
							onDragOver={(e) => handleDragOver(e, column.stepName)}
							onDragLeave={handleDragLeave}
							onDrop={(e) => handleDrop(e, column.stepName)}
						>
							{/* Column Header */}
							<div className="p-4 border-b border-border">
								<h3 className="font-semibold text-foreground text-sm truncate">
									{column.stepName}
								</h3>
							</div>

							{/* Column Content */}
							<div className="p-3 flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-300px)]">
								{column.clients.length === 0 ? (
									<p className="text-xs text-muted-foreground text-center py-4">Sin clientes</p>
								) : (
									column.clients.map((clientWithSurvey) => {
										const allItemsCompleted = clientWithSurvey.items.every((i) => i.completed);
										const { color, daysRemaining } = getDueDateStatus(
											clientWithSurvey.survey,
											allItemsCompleted
										);

										return (
											<Card
												key={clientWithSurvey.survey.id}
												className="p-3 bg-secondary/50 border-border hover:border-primary/50 transition-colors cursor-pointer"
												onClick={() => handleClientClick(clientWithSurvey.client)}
												draggable
												onDragStart={(e) => handleDragStart(e, clientWithSurvey)}
											>
												<div className="space-y-2">
													<div className="flex items-center justify-between">
														<h4 className="font-medium text-foreground text-sm">
															{clientWithSurvey.client.last_name} {clientWithSurvey.client.name}
														</h4>
														<TagSelector surveyId={clientWithSurvey.survey.id} onChange={loadSurveys} assignedTags={clientWithSurvey.tags} />
													</div>
													{clientWithSurvey.client.locality && (
														<p className="text-xs text-muted-foreground">
															{clientWithSurvey.client.locality}
														</p>
													)}
													{clientWithSurvey.tags.length > 0 && (
														<div className="flex flex-wrap gap-1">
															{clientWithSurvey.tags.map((tag) => (
																<Badge
																	key={tag.id}
																	className={`text-xs ${getColorClass(tag.color)} text-white border-0`}
																>
																	{tag.name}
																</Badge>
															))}
														</div>
													)}
													<div className="flex items-center gap-1 text-muted-foreground text-xs">
														<Calendar className="h-3 w-3" />
														<p className="text-xs">Creado el</p>
														<span>{formatCreatedAt(clientWithSurvey.survey.created_at)}</span>
													</div>
													{clientWithSurvey.survey.due_date && (
														<div className="flex items-center gap-1 text-xs">
															<div className={`flex items-center gap-1`}>
																<Calendar className="h-3 w-3" />
																<span>{formatCreatedAt(new Date())}</span>
															</div>{' '}
															<ArrowRight className="h-3 w-3 text-muted-foreground" />
															<div className={`flex items-center gap-1 ${color}`}>
																<Calendar className="h-3 w-3" />
																<span>{formatCreatedAt(clientWithSurvey.survey.due_date)}</span>
															</div>
														</div>
													)}
													<div className="flex items-center gap-2">
														<Badge variant="outline" className="text-xs">
															{clientWithSurvey.items.filter((i) => i.completed).length}/
															{clientWithSurvey.items.length} pasos
														</Badge>
														{daysRemaining !== null && !allItemsCompleted && (
															<Badge variant="outline" className={`text-xs ${color}`}>
																{daysRemaining <= 0 ? 'Vencido' : `${daysRemaining} días`}
															</Badge>
														)}
													</div>
												</div>
											</Card>
										);
									})
								)}
							</div>
						</Card>
					))}
				</div>
			)}

			{/* Client Details Dialog */}
			<ClientDetailsDialog
				client={selectedClient}
				isOpen={isClientDialogOpen}
				onClose={() => setIsClientDialogOpen(false)}
				onEdit={() => {}}
				defaultTab="surveys"
			/>

			{/* Tag Manager Dialog */}
			<TagManagerDialog
				open={isTagManagerOpen}
				onOpenChange={setIsTagManagerOpen}
			/>
		</div>
	);
}
