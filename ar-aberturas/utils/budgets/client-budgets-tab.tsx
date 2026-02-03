'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import { createBudget, chooseBudgetForClient, Budget, getBudgetsByFolderBudgetIds } from '@/lib/budgets/budgets';
import { createFolderBudget, FolderBudget, getFolderBudgetsByClientId } from '@/lib/budgets/folder_budgets';
import { CheckCircle, FileText, Plus, ChevronDown } from 'lucide-react';

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
	const [formWorkId, setFormWorkId] = useState<string>('none');
	const [formPdf, setFormPdf] = useState<File | null>(null);

	const folderBudgetIds = useMemo(() => folderBudgets.map((f) => f.id), [folderBudgets]);

	const chosenBudgetId = useMemo(() => {
		const chosen = budgets.find((b) => !!b.accepted);
		return chosen?.id ?? null;
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
			const { error } = await chooseBudgetForClient(budgetId, folderBudgetIds);
			if (error) {
				toast({
					variant: 'destructive',
					title: 'No se pudo marcar como elegido',
					description: 'Intente nuevamente.',
				});
				return;
			}
			await load();
		} finally {
			setIsLoading(false);
		}
	}

	function resetForm() {
		setFormType('PVC');
		setFormVersion('');
		setFormNumber('');
		setFormAmount('');
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

			const parsedNumber = formNumber.trim() ? Number(formNumber) : null;
			const parsedAmount = formAmount.trim() ? Number(formAmount) : null;
			const number = parsedNumber !== null && !Number.isNaN(parsedNumber) ? parsedNumber : null;
			const amount = parsedAmount !== null && !Number.isNaN(parsedAmount) ? parsedAmount : null;

			const { error: createError } = await createBudget(
				{
					folder_budget_id: folderId,
					accepted: false,
					type: formType,
					version: formVersion.trim() || null,
					number,
					amount_ars: amount,
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
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-2">
				<div className="min-w-0">
					<p className="text-sm text-muted-foreground">
						Organizá presupuestos por obra y luego por tipo. Marcá uno como elegido.
					</p>
					{chosenBudgetId ? (
						<div className="mt-1">
							<Badge variant="default" className="gap-2">
								<CheckCircle className="h-4 w-4" />
								Hay un presupuesto elegido
							</Badge>
						</div>
					) : (
						<div className="mt-1">
							<Badge variant="secondary">Sin presupuesto elegido</Badge>
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
									<Label>Número (opcional)</Label>
									<Input
										type="number"
										value={formNumber}
										onChange={(e) => setFormNumber(e.target.value)}
										placeholder="Ej: 123"
									/>
								</div>
								<div className="grid gap-2">
									<Label>Monto ARS (opcional)</Label>
									<Input
										type="number"
										value={formAmount}
										onChange={(e) => setFormAmount(e.target.value)}
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
					const hasChosenInFolder = folderBudgetsList.some((b) => !!b.accepted);

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
												{hasChosenInFolder ? (
													<Badge className="gap-1">
														<CheckCircle className="h-3.5 w-3.5" /> Elegido
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
																			'min-w-[260px] max-w-[260px] p-4 border-border',
																			isChosen && 'border-primary bg-primary/5'
																		)}
																	>
																		<div className="flex items-start justify-between gap-2">
																			<div className="min-w-0">
																				<p className="font-semibold text-foreground truncate">
																					{b.version || 'Sin variante'}
																				</p>
																				<p className="text-xs text-muted-foreground truncate">{workLabel(folder)}</p>
																			</div>
																			{isChosen ? (
																				<Badge className="gap-1">
																					<CheckCircle className="h-3.5 w-3.5" /> Elegido
																				</Badge>
																			) : null}
																		</div>

																		<div className="mt-3 space-y-2">
																			<div className="flex items-center justify-between">
																				<p className="text-sm font-semibold text-foreground">
																					{typeof b.amount_ars === 'number'
																						? `$${b.amount_ars.toLocaleString('es-AR')}`
																						: 'Monto no cargado'}
																				</p>
																				{typeof b.number === 'number' ? (
																					<Badge variant="outline">#{b.number}</Badge>
																				) : null}
																			</div>

																			<div className="flex flex-wrap gap-2">
																				{b.pdf_url ? (
																					<Button
																						variant="outline"
																						size="sm"
																						onClick={() => window.open(b.pdf_url ?? '', '_blank')}
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
																					{isChosen ? 'Elegido' : chosenBudgetId ? 'Cambiar a este' : 'Elegir'}
																				</Button>
																			</div>
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
	);
}
