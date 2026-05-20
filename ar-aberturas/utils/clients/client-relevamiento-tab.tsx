'use client';

import { useEffect, useState } from 'react';

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
import { ClipboardList, Pencil, Plus, Trash2 } from 'lucide-react';

import { Client } from '@/lib/clients/clients';
import { BudgetWithWork } from '@/lib/works/balances';
import { Relevamiento, RelevamientoItem } from '@/lib/relevamientos/relevamientos';
import { translateError } from '@/lib/error-translator';
import { useClientRelevamientos } from '@/hooks/clients/use-client-relevamientos';

import { RelevamientoItemForm } from './relevamiento-item-form';

interface ClientRelevamientoTabProps {
	client: Client;
}

type ItemDialogState = {
	open: boolean;
	mode: 'add' | 'edit';
	relevamientoId: string | null;
	item: RelevamientoItem | null;
};

type DeleteItemConfirmState = {
	open: boolean;
	itemId: string | null;
};

type DeleteRelConfirmState = {
	open: boolean;
	relevamientoId: string | null;
};

const INITIAL_ITEM_DIALOG: ItemDialogState = {
	open: false,
	mode: 'add',
	relevamientoId: null,
	item: null,
};

const INITIAL_DELETE_ITEM: DeleteItemConfirmState = { open: false, itemId: null };
const INITIAL_DELETE_REL: DeleteRelConfirmState = { open: false, relevamientoId: null };

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

export function ClientRelevamientoTab({ client }: ClientRelevamientoTabProps) {
	const {
		soldBudgets,
		relevamientos,
		items,
		isLoading,
		load,
		createRelevamiento,
		removeRelevamiento,
		addItem,
		updateItem,
		removeItem,
	} = useClientRelevamientos(client.id);

	const [itemDialog, setItemDialog] = useState<ItemDialogState>(INITIAL_ITEM_DIALOG);
	const [deleteItemConfirm, setDeleteItemConfirm] = useState<DeleteItemConfirmState>(INITIAL_DELETE_ITEM);
	const [deleteRelConfirm, setDeleteRelConfirm] = useState<DeleteRelConfirmState>(INITIAL_DELETE_REL);

	useEffect(() => {
		load();
	}, [load]);

	const getRelevamientoForBudget = (budgetId: string): Relevamiento | undefined =>
		relevamientos.find((r) => r.budget_id === budgetId);

	const getItemsForRelevamiento = (relevamientoId: string): RelevamientoItem[] =>
		items
			.filter((i) => i.relevamiento_id === relevamientoId)
			.sort((a, b) => a.order - b.order);

	const getProgress = (relevamientoId: string): { done: number; total: number } => {
		const rel = getItemsForRelevamiento(relevamientoId);
		return { done: rel.filter((i) => i.completed).length, total: rel.length };
	};

	const handleCreateRelevamiento = async (budgetId: string) => {
		try {
			await createRelevamiento(budgetId);
			toast({ title: 'Relevamiento creado', description: 'Se creó el relevamiento con los pasos por defecto.' });
		} catch (err) {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: translateError(err) || 'No se pudo crear el relevamiento.',
			});
		}
	};

	const handleToggleItem = async (item: RelevamientoItem) => {
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
			if (itemDialog.mode === 'add' && itemDialog.relevamientoId) {
				await addItem(itemDialog.relevamientoId, label);
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

	const handleConfirmDeleteRelevamiento = async () => {
		if (!deleteRelConfirm.relevamientoId) return;
		try {
			await removeRelevamiento(deleteRelConfirm.relevamientoId);
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

	if (isLoading && !soldBudgets.length && !relevamientos.length) {
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
				const relevamiento = getRelevamientoForBudget(budget.id);
				const address = getBudgetAddress(budget);
				const label = getBudgetLabel(budget);

				return (
					<Card key={budget.id}>
						<CardHeader className="pb-2">
							<div className="flex items-start justify-between gap-2">
								<div className="min-w-0">
									<CardTitle className="text-sm font-semibold">{label}</CardTitle>
									{address && (
										<p className="text-xs text-muted-foreground mt-0.5">{address}</p>
									)}
								</div>
								<div className="flex items-center gap-2 flex-shrink-0">
									<Badge variant="default" className="text-xs">
										Vendido
									</Badge>
									{relevamiento && (
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7 text-muted-foreground hover:text-destructive"
											disabled={isLoading}
											aria-label="Eliminar relevamiento"
											onClick={() =>
												setDeleteRelConfirm({ open: true, relevamientoId: relevamiento.id })
											}
										>
											<Trash2 className="h-3.5 w-3.5" />
										</Button>
									)}
								</div>
							</div>
						</CardHeader>

						<CardContent>
							{!relevamiento ? (
								<div className="text-center py-4 space-y-3">
									<p className="text-xs text-muted-foreground">
										No hay relevamiento para este presupuesto.
									</p>
									<Button
										size="sm"
										onClick={() => handleCreateRelevamiento(budget.id)}
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
										const { done, total } = getProgress(relevamiento.id);
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
									{getItemsForRelevamiento(relevamiento.id).length === 0 ? (
										<p className="text-xs text-muted-foreground text-center py-2">
											No hay pasos. Agregá el primero.
										</p>
									) : (
										<ul className="space-y-2">
											{getItemsForRelevamiento(relevamiento.id).map((item) => (
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
																	relevamientoId: item.relevamiento_id,
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
															onClick={() =>
																setDeleteItemConfirm({ open: true, itemId: item.id })
															}
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
												relevamientoId: relevamiento.id,
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
						<DialogTitle>
							{itemDialog.mode === 'add' ? 'Agregar paso' : 'Editar paso'}
						</DialogTitle>
						<DialogDescription>
							{itemDialog.mode === 'add'
								? 'Ingresá el nombre del nuevo paso del relevamiento.'
								: 'Modificá el nombre del paso.'}
						</DialogDescription>
					</DialogHeader>
					<RelevamientoItemForm
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

			{/* Confirm delete relevamiento */}
			<ConfirmDialog
				open={deleteRelConfirm.open}
				onOpenChange={(open) => setDeleteRelConfirm({ ...deleteRelConfirm, open })}
				title="Eliminar relevamiento"
				description="¿Estás seguro de que querés eliminar este relevamiento y todos sus pasos? Esta acción no se puede deshacer."
				onConfirm={handleConfirmDeleteRelevamiento}
				isLoading={isLoading}
			/>
		</div>
	);
}
