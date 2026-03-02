'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Loader2, CheckCircle } from 'lucide-react';
import {
	pvcChecklistItems,
	aluminioChecklistNames,
	mamparasChecklistNames,
	vidrioChecklistNames,
	persianasChecklistNames,
	portonesChecklistNames,
} from '@/lib/works/checklists.constants';
import { Checklist } from '@/lib/works/checklists';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { translateError } from '@/lib/error-translator';

type ChecklistModalProps = {
	workId: string;
	existingChecklists?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	checklistToEdit?: Checklist | null;
	onSave: (checklist: {
		name?: string | null;
		description?: string | null;
		width?: number | null;
		height?: number | null;
		type_opening?: 'PVC' | 'Aluminio' | 'Persiana' | 'Mampara' | 'Porton' | 'Vidrio' | null;
		items: Array<{ name: string; completed: boolean }>;
	}) => Promise<void>;
	onUpdate?: (
		checklistId: string,
		checklist: {
			name?: string | null;
			description?: string | null;
			width?: number | null;
			height?: number | null;
			type_opening?: 'PVC' | 'Aluminio' | 'Persiana' | 'Mampara' | 'Porton' | 'Vidrio' | null;
			items: Array<{ name: string; done: boolean }>;
		}
	) => void;
};

export function ChecklistModal({
	workId,
	existingChecklists,
	open,
	onOpenChange,
	checklistToEdit,
	onSave,
	onUpdate,
}: ChecklistModalProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [createdCount, setCreatedCount] = useState(0);
	const [isCreating, setIsCreating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isEditMode = !!checklistToEdit; // true if checklistToEdit is provided, false for create mode
	const isControlled = open !== undefined;
	const modalOpen = isControlled ? open : isOpen;
	const setModalOpen = isControlled ? onOpenChange || (() => {}) : setIsOpen;

	const [checklist, setChecklist] = useState<{
		name?: string | null;
		description?: string | null;
		type_opening?: 'PVC' | 'Aluminio' | 'Persiana' | 'Mampara' | 'Porton' | 'Vidrio' | null;
		width?: number | null;
		height?: number | null;
		items: Array<{ name: string; completed: boolean }>;
	}>({
		name: null,
		description: null,
		width: null,
		height: null,
		items: [],
		type_opening: null,
	});

	// Initialize from checklist to edit
	useEffect(() => {
		if (checklistToEdit && modalOpen) {
			const editChecklist = {
				name: checklistToEdit.name || null,
				description: checklistToEdit.description || null,
				width: checklistToEdit.width || null,
				height: checklistToEdit.height || null,
				type_opening:
					(checklistToEdit.type_opening as
						| 'PVC'
						| 'Aluminio'
						| 'Persiana'
						| 'Mampara'
						| 'Porton'
						| 'Vidrio'
						| null) || null,
				items: (checklistToEdit.items || []).map((item) => ({
					name: item.name,
					completed: item.done || false,
				})),
			};
			setChecklist(editChecklist);
		}
	}, [checklistToEdit, modalOpen]);

	// Reset when modal opens/closes
	useEffect(() => {
		if (!modalOpen) {
			setCreatedCount(0);
			setError(null);
			if (!isEditMode) {
				resetForm();
			}
		}
	}, [modalOpen, isEditMode]);

	const resetForm = () => {
		setChecklist({
			name: null,
			description: null,
			width: null,
			height: null,
			items: [],
			type_opening: null,
		});
		setError(null);
	};

	const addChecklistItem = (itemText: string) => {
		if (itemText.trim()) {
			setChecklist((prev) => ({
				...prev,
				items: [...prev.items, { name: itemText.trim(), completed: false }],
			}));
		}
	};

	const removeChecklistItem = (itemIndex: number) => {
		setChecklist((prev) => ({
			...prev,
			items: prev.items.filter((_, i) => i !== itemIndex),
		}));
	};

	const updateChecklistField = (field: string, value: any) => {
		setChecklist((prev) => ({
			...prev,
			[field]: value === '' ? null : value,
		}));

		if (field === 'type_opening') {
			const defaultItems =
				value === 'PVC'
					? pvcChecklistItems
					: value === 'Aluminio'
						? aluminioChecklistNames
						: value === 'Mampara'
							? mamparasChecklistNames
							: value === 'Vidrio'
								? vidrioChecklistNames
								: value === 'Persiana'
									? persianasChecklistNames
									: value === 'Porton'
										? portonesChecklistNames
										: [];

			setChecklist((prev) => ({
				...prev,
				[field]: value === '' ? null : value,
				items: defaultItems.map((itemName) => ({
					name: itemName,
					completed: false,
				})),
			}));
		}
	};

	const handleSaveAndNext = async () => {
		setIsCreating(true);
		setError(null);

		try {
			if (isEditMode && onUpdate && checklistToEdit) {
				onUpdate(checklistToEdit.id, {
					...checklist,
					items: checklist.items.map((item) => ({
						name: item.name,
						done: item.completed,
					})),
				});
				toast({
					title: 'Checklist actualizada',
					description: 'Los cambios se guardaron correctamente.',
				});
				setModalOpen(false);
			} else {
				// Create mode
				await onSave(checklist);
				setCreatedCount((prev) => prev + 1);
				toast({
					title: 'Checklist creada',
					description: `Checklist ${createdCount + 1} creada exitosamente.`,
				});
				resetForm();
			}
		} catch (err: any) {
			const errorMessage = translateError(err);
			setError(errorMessage);
			toast({
				title: 'Error',
				description: errorMessage,
				variant: 'destructive',
			});
		} finally {
			setIsCreating(false);
		}
	};

	const handleFinish = () => {
		if (createdCount > 0) {
			toast({
				title: 'Proceso completado',
				description: `Se crearon ${createdCount} checklist(s) exitosamente.`,
			});
		}
		setModalOpen(false);
	};

	return (
		<Dialog open={modalOpen} onOpenChange={setModalOpen}>
			<DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6">
				<DialogHeader>
					<div className="flex items-center justify-between">
						<DialogTitle>{isEditMode ? 'Editar Checklist' : 'Crear Checklist'}</DialogTitle>
						{!isEditMode && createdCount > 0 && (
							<Badge variant="default" className="gap-1">
								<CheckCircle className="h-3 w-3" />
								{createdCount} creada(s)
							</Badge>
						)}
					</div>
				</DialogHeader>

				<div className="space-y-6">
					{error && (
						<div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
							<p className="text-sm text-destructive">{error}</p>
						</div>
					)}

					<Card className="border-2 shadow-sm">
						<CardHeader className="pb-6 space-y-4">
							<div className="text-center">
								<h3 className="text-xl font-semibold text-muted-foreground mb-2">
									{isEditMode ? 'Editar' : `Abertura ${createdCount + 1}`}
								</h3>
								<Input
									placeholder="Identificador"
									value={checklist.name || ''}
									onChange={(e) => updateChecklistField('name', e.target.value)}
									className="text-center border-0 shadow-none focus-visible:ring-1 bg-muted/30"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="description" className="text-sm">
										Descripción
									</Label>
									<Input
										id="description"
										placeholder="Descripción (opcional)"
										value={checklist.description || ''}
										onChange={(e) => updateChecklistField('description', e.target.value)}
										className="h-10"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="opening-type" className="text-sm">
										Tipo de Abertura
									</Label>
									<Select
										value={checklist.type_opening || ''}
										onValueChange={(value) => updateChecklistField('type_opening', value)}
									>
										<SelectTrigger id="opening-type" className="h-10">
											<SelectValue placeholder="Seleccionar tipo" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="PVC">PVC</SelectItem>
											<SelectItem value="Aluminio">Aluminio</SelectItem>
											<SelectItem value="Mampara">Mampara</SelectItem>
											<SelectItem value="Vidrio">Vidrio</SelectItem>
											<SelectItem value="Persiana">Persiana</SelectItem>
											<SelectItem value="Porton">Portón</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="width" className="text-sm">
										Ancho (cm)
									</Label>
									<Input
										id="width"
										type="number"
										placeholder="Ancho"
										value={checklist.width || ''}
										onChange={(e) =>
											updateChecklistField('width', parseFloat(e.target.value) || null)
										}
										className="h-10"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="height" className="text-sm">
										Alto (cm)
									</Label>
									<Input
										id="height"
										type="number"
										placeholder="Alto"
										value={checklist.height || ''}
										onChange={(e) =>
											updateChecklistField('height', parseFloat(e.target.value) || null)
										}
										className="h-10"
									/>
								</div>
							</div>
						</CardHeader>

						<CardContent className="space-y-6">
							<div className="space-y-4">
								<h4 className="font-medium text-center text-muted-foreground">
									Items de Checklist
								</h4>

								<div className="space-y-3 max-h-48 overflow-y-auto">
									{checklist.items.map((item, itemIndex) => (
										<div
											key={itemIndex}
											className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border"
										>
											<span className="text-sm font-medium">{item.name}</span>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => removeChecklistItem(itemIndex)}
												className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									))}
								</div>

								<div className="flex items-center gap-3 p-3 border-2 border-dashed border-muted rounded-lg">
									<Input
										placeholder="Agregar nuevo item..."
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												const target = e.target as HTMLInputElement;
												addChecklistItem(target.value);
												target.value = '';
											}
										}}
										className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-sm"
									/>
									<Button
										type="button"
										onClick={(e) => {
											const input = e.currentTarget.parentElement?.querySelector('input');
											if (input) {
												addChecklistItem(input.value);
												input.value = '';
											}
										}}
										size="sm"
										className="h-8 w-8 p-0 shrink-0"
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					<div className="flex justify-center space-x-4 pt-4 border-t">
						{isEditMode ? (
							<>
								<Button
									type="button"
									variant="outline"
									onClick={() => setModalOpen(false)}
									className="px-8"
								>
									Cancelar
								</Button>
								<Button onClick={handleSaveAndNext} disabled={isCreating} className="px-8">
									{isCreating ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Guardando...
										</>
									) : (
										'Guardar Cambios'
									)}
								</Button>
							</>
						) : (
							<>
								<Button type="button" variant="outline" onClick={handleFinish} className="px-8">
									Finalizar
								</Button>
								<Button onClick={handleSaveAndNext} disabled={isCreating} className="px-8">
									{isCreating ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Creando...
										</>
									) : (
										<>
											Crear y siguiente
											<Plus className="ml-2 h-4 w-4" />
										</>
									)}
								</Button>
							</>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
