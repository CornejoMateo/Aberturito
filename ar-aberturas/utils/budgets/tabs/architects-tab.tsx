'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { getArchitectsReport, ArchitectReport, ArchitectStats } from '@/lib/budgets/architects';
import { ArchitectsTopBudgetsCount } from '../architects-top-budgets-count';
import { ArchitectMetricsCards } from '../architect-metrics-cards';
import { Building, Trophy, DollarSign } from 'lucide-react';

interface ArchitectsTabProps {
	loading?: boolean;
}

export function ArchitectsTab({ loading: externalLoading = false }: ArchitectsTabProps) {
	const [report, setReport] = useState<ArchitectReport | null>(null);
	const [loading, setLoading] = useState(true);
	const [displayCount, setDisplayCount] = useState(5); // Initial items to show
	const ITEMS_PER_PAGE = 5;

	const fetchData = async () => {
		try {
			setLoading(true);
			const { data } = await getArchitectsReport();
			setReport(data);
			setDisplayCount(5); // Reset display count when data refreshes
		} catch (error) {
			console.error('Error fetching architects report:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const loadMore = () => {
		setDisplayCount(prev => prev + ITEMS_PER_PAGE);
	};

	const hasMore = (architects: ArchitectStats[]) => {
		return displayCount < architects.length;
	};

	const isLoading = externalLoading || loading;
	const allArchitects = report?.architects ?? [];
	const soldArchitects = allArchitects.filter(a => a.soldBudgets > 0);
	const hasMoreAnyList = hasMore(allArchitects) || hasMore(soldArchitects);

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
			<ArchitectMetricsCards report={report} />

			{!isLoading && displayCount > ITEMS_PER_PAGE && (
				<div className="flex justify-center">
					<Button 
						variant="outline" 
						onClick={() => setDisplayCount(ITEMS_PER_PAGE)}
						className="w-full max-w-md"
						disabled={isLoading}
					>
						Cargar menos
					</Button>
				</div>
			)}

			{/* Charts Grid */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Top Performers by Budget Count */}
				<ArchitectsTopBudgetsCount
					title="Más presupuestos"
					icon={<Building className="h-5 w-5 text-blue-600" />}
					architects={allArchitects}
					displayCount={displayCount}
					onLoadMore={loadMore}
					isLoading={isLoading}
				/>

				{/* Most Sales */}
				<ArchitectsTopBudgetsCount
					title="Más ventas"
					icon={<Trophy className="h-5 w-5 text-green-600" />}
					architects={soldArchitects}
					displayCount={displayCount}
					onLoadMore={loadMore}
					isLoading={isLoading}
					showSalesInfo
				/>

				{/* Revenue Leaders */}
				<ArchitectsTopBudgetsCount
					title="Mayor facturación"
					icon={<DollarSign className="h-5 w-5 text-orange-600" />}
					architects={allArchitects}
					displayCount={displayCount}
					onLoadMore={loadMore}
					isLoading={isLoading}
					showRevenueInfo
				/>
			</div>

			{!isLoading && hasMoreAnyList && (
				<div className="flex justify-center">
					<Button 
						variant="outline" 
						onClick={loadMore}
						className="w-full max-w-md"
						disabled={isLoading}
					>
						Cargar más
					</Button>
				</div>
			)}
		</div>
	);
}
