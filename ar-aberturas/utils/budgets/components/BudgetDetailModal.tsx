'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, Edit, CheckCircle } from 'lucide-react';
import { BudgetWithWork } from '@/lib/works/balances';
import { formatCurrency } from '../utils';
import { formatCreatedAt } from '@/helpers/date/format-date'

interface BudgetDetailModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	budget: BudgetWithWork | null;
	isLoading: boolean;
	onEdit: (budget: BudgetWithWork) => void;
	onToggleSold: (budgetId: string) => void;
	onChooseBudget: (budgetId: string) => void;
	onViewPdf: (budget: BudgetWithWork) => void;
	onClose: () => void;
}

export function BudgetDetailModal({
	isOpen,
	onOpenChange,
	budget,
	isLoading,
	onEdit,
	onToggleSold,
	onChooseBudget,
	onViewPdf,
	onClose,
}: BudgetDetailModalProps) {
	if (!budget) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Detalles del Presupuesto
					</DialogTitle>
					<DialogDescription>
						Información completa del presupuesto seleccionado
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
							<p className="text-sm font-semibold">{budget.type}</p>
						</div>
						<div>
							<Label className="text-sm font-medium text-muted-foreground">Variante</Label>
							<p className="text-sm font-semibold">{budget.version || 'Sin variante'}</p>
						</div>
						<div>
							<Label className="text-sm font-medium text-muted-foreground">Número</Label>
							<p className="text-sm font-semibold">#{budget.number || 'Sin número'}</p>
						</div>
						<div>
							<Label className="text-sm font-medium text-muted-foreground">Estado</Label>
							<div className="flex items-center gap-2">
								{budget.accepted ? (
									<Badge className="gap-1">
										<CheckCircle className="h-3.5 w-3.5" /> Elegido
									</Badge>
								) : (
									<Badge variant="secondary">No elegido</Badge>
								)}
								{budget.sold ? (
									<Badge className="gap-1 bg-green-500 hover:bg-green-600">
										<CheckCircle className="h-3.5 w-3.5" /> Vendido
									</Badge>
								) : (
									<Badge variant="outline">No vendido</Badge>
								)}
							</div>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label className="text-sm font-medium text-muted-foreground">Monto ARS</Label>
							<p className="text-sm font-semibold">
								{formatCurrency(budget.amount_ars, 'ARS')}
							</p>
						</div>
						<div>
							<Label className="text-sm font-medium text-muted-foreground">Monto USD</Label>
							<p className="text-sm font-semibold">
								{formatCurrency(budget.amount_usd, 'USD')}
							</p>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label className="text-sm font-medium text-muted-foreground">Obra</Label>
							<p className="text-sm font-semibold">
								{budget.folder_budget?.work
									? `${budget.folder_budget.work.address} - ${budget.folder_budget.work.locality}`
									: 'Sin obra asignada'}
							</p>
						</div>
						<div>
							<Label className="text-sm font-medium text-muted-foreground mt-2">Fecha de emisión</Label>
							<p className="text-sm font-semibold">
								{formatCreatedAt(budget.created_at)}
							</p>
						</div>
					</div>

					<div>
						<Label className="text-sm font-medium text-muted-foreground">PDF</Label>
						<div className="flex items-center gap-2 mt-1">
							{budget.pdf_path ? (
								<Button
									variant="outline"
									size="sm"
									onClick={() => onViewPdf(budget)}
									className="gap-2"
								>
									<FileText className="h-4 w-4" /> Ver PDF
								</Button>
							) : (
								<Badge variant="secondary">Borrador - Sin PDF</Badge>
							)}
						</div>
					</div>

					<div className="flex justify-end gap-2 pt-4 border-t">
						<Button variant="outline" onClick={onClose}>
							Cerrar
						</Button>
						<Button
							variant="outline"
							onClick={() => onEdit(budget)}
							className="gap-2"
							disabled={isLoading}
						>
							<Edit className="h-4 w-4" />
							Editar
						</Button>
						<Button
							variant={budget.sold ? "secondary" : "default"}
							onClick={() => onToggleSold(budget.id)}
							className="gap-2"
							disabled={isLoading}
						>
							<CheckCircle className="h-4 w-4" />
							{budget.sold ? 'Marcar como no vendido' : 'Marcar como vendido'}
						</Button>
						{!budget.accepted && (
							<Button
								onClick={() => {
									onChooseBudget(budget.id);
									onClose();
								}}
								className="gap-2"
							>
								<CheckCircle className="h-4 w-4" />
								Elegir
							</Button>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
