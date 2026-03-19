import { Work } from '@/lib/works/works';
import { BudgetWithWork } from '@/lib/works/balances';
import { FolderBudget } from '@/lib/budgets/folder_budgets';

export interface BudgetFolderVM extends FolderBudget {
	budgets: BudgetWithWork[];
}

export interface ClientBudgetsTabProps {
	clientId: string;
	works: Work[];
	loadWorks: () => void;
	onBudgetsChange: (budgets: BudgetWithWork[]) => void;
}

export interface DeleteBudgetConfirmState {
	open: boolean;
	budgetId: string | null;
}

export interface DeleteFolderConfirmState {
	open: boolean;
	folderId: string | null;
	budgetCount: number;
}

export interface PdfPreviewState {
	open: boolean;
	budget: BudgetWithWork | null;
	pdfUrl: string | null;
}

export interface BudgetDetailModalState {
	open: boolean;
	budget: BudgetWithWork | null;
}

export interface BudgetFormData {
	type: string;
	version: string;
	number: string;
	amount: string;
	amountUsd: string;
	workId: string;
	pdf: File | null;
	created_at: string;
}

export interface ClientBudgetsTabState {
	isLoading: boolean;
	openFolders: Record<string, boolean>;
	isCreateOpen: boolean;
	formData: BudgetFormData;
	deleteBudgetConfirm: DeleteBudgetConfirmState;
	deleteFolderConfirm: DeleteFolderConfirmState;
	pdfPreview: PdfPreviewState;
	isClientBudgetsUpdateModalOpen: boolean;
	budgetDetailModal: BudgetDetailModalState;
	editModalOpen: boolean;
	editingBudget: BudgetWithWork | null;
}
