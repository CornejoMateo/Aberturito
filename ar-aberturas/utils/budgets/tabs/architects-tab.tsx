'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
	Users, 
	Trophy, 
	TrendingUp, 
	RefreshCw,
	Building,
	DollarSign 
} from 'lucide-react';
import { getArchitectsReport, ArchitectReport, ArchitectStats } from '@/lib/budgets/architects';
import { formatCurrency } from '@/helpers/format-prices.tsx/formats';

interface ArchitectsTabProps {
	loading?: boolean;
}

export function ArchitectsTab({ loading: externalLoading = false }: ArchitectsTabProps) {
	const [report, setReport] = useState<ArchitectReport | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchData = async () => {
		try {
			setLoading(true);
			const { data } = await getArchitectsReport();
			setReport(data);
		} catch (error) {
			console.error('Error fetching architects report:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const isLoading = externalLoading || loading;

	const getTopPerformers = () => {
		if (!report?.architects.length) return [];
		
		return report.architects
			.sort((a, b) => b.totalBudgets - a.totalBudgets)
			.slice(0, 5);
	};

	const getSoldLeaders = () => {
		if (!report?.architects.length) return [];
		
		return report.architects
			.filter(a => a.soldBudgets > 0)
			.sort((a, b) => b.soldBudgets - a.soldBudgets)
			.slice(0, 5);
	};

	const getRevenueLeaders = () => {
		if (!report?.architects.length) return [];
		
		return report.architects
			.sort((a, b) => b.totalAmount - a.totalAmount)
			.slice(0, 5);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h3 className="text-2xl font-bold text-foreground text-balance">Arquitectos</h3>
					<p className="text-muted-foreground mt-1">Análisis de rendimiento por arquitecto</p>
				</div>
				<Button variant="outline" onClick={() => fetchData()} className="gap-2">
					<RefreshCw className="h-4 w-4" />
					Actualizar
				</Button>
			</div>

			{/* Key Metrics */}
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
								{getRevenueLeaders()[0]?.name || 'N/A'}
							</p>
							<p className="text-xs text-muted-foreground">
								{formatCurrency(getRevenueLeaders()[0]?.totalAmount || 0)}
							</p>
						</div>
					</div>
				</Card>
			</div>

			{/* Charts Grid */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Top Performers by Budget Count */}
				<Card className="p-6">
					<div className="flex items-center gap-2 mb-4">
						<Building className="h-5 w-5 text-blue-600" />
						<h4 className="text-lg font-semibold">Más presupuestos</h4>
					</div>
					<div className="space-y-3">
						{isLoading ? (
							<div className="text-center text-muted-foreground py-8">
								Cargando datos...
							</div>
						) : getTopPerformers().length === 0 ? (
							<div className="text-center text-muted-foreground py-8">
								No hay datos disponibles
							</div>
						) : (
							getTopPerformers().map((architect, index) => {
								const maxBudgets = getTopPerformers()[0]?.totalBudgets || 1;
								const percentage = (architect.totalBudgets / maxBudgets) * 100;
								
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
												{architect.totalBudgets}
											</span>
										</div>
										<Progress value={percentage} className="h-2" />
									</div>
								);
							})
						)}
					</div>
				</Card>

				{/* Most Sales */}
				<Card className="p-6">
					<div className="flex items-center gap-2 mb-4">
						<Trophy className="h-5 w-5 text-green-600" />
						<h4 className="text-lg font-semibold">Más ventas</h4>
					</div>
					<div className="space-y-3">
						{isLoading ? (
							<div className="text-center text-muted-foreground py-8">
								Cargando datos...
							</div>
						) : getSoldLeaders().length === 0 ? (
							<div className="text-center text-muted-foreground py-8">
								No hay ventas registradas
							</div>
						) : (
							getSoldLeaders().map((architect, index) => {
								const maxSold = getSoldLeaders()[0]?.soldBudgets || 1;
								const percentage = (architect.soldBudgets / maxSold) * 100;
								
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
												{architect.soldBudgets}
											</span>
										</div>
										<Progress value={percentage} className="h-2" />
										<div className="flex items-center justify-between text-xs text-muted-foreground">
											<span>{architect.soldPercentage.toFixed(1)}% de conversión</span>
											<span>{formatCurrency(architect.soldAmount)}</span>
										</div>
									</div>
								);
							})
						)}
					</div>
				</Card>

				{/* Revenue Leaders */}
				<Card className="p-6">
					<div className="flex items-center gap-2 mb-4">
						<DollarSign className="h-5 w-5 text-orange-600" />
						<h4 className="text-lg font-semibold">Mayor facturación</h4>
					</div>
					<div className="space-y-3">
						{isLoading ? (
							<div className="text-center text-muted-foreground py-8">
								Cargando datos...
							</div>
						) : getRevenueLeaders().length === 0 ? (
							<div className="text-center text-muted-foreground py-8">
								No hay datos de facturación
							</div>
						) : (
							getRevenueLeaders().map((architect, index) => {
								const maxRevenue = getRevenueLeaders()[0]?.totalAmount || 1;
								const percentage = (architect.totalAmount / maxRevenue) * 100;
								
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
												{formatCurrency(architect.totalAmount)}
											</span>
										</div>
										<Progress value={percentage} className="h-2" />
										<div className="flex items-center justify-between text-xs text-muted-foreground">
											<span>{architect.totalBudgets} presupuestos</span>
											<span>{architect.soldBudgets} vendidos</span>
										</div>
									</div>
								);
							})
						)}
					</div>
				</Card>
			</div>
		</div>
	);
}
