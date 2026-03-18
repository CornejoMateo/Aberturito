import { BudgetWithWork } from '@/lib/works/balances';
import { Badge } from '@/components/ui/badge';
import { BUDGET_STATUS_LABELS, BUDGET_STATUS_COLORS } from '@/constants/budget-status';

interface LockedBudgetsListProps {
	lockedBudgets: BudgetWithWork[];
}

export function LockedBudgetsList({ lockedBudgets }: LockedBudgetsListProps) {
	if (lockedBudgets.length === 0) return null;

	return (
		<div className="mt-4 space-y-2">
			<h5 className="text-sm font-medium text-muted-foreground">Presupuestos protegidos:</h5>
			<div className="space-y-2">
				{lockedBudgets.map((budget) => (
					<div key={budget.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded border">
						<div className="flex items-center gap-2">
							<span className="text-sm font-medium">
								#{budget.number || 'sin número'} - {budget.version || 'Sin variante'}
							</span>
							{budget.sold && (
								<Badge className={`text-xs ${BUDGET_STATUS_COLORS.sold}`}>
									{BUDGET_STATUS_LABELS.sold}
								</Badge>
							)}
							{budget.accepted && (
								<Badge className={`text-xs ${BUDGET_STATUS_COLORS.accepted}`}>
									{BUDGET_STATUS_LABELS.accepted}
								</Badge>
							)}
						</div>
						<div className="text-right text-xs text-muted-foreground">
							${(budget.amount_ars || 0).toLocaleString('es-AR')} ARS
							<span className="ml-1">
								({(budget.amount_usd || 0).toFixed(2)} USD)
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
