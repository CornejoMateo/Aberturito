'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, FileText, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BudgetWithWork } from '@/lib/works/balances';
import { BudgetFolderVM } from '../types';
import { formatCurrency, workLabel } from '../utils';
import { formatCreatedAt } from '@/helpers/date/format-date';

interface BudgetCardProps {
	budget: BudgetWithWork;
	folder: BudgetFolderVM;
	isLoading: boolean;
	onChooseBudget: (budgetId: string) => void;
	onDeleteBudget: (budgetId: string) => void;
	onViewPdf: (budget: BudgetWithWork) => void;
	onOpenDetail: (budget: BudgetWithWork) => void;
}

export function BudgetCard({
	budget,
	folder,
	isLoading,
	onChooseBudget,
	onDeleteBudget,
	onViewPdf,
	onOpenDetail,
}: BudgetCardProps) {
	const isChosen = !!budget.accepted;

	return (
		<Card
			className={cn(
				'min-w-[260px] max-w-[260px] p-4 border-border relative cursor-pointer hover:shadow-md transition-shadow',
				isChosen && 'border-primary bg-primary/5'
			)}
			onClick={() => onOpenDetail(budget)}
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
					onClick={(e) => {
						e.stopPropagation();
						onDeleteBudget(budget.id);
					}}
					disabled={isLoading}
					className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
				>	
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>
			<div className="flex items-start justify-between gap-2">
				<div className="min-w-0">
					<p className="font-semibold text-foreground truncate">
						{budget.version || 'Sin variante'}
					</p>
					<p className="text-xs text-muted-foreground truncate">{workLabel(folder)}</p>
				</div>
			</div>

			<div className="mt-3 space-y-2">
				<div className="space-y-1">
					<p className="text-sm font-semibold text-foreground">
						{formatCurrency(budget.amount_ars, 'ARS')}
					</p>
					<p className="text-sm font-semibold text-foreground">
						{formatCurrency(budget.amount_usd, 'USD')}
					</p>
				</div>
				{budget.number ? (
					<Badge variant="outline">#{budget.number}</Badge>
				) : null}
				{budget.created_at && (
					<p className="text-xs text-muted-foreground">
						{formatCreatedAt(budget.created_at)}
					</p>
				)}
			</div>

			<div className="flex flex-wrap gap-2 mb-3">
				{budget.pdf_path ? (
					<Button
						variant="outline"
						size="sm"
						onClick={(e) => {
							e.stopPropagation();
							onViewPdf(budget);
						}}
						className="gap-2"
					>
						<FileText className="h-4 w-4" /> Ver PDF
					</Button>
				) : (
					<Badge variant="secondary">Sin PDF</Badge>
				)}

				<Button
					variant={isChosen ? 'secondary' : 'default'}
					size="sm"
					disabled={isLoading}
					onClick={(e) => {
						e.stopPropagation();
						onChooseBudget(budget.id);
					}}
					className="gap-2"
				>
					<CheckCircle className="h-4 w-4" />
					{isChosen ? 'Elegido' : 'Elegir'}
				</Button>
			</div>
			{budget.sold && (
				<div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-xs font-semibold py-1 text-center rounded-b-lg">
					VENDIDO
				</div>
			)}
		</Card>
	);
}
