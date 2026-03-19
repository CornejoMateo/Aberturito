'use client';

import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { TrendingUp, Plus } from 'lucide-react';
import { Work } from '@/lib/works/works';
import { BudgetWithWork } from '@/lib/works/balances';
import { ClientBudgetsDollarUpdateModal } from '@/components/ui/client-budgets-dollar-update-modal';
import { BudgetFormModal } from '@/components/ui/budget-form-modal';
import { useClientBudgetsState } from './hooks/useClientBudgetsState';
import { budgetHandlers } from './handlers';
import { FolderCard } from './components/FolderCard';
import { BudgetDetailModal } from './components/BudgetDetailModal';
import { CreateBudgetModal } from './components/CreateBudgetModal';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { ClientBudgetsTabProps } from './types';

export function ClientBudgetsTab({ clientId, works, loadWorks, onBudgetsChange }: ClientBudgetsTabProps) {
	const {
		// State
		isLoading,
		setIsLoading,
		openFolders,
		setOpenFolders,
		isCreateOpen,
		setIsCreateOpen,
		formData,
		updateFormData,
		resetFormData,
		deleteBudgetConfirm,
		setDeleteBudgetConfirm,
		deleteFolderConfirm,
		setDeleteFolderConfirm,
		pdfPreview,
		setPdfPreview,
		isClientBudgetsUpdateModalOpen,
		setIsClientBudgetsUpdateModalOpen,
		budgetDetailModal,
		setBudgetDetailModal,
		editModalOpen,
		setEditModalOpen,
		editingBudget,
		setEditingBudget,
		
		// Data
		folderBudgets,
		loadingFolders,
		budgets,
		loadingBudgets,
		orderedFolders,
		chosenBudgetIds,
		
		// Actions
		refresh,
	} = useClientBudgetsState(clientId);

	useEffect(() => {
		onBudgetsChange(budgets);
	}, [budgets, onBudgetsChange]);

	useEffect(() => {
		loadWorks();
	}, []);

	// Event handlers
	const handleChooseBudget = (budgetId: string) => {
		budgetHandlers.handleChooseBudget(budgetId, budgets, refresh, setIsLoading);
	};

	const handleToggleSold = (budgetId: string) => {
		budgetHandlers.handleToggleSold(budgetId, budgets, refresh, setIsLoading, () => setBudgetDetailModal({ open: false, budget: null }));
	};

	const handleDeleteBudget = (budgetId: string) => {
		budgetHandlers.handleDeleteBudget(budgetId, setDeleteBudgetConfirm);
	};

	const confirmDeleteBudget = () => {
		budgetHandlers.confirmDeleteBudget(deleteBudgetConfirm, refresh, setIsLoading, setDeleteBudgetConfirm);
	};

	const handleDeleteFolder = (folderId: string) => {
		budgetHandlers.handleDeleteFolder(folderId, budgetsByFolderId, setDeleteFolderConfirm);
	};

	const confirmDeleteFolder = () => {
		budgetHandlers.confirmDeleteFolder(deleteFolderConfirm, refresh, setIsLoading, setDeleteFolderConfirm);
	};

	const handleViewPdf = (budget: BudgetWithWork) => {
		budgetHandlers.handleViewPdf(budget, setPdfPreview, setIsLoading);
	};

	const closePdfPreview = () => {
		budgetHandlers.closePdfPreview(pdfPreview, setPdfPreview);
	};

	const handleOpenBudgetDetail = (budget: BudgetWithWork) => {
		budgetHandlers.handleOpenBudgetDetail(budget, setBudgetDetailModal);
	};

	const closeBudgetDetailModal = () => {
		budgetHandlers.closeBudgetDetailModal(setBudgetDetailModal);
	};

	const handleEditBudget = (budget: BudgetWithWork) => {
		budgetHandlers.handleEditBudget(budget, setEditingBudget, closeBudgetDetailModal, setEditModalOpen);
	};

	const handleEditBudgetSubmit = async (formData: any) => {
		await budgetHandlers.handleEditBudgetSubmit(formData, editingBudget, clientId, setIsLoading, setEditModalOpen, setEditingBudget, refresh);
	};

	const handleClientBudgetsUpdate = async (newUsdRate: number) => {
		await budgetHandlers.handleClientBudgetsUpdate(newUsdRate, clientId, refresh);
	};

	const handleCreateBudget = async () => {
		await budgetHandlers.handleCreateBudget(formData, folderBudgets, clientId, setIsCreateOpen, resetFormData, refresh, setIsLoading);
	};

	const handleCancelCreate = () => {
		setIsCreateOpen(false);
		resetFormData();
	};

	// Helper function to get budgets by folder ID (needed for folder delete)
	const budgetsByFolderId = new Map<string, BudgetWithWork[]>();
	for (const budget of budgets) {
		if (!budget || !budget.folder_budget || !budget.folder_budget.id) {
			continue;
		}
		const folderId = budget.folder_budget.id;
		if (!budgetsByFolderId.has(folderId)) {
			budgetsByFolderId.set(folderId, []);
		}
		budgetsByFolderId.get(folderId)!.push(budget);
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

					<div className="flex gap-2">
						{budgets.filter(b => b.amount_usd && b.amount_usd > 0).length > 0 && (
							<Button
								size="sm"
								variant="outline"
								className="gap-2"
								disabled={isLoading}
								onClick={() => setIsClientBudgetsUpdateModalOpen(true)}
							>
								<TrendingUp className="h-4 w-4" />
								Actualizar Precios
							</Button>
						)}
						<Button size="sm" className="gap-2" disabled={isLoading} onClick={() => setIsCreateOpen(true)}>
							<Plus className="h-4 w-4" />
							Nuevo presupuesto
						</Button>
					</div>
				</div>

				{(loadingFolders || loadingBudgets) && folderBudgets.length === 0 ? (
					<p className="text-sm text-muted-foreground text-center py-6">Cargando presupuestos...</p>
				) : folderBudgets.length === 0 ? (
					<Card className="p-6">
						<div className="text-center space-y-2">
							<p className="text-sm text-muted-foreground">Este cliente todavía no tiene presupuestos.</p>
						</div>
					</Card>
				) : null}

				<div className="space-y-3">
					{orderedFolders.map((folder) => (
						<FolderCard
							key={folder.id}
							folder={folder}
							isOpen={!!openFolders[folder.id]}
							onToggle={(open) => setOpenFolders(prev => ({ ...prev, [folder.id]: open }))}
							isLoading={isLoading}
							onChooseBudget={handleChooseBudget}
							onDeleteBudget={handleDeleteBudget}
							onDeleteFolder={handleDeleteFolder}
							onViewPdf={handleViewPdf}
							onOpenDetail={handleOpenBudgetDetail}
						/>
					))}
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

			<PdfPreviewModal
				isOpen={pdfPreview.open}
				onOpenChange={closePdfPreview}
				budget={pdfPreview.budget}
				pdfUrl={pdfPreview.pdfUrl}
			/>

			<ClientBudgetsDollarUpdateModal
				isOpen={isClientBudgetsUpdateModalOpen}
				onOpenChange={setIsClientBudgetsUpdateModalOpen}
				budgets={budgets}
				clientId={clientId}
				onUpdateConfirmed={handleClientBudgetsUpdate}
			/>

			<BudgetDetailModal
				isOpen={budgetDetailModal.open}
				onOpenChange={closeBudgetDetailModal}
				budget={budgetDetailModal.budget}
				isLoading={isLoading}
				onEdit={handleEditBudget}
				onToggleSold={handleToggleSold}
				onChooseBudget={handleChooseBudget}
				onViewPdf={handleViewPdf}
				onClose={closeBudgetDetailModal}
			/>

			<CreateBudgetModal
				isOpen={isCreateOpen}
				onOpenChange={setIsCreateOpen}
				formData={formData}
				works={works}
				isLoading={isLoading}
				onUpdateFormData={updateFormData}
				onCreateBudget={handleCreateBudget}
				onCancel={handleCancelCreate}
			/>

			<BudgetFormModal
				isOpen={editModalOpen}
				onOpenChange={setEditModalOpen}
				mode="edit"
				works={works}
				budget={editingBudget}
				onSubmit={handleEditBudgetSubmit}
				isLoading={isLoading}
			/>
		</>
	);
}
