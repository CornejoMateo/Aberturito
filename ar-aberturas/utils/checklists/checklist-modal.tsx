'use client';

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, X, Plus, Trash2, Edit } from 'lucide-react';
import { pvcChecklistItems, aluminioChecklistNames } from '@/lib/works/checklists.constants';
import { Checklist } from '@/lib/works/checklists';
import { useAuth } from '@/components/provider/auth-provider';

type ChecklistModalProps = {
	workId: string;
	existingChecklists?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	checklistToEdit?: Checklist | null;
	onSave: (
		checklists: Array<{
			name?: string | null;
			description?: string | null;
			width?: number | null;
			height?: number | null;
			type_opening?: 'PVC' | 'Aluminio' | null;
			items: Array<{ name: string; completed: boolean }>;
		}>
	) => void;
	onUpdate?: (checklistId: string, checklist: {
		name?: string | null;
		description?: string | null;
		width?: number | null;
		height?: number | null;
		type_opening?: 'PVC' | 'Aluminio' | null;
		items: Array<{ name: string; done: boolean }>;
	}) => void;
	children?: React.ReactNode;
};

export function ChecklistModal({ workId, existingChecklists, open, onOpenChange, checklistToEdit, onSave, onUpdate }: ChecklistModalProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [step, setStep] = useState(1);
	const [windowCount, setWindowCount] = useState(1);
	const { user } = useAuth();

	const isEditMode = !!checklistToEdit;
	const isControlled = open !== undefined;
	const modalOpen = isControlled ? open : isOpen;
	const setModalOpen = isControlled ? (onOpenChange || (() => {})) : setIsOpen;
	const [checklists, setChecklists] = useState<
		Array<{
			name?: string | null;
			description?: string | null;
			type_opening?: 'PVC' | 'Aluminio' | null;
			width?: number | null;
			height?: number | null;
			items: Array<{ name: string; completed: boolean }>;
		}>
	>([]);

	// Initialize from checklist to edit
	useEffect(() => {
		if (checklistToEdit && modalOpen) {
			const editChecklist = {
				name: checklistToEdit.name || null,
				description: checklistToEdit.description || null,
				width: checklistToEdit.width || null,
				height: checklistToEdit.height || null,
				type_opening: (checklistToEdit.type_opening as 'PVC' | 'Aluminio' | null) || null,
				items: (checklistToEdit.items || []).map(item => ({
					name: item.name,
					completed: item.done || false,
				})),
			};
			setChecklists([editChecklist]);
			setStep(2); // Skip to edit screen
		}
	}, [checklistToEdit, modalOpen]);

	// Initialize checklists with default items when window count changes
	const initializeChecklists = (count: number) => {
		const newChecklists = Array.from({ length: count }, () => ({
			name: null,
			description: null,
			width: null,
			height: null,
			items: [],
			type_opening: null,
		}));
		setChecklists(newChecklists);
	};

	const handleWindowCountSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		initializeChecklists(windowCount);
		setStep(2);
	};

	const addChecklistItem = (windowIndex: number, itemText: string) => {
		if (itemText.trim()) {
			const updatedChecklists = [...checklists];
			updatedChecklists[windowIndex].items.push({
				name: itemText.trim(),
				completed: false,
			});
			setChecklists(updatedChecklists);
		}
	};

	const removeChecklistItem = (windowIndex: number, itemIndex: number) => {
		const updatedChecklists = [...checklists];
		updatedChecklists[windowIndex].items = updatedChecklists[windowIndex].items.filter(
			(_, i) => i !== itemIndex
		);
		setChecklists(updatedChecklists);
	};

	const toggleChecklistItem = (windowIndex: number, itemIndex: number) => {
		const updatedChecklists = [...checklists];
		updatedChecklists[windowIndex].items[itemIndex].completed =
			!updatedChecklists[windowIndex].items[itemIndex].completed;
		setChecklists(updatedChecklists);
	};

	const handleSave = () => {
		if (isEditMode && onUpdate && checklistToEdit) {
			// Edit mode - update existing checklist
			const editedChecklist = checklists[0];
			onUpdate(checklistToEdit.id, {
				...editedChecklist,
				items: editedChecklist.items.map(item => ({
					name: item.name,
					done: item.completed,
				})),
			});
		} else {
			onSave(checklists);
		}
		setModalOpen(false);
		setStep(1);
		setWindowCount(1);
		setChecklists([]);
	};

	const updateChecklistField = (index: number, field: string, value: any) => {
		const updatedChecklists = [...checklists];
		updatedChecklists[index] = {
			...updatedChecklists[index],
			[field]: value === '' ? null : value,
		};

		if (field === 'type_opening') {
			const defaultItems =
				value === 'PVC' ? pvcChecklistItems : value === 'Aluminio' ? aluminioChecklistNames : [];

			updatedChecklists[index].items = defaultItems.map((itemName) => ({
				name: itemName,
				completed: false,
			}));
		}

		setChecklists(updatedChecklists);
	};

	return (
		<Dialog open={modalOpen} onOpenChange={setModalOpen}>
			<DialogContent className="max-w-2xl! max-h-[85vh] overflow-y-auto p-6">
				<DialogHeader>
					<DialogTitle>
						{isEditMode ? 'Editar Checklist' : step === 1 ? 'Cantidad de Aberturas' : 'Configurar Checklists'}
					</DialogTitle>
				</DialogHeader>

				{!isEditMode && step === 1 ? (
					<form onSubmit={handleWindowCountSubmit} className="space-y-8 max-w-md mx-auto">
						<div className="space-y-4">
							<Label htmlFor="windowCount" className="text-lg font-medium">
								{!existingChecklists
									? '¿Cuántas aberturas vas a instalar?'
									: '¿Cuántas aberturas desea agregar?'}
							</Label>
							<Input
								id="windowCount"
								type="number"
								min="1"
								value={windowCount || ''}
								onChange={(e) => setWindowCount(Number(e.target.value))}
								className="w-32 h-12 text-center text-lg"
							/>
						</div>
						<div className="flex justify-center space-x-4 pt-6">
							<Button
								type="button"
								variant="outline"
								onClick={() => setModalOpen(false)}
								className="px-8"
							>
								Cancelar
							</Button>
							<Button type="submit" className="px-8">
								Configurar Checklists
							</Button>
						</div>
					</form>
				) : (
					<div className="space-y-8">
						<div className="space-y-8">
							{checklists.map((checklist, windowIndex) => (
								<Card key={windowIndex} className="border-2 shadow-sm">
									<CardHeader className="pb-6 space-y-4">
										<div className="text-center">
											<h3 className="text-xl font-semibold text-muted-foreground mb-2">
												Abertura {windowIndex + 1}
											</h3>
											<Input
												placeholder="Identificador"
												value={checklist.name || ''}
												onChange={(e) => updateChecklistField(windowIndex, 'name', e.target.value)}
												className="text-center border-0 shadow-none focus-visible:ring-1 bg-muted/30"
											/>
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor={`description-${windowIndex}`} className="text-sm">
													Descripción
												</Label>
												<Input
													id={`description-${windowIndex}`}
													placeholder="Descripción (opcional)"
													value={checklist.description || ''}
													onChange={(e) =>
														updateChecklistField(windowIndex, 'description', e.target.value)
													}
													className="h-10"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor={`opening-type-${windowIndex}`} className="text-sm">
													Tipo de Abertura
												</Label>
												<Select
													value={checklist.type_opening || ''}
													onValueChange={(value) =>
														updateChecklistField(windowIndex, 'type_opening', value)
													}
												>
													<SelectTrigger id={`opening-type-${windowIndex}`} className="h-10">
														<SelectValue placeholder="Seleccionar tipo" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="PVC">PVC</SelectItem>
														<SelectItem value="Aluminio">Aluminio</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor={`width-${windowIndex}`} className="text-sm">
													Ancho (cm)
												</Label>
												<Input
													id={`width-${windowIndex}`}
													type="number"
													placeholder="Ancho"
													value={checklist.width || ''}
													onChange={(e) =>
														updateChecklistField(
															windowIndex,
															'width',
															parseFloat(e.target.value) || null
														)
													}
													className="h-10"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor={`height-${windowIndex}`} className="text-sm">
													Alto (cm)
												</Label>
												<Input
													id={`height-${windowIndex}`}
													type="number"
													placeholder="Alto"
													value={checklist.height || ''}
													onChange={(e) =>
														updateChecklistField(
															windowIndex,
															'height',
															parseFloat(e.target.value) || null
														)
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
															onClick={() => removeChecklistItem(windowIndex, itemIndex)}
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
															addChecklistItem(windowIndex, target.value);
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
															addChecklistItem(windowIndex, input.value);
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
							))}
						</div>

						<div className="flex justify-center space-x-4 pt-8 border-t">
							{!isEditMode && (
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setStep(1);
										setChecklists([]);
									}}
									className="px-8"
								>
									Atrás
								</Button>
							)}
							<Button
								type="button"
								variant="outline"
								onClick={() => setModalOpen(false)}
								className="px-8"
							>
								Cancelar
							</Button>
							<Button onClick={handleSave} className="px-8">
								{isEditMode ? 'Guardar Cambios' : 'Crear Checklists para Aberturas'}
							</Button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
