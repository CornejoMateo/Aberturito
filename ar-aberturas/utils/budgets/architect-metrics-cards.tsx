'use client';

import { Card } from '@/components/ui/card';
import { Users, Trophy, TrendingUp, DollarSign } from 'lucide-react';
import { ArchitectReport } from '@/lib/budgets/architects';
import { formatCurrency } from '@/helpers/format-prices.tsx/formats';

interface ArchitectMetricsCardsProps {
	report: ArchitectReport | null;
}

export function ArchitectMetricsCards({ report }: ArchitectMetricsCardsProps) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card className="p-4">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-blue-100 rounded-lg">
						<Users className="h-5 w-5 text-blue-600" />
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Total arquitectos</p>
						<p className="text-2xl font-bold">{report?.totalArchitects || 0}</p>
					</div>
				</div>
			</Card>

			<Card className="p-4">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-green-100 rounded-lg">
						<Trophy className="h-5 w-5 text-green-600" />
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Top arquitecto</p>
						<p className="text-lg font-semibold truncate">
							{report?.topArchitect?.name || 'N/A'}
						</p>
						<p className="text-xs text-muted-foreground">
							{report?.topArchitect?.totalBudgets || 0} presupuestos
						</p>
					</div>
				</div>
			</Card>

			<Card className="p-4">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-purple-100 rounded-lg">
						<TrendingUp className="h-5 w-5 text-purple-600" />
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Más ventas</p>
						<p className="text-lg font-semibold truncate">
							{report?.mostSoldArchitect?.name || 'N/A'}
						</p>
						<p className="text-xs text-muted-foreground">
							{report?.mostSoldArchitect?.soldBudgets || 0} vendidos
						</p>
					</div>
				</div>
			</Card>

			<Card className="p-4">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-orange-100 rounded-lg">
						<DollarSign className="h-5 w-5 text-orange-600" />
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Mayor facturación</p>
						<p className="text-lg font-semibold truncate">
							{report?.architects?.sort((a, b) => b.totalAmount - a.totalAmount)[0]?.name || 'N/A'}
						</p>
						<p className="text-xs text-muted-foreground">
							{formatCurrency(report?.architects?.sort((a, b) => b.totalAmount - a.totalAmount)[0]?.totalAmount || 0)}
						</p>
					</div>
				</div>
			</Card>
		</div>
	);
}
