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
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Checklist, editChecklist, deleteChecklist } from '@/lib/works/checklists';
import { ChecklistPDFButton } from '@/components/ui/checklist-pdf-button';
import { ChecklistModal } from './checklist-modal';
import { useAuth } from '@/components/provider/auth-provider';
import { toast } from '@/components/ui/use-toast';
import { createClaim } from '@/lib/claims/claims';
import { translateError } from '@/lib/error-translator';
import { useWorkChecklistData } from '@/hooks/clients/use-works-checklists-data';
import { calculateProgress } from '@/helpers/checklists/progress';
import { ChecklistCard } from './checklist-card';

type ChecklistCompletionModalProps = {
	workId: string;
	children?: React.ReactNode;
};

export function ChecklistCompletionModal({ workId, children }: ChecklistCompletionModalProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [saving, setSaving] = useState(false);
	const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});
	const [addingClaim, setAddingClaim] = useState<Record<string, boolean>>({});
	const [checklistToDelete, setChecklistToDelete] = useState<Checklist | null>(null);
	const [checklistToEdit, setChecklistToEdit] = useState<Checklist | null>(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const notesDebounceTimersRef = useRef<Record<string, number>>({});

	const { user } = useAuth();

	// Load checklists when modal opens
	useEffect(() => {
		if (isOpen && workId) {
			reload();
		}
	}, [isOpen, workId]);

	const {
		clientData,
		clientId,
		workData,
		checklists: fetchedChecklists,
		loading,
		reload,
	} = useWorkChecklistData(workId);

	const [checklists, setChecklists] = useState<Checklist[]>(fetchedChecklists ?? []);

	useEffect(() => {
		if (fetchedChecklists) {
			setChecklists(fetchedChecklists);
		}
	}, [fetchedChecklists]);

	const toggleChecklistItem = async (
		checklistId: string,
		itemIndex: number,
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
					const errorMessage = translateError(error);
					toast({
						title: 'Error al actualizar checklist',
						description:
							errorMessage || 'No se pudo actualizar el checklist. Por favor, intenta nuevamente.',
						variant: 'destructive',
					});
					// Revert on error
					setChecklists(checklists);
				}
			}
		} catch (error) {
			const errorMessage = translateError(error);
			toast({
				title: 'Error al actualizar checklist',
				description:
					errorMessage || 'No se pudo actualizar el checklist. Por favor, intenta nuevamente.',
				variant: 'destructive',
			});
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
		setChecklists((prev) => prev.map((c) => (c.id === checklistId ? { ...c, notes } : c)));

		window.clearTimeout(notesDebounceTimersRef.current[checklistId]);

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

	const handleAddChecklistEntry = async (checklist: Checklist, mode: 'claim' | 'daily') => {
		if (!workData) {
			toast({
				title: 'No se puede crear',
				description: 'Falta información de la obra.',
				variant: 'destructive',
			});
			return;
		}

		// Claim requires notes
		if (mode === 'claim' && !checklist.notes?.trim()) {
			toast({
				title: 'No se puede crear el reclamo',
				description: 'Esta abertura no tiene notas.',
				variant: 'destructive',
			});
			return;
		}

		let description = '';

		if (mode === 'claim') {
			description = checklist.notes!;
		} else {
			// Build description for daily activity
			description = `${checklist.name || 'Checklist'}\n\n`;

			const items = checklist.items?.filter((item) => item.done) || [];

			if (items.length) {
				description += 'Items:\n';

				items.forEach((item) => {
					const status = item.done ? '✓' : '✗';
					description += `${status} ${item.name}\n`;
				});
			}
		}

		try {
			setAddingClaim((prev) => ({ ...prev, [checklist.id]: true }));

			const today = new Date().toISOString().split('T')[0];

			const claimData = {
				date: today,
				daily: mode === 'daily',
				alum_pvc: checklist.type_opening || null,
				attend: null,
				description,
				resolved: false,
				client_name: clientData?.name || null,
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
				title: mode === 'daily' ? 'Actividad diaria creada' : 'Reclamo creado',
				description: `${
					mode === 'daily' ? 'Se creó una actividad diaria' : 'Se creó un reclamo'
				} para ${checklist.name || 'esta abertura'}.`,
			});

			// Refresh claims
			localStorage.removeItem('claims_cache');
			window.dispatchEvent(new CustomEvent('claims-updated'));
		} catch (error) {
			const errorMessage = translateError(error);

			toast({
				title: mode === 'daily' ? 'Error al crear actividad diaria' : 'Error al crear reclamo',
				description:
					errorMessage ||
					(mode === 'daily'
						? 'No se pudo crear la actividad diaria.'
						: 'No se pudo crear el reclamo.'),
				variant: 'destructive',
			});
		} finally {
			setAddingClaim((prev) => ({ ...prev, [checklist.id]: false }));
		}
	};

	const confirmDeleteChecklist = async () => {
		if (!checklistToDelete) return;

		try {
			setSaving(true);
			const { error } = await deleteChecklist(checklistToDelete.id);
			if (error) {
				const errorMessage = translateError(error);
				toast({
					title: 'Error al eliminar checklist',
					description:
						errorMessage || 'No se pudo eliminar el checklist. Por favor, intenta nuevamente.',
					variant: 'destructive',
				});
			} else {
				toast({
					title: 'Checklist eliminado',
					description: `Se eliminó el checklist ${checklistToDelete.name || 'sin nombre'}.`,
				});
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
				const errorMessage = translateError(error);
				toast({
					title: 'Error al actualizar checklist',
					description:
						errorMessage || 'No se pudo actualizar el checklist. Por favor, intenta nuevamente.',
					variant: 'destructive',
				});
				return;
			}

			// Update local state
			setChecklists((prev) =>
				prev.map((c) => (c.id === checklistId ? { ...c, ...transformedUpdates } : c))
			);
			setIsEditModalOpen(false);
			setChecklistToEdit(null);
			toast({
				title: 'Checklist actualizado',
				description: `Se actualizó el checklist ${updates.name || 'sin nombre'}.`,
			});
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
								<div className="text-sm font-medium text-foreground">
									Progreso total: {Math.round(totalProgress)}%
								</div>
								<div className="text-base">
									{checklists.length > 0 ? (
										<b>Cantidad de checklists: {checklists.length}</b>
									) : (
										<b>No hay checklists disponibles</b>
									)}
								</div>
							</div>

							{/* Checklists */}
							<div className="space-y-8">
								{checklists.map((checklist, index) => (
									<ChecklistCard
										key={checklist.id}
										checklist={checklist}
										index={index}
										user={user}
										saving={saving}
										loading={loading}
										addingClaim={addingClaim}
										savingNotes={savingNotes}
										onToggleItem={toggleChecklistItem}
										onSetAllItems={setAllChecklistItems}
										onUpdateNotes={updateChecklistNotes}
										onAddEntry={handleAddChecklistEntry}
										onEdit={handleEditChecklist}
										onDelete={setChecklistToDelete}
										clientId={clientId}
									/>
								))}
							</div>

							{/* Footer */}
							<div className="flex flex-col sm:flex-row justify-center gap-3 pt-8 border-t">
								<ChecklistPDFButton
									checklists={checklists}
									workId={workId}
									clientName={clientData?.name || 'Cliente sin nombre'}
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
							<span className="font-semibold">{checklistToDelete?.name || 'sin nombre'}</span> y
							todos sus datos asociados.
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
