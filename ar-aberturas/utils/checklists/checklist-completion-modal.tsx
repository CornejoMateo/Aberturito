'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Loader2, Trash2, Edit, AlertCircle } from 'lucide-react';
import { Checklist, editChecklist, deleteChecklist } from '@/lib/works/checklists';
import { ChecklistPDFButton } from '@/components/ui/checklist-pdf-button';
import { getWorkById, Work } from '@/lib/works/works';
import { ChecklistModal } from './checklist-modal';
import { getClientById, Client } from '@/lib/clients/clients';
import { useAuth } from '@/components/provider/auth-provider';
import { useToast } from '@/components/ui/use-toast';
import { createClaim } from '@/lib/claims/claims';
import { getChecklistsByWorkId } from '@/lib/works/checklists';

type ChecklistCompletionModalProps = {
	workId: string;
	children?: React.ReactNode;
};

export function ChecklistCompletionModal({ workId, children }: ChecklistCompletionModalProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [checklists, setChecklists] = useState<Checklist[]>([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});
	const [addingClaim, setAddingClaim] = useState<Record<string, boolean>>({});
	const [clientName, setClientName] = useState<string>('');
	const [workData, setWorkData] = useState<Work | null>(null);
	const [clientData, setClientData] = useState<Client | null>(null);
	const [checklistToDelete, setChecklistToDelete] = useState<Checklist | null>(null);
	const [checklistToEdit, setChecklistToEdit] = useState<Checklist | null>(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const notesDebounceTimersRef = useRef<Record<string, number>>({});
	const { toast } = useToast();

	const { user } = useAuth();

	// Load checklists when modal opens
	useEffect(() => {
		if (isOpen && workId) {
			loadChecklists();
		}
	}, [isOpen, workId]);

	const loadChecklists = async () => {
		try {
			setLoading(true);
			
			// Load work data to get client name and other info
			const { data: work, error: workError } = await getWorkById(workId);
			if (workError) {
				console.error('Error loading work data:', workError);
			} else if (work) {
				setWorkData(work);
				const fullName = [work.client_name, work.client_last_name]
					.filter(Boolean)
					.join(' ');
				setClientName(fullName);
				
				// Load client data to get phone number
				if (work.client_id) {
					const { data: client, error: clientError } = await getClientById(work.client_id);
					if (clientError) {
						console.error('Error loading client data:', clientError);
					} else if (client) {
						setClientData(client);
					}
				}
			}
			
			const { data, error } = await getChecklistsByWorkId(workId);

			if (error) {
				console.error('Error loading checklists:', error);
				return;
			}

			if (data) {
				setChecklists(data);
			}
		} catch (error) {
			console.error('Error loading checklists:', error);
		} finally {
			setLoading(false);
		}
	};

	const toggleChecklistItem = async (
		checklistId: string,
		itemIndex: number,
		currentItems: any[]
	) => {
		// Update local state optimistically
		const updatedChecklists = checklists.map((checklist) => {
			if (checklist.id === checklistId) {
				const updatedItems = [...(checklist.items || [])];
				if (updatedItems[itemIndex]) {
					updatedItems[itemIndex] = {
						...updatedItems[itemIndex],
						done: !updatedItems[itemIndex].done,
					};
				}
				return { ...checklist, items: updatedItems };
			}
			return checklist;
		});

		setChecklists(updatedChecklists);

		// Save to database
		try {
			setSaving(true);
			const targetChecklist = updatedChecklists.find((c) => c.id === checklistId);
			if (targetChecklist) {
				const { error } = await editChecklist(checklistId, {
					items: targetChecklist.items,
				});

				if (error) {
					console.error('Error saving checklist:', error);
					// Revert on error
					setChecklists(checklists);
				}
			}
		} catch (error) {
			console.error('Error saving checklist:', error);
			// Revert on error
			setChecklists(checklists);
		} finally {
			setSaving(false);
		}
	};

	const setAllChecklistItems = async (checklistId: string, done: boolean) => {
		const previousChecklists = checklists;

		// Update local state optimistically
		const updatedChecklists = checklists.map((checklist) => {
			if (checklist.id !== checklistId) return checklist;
			const items = (checklist.items || []).map((item) => ({ ...item, done }));
			return { ...checklist, items };
		});
		setChecklists(updatedChecklists);

		// Persist
		try {
			setSaving(true);
			const targetChecklist = updatedChecklists.find((c) => c.id === checklistId);
			if (targetChecklist) {
				const { error } = await editChecklist(checklistId, { items: targetChecklist.items });
				if (error) {
					console.error('Error saving checklist bulk update:', error);
					setChecklists(previousChecklists);
				}
			}
		} catch (error) {
			console.error('Error saving checklist bulk update:', error);
			setChecklists(previousChecklists);
		} finally {
			setSaving(false);
		}
	};

	const updateChecklistNotes = (checklistId: string, notes: string) => {
		// Update local state
		setChecklists((prev) =>
			prev.map((c) => (c.id === checklistId ? { ...c, notes } : c))
		);

		// Debounced save
		const existingTimer = notesDebounceTimersRef.current[checklistId];
		if (existingTimer) {
			window.clearTimeout(existingTimer);
		}

		notesDebounceTimersRef.current[checklistId] = window.setTimeout(async () => {
			try {
				setSavingNotes((prev) => ({ ...prev, [checklistId]: true }));
				const { error } = await editChecklist(checklistId, { notes });
				if (error) {
					console.error('Error saving checklist notes:', error);
				}
			} catch (error) {
				console.error('Error saving checklist notes:', error);
			} finally {
				setSavingNotes((prev) => ({ ...prev, [checklistId]: false }));
			}
		}, 600);
	};

	const handleAddAsClaim = async (checklist: Checklist) => {
		if (!workData || !checklist.notes?.trim()) {
			toast({
				title: 'No se puede crear el reclamo',
				description: checklist.notes?.trim() ? 'Falta información de la obra.' : 'Esta abertura no tiene notas.',
				variant: 'destructive',
			});
			return;
		}

		try {
			setAddingClaim((prev) => ({ ...prev, [checklist.id]: true }));
			
			// Prepare claim data
			const today = new Date().toISOString().split('T')[0];
			
			const claimData = {
				date: today,
				daily: false,
				alum_pvc: checklist.type_opening || null,
				attend: null,
				description: checklist.notes,
				resolved: false,
				client_name: clientName || null,
				client_phone: clientData?.phone_number || null,
				work_zone: null,
				work_locality: workData.locality || null,
				work_address: workData.address || null,
			};

			const { error } = await createClaim(claimData);
			
			if (error) {
				throw error;
			}

			toast({
				title: 'Reclamo creado',
				description: `Se creó un reclamo para ${checklist.name || 'esta abertura'}.`,
			});

			// Invalidate claims cache and dispatch event for real-time refresh
			localStorage.removeItem('claims_cache');
			window.dispatchEvent(new CustomEvent('claims-updated'));
		} catch (error) {
			console.error('Error creating claim:', error);
			toast({
				title: 'Error al crear reclamo',
				description: 'No se pudo crear el reclamo. Por favor, intenta nuevamente.',
				variant: 'destructive',
			});
		} finally {
			setAddingClaim((prev) => ({ ...prev, [checklist.id]: false }));
		}
    }

	const handleAddAsDailyAct = async (checklist: Checklist) => {
		if (!workData) {
			toast({
				title: 'No se puede crear la actividad',
				description: 'Falta información de la obra.',
				variant: 'destructive',
			});
			return;
		}

		// Build description from checklist items
		let description = `${checklist.name || 'Checklist'}\n\n`;

		const items = checklist.items?.filter((item) => item.done) || [];
		
		if (items && items.length > 0) {
			description += 'Items:\n';
			items.forEach((item) => {
				const status = item.done ? '✓' : '✗';
				description += `${status} ${item.name}\n`;
			});
		}

		try {
			setAddingClaim((prev) => ({ ...prev, [checklist.id]: true }));
			
			// Prepare daily activity data
			const today = new Date().toISOString().split('T')[0];
			
			const claimData = {
				date: today,
				daily: true,
				alum_pvc: checklist.type_opening || null,
				attend: null,
				description: description,
				resolved: false,
				client_name: clientName || null,
				client_phone: clientData?.phone_number || null,
				work_zone: null,
				work_locality: workData.locality || null,
				work_address: workData.address || null,
			};

			const { error } = await createClaim(claimData);
			
			if (error) {
				throw error;
			}

			toast({
				title: 'Actividad diaria creada',
				description: `Se creó una actividad diaria para ${checklist.name || 'esta abertura'}.`,
			});

			// Invalidate claims cache and dispatch event for real-time refresh
			localStorage.removeItem('claims_cache');
			window.dispatchEvent(new CustomEvent('claims-updated'));
		} catch (error) {
			console.error('Error creating daily activity:', error);
			toast({
				title: 'Error al crear actividad diaria',
				description: 'No se pudo crear la actividad diaria. Por favor, intenta nuevamente.',
				variant: 'destructive',
			});
		} finally {
			setAddingClaim((prev) => ({ ...prev, [checklist.id]: false }));
		}
    }
    
	const confirmDeleteChecklist = async () => {
		if (!checklistToDelete) return;

		try {
			setSaving(true);
			const { error } = await deleteChecklist(checklistToDelete.id);
			if (error) {
				console.error('Error deleting checklist:', error);
				return;
			}

			// Update local state
			setChecklists((prev) => prev.filter((c) => c.id !== checklistToDelete.id));
			setChecklistToDelete(null);
		} catch (error) {
			console.error('Error deleting checklist:', error);
		} finally {
			setSaving(false);
		}
	};

	const handleEditChecklist = (checklist: Checklist) => {
		setChecklistToEdit(checklist);
		setIsEditModalOpen(true);
	};

	const handleUpdateChecklist = async (checklistId: string, updates: any) => {
		try {
			setSaving(true);
			// Transform items to include key property
			const transformedUpdates = {
				...updates,
				items: updates.items?.map((item: any, idx: number) => ({
					name: item.name,
					done: item.done,
					key: idx,
				})),
			};
			const { error } = await editChecklist(checklistId, transformedUpdates);
			if (error) {
				console.error('Error updating checklist:', error);
				return;
			}

			// Update local state
			setChecklists((prev) =>
				prev.map((c) => (c.id === checklistId ? { ...c, ...transformedUpdates } : c))
			);
			setIsEditModalOpen(false);
			setChecklistToEdit(null);
		} catch (error) {
			console.error('Error updating checklist:', error);
		} finally {
			setSaving(false);
		}
	};

	useEffect(() => {
		return () => {
			Object.values(notesDebounceTimersRef.current).forEach((timerId) => {
				if (timerId) window.clearTimeout(timerId);
			});
		};
	}, []);

	const calculateProgress = (items: any[] = []) => {
		if (items.length === 0) return 100;
		const completed = items.filter((item) => item.done).length;
		return Math.round((completed / items.length) * 100);
	};

	const totalProgress =
		checklists.reduce((acc, checklist) => {
			return acc + calculateProgress(checklist.items || []);
		}, 0) / (checklists.length || 1);

	return (
		<>
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				{children || (
					<Button variant="outline">
						<CheckCircle2 className="mr-2 h-4 w-4" />
						Completar Checklists
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6">
				<DialogHeader>
					<DialogTitle>Completar Checklists</DialogTitle>
				</DialogHeader>

				{loading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						<span className="ml-2 text-muted-foreground">Cargando checklists...</span>
					</div>
				) : (
					<div className="space-y-8">
						{/* Progress Overview */}
						<div className="text-center space-y-2">
							<div className='text-sm font-medium text-foreground'>Progreso total: {Math.round(totalProgress)}%</div>
							<div className="text-base"><b>{checklists.length > 0 ? 'Listado de checklists:' : 'No hay checklists disponibles'}</b></div>
						</div>

						{/* Checklists */}
						<div className="space-y-8">
							{checklists.map((checklist, index) => (
								<Card key={checklist.id} className="border-2 shadow-sm">
									<CardHeader className="pb-4 space-y-4">
										<div className="flex items-start justify-between gap-2">
											<div className="space-y-3 flex-1">
												<h3 className="text-xl font-bold text-foreground">
													{checklist.name || `Abertura ${index + 1}`}
												</h3>

												{checklist.description && (
													<div className="space-y-1">
														<Label className="text-xs text-muted-foreground">Descripción</Label>
														<p className="text-sm text-foreground">{checklist.description}</p>
													</div>
												)}
											</div>
											{user?.role === "Admin" && (
												<div className="flex items-center gap-1">
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleEditChecklist(checklist)}
														disabled={saving}
														className="text-muted-foreground hover:text-primary hover:bg-primary/10 flex-shrink-0 h-8 w-8"
														title="Editar checklist"
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => setChecklistToDelete(checklist)}
														disabled={saving}
														className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0 h-8 w-8"
														title="Eliminar checklist"
													>
														<Trash2 className="h-4 w-4" />	
													</Button>
												</div>
											)}
										</div>
										<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
											{checklist.type_opening && (
												<div className="space-y-1">
													<Label className="text-xs text-muted-foreground">Tipo</Label>
													<div className="font-medium text-foreground capitalize">
														{checklist.type_opening}
													</div>
												</div>
											)}
											{checklist.width && (
												<div className="space-y-1">
													<Label className="text-xs text-muted-foreground">Ancho</Label>
													<div className="font-medium text-foreground">{checklist.width} cm</div>
												</div>
											)}
											{checklist.height && (
												<div className="space-y-1">
													<Label className="text-xs text-muted-foreground">Alto</Label>
													<div className="font-medium text-foreground">{checklist.height} cm</div>
												</div>
											)}
										</div>

										<div className="space-y-2 pt-2">
											<div className="flex items-center justify-between">
												<Label className="text-xs text-muted-foreground">Progreso</Label>
												<span className="text-sm font-semibold text-primary">
													{calculateProgress(checklist.items || [])}%
												</span>
											</div>
											<div className="w-full bg-secondary rounded-full h-2.5">
												<div
													className="bg-primary h-2.5 rounded-full transition-all duration-300"
													style={{ width: `${calculateProgress(checklist.items || [])}%` }}
												/>
											</div>
										</div>

										<div className="space-y-2 pt-2">
											<div className="flex items-center justify-between">
												<Label className="text-xs text-muted-foreground">Nota / recordatorio</Label>
												{savingNotes[checklist.id] && (
													<span className="text-xs text-muted-foreground">Guardando...</span>
												)}
											</div>
											<Textarea
												value={checklist.notes || ''}
												onChange={(e) => updateChecklistNotes(checklist.id, e.target.value)}
												placeholder="Escribí una nota para esta abertura (ej: falta sellador, revisar nivel, etc.)"
												className="text-sm"
												disabled={loading}
											/>
											{user?.role === 'Admin' && (
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => handleAddAsClaim(checklist)}
													disabled={!checklist.notes?.trim() || addingClaim[checklist.id] || loading}
													className="w-full mt-2"
												>
													{addingClaim[checklist.id] ? (
														<>
															<Loader2 className="mr-2 h-4 w-4 animate-spin" />
															Creando reclamo...
														</>
													) : (
														<>
															<AlertCircle className="mr-2 h-4 w-4" />
															Agregar como reclamo
														</>
													)}
												</Button>
											)}
										</div>
									</CardHeader>

									<CardContent className="pt-0 pb-6">
										<div className="space-y-3">
											<div className="flex items-center justify-between gap-2">
												<h4 className="font-medium text-sm text-muted-foreground">Items de Checklist</h4>
												<div className="flex items-center gap-2">
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => setAllChecklistItems(checklist.id, true)}
														disabled={saving || (checklist.items || []).length === 0}
													>
														Marcar todo
													</Button>
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => setAllChecklistItems(checklist.id, false)}
														disabled={saving || (checklist.items || []).length === 0}
													>
														Desmarcar todo
													</Button>
												</div>
											</div>

											<div className="space-y-2 max-h-80 overflow-y-auto pr-1">
												{(checklist.items || []).map((item, itemIndex) => (
													<div
														key={itemIndex}
														className="flex items-center gap-3 p-3 bg-card hover:bg-muted/30 rounded-lg border transition-colors"
													>
														<Checkbox
															id={`checklist-${checklist.id}-item-${itemIndex}`}
															checked={item.done || false}
															onCheckedChange={() =>
																toggleChecklistItem(checklist.id, itemIndex, checklist.items || [])
															}
															disabled={saving}
															className="flex-shrink-0"
														/>
														<label
															htmlFor={`checklist-${checklist.id}-item-${itemIndex}`}
															className={`text-sm flex-1 cursor-pointer ${
																item.done
																	? 'line-through text-muted-foreground'
																	: 'font-medium text-foreground'
															}`}
														>
															{item.name}
														</label>
														{item.done && (
															<CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
														)}
													</div>
												))}
											</div>
										</div>

										{user?.role === 'Admin' && (
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => handleAddAsDailyAct(checklist)}
												disabled={checklist.items?.length === 0 || checklist.items?.filter((item) => item.done).length === 0 || addingClaim[checklist.id] || loading}
												className="w-full mt-2"
											>
												{addingClaim[checklist.id] ? (
													<>
														<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														Creando actividad...
													</>
												) : (
													<>
														<AlertCircle className="mr-2 h-4 w-4" />
														Agregar a actividades diarias
													</>
												)}
											</Button>
										)}
									</CardContent>
								</Card>
								
							))}
						</div>

						{/* Footer */}
						<div className="flex flex-col sm:flex-row justify-center gap-3 pt-8 border-t">
							<ChecklistPDFButton 
								checklists={checklists} 
								workId={workId}
								clientName={clientName}
								disabled={saving}
							/>
							<Button
								variant="outline"
								onClick={() => setIsOpen(false)}
								className="w-full sm:w-auto px-8"
								disabled={saving}
							>
								Cerrar
							</Button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>

		{/* Delete Confirmation Dialog */}
		<AlertDialog open={!!checklistToDelete} onOpenChange={() => setChecklistToDelete(null)}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>¿Eliminar checklist?</AlertDialogTitle>
					<AlertDialogDescription>
						Esta acción no se puede deshacer. Se eliminará permanentemente el checklist{' '}
						<span className="font-semibold">
							{checklistToDelete?.name || 'sin nombre'}
						</span>{' '}
						y todos sus datos asociados.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						onClick={confirmDeleteChecklist}
						disabled={saving}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{saving ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Eliminando...
							</>
						) : (
							'Eliminar'
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>

		{/* Edit Checklist Modal */}
		<ChecklistModal
			workId={workId}
			open={isEditModalOpen}
			onOpenChange={setIsEditModalOpen}
			checklistToEdit={checklistToEdit}
			onUpdate={handleUpdateChecklist}
			onSave={async () => {}}
		/>
		</>
	);
}