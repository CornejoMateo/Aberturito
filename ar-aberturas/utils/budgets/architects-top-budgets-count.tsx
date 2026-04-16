'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Building, Trophy, DollarSign } from 'lucide-react';
import { ArchitectStats } from '@/lib/budgets/architects';
import { formatCurrency } from '@/helpers/format-prices.tsx/formats';

interface ArchitectsTopBudgetsCountProps {
	title: string;
	icon: React.ReactNode;
	architects: ArchitectStats[];
	displayCount: number;
	onLoadMore: () => void;
	hasMore: boolean;
	isLoading: boolean;
	showSalesInfo?: boolean;
	showRevenueInfo?: boolean;
}

export function ArchitectsTopBudgetsCount({
	title,
	icon,
	architects,
	displayCount,
	onLoadMore,
	hasMore,
	isLoading,
	showSalesInfo = false,
	showRevenueInfo = false
}: ArchitectsTopBudgetsCountProps) {
	const getDisplayedArchitects = () => {
		return architects.slice(0, displayCount);
	};

	const getMetricValue = (architect: ArchitectStats) => {
		if (showSalesInfo) return architect.soldBudgets;
		if (showRevenueInfo) return architect.totalAmount;
		return architect.totalBudgets;
	};

	const getMaxValue = () => {
		const displayed = getDisplayedArchitects();
		if (displayed.length === 0) return 1;
		
		if (showSalesInfo) {
			return displayed[0]?.soldBudgets || 1;
		}
		if (showRevenueInfo) {
			return displayed[0]?.totalAmount || 1;
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
							const percentage = (currentValue / maxValue) * 100;
							
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
									<Progress value={percentage} className="h-2" />
									
									{(showSalesInfo || showRevenueInfo) && (
										<div className="flex items-center justify-between text-xs text-muted-foreground">
											{showSalesInfo ? (
												<>
													<span>{architect.soldPercentage.toFixed(1)}% de conversión</span>
													<span>{formatCurrency(architect.soldAmount)}</span>
												</>
											) : showRevenueInfo ? (
												<>
													<span>{architect.totalBudgets} presupuestos</span>
													<span>{architect.soldBudgets} vendidos</span>
												</>
											) : null}
										</div>
									)}
								</div>
							);
						})}
						{hasMore && (
							<div className="pt-4">
								<Button 
									variant="outline" 
									onClick={onLoadMore}
									className="w-full"
									disabled={isLoading}
								>
									Cargar más ({architects.length - displayCount} restantes)
								</Button>
							</div>
						)}
					</>
				)}
			</div>
		</Card>
	);
}
