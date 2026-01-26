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
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Checklist, editChecklist } from '@/lib/works/checklists';
import { ChecklistPDFButton } from '@/components/ui/checklist-pdf-button';
import { getWorkById } from '@/lib/works/works';

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
	const [clientName, setClientName] = useState<string>('');
	const notesDebounceTimersRef = useRef<Record<string, number>>({});

	// Load checklists when modal opens
	useEffect(() => {
		if (isOpen && workId) {
			loadChecklists();
		}
	}, [isOpen, workId]);

	const loadChecklists = async () => {
		try {
			setLoading(true);
			
			// Load work data to get client name
			const { data: workData, error: workError } = await getWorkById(workId);
			if (workError) {
				console.error('Error loading work data:', workError);
			} else if (workData) {
				const fullName = [workData.client_name, workData.client_last_name]
					.filter(Boolean)
					.join(' ');
				setClientName(fullName);
			}
			
			const { getChecklistsByWorkId } = await import('@/lib/works/checklists');
			const { data, error } = await getChecklistsByWorkId(workId);

			if (error) {
				console.error('Error loading checklists:', error);
				return;
			}

			if (data) {
				// Sort checklists by name or identifier to ensure sequential order
				const sortedChecklists = data.sort((a, b) => {
					// Try to extract number from name (e.g., "Ventana 1", "Ventana 2")
					const aName = a.name || '';
					const bName = b.name || '';

					const aNum = parseInt(aName.match(/\d+/)?.[0] || '0');
					const bNum = parseInt(bName.match(/\d+/)?.[0] || '0');

					// If both have numbers, sort by number
					if (aNum > 0 && bNum > 0) {
						return aNum - bNum;
					}

					// Otherwise, sort alphabetically by name
					return aName.localeCompare(bName);
				});

				setChecklists(sortedChecklists);
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
							<div className="text-2xl font-bold text-primary">{Math.round(totalProgress)}%</div>
							<div className="text-sm text-muted-foreground">Ver checklists</div>
						</div>

						{/* Checklists */}
						<div className="space-y-8">
							{checklists.map((checklist, index) => (
								<Card key={checklist.id} className="border-2 shadow-sm">
									<CardHeader className="pb-4 space-y-4">
										<div className="space-y-3">
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
	);
}
