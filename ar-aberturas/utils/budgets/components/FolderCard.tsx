'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CheckCircle, ChevronDown, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BudgetFolderVM } from '../types';
import { workLabel, groupBudgetsByType, getOrderedTypeKeys } from '../utils';
import { BudgetCard } from './BudgetCard';

interface FolderCardProps {
	folder: BudgetFolderVM;
	isOpen: boolean;
	onToggle: (open: boolean) => void;
	isLoading: boolean;
	onChooseBudget: (budgetId: string) => void;
	onDeleteBudget: (budgetId: string) => void;
	onDeleteFolder: (folderId: string) => void;
	onViewPdf: (budget: any) => void;
	onOpenDetail: (budget: any) => void;
}

export function FolderCard({
	folder,
	isOpen,
	onToggle,
	isLoading,
	onChooseBudget,
	onDeleteBudget,
	onDeleteFolder,
	onViewPdf,
	onOpenDetail,
}: FolderCardProps) {
	const folderBudgetsList = folder.budgets;
	const chosenCountInFolder = folderBudgetsList.filter((b) => !!b.accepted).length;

	const budgetsByType = groupBudgetsByType(folderBudgetsList);
	const orderedTypeKeys = getOrderedTypeKeys(budgetsByType);

	return (
		<Collapsible open={isOpen} onOpenChange={onToggle}>
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
									className={cn('h-4 w-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')}
								/>
							</div>
						</button>
					</CollapsibleTrigger>
					<Button
						variant="ghost"
						size="sm"
						onClick={(e) => {
							e.stopPropagation();
							onDeleteFolder(folder.id);
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
											{list.map((budget) => (
												<BudgetCard
													key={budget.id}
													budget={budget}
													folder={folder}
													isLoading={isLoading}
													onChooseBudget={onChooseBudget}
													onDeleteBudget={onDeleteBudget}
													onViewPdf={onViewPdf}
													onOpenDetail={onOpenDetail}
												/>
											))}
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
}
