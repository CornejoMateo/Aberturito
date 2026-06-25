'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Pencil, Plus, Trash2 } from 'lucide-react';
import { EventFormModal } from '@/utils/calendar/event-form-modal';
import { Client } from '@/lib/clients/clients';
import { BudgetWithWork } from '@/lib/works/balances';
import { Survey, SurveyItem } from '@/lib/survey/survey';
import { formatCreatedAt } from '@/helpers/date/format-date';
import { handleCreateEventFromSurveyItem } from '@/helpers/calendar/event-from-survey-item';

interface SurveyBudgetCardProps {
	budget: BudgetWithWork;
	survey: Survey | undefined;
	items: SurveyItem[];
	client: Client;
	isLoading: boolean;
	onCreateSurvey: (budgetId: number) => Promise<void>;
	onToggleItem: (item: SurveyItem) => Promise<void>;
	onSetItemDialog: (dialog: any) => void;
	onSetDeleteItemConfirm: (confirm: any) => void;
	onSetDeleteRelConfirm: (confirm: any) => void;
	onSetDueDateDialog: (dialog: any) => void;
}

export function SurveyBudgetCard({
	budget,
	survey,
	items,
	client,
	isLoading,
	onCreateSurvey,
	onToggleItem,
	onSetItemDialog,
	onSetDeleteItemConfirm,
	onSetDeleteRelConfirm,
	onSetDueDateDialog,
}: SurveyBudgetCardProps) {
	const getBudgetLabel = (budget: BudgetWithWork): string => {
		const parts: string[] = [];
		if (budget.number) parts.push(`#${budget.number}`);
		if (budget.type) parts.push(budget.type);
		return parts.length ? parts.join(' · ') : 'Presupuesto vendido';
	};

	const getBudgetAddress = (budget: BudgetWithWork): string | null => {
		const work = budget.folder_budget?.work;
		if (!work) return null;
		const parts = [work.address, work.locality].filter(Boolean);
		return parts.join(', ') || null;
	};

	const getItemsForSurvey = (surveyId: number): SurveyItem[] =>
		items.filter((i) => i.survey_id === surveyId).sort((a, b) => a.order - b.order);

	const getProgress = (surveyId: number): { done: number; total: number } => {
		const surveyItems = getItemsForSurvey(surveyId);
		return { done: surveyItems.filter((i) => i.completed).length, total: surveyItems.length };
	};

	const address = getBudgetAddress(budget);
	const label = getBudgetLabel(budget);

	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0">
						<CardTitle className="text-sm font-semibold">{label}</CardTitle>
						{address && <p className="text-xs text-muted-foreground mt-0.5">{address}</p>}
					</div>
					<div className="flex items-center gap-2 flex-shrink-0">
						<Badge variant="default" className="text-xs">
							Vendido
						</Badge>
						{survey && (
							<>
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7 text-muted-foreground"
									disabled={isLoading}
									aria-label="Editar fecha de vencimiento"
									onClick={() =>
										onSetDueDateDialog({
											open: true,
											surveyId: survey.id,
											currentDueDate: survey.due_date ? new Date(survey.due_date) : null,
										})
									}
								>
									<CalendarIcon className="h-3.5 w-3.5" />
								</Button>
								<div className="text-xs text-muted-foreground">
									{survey.due_date ? formatCreatedAt(survey.due_date) : 'No establecida'}
								</div>

								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7 text-muted-foreground hover:text-destructive"
									disabled={isLoading}
									aria-label="Eliminar relevamiento"
									onClick={() => onSetDeleteRelConfirm({ open: true, surveyId: survey.id })}
								>
									<Trash2 className="h-3.5 w-3.5" />
								</Button>
							</>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent>
				{!survey ? (
					<div className="text-center py-4 space-y-3">
						<p className="text-xs text-muted-foreground">
							No hay relevamiento para este presupuesto.
						</p>
						<Button size="sm" onClick={() => onCreateSurvey(budget.id)} disabled={isLoading}>
							<Plus className="h-4 w-4 mr-1" />
							Crear relevamiento
						</Button>
					</div>
				) : (
					<div className="space-y-3">
						{/* Progress bar */}
						{(() => {
							const { done, total } = getProgress(survey.id);
							return total > 0 ? (
								<div className="flex items-center gap-2">
									<div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
										<div
											className="h-full bg-primary rounded-full transition-all duration-300"
											style={{ width: `${(done / total) * 100}%` }}
										/>
									</div>
									<span className="text-xs text-muted-foreground whitespace-nowrap">
										{done}/{total}
									</span>
								</div>
							) : null;
						})()}

						{/* Steps list */}
						{getItemsForSurvey(survey.id).length === 0 ? (
							<p className="text-xs text-muted-foreground text-center py-2">
								No hay pasos. Agregá el primero.
							</p>
						) : (
							<ul className="space-y-2">
								{getItemsForSurvey(survey.id).map((item) => (
									<li key={item.id} className="flex items-center gap-3 group">
										<Checkbox
											id={`item-${item.id}`}
											checked={item.completed}
											onCheckedChange={() => onToggleItem(item)}
											disabled={isLoading}
										/>
										<label
											htmlFor={`item-${item.id}`}
											className={`flex-1 text-sm cursor-pointer select-none ${
												item.completed ? 'line-through text-muted-foreground' : ''
											}`}
										>
											{item.label}
										</label>
										<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6"
												aria-label="Editar paso"
												disabled={isLoading}
												onClick={() =>
													onSetItemDialog({
														open: true,
														mode: 'edit',
														surveyId: item.survey_id,
														item,
													})
												}
											>
												<Pencil className="h-3 w-3" />
											</Button>
											<EventFormModal
												onSave={async (eventData) => {
													return handleCreateEventFromSurveyItem(eventData);
												}}
												initialData={{
													title: item.label,
													type: 'medicion',
													client: `${client.last_name} ${client.name}`,
													location: budget.folder_budget?.work?.locality || '',
													address: budget.folder_budget?.work?.address || '',
													description: '',
												}}
											>
												<Button
													variant="ghost"
													size="icon"
													className="h-6 w-6"
													aria-label="Crear evento"
													disabled={isLoading}
												>
													<CalendarIcon className="h-3 w-3" />
												</Button>
											</EventFormModal>
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6 text-muted-foreground hover:text-destructive"
												aria-label="Eliminar paso"
												disabled={isLoading}
												onClick={() => onSetDeleteItemConfirm({ open: true, itemId: item.id })}
											>
												<Trash2 className="h-3 w-3" />
											</Button>
										</div>
									</li>
								))}
							</ul>
						)}

						{/* Add step */}
						<Button
							variant="outline"
							size="sm"
							className="w-full mt-1"
							disabled={isLoading}
							onClick={() =>
								onSetItemDialog({
									open: true,
									mode: 'add',
									surveyId: survey.id,
									item: null,
								})
							}
						>
							<Plus className="h-4 w-4 mr-1" />
							Agregar paso
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
