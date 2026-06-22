'use client';

import { useEffect, useState } from 'react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from '@/components/ui/use-toast';
import { ClipboardList } from 'lucide-react';

import { Client } from '@/lib/clients/clients';
import { Survey, SurveyItem, updateSurvey } from '@/lib/survey/survey';
import { translateError } from '@/lib/error-translator';
import { useClientSurveys } from '@/hooks/clients/use-client-survey';

import type {
	ItemDialogState,
	DeleteItemConfirmState,
	DeleteRelConfirmState,
	DueDateDialogState,
} from './client-survey-tab.types';
import {
	INITIAL_ITEM_DIALOG,
	INITIAL_DELETE_ITEM,
	INITIAL_DELETE_REL,
	INITIAL_DUE_DATE,
} from '@/constants/survey';
import { SurveyItemDialog } from './survey-item-dialog';
import { SurveyDueDateDialog } from './survey-due-date-dialog';
import { SurveyBudgetCard } from './survey-budget-card';

interface ClientSurveyTabProps {
	client: Client;
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

	const getSurveyForBudget = (budgetId: number): Survey | undefined =>
		surveys.find((s) => s.budget_id === budgetId);

	const getItemsForSurvey = (surveyId: number): SurveyItem[] =>
		items.filter((i) => i.survey_id === surveyId).sort((a, b) => a.order - b.order);

	const handleCreateSurvey = async (budgetId: number) => {
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
			{soldBudgets.map((budget) => (
				<SurveyBudgetCard
					key={budget.id}
					budget={budget}
					survey={getSurveyForBudget(budget.id)}
					items={items}
					client={client}
					isLoading={isLoading}
					onCreateSurvey={handleCreateSurvey}
					onToggleItem={handleToggleItem}
					onSetItemDialog={setItemDialog}
					onSetDeleteItemConfirm={setDeleteItemConfirm}
					onSetDeleteRelConfirm={setDeleteRelConfirm}
					onSetDueDateDialog={setDueDateDialog}
				/>
			))}

			{/* Add / Edit item dialog */}
			<SurveyItemDialog
				dialog={itemDialog}
				onOpenChange={(open) => !open && setItemDialog(INITIAL_ITEM_DIALOG)}
				onSubmit={handleItemFormSubmit}
				isLoading={isLoading}
			/>

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
			<SurveyDueDateDialog
				dialog={dueDateDialog}
				onOpenChange={(open) => !open && setDueDateDialog(INITIAL_DUE_DATE)}
				onSave={handleDueDateSave}
				onDateSelect={(date) => setDueDateDialog({ ...dueDateDialog, currentDueDate: date ?? null })}
			/>
		</div>
	);
}
