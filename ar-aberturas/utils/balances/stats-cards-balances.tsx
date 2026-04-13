import { TrendingDown, TrendingUp, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/helpers/format-prices.tsx/formats';
import { BALANCE_TYPES } from '@/constants/reports/balances-report';

interface StatsCardsBalancesProps {
	stats: {
		totalDebtors: number;
		totalCreditors: number;
		debtorsCount: number;
		creditorsCount: number;
	};
}

export function StatsCardsBalances({
	stats,
}: StatsCardsBalancesProps) {
	return (
		<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
			<Card className="p-6 bg-card border-border">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-muted-foreground">
							{BALANCE_TYPES.TOTAL}
						</p>
						<p className="text-2xl font-bold text-foreground mt-2">
							{stats.debtorsCount + stats.creditorsCount}
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							{stats.debtorsCount} deudores, {stats.creditorsCount} acreedores
						</p>
					</div>
					<div className="rounded-lg bg-secondary p-3 text-foreground/80">
						<Users className="h-6 w-6" />
					</div>
				</div>
			</Card>

			<Card className="p-6 bg-card border-border">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-muted-foreground">
							{BALANCE_TYPES.DEBTOR}
						</p>
						<p className="text-2xl font-bold text-foreground mt-2">
							{formatCurrency(stats.totalDebtors)}
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							{stats.debtorsCount} cliente{stats.debtorsCount !== 1 ? 's' : ''}
						</p>
					</div>
					<div className="rounded-lg bg-red-50 p-3 text-red-600">
						<TrendingUp className="h-6 w-6" />
					</div>
				</div>
			</Card>

			<Card className="p-6 bg-card border-border">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-muted-foreground">
							{BALANCE_TYPES.CREDITOR}
						</p>
						<p className="text-2xl font-bold text-foreground mt-2">
							{formatCurrency(stats.totalCreditors)}
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							{stats.creditorsCount} cliente{stats.creditorsCount !== 1 ? 's' : ''}
						</p>
					</div>
					<div className="rounded-lg bg-green-50 p-3 text-green-600">
						<TrendingDown className="h-6 w-6" />
					</div>
				</div>
			</Card>
		</div>
	);
}
