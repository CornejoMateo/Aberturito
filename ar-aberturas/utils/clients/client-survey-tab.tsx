'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from '@/components/ui/use-toast';
import { Calendar as CalendarIcon, ClipboardList, Pencil, Plus, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { Client } from '@/lib/clients/clients';
import { BudgetWithWork } from '@/lib/works/balances';
import { Survey, SurveyItem, updateSurvey } from '@/lib/survey/survey';
import { translateError } from '@/lib/error-translator';
import { useClientSurveys } from '@/hooks/clients/use-client-survey';

import { SurveyItemForm } from './survey-item-form';
import { formatCreatedAt } from '@/helpers/date/format-date';

interface ClientSurveyTabProps {
	client: Client;
}

type ItemDialogState = {
	open: boolean;
	mode: 'add' | 'edit';
	surveyId: string | null;
	item: SurveyItem | null;
};

type DeleteItemConfirmState = {
	open: boolean;
	itemId: string | null;
};

type DeleteRelConfirmState = {
	open: boolean;
	surveyId: string | null;
};

type DueDateDialogState = {
	open: boolean;
	surveyId: string | null;
	currentDueDate: Date | null;
};

const INITIAL_ITEM_DIALOG: ItemDialogState = {
	open: false,
	mode: 'add',
	surveyId: null,
	item: null,
};

const INITIAL_DELETE_ITEM: DeleteItemConfirmState = { open: false, itemId: null };
const INITIAL_DELETE_REL: DeleteRelConfirmState = { open: false, surveyId: null };
const INITIAL_DUE_DATE: DueDateDialogState = { open: false, surveyId: null, currentDueDate: null };

function getBudgetLabel(budget: BudgetWithWork): string {
	const parts: string[] = [];
	if (budget.number) parts.push(`#${budget.number}`);
	if (budget.type) parts.push(budget.type);
	return parts.length ? parts.join(' · ') : 'Presupuesto vendido';
}

function getBudgetAddress(budget: BudgetWithWork): string | null {
	const work = budget.folder_budget?.work;
	if (!work) return null;
	const parts = [work.address, work.locality].filter(Boolean);
	return parts.join(', ') || null;
}

export function ClientSurveyTab({ client }: ClientSurveyTabProps) {
	const {
		soldBudgets,
		Surveys: surveys,
		items,
		isLoading,
		load,
		createSurvey,
		removeSurvey,
		addItem,
		updateItem,
		removeItem,
	} = useClientSurveys(client.id);

	const [itemDialog, setItemDialog] = useState<ItemDialogState>(INITIAL_ITEM_DIALOG);
	const [deleteItemConfirm, setDeleteItemConfirm] =
		useState<DeleteItemConfirmState>(INITIAL_DELETE_ITEM);
	const [deleteRelConfirm, setDeleteRelConfirm] =
		useState<DeleteRelConfirmState>(INITIAL_DELETE_REL);
	const [dueDateDialog, setDueDateDialog] = useState<DueDateDialogState>(INITIAL_DUE_DATE);

	useEffect(() => {
		load();
	}, [load]);

	const getSurveyForBudget = (budgetId: string): Survey | undefined =>
		surveys.find((s) => s.budget_id === budgetId);

	const getItemsForSurvey = (surveyId: string): SurveyItem[] =>
		items.filter((i) => i.survey_id === surveyId).sort((a, b) => a.order - b.order);

	const getProgress = (surveyId: string): { done: number; total: number } => {
		const survey = getItemsForSurvey(surveyId);
		return { done: survey.filter((i) => i.completed).length, total: survey.length };
	};

	const handleCreateSurvey = async (budgetId: string) => {
		try {
			await createSurvey(budgetId);
			toast({
				title: 'Relevamiento creado',
				description: 'Se creó el relevamiento con los pasos por defecto.',
			});
		} catch (err) {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: translateError(err) || 'No se pudo crear el relevamiento.',
			});
		}
	};

	const handleToggleItem = async (item: SurveyItem) => {
		try {
			await updateItem(item.id, { completed: !item.completed });
		} catch (err) {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: translateError(err) || 'No se pudo actualizar el paso.',
			});
		}
	};

	const handleItemFormSubmit = async (label: string) => {
		try {
			if (itemDialog.mode === 'add' && itemDialog.surveyId) {
				await addItem(itemDialog.surveyId, label);
				toast({ title: 'Paso agregado' });
			} else if (itemDialog.mode === 'edit' && itemDialog.item) {
				await updateItem(itemDialog.item.id, { label });
				toast({ title: 'Paso actualizado' });
			}
			setItemDialog(INITIAL_ITEM_DIALOG);
		} catch (err) {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: translateError(err) || 'No se pudo guardar el paso.',
			});
		}
	};

	const handleConfirmDeleteItem = async () => {
		if (!deleteItemConfirm.itemId) return;
		try {
			await removeItem(deleteItemConfirm.itemId);
			toast({ title: 'Paso eliminado' });
		} catch (err) {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: translateError(err) || 'No se pudo eliminar el paso.',
			});
		} finally {
			setDeleteItemConfirm(INITIAL_DELETE_ITEM);
		}
	};

	const handleConfirmDeleteSurvey = async () => {
		if (!deleteRelConfirm.surveyId) return;
		try {
			await removeSurvey(deleteRelConfirm.surveyId);
			toast({ title: 'Relevamiento eliminado' });
		} catch (err) {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: translateError(err) || 'No se pudo eliminar el relevamiento.',
			});
		} finally {
			setDeleteRelConfirm(INITIAL_DELETE_REL);
		}
	};

	const handleDueDateSave = async (dueDate: Date | null) => {
		if (!dueDateDialog.surveyId) return;
		try {
			// Convert Date to ISO string for database
			const finalDueDate = dueDate ? dueDate.toISOString().split('T')[0] : null;
			await updateSurvey(dueDateDialog.surveyId, { due_date: finalDueDate });
			toast({ title: 'Fecha de vencimiento actualizada' });
			setDueDateDialog(INITIAL_DUE_DATE);
			load();
		} catch (err) {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: translateError(err) || 'No se pudo actualizar la fecha de vencimiento.',
			});
		}
	};

	if (isLoading && !soldBudgets.length && !surveys.length) {
		return (
			<div className="py-8 text-center">
				<p className="text-sm text-muted-foreground">Cargando relevamientos...</p>
			</div>
		);
	}

	if (!soldBudgets.length) {
		return (
			<Card className="p-6">
				<div className="text-center space-y-2">
					<ClipboardList className="h-8 w-8 text-muted-foreground mx-auto" />
					<p className="text-sm font-medium">Sin presupuestos vendidos</p>
					<p className="text-xs text-muted-foreground">
						El relevamiento estará disponible cuando el cliente tenga al menos un presupuesto
						marcado como vendido.
					</p>
				</div>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{soldBudgets.map((budget: BudgetWithWork) => {
				const survey = getSurveyForBudget(budget.id);
				const address = getBudgetAddress(budget);
				const label = getBudgetLabel(budget);

				return (
					<Card key={budget.id}>
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
													setDueDateDialog({
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
												onClick={() => setDeleteRelConfirm({ open: true, surveyId: survey.id })}
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
									<Button
										size="sm"
										onClick={() => handleCreateSurvey(budget.id)}
										disabled={isLoading}
									>
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
														onCheckedChange={() => handleToggleItem(item)}
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
																setItemDialog({
																	open: true,
																	mode: 'edit',
																	surveyId: item.survey_id,
																	item,
																})
															}
														>
															<Pencil className="h-3 w-3" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															className="h-6 w-6 text-muted-foreground hover:text-destructive"
															aria-label="Eliminar paso"
															disabled={isLoading}
															onClick={() => setDeleteItemConfirm({ open: true, itemId: item.id })}
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
											setItemDialog({
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
			})}

			{/* Add / Edit item dialog */}
			<Dialog
				open={itemDialog.open}
				onOpenChange={(open) => !open && setItemDialog(INITIAL_ITEM_DIALOG)}
			>
				<DialogContent className="sm:max-w-[400px]">
					<DialogHeader>
						<DialogTitle>{itemDialog.mode === 'add' ? 'Agregar paso' : 'Editar paso'}</DialogTitle>
						<DialogDescription>
							{itemDialog.mode === 'add'
								? 'Ingresá el nombre del nuevo paso del relevamiento.'
								: 'Modificá el nombre del paso.'}
						</DialogDescription>
					</DialogHeader>
					<SurveyItemForm
						initialLabel={itemDialog.item?.label ?? ''}
						onSubmit={handleItemFormSubmit}
						onCancel={() => setItemDialog(INITIAL_ITEM_DIALOG)}
						isLoading={isLoading}
					/>
				</DialogContent>
			</Dialog>

			{/* Confirm delete step */}
			<ConfirmDialog
				open={deleteItemConfirm.open}
				onOpenChange={(open) => setDeleteItemConfirm({ ...deleteItemConfirm, open })}
				title="Eliminar paso"
				description="¿Estás seguro de que querés eliminar este paso? Esta acción no se puede deshacer."
				onConfirm={handleConfirmDeleteItem}
				isLoading={isLoading}
			/>

			{/* Confirm delete survey */}
			<ConfirmDialog
				open={deleteRelConfirm.open}
				onOpenChange={(open) => setDeleteRelConfirm({ ...deleteRelConfirm, open })}
				title="Eliminar relevamiento"
				description="¿Estás seguro de que querés eliminar este relevamiento y todos sus pasos? Esta acción no se puede deshacer."
				onConfirm={handleConfirmDeleteSurvey}
				isLoading={isLoading}
			/>

			{/* Due date dialog */}
			<Dialog
				open={dueDateDialog.open}
				onOpenChange={(open) => !open && setDueDateDialog(INITIAL_DUE_DATE)}
			>
				<DialogContent className="sm:max-w-[400px]">
					<DialogHeader>
						<DialogTitle>Fecha de vencimiento</DialogTitle>
						<DialogDescription>
							Establecé una fecha límite para completar este relevamiento.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<label htmlFor="due-date" className="text-sm font-medium">
								Fecha de vencimiento
							</label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											'w-full justify-start text-left font-normal mt-1.5',
											!dueDateDialog.currentDueDate && 'text-muted-foreground'
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{dueDateDialog.currentDueDate
											? formatCreatedAt(dueDateDialog.currentDueDate)
											: 'Seleccionar fecha'}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={dueDateDialog.currentDueDate ?? undefined}
										onSelect={(date) =>
											setDueDateDialog({ ...dueDateDialog, currentDueDate: date ?? null })
										}
										initialFocus
										locale={es}
									/>
								</PopoverContent>
							</Popover>
						</div>
						<div className="flex justify-end gap-2">
							{dueDateDialog.currentDueDate && (
								<Button
									variant="ghost"
									onClick={() => handleDueDateSave(null)}
									className="text-destructive hover:text-destructive"
								>
									Quitar fecha
								</Button>
							)}
							<Button variant="outline" onClick={() => setDueDateDialog(INITIAL_DUE_DATE)}>
								Cancelar
							</Button>
							<Button onClick={() => handleDueDateSave(dueDateDialog.currentDueDate)}>
								Guardar
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
