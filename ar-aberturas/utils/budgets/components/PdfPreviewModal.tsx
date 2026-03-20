'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BudgetWithWork } from '@/lib/works/balances';
import { workLabel } from '../utils';

interface PdfPreviewModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	budget: BudgetWithWork | null;
	pdfUrl: string | null;
}

export function PdfPreviewModal({
	isOpen,
	onOpenChange,
	budget,
	pdfUrl,
}: PdfPreviewModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh]">
				<DialogHeader>
					<DialogTitle>
						Vista previa - Presupuesto {budget?.type} #{budget?.number || 'sin número'}
					</DialogTitle>
					<DialogDescription>
						{budget?.version || 'Sin variante'} - {budget?.folder_budget?.work
  ? `${budget.folder_budget.work.address} - ${budget.folder_budget.work.locality}`
  : 'Sin obra'}
					</DialogDescription>
				</DialogHeader>
				<div className="flex-1 min-h-[600px]">
					{pdfUrl && (
						<iframe
							src={pdfUrl}
							className="w-full h-full min-h-[600px] border rounded"
							title="Vista previa del PDF"
						/>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
