'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArchitectStats } from '@/lib/budgets/architects';
import { formatCurrency } from '@/helpers/format-prices.tsx/formats';

interface ArchitectsTopBudgetsCountProps {
	title: string;
	icon: React.ReactNode;
	architects: ArchitectStats[];
	displayCount: number;
	onLoadMore: () => void;
	isLoading: boolean;
	showSalesInfo?: boolean;
	showRevenueInfo?: boolean;
}

export function ArchitectsTopBudgetsCount({
	title,
	icon,
	architects,
	displayCount,
	isLoading,
	showSalesInfo = false,
	showRevenueInfo = false
}: ArchitectsTopBudgetsCountProps) {
	const getSortedArchitects = () => {
		const sortedArchitects = [...architects];

		if (showSalesInfo) {
			return sortedArchitects.sort((a, b) => b.soldBudgets - a.soldBudgets);
		}

		if (showRevenueInfo) {
			return sortedArchitects.sort((a, b) => b.soldAmount - a.soldAmount);
		}

		return sortedArchitects.sort((a, b) => b.totalBudgets - a.totalBudgets);
	};

	const getDisplayedArchitects = () => {
		return getSortedArchitects().slice(0, displayCount);
	};

	const getMetricValue = (architect: ArchitectStats) => {
		if (showSalesInfo) return architect.soldBudgets;
		if (showRevenueInfo) return architect.soldAmount;
		return architect.totalBudgets;
	};

	const getProgressValue = (architect: ArchitectStats) => {
		if (showSalesInfo) return architect.soldPercentage;
		if (showRevenueInfo) return architect.soldAmount;
		return architect.totalBudgets;
	};

	const getMaxValue = () => {
		const displayed = getDisplayedArchitects();
		if (displayed.length === 0) return 1;
		
		if (showSalesInfo) {
			return 100;
		}
		if (showRevenueInfo) {
			return displayed[0]?.soldAmount || 1;
		}
		return displayed[0]?.totalBudgets || 1;
	};

	const formatMetricValue = (value: number) => {
		if (showRevenueInfo) return formatCurrency(value);
		return value.toString();
	};

	const getEmptyMessage = () => {
		if (showSalesInfo) return 'No hay ventas registradas';
		if (showRevenueInfo) return 'No hay datos de facturación';
		return 'No hay datos disponibles';
	};

	return (
		<Card className="p-6">
			<div className="flex items-center gap-2 mb-4">
				{icon}
				<h4 className="text-lg font-semibold">{title}</h4>
			</div>
			<div className="space-y-3">
				{isLoading ? (
					<div className="text-center text-muted-foreground py-8">
						Cargando datos...
					</div>
				) : getDisplayedArchitects().length === 0 ? (
					<div className="text-center text-muted-foreground py-8">
						{getEmptyMessage()}
					</div>
				) : (
					<>
						{getDisplayedArchitects().map((architect, index) => {
							const maxValue = getMaxValue();
							const currentValue = getMetricValue(architect);
							const currentProgressValue = getProgressValue(architect);
							const percentage = (currentProgressValue / maxValue) * 100;
							
							return (
								<div key={architect.name} className="space-y-2">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Badge variant="outline" className="text-xs">
												#{index + 1}
											</Badge>
											<span className="text-sm font-medium truncate">
												{architect.name}
											</span>
										</div>
										<span className="text-sm text-muted-foreground">
											{formatMetricValue(currentValue)}
										</span>
									</div>
									{!showRevenueInfo && (
										<Progress value={percentage} className="h-2" />
									)}
									
									{(showSalesInfo || showRevenueInfo) && (
										<div className="flex items-center justify-between text-xs text-muted-foreground">
											{showSalesInfo ? (
												<>
													<span>{architect.soldPercentage.toFixed(1)}% de conversión</span>
													<span>{formatCurrency(architect.soldAmount)}</span>
												</>
											) : showRevenueInfo ? (
												<>
													<span>{architect.soldBudgets} vendidos</span>
													<span>{architect.soldPercentage.toFixed(1)}% de conversión</span>
												</>
											) : null}
										</div>
									)}
								</div>
							);
						})}
					</>
				)}
			</div>
		</Card>
	);
}
