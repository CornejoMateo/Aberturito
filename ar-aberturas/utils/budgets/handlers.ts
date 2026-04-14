import { toast } from '@/components/ui/use-toast';
import { getSupabaseClient } from '@/lib/supabase-client';
import { BudgetWithWork } from '@/lib/works/balances';
import { 
	createBudget, 
	updateBudget,
	deleteBudget, 
	editBudget 
} from '@/lib/budgets/budgets';
import { 
	createFolderBudget, 
	deleteFolderBudgetWithBudgets, 
	deleteFolderBudget 
} from '@/lib/budgets/folder_budgets';
import { translateError } from '@/lib/error-translator';
import { TOAST_MESSAGES } from '../../constants/budgets/constants';
import { parseAmount } from './utils';
import { BUDGET_STATUS, BUDGET_STATUS_LABELS } from '@/constants/budget-status';

export interface BudgetHandlers {
	handleChooseBudget: (budgetId: string, budgets: BudgetWithWork[], refresh: () => void, setIsLoading: (loading: boolean) => void) => Promise<void>;
	handleToggleSold: (budgetId: string, budgets: BudgetWithWork[], refresh: () => void, setIsLoading: (loading: boolean) => void, closeBudgetDetailModal: () => void) => Promise<void>;
	handleToggleLost: (budgetId: string, budgets: BudgetWithWork[], refresh: () => void, setIsLoading: (loading: boolean) => void, closeBudgetDetailModal: () => void) => Promise<void>;
	handleStatusChange: (budgetId: string, newStatus: string, budgets: BudgetWithWork[], refresh: () => void, setIsLoading: (loading: boolean) => void) => Promise<void>;
	handleDeleteBudget: (budgetId: string, setDeleteBudgetConfirm: (state: any) => void) => void;
	confirmDeleteBudget: (deleteBudgetConfirm: any, refresh: () => void, setIsLoading: (loading: boolean) => void, setDeleteBudgetConfirm: (state: any) => void) => Promise<void>;
	handleDeleteFolder: (folderId: string, budgetsByFolderId: Map<string, BudgetWithWork[]>, setDeleteFolderConfirm: (state: any) => void) => void;
	confirmDeleteFolder: (deleteFolderConfirm: any, refresh: () => void, setIsLoading: (loading: boolean) => void, setDeleteFolderConfirm: (state: any) => void) => Promise<void>;
	handleViewPdf: (budget: BudgetWithWork, setPdfPreview: (state: any) => void, setIsLoading: (loading: boolean) => void) => Promise<void>;
	closePdfPreview: (pdfPreview: any, setPdfPreview: (state: any) => void) => void;
	handleOpenBudgetDetail: (budget: BudgetWithWork, setBudgetDetailModal: (state: any) => void) => void;
	closeBudgetDetailModal: (setBudgetDetailModal: (state: any) => void) => void;
	handleEditBudget: (budget: BudgetWithWork, setEditingBudget: (budget: BudgetWithWork | null) => void, closeBudgetDetailModal: () => void, setEditModalOpen: (open: boolean) => void) => void;
	handleEditBudgetSubmit: (formData: any, editingBudget: BudgetWithWork | null, clientId: string, setIsLoading: (loading: boolean) => void, setEditModalOpen: (open: boolean) => void, setEditingBudget: (budget: BudgetWithWork | null) => void, refresh: () => void) => Promise<void>;
	handleClientBudgetsUpdate: (newUsdRate: number, clientId: string, refresh: () => void) => Promise<void>;
	handleCreateBudget: (formData: any, folderBudgets: any[], clientId: string, setIsCreateOpen: (open: boolean) => void, refresh: () => void, setIsLoading: (loading: boolean) => void) => Promise<void>;
}

export const budgetHandlers: BudgetHandlers = {
	async handleChooseBudget(budgetId: string, budgets: BudgetWithWork[], refresh: () => void, setIsLoading: (loading: boolean) => void) {
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
					description: translateError(error),
				});
				return;
			}
			
			toast({ 
				title: budget.accepted ? TOAST_MESSAGES.budgetUnchosen : TOAST_MESSAGES.budgetChosen,
				description: budget.accepted ? 'El presupuesto ya no será considerado como elegido.' : 'El presupuesto ahora es el elegido para este cliente.',
			});
			refresh();
		} finally {
			setIsLoading(false);
		}
	},

	async handleToggleSold(budgetId: string, budgets: BudgetWithWork[], refresh: () => void, setIsLoading: (loading: boolean) => void, closeBudgetDetailModal: () => void) {
		try {
			setIsLoading(true);
			const budget = budgets.find(b => b.id === budgetId);
			if (!budget) return;

			const { error } = await updateBudget(budgetId, {
				sold: !budget.sold
			});
			
			if (error) {
				toast({
					variant: 'destructive',
					title: 'No se pudo cambiar el estado de venta',
					description: translateError(error),
				});
				return;
			}
			
			toast({ 
				title: budget.sold ? TOAST_MESSAGES.soldUnmarked : TOAST_MESSAGES.soldMarked,
				description: budget.sold ? 'El presupuesto ya no está marcado como vendido.' : 'El presupuesto ahora está marcado como vendido.',
			});
			
			closeBudgetDetailModal();
			refresh();
		} finally {
			setIsLoading(false);
		}
	},

	async handleToggleLost(budgetId: string, budgets: BudgetWithWork[], refresh: () => void, setIsLoading: (loading: boolean) => void, closeBudgetDetailModal: () => void) {
		try {
			setIsLoading(true);
			const budget = budgets.find(b => b.id === budgetId);
			if (!budget) return;

			const { error } = await updateBudget(budgetId, {
				lost: !budget.lost
			});
			
			if (error) {
				toast({
					variant: 'destructive',
					title: 'No se pudo cambiar el estado del presupuesto',
					description: translateError(error),
				});
				return;
			}
			
			toast({ 
				title: budget.lost ? TOAST_MESSAGES.lostUnmarked : TOAST_MESSAGES.lostMarked,
				description: budget.lost ? 'El presupuesto ya no está marcado como perdido.' : 'El presupuesto ahora está marcado como perdido.',
			});
			
			closeBudgetDetailModal();
			refresh();
		} finally {
			setIsLoading(false);
		}
	},

	async handleStatusChange(budgetId: string, newStatus: string, budgets: BudgetWithWork[], refresh: () => void, setIsLoading: (loading: boolean) => void) {
		try {
			setIsLoading(true);
			const budget = budgets.find(b => b.id === budgetId);
			if (!budget) return;

			// Reset only main status flags (keep 'accepted' independent)
			const updateData: any = {
				sold: false,
				lost: false,
			};

			// Set the new status
			switch (newStatus) {
				case BUDGET_STATUS.SOLD:
					updateData.sold = true;
					break;
				case BUDGET_STATUS.LOST:
					updateData.lost = true;
					break;
				case BUDGET_STATUS.IN_PROGRESS:
				default:
					// All flags remain false for "in progress"
					break;
			}

			const { error } = await updateBudget(budgetId, updateData);
			
			if (error) {
				toast({
					variant: 'destructive',
					title: 'No se pudo cambiar el estado del presupuesto',
					description: translateError(error),
				});
				return;
			}
			
			const statusLabel = BUDGET_STATUS_LABELS[newStatus as keyof typeof BUDGET_STATUS_LABELS];
			toast({ 
				title: 'Estado actualizado',
				description: `El presupuesto ahora está marcado como "${statusLabel}".`,
			});
			
			refresh();
		} finally {
			setIsLoading(false);
		}
	},

	handleDeleteBudget(budgetId: string, setDeleteBudgetConfirm: (state: any) => void) {
		setDeleteBudgetConfirm({ open: true, budgetId });
	},

	async confirmDeleteBudget(deleteBudgetConfirm: any, refresh: () => void, setIsLoading: (loading: boolean) => void, setDeleteBudgetConfirm: (state: any) => void) {
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
					description: translateError(error) || 'Intente nuevamente.',
				});
				return;
			}
			toast({ title: TOAST_MESSAGES.budgetDeleted });
			refresh();
		} finally {
			setIsLoading(false);
			setDeleteBudgetConfirm({ open: false, budgetId: null });
		}
	},

	handleDeleteFolder(folderId: string, budgetsByFolderId: Map<string, BudgetWithWork[]>, setDeleteFolderConfirm: (state: any) => void) {
		const budgetCount = budgetsByFolderId.get(folderId)?.length || 0;
		setDeleteFolderConfirm({ 
			open: true, 
			folderId, 
			budgetCount 
		});
	},

	async confirmDeleteFolder(deleteFolderConfirm: any, refresh: () => void, setIsLoading: (loading: boolean) => void, setDeleteFolderConfirm: (state: any) => void) {
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
					description: translateError(error) || 'Intente nuevamente.',
				});
				return;
			}
			toast({ title: TOAST_MESSAGES.folderDeleted });
			refresh();
		} finally {
			setIsLoading(false);
			setDeleteFolderConfirm({ 
				open: false, 
				folderId: null, 
				budgetCount: 0 
			});
		}
	},

	async handleViewPdf(budget: BudgetWithWork, setPdfPreview: (state: any) => void, setIsLoading: (loading: boolean) => void) {
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
	},

	closePdfPreview(pdfPreview: any, setPdfPreview: (state: any) => void) {
		if (pdfPreview.pdfUrl) {
			URL.revokeObjectURL(pdfPreview.pdfUrl);
		}
		setPdfPreview({ open: false, budget: null, pdfUrl: null });
	},

	handleOpenBudgetDetail(budget: BudgetWithWork, setBudgetDetailModal: (state: any) => void) {
		setBudgetDetailModal({ open: true, budget });
	},

	closeBudgetDetailModal(setBudgetDetailModal: (state: any) => void) {
		setBudgetDetailModal({ open: false, budget: null });
	},

	handleEditBudget(budget: BudgetWithWork, setEditingBudget: (budget: BudgetWithWork | null) => void, closeBudgetDetailModal: () => void, setEditModalOpen: (open: boolean) => void) {
		setEditingBudget(budget);
		closeBudgetDetailModal();
		setEditModalOpen(true);
	},

	async handleEditBudgetSubmit(formData: any, editingBudget: BudgetWithWork | null, clientId: string, setIsLoading: (loading: boolean) => void, setEditModalOpen: (open: boolean) => void, setEditingBudget: (budget: BudgetWithWork | null) => void, refresh: () => void) {
		if (!editingBudget) return;

		try {
			setIsLoading(true);

			const amount = parseAmount(formData.amount);
			const amountUsd = parseAmount(formData.amountUsd);
			const number = formData.number.trim() || null;

			const { error } = await editBudget(
				editingBudget.id,
				{
					type: formData.type,
					version: formData.version.trim() || null,
					number: number,
					amount_ars: amount,
					amount_usd: amountUsd,
					created_at: formData.created_at ? new Date(formData.created_at + 'T00:00:00').toISOString() : editingBudget.created_at,
				},
				formData.pdf,
				clientId
			);

			if (error) {
				console.error('Error editando presupuesto:', error);
				toast({
					variant: 'destructive',
					title: 'No se pudo editar el presupuesto',
					description: translateError(error) || 'Intente nuevamente.',
				});
				return;
			}

			toast({ title: TOAST_MESSAGES.budgetUpdated });
			setEditModalOpen(false);
			setEditingBudget(null);
			refresh();
		} finally {
			setIsLoading(false);
		}
	},

	async handleClientBudgetsUpdate(newUsdRate: number, clientId: string, refresh: () => void) {	
		try {
			const response = await fetch('/api/budget-dollar-rate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					clientId,
					newUsdRate,
				}),
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.error || 'Error al actualizar el tipo de cambio');
			}

			refresh();
			
			toast({
				title: TOAST_MESSAGES.pricesUpdated,
				description: `${result.data.updatedCount} presupuesto(s) se actualizaron con el nuevo tipo de cambio.`,
			});
		} catch (error) {
			console.error('Error al actualizar presupuestos del cliente:', error);
			throw error;
		}
	},

	async handleCreateBudget(formData: any, folderBudgets: any[], clientId: string, setIsCreateOpen: (open: boolean) => void, refresh: () => void, setIsLoading: (loading: boolean) => void) {
		try {
			setIsLoading(true);

		const work_id =
			formData.workId === 'none' ? null : Number(formData.workId);

		const existingFolder = folderBudgets.find(
			(f) => (f.work_id ?? null) === work_id
		);
			let folderId = existingFolder?.id;
			let newFolder = false;

			if (!folderId) {
				const { data: folder, error: folderError } = await createFolderBudget({
					client_id: clientId,
					work_id: work_id?.toString(),
				});

				if (folderError || !folder) {
					const errorMessage = folderError ? translateError(folderError) : 'Error desconocido al crear la carpeta';
					toast({
						variant: 'destructive',
						title: 'No se pudo crear la carpeta.' + errorMessage,
						description: 'Intente nuevamente.',
					});
					return;
				}
				folderId = folder.id;
				newFolder = true;
			}

			const amount = parseAmount(formData.amount);
			const amountUsd = parseAmount(formData.amountUsd);
			const number = formData.number.trim() || null;

			const { error: createError } = await createBudget(
				{
					folder_budget_id: folderId,
					accepted: false,
					sold: false,
					lost: false,
					type: formData.type,
					version: formData.version.trim() || null,
					number: number,
					amount_ars: amount,
					amount_usd: amountUsd,
					created_at: formData.created_at ? new Date(formData.created_at + 'T00:00:00').toISOString() : new Date().toISOString(),
				},
				formData.pdf,
				clientId
			);

			if (createError) {
				console.error('Error creando presupuesto:', createError);
				toast({
					variant: 'destructive',
					title: 'No se pudo crear el presupuesto',
					description: translateError(createError) || 'Intente nuevamente.',
				});
				if (newFolder && folderId) {
					await deleteFolderBudget(folderId);
				}
				return;
			}

			toast({ title: TOAST_MESSAGES.budgetCreated });
			setIsCreateOpen(false);
			refresh();
		} finally {
			setIsLoading(false);
		}
	},
};
