'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Work } from '@/lib/works/works';
import { createBudget, chooseBudgetForClient, Budget, getBudgetsByFolderBudgetIds, deleteBudget, updateBudget } from '@/lib/budgets/budgets';
import { createFolderBudget, FolderBudget, getFolderBudgetsByClientId, deleteFolderBudgetWithBudgets } from '@/lib/budgets/folder_budgets';
import { getSupabaseClient } from '@/lib/supabase-client';
import { CheckCircle, FileText, Plus, ChevronDown, Trash2, Download, X } from 'lucide-react';

type BudgetFolderVM = FolderBudget & {
	budgets: Budget[];
};

const DEFAULT_TYPES = ['PVC', 'Aluminio', 'Otros'] as const;

function normalizeType(type: string | null | undefined): string {
	const t = (type ?? '').trim();
	if (!t) return 'Otros';
	return t;
}

function workLabel(folder: FolderBudget): string {
	const w = folder.works;
	if (!w) return 'Sin obra';
	const parts = [w.address, w.locality].filter(Boolean);
	return parts.length > 0 ? parts.join(' - ') : 'Obra';
}

export function ClientBudgetsTab({ clientId, works }: { clientId: string; works: Work[] }) {
	const [isLoading, setIsLoading] = useState(false);
	const [folderBudgets, setFolderBudgets] = useState<FolderBudget[]>([]);
	const [budgets, setBudgets] = useState<Budget[]>([]);
	const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [formType, setFormType] = useState<string>('PVC');
	const [formVersion, setFormVersion] = useState<string>('');
	const [formNumber, setFormNumber] = useState<string>('');
	const [formAmount, setFormAmount] = useState<string>('');
	const [formAmountUsd, setFormAmountUsd] = useState<string>('');
	const [formWorkId, setFormWorkId] = useState<string>('none');
	const [formPdf, setFormPdf] = useState<File | null>(null);

	const [deleteBudgetConfirm, setDeleteBudgetConfirm] = useState<{
		open: boolean;
		budgetId: string | null;
	}>({ open: false, budgetId: null });

	const [deleteFolderConfirm, setDeleteFolderConfirm] = useState<{
		open: boolean;
		folderId: string | null;
		budgetCount: number;
	}>({ open: false, folderId: null, budgetCount: 0 });

	const [pdfPreview, setPdfPreview] = useState<{
		open: boolean;
		budget: Budget | null;
		pdfUrl: string | null;
	}>({ open: false, budget: null, pdfUrl: null });

	const folderBudgetIds = useMemo(() => folderBudgets.map((f) => f.id), [folderBudgets]);

	const chosenBudgetIds = useMemo(() => {
		const chosen = budgets.filter((b) => !!b.accepted);
		return chosen.map(b => b.id);
	}, [budgets]);

	const budgetsByFolderId = useMemo(() => {
		const map = new Map<string, Budget[]>();
		for (const b of budgets) {
			const key = b.folder_budget_id ?? '';
			if (!key) continue;
			const prev = map.get(key) ?? [];
			prev.push(b);
			map.set(key, prev);
		}
		return map;
	}, [budgets]);

	const foldersVM: BudgetFolderVM[] = useMemo(() => {
		return folderBudgets.map((f) => ({
			...f,
			budgets: budgetsByFolderId.get(f.id) ?? [],
		}));
	}, [folderBudgets, budgetsByFolderId]);

	const orderedFolders = useMemo(() => {
		return [...foldersVM].sort((a, b) => {
			const aNone = !a.work_id;
			const bNone = !b.work_id;
			if (aNone !== bNone) return aNone ? 1 : -1;
			return workLabel(a).localeCompare(workLabel(b));
		});
	}, [foldersVM]);

	async function load() {
		try {
			setIsLoading(true);
			const fb = await getFolderBudgetsByClientId(clientId);
			if (fb.error) {
				toast({
					variant: 'destructive',
					title: 'Error al cargar carpetas de presupuestos',
					description: 'Intente nuevamente.',
				});
				return;
			}
			const folderList = fb.data ?? [];
			setFolderBudgets(folderList);

			const ids = folderList.map((x) => x.id);
			const bs = await getBudgetsByFolderBudgetIds(ids);
			if (bs.error) {
				toast({
					variant: 'destructive',
					title: 'Error al cargar presupuestos',
					description: 'Intente nuevamente.',
				});
				return;
			}
			setBudgets(bs.data ?? []);
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		load();
	}, [clientId]);

	useEffect(() => {
		setOpenFolders((prev) => {
			const next: Record<string, boolean> = { ...prev };
			for (const f of orderedFolders) {
				if (next[f.id] === undefined) next[f.id] = true;
			}
			return next;
		});
	}, [orderedFolders]);

	async function handleChooseBudget(budgetId: string) {
		try {
			setIsLoading(true);
			const budget = budgets.find(b => b.id === budgetId);
			if (!budget) return;

			const { error } = await updateBudget(budgetId, {
				accepted: !budget.accepted
			});
			
			if (error) {
				toast({
					variant: 'destructive',
					title: 'No se pudo cambiar el estado',
					description: 'Intente nuevamente.',
				});
				return;
			}
			
			toast({ 
				title: budget.accepted ? 'Presupuesto deseleccionado' : 'Presupuesto elegido' 
			});
			await load();
		} finally {
			setIsLoading(false);
		}
	}

	async function handleDeleteBudget(budgetId: string) {
		setDeleteBudgetConfirm({ open: true, budgetId });
	}

	async function confirmDeleteBudget() {
		if (!deleteBudgetConfirm.budgetId) {
			return;
		}

		try {
			setIsLoading(true);
			const budgetIdString = String(deleteBudgetConfirm.budgetId);
			const { error } = await deleteBudget(budgetIdString);
			if (error && error !== null) {
				toast({
					variant: 'destructive',
					title: 'No se pudo eliminar el presupuesto',
					description: 'Intente nuevamente.',
				});
				return;
			}
			toast({ title: 'Presupuesto eliminado' });
			await load();
		} finally {
			setIsLoading(false);
			setDeleteBudgetConfirm({ open: false, budgetId: null });
		}
	}

	async function handleDeleteFolder(folderId: string) {
		const budgetCount = budgetsByFolderId.get(folderId)?.length || 0;
		setDeleteFolderConfirm({ 
			open: true, 
			folderId, 
			budgetCount 
		});
	}

	async function confirmDeleteFolder() {
		if (!deleteFolderConfirm.folderId) {
			return;
		}

		try {
			setIsLoading(true);
			const folderIdString = String(deleteFolderConfirm.folderId);
			const { error } = await deleteFolderBudgetWithBudgets(folderIdString);
			if (error && error !== null) {
				toast({
					variant: 'destructive',
					title: 'No se pudo eliminar la carpeta',
					description: 'Intente nuevamente.',
				});
				return;
			}
			toast({ title: 'Carpeta eliminada' });
			await load();
		} finally {
			setIsLoading(false);
			setDeleteFolderConfirm({ 
				open: false, 
				folderId: null, 
				budgetCount: 0 
			});
		}
	}

	async function handleViewPdf(budget: Budget) {
		if (!budget.pdf_path) return;

		try {
			setIsLoading(true);
			const supabase = getSupabaseClient();
			const { data, error } = await supabase.storage
				.from('clients')
				.download(budget.pdf_path);

			if (error) {
				toast({
					variant: 'destructive',
					title: 'No se pudo cargar el PDF',
					description: 'Intente nuevamente.',
				});
				return;
			}

			const url = URL.createObjectURL(data);
			setPdfPreview({ open: true, budget, pdfUrl: url });
		} finally {
			setIsLoading(false);
		}
	}

	function closePdfPreview() {
		if (pdfPreview.pdfUrl) {
			URL.revokeObjectURL(pdfPreview.pdfUrl);
		}
		setPdfPreview({ open: false, budget: null, pdfUrl: null });
	}

	async function handleDownloadPdf() {
		if (!pdfPreview.pdfUrl || !pdfPreview.budget) return;

		const link = document.createElement('a');
		link.href = pdfPreview.pdfUrl;
		link.download = `presupuesto_${pdfPreview.budget.type}_${pdfPreview.budget.number || 'sin-numero'}.pdf`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	function resetForm() {
		setFormType('PVC');
		setFormVersion('');
		setFormNumber('');
		setFormAmount('');
		setFormAmountUsd('');
		setFormWorkId('none');
		setFormPdf(null);
	}

	async function handleCreateBudget() {
		if (!formPdf) {
			toast({
				variant: 'destructive',
				title: 'Falta el PDF',
				description: 'Adjuntá el PDF del presupuesto para crearlo.',
			});
			return;
		}

		try {
			setIsLoading(true);

			const work_id = formWorkId === 'none' ? null : formWorkId;
			const existingFolder = folderBudgets.find((f) => (f.work_id ?? null) === work_id);
			let folderId = existingFolder?.id;

			if (!folderId) {
				const { data: folder, error: folderError } = await createFolderBudget({
					client_id: clientId,
					work_id,
				});

				if (folderError || !folder) {
					toast({
						variant: 'destructive',
						title: 'No se pudo crear la carpeta',
						description: 'Intente nuevamente.',
					});
					return;
				}
				folderId = folder.id;
			}

			const parsedAmount = formAmount.trim() ? Number(formAmount) : null;
			const parsedAmountUsd = formAmountUsd.trim() ? Number(formAmountUsd) : null;
		   
			const number = formNumber.trim() || null;
			const amount = parsedAmount !== null && !Number.isNaN(parsedAmount) ? parsedAmount : null;
			const amountUsd = parsedAmountUsd !== null && !Number.isNaN(parsedAmountUsd) ? parsedAmountUsd : null;

			const { error: createError } = await createBudget(
				{
					folder_budget_id: folderId,
					accepted: false,
					type: formType,
					version: formVersion.trim() || null,
					number: number,
					amount_ars: amount,
					amount_usd: amountUsd,
				},
				formPdf,
				clientId
			);

			if (createError) {
				toast({
					variant: 'destructive',
					title: 'No se pudo crear el presupuesto',
					description: 'Intente nuevamente.',
				});
				return;
			}

			toast({ title: 'Presupuesto creado' });
			setIsCreateOpen(false);
			resetForm();
			await load();
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<>
			<div className="space-y-4">
			<div className="flex items-center justify-between gap-2">
				<div className="min-w-0">
					{chosenBudgetIds.length > 0 ? (
						<div className="mt-1">	
							<Badge variant="secondary">{chosenBudgetIds.length} presupuesto(s) elegido(s)</Badge>
						</div>
					) : (
						<div className="mt-1">	
						</div>
					)}
				</div>

				<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
					<DialogTrigger asChild>
						<Button size="sm" className="gap-2" disabled={isLoading}>
							<Plus className="h-4 w-4" />
							Nuevo presupuesto
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Nuevo presupuesto</DialogTitle>
						</DialogHeader>
						<div className="grid gap-4">
							<div className="grid gap-2">
								<Label>Tipo</Label>
								<Select value={formType} onValueChange={setFormType}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Seleccionar tipo" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="PVC">PVC</SelectItem>
										<SelectItem value="Aluminio">Aluminio</SelectItem>
										<SelectItem value="Otros">Otros</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-2">
								<Label>Variante</Label>
								<Select value={formVersion} onValueChange={setFormVersion}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Seleccionar variante" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Mínimo">Mínimo</SelectItem>
										<SelectItem value="Estándar">Estándar</SelectItem>
										<SelectItem value="Óptimo">Óptimo</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-2">
								<Label>Obra</Label>
								<Select value={formWorkId} onValueChange={setFormWorkId}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Seleccionar obra" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">Sin obra</SelectItem>
										{works.map((w) => (
											<SelectItem key={w.id} value={w.id}>
												{[w.address, w.locality].filter(Boolean).join(' - ') || `Obra ${w.id}`}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label>Número de presupuesto *</Label>
									<Input
										type="text"
										value={formNumber}
										onChange={(e) => setFormNumber(e.target.value)}
										placeholder="Ej: 123 o 1-2-A"
									/>
								</div>
								<div className="grid gap-2">
									<Label>Monto ARS *</Label>
									<Input
										type="number"
										value={formAmount}
										onChange={(e) => setFormAmount(e.target.value)}
										placeholder="0"
									/>
								</div>
								<div className="grid gap-2">
									<Label>Monto USD *</Label>
									<Input
										type="number"
										value={formAmountUsd}
										onChange={(e) => setFormAmountUsd(e.target.value)}
										placeholder="0"
									/>
								</div>
							</div>

							<div className="grid gap-2">
								<Label>PDF</Label>
								<Input
									type="file"
									accept="application/pdf"
									onChange={(e) => setFormPdf(e.target.files?.[0] ?? null)}
								/>
							</div>
						</div>

						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								onClick={() => {
									setIsCreateOpen(false);
									resetForm();
								}}
							>
								Cancelar
							</Button>
							<Button onClick={handleCreateBudget} disabled={isLoading}>
								Crear
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{isLoading && folderBudgets.length === 0 ? (
				<p className="text-sm text-muted-foreground text-center py-6">Cargando presupuestos...</p>
			) : folderBudgets.length === 0 ? (
				<Card className="p-6">
					<div className="text-center space-y-2">
						<p className="text-sm text-muted-foreground">Este cliente todavía no tiene presupuestos.</p>
					</div>
				</Card>
			) : null}

			<div className="space-y-3">
				{orderedFolders.map((folder) => {
					const open = !!openFolders[folder.id];
					const folderBudgetsList = folder.budgets;
					const chosenCountInFolder = folderBudgetsList.filter((b) => !!b.accepted).length;

					const budgetsByType = new Map<string, Budget[]>();
					for (const t of DEFAULT_TYPES) budgetsByType.set(t, []);
					for (const b of folderBudgetsList) {
						const typeKey = normalizeType(b.type);
						const prev = budgetsByType.get(typeKey) ?? [];
						prev.push(b);
						budgetsByType.set(typeKey, prev);
					}

					const orderedTypeKeys = Array.from(budgetsByType.keys()).sort((a, b) => {
						const ai = DEFAULT_TYPES.includes(a as any) ? DEFAULT_TYPES.indexOf(a as any) : Number.MAX_SAFE_INTEGER;
						const bi = DEFAULT_TYPES.includes(b as any) ? DEFAULT_TYPES.indexOf(b as any) : Number.MAX_SAFE_INTEGER;
						if (ai !== bi) return ai - bi;
						return a.localeCompare(b);
					});

					return (
						<Collapsible
							key={folder.id}
							open={open}
							onOpenChange={(v) => setOpenFolders((prev) => ({ ...prev, [folder.id]: v }))}
						>
							<Card className="border-border">
								<div className="flex items-center justify-between gap-2 p-4">
									<CollapsibleTrigger asChild>
										<button className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left">
											<div className="min-w-0">
												<p className="font-semibold text-foreground truncate">{workLabel(folder)}</p>
												<p className="text-xs text-muted-foreground">{folderBudgetsList.length} presupuesto(s)</p>
											</div>
											<div className="flex items-center gap-2">
												{chosenCountInFolder > 0 ? (
													<Badge className="gap-1">
														<CheckCircle className="h-3.5 w-3.5" /> {chosenCountInFolder} elegido(s)
													</Badge>
												) : (
													<Badge variant="secondary">Opciones</Badge>
												)}
												<ChevronDown
													className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')}
												/>
											</div>
										</button>
									</CollapsibleTrigger>
									<Button
										variant="ghost"
										size="sm"
										onClick={(e) => {
											e.stopPropagation();
											handleDeleteFolder(folder.id);
										}}
										disabled={isLoading}
										className="text-destructive hover:text-destructive hover:bg-destructive/10"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>

								<CollapsibleContent>
									<div className="px-4 pb-4 space-y-4">
										{orderedTypeKeys.map((typeKey) => {
											const list = budgetsByType.get(typeKey) ?? [];
											return (
												<div key={typeKey} className="space-y-2">
													<div className="flex items-center justify-between">
														<p className="text-sm font-semibold text-foreground">{typeKey}</p>
														<p className="text-xs text-muted-foreground">{list.length} opción(es)</p>
													</div>

													{list.length === 0 ? (
														<p className="text-sm text-muted-foreground">Sin presupuestos en este tipo.</p>
													) : (
														<div className="flex gap-3 overflow-x-auto pb-2">
															{list.map((b) => {
																const isChosen = !!b.accepted;
																return (
																	<Card
																		key={b.id}
																		className={cn(
																			'min-w-[260px] max-w-[260px] p-4 border-border relative',
																			isChosen && 'border-primary bg-primary/5'
																		)}
																	>
																		<div className="absolute top-2 right-2 flex items-center gap-2">
																			{isChosen ? (
																				<Badge className="gap-1 shrink-0">
																					<CheckCircle className="h-3.5 w-3.5" /> Elegido
																				</Badge>
																			) : null}
																			<Button
																				variant="ghost"
																				size="sm"
																				onClick={() => handleDeleteBudget(b.id)}
																				disabled={isLoading}
																				className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
																			>	
																				<Trash2 className="h-4 w-4" />
																			</Button>
																		</div>
																		<div className="flex items-start justify-between gap-2">
																			<div className="min-w-0">
																				<p className="font-semibold text-foreground truncate">
																					{b.version || 'Sin variante'}
																				</p>
																				<p className="text-xs text-muted-foreground truncate">{workLabel(folder)}</p>
																			</div>
																		</div>

																		<div className="mt-3 space-y-2">
																			<div className="space-y-1">
																				<p className="text-sm font-semibold text-foreground">
																					{typeof b.amount_ars === 'number'
																						? `$${b.amount_ars.toLocaleString('es-AR')} ARS`
																						: 'Monto ARS no cargado'}
																				</p>
																				<p className="text-sm font-semibold text-foreground">
																					{typeof b.amount_usd === 'number'
																						? `$${b.amount_usd.toLocaleString('es-AR')} USD`
																						: 'Monto USD no cargado'}
																				</p>
																			</div>
																			{b.number ? (
																				<Badge variant="outline">#{b.number}</Badge>
																			) : null}
																		</div>

																			<div className="flex flex-wrap gap-2">
																				{b.pdf_path ? (
																					<Button
																						variant="outline"
																						size="sm"
																						onClick={() => handleViewPdf(b)}
																						className="gap-2"
																					>
																						<FileText className="h-4 w-4" /> Ver PDF
																					</Button>
																				) : (
																					<Badge variant="secondary">Borrador</Badge>
																				)}

																				<Button
																					variant={isChosen ? 'secondary' : 'default'}
																					size="sm"
																					disabled={isLoading}
																					onClick={() => handleChooseBudget(b.id)}
																					className="gap-2"
																				>
																					<CheckCircle className="h-4 w-4" />
																					{isChosen ? 'Elegido' : chosenBudgetIds.length > 0 ? 'Agregar a elegidos' : 'Elegir'}
																				</Button>
																			</div>
																	</Card>
																);
															})}
														</div>
													)}
												</div>
											);
										})}
									</div>
								</CollapsibleContent>
							</Card>
						</Collapsible>
					);
				})}
			</div>
		</div>

		<ConfirmDialog
			open={deleteBudgetConfirm.open}
			onOpenChange={(open) => setDeleteBudgetConfirm({ ...deleteBudgetConfirm, open })}
			title="Eliminar presupuesto"
			description="¿Estás seguro de que quieres eliminar este presupuesto? Esta acción no se puede deshacer."
			onConfirm={confirmDeleteBudget}
			isLoading={isLoading}
		/>

		<ConfirmDialog
			open={deleteFolderConfirm.open}
			onOpenChange={(open) => setDeleteFolderConfirm({ ...deleteFolderConfirm, open })}
			title="Eliminar carpeta"
			description={`¿Estás seguro de que quieres eliminar esta carpeta y sus ${deleteFolderConfirm.budgetCount} presupuesto(s)? Esta acción no se puede deshacer.`}
			onConfirm={confirmDeleteFolder}
			isLoading={isLoading}
		/>

		<Dialog open={pdfPreview.open} onOpenChange={closePdfPreview}>
			<DialogContent className="max-w-4xl max-h-[90vh]">
				<DialogHeader>
					<div className="flex items-center justify-between">
						<div>
							<DialogTitle>
								Vista previa - Presupuesto {pdfPreview.budget?.type} #{pdfPreview.budget?.number || 'sin número'}
							</DialogTitle>
							<DialogDescription>
								{pdfPreview.budget?.version || 'Sin variante'} - {orderedFolders.find(f => f.id === pdfPreview.budget?.folder_budget_id)?.works ? workLabel(orderedFolders.find(f => f.id === pdfPreview.budget?.folder_budget_id)!) : 'Sin obra'}
							</DialogDescription>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={closePdfPreview}
							className="h-8 w-8 p-0"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</DialogHeader>
				<div className="flex-1 min-h-[600px]">
					{pdfPreview.pdfUrl && (
						<iframe
							src={pdfPreview.pdfUrl}
							className="w-full h-full min-h-[600px] border rounded"
							title="Vista previa del PDF"
						/>
					)}
				</div>
				<div className="flex justify-end gap-2 pt-4">
					<Button
						variant="outline"
						onClick={handleDownloadPdf}
						className="gap-2"
					>
						<Download className="h-4 w-4" />
						Descargar
					</Button>
					<Button onClick={closePdfPreview}>
						Cerrar
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	</>
);
}
