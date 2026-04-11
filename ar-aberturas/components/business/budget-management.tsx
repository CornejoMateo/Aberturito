'use client';

import { useState } from 'react';
import { Users, FileText, Package, DollarSign } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBudgetMetrics } from '@/hooks/budgets/use-budget-metrics';
import { buildChartPages, formatChartValue } from '@/utils/budgets/calculations';
import { MetricCard } from '@/utils/budgets/metric-card';
import { OverviewTab } from '@/utils/budgets/tabs/overview-tab';
import { PerformanceTab } from '@/utils/budgets/tabs/performance-tab';
import { SourcesAndMaterialsTab } from '@/utils/budgets/tabs/sources-and-materials-tab';
import { TICKET_TYPES, DEFAULT_TICKET_TYPE } from '@/constants/budgets/tickets';
import { formatCurrency } from '@/helpers/format-prices.tsx/formats';

export function BudgetManagement() {
	const { metrics, loading } = useBudgetMetrics();
	const [ticketType, setTicketType] = useState(DEFAULT_TICKET_TYPE);
	const [chartPage, setChartPage] = useState(0);

	const getCurrentTicketValue = () => {
		switch (ticketType) {
			case 'sold':
				return metrics.soldAverageTicket;
			case 'chosen':
				return metrics.chosenAverageTicket;
			case 'total':
				return metrics.totalAverageTicket;
			default:
				return 0;
		}
	};

	const getCurrentTicketLabel = () => {
		const current = TICKET_TYPES.find((t) => t.id === ticketType);
		return current?.description || '';
	};

	const handleNextTicket = () => {
		const currentIndex = TICKET_TYPES.findIndex((t) => t.id === ticketType);
		const nextIndex = (currentIndex + 1) % TICKET_TYPES.length;
		setTicketType(TICKET_TYPES[nextIndex].id);
	};

	const handlePrevTicket = () => {
		const currentIndex = TICKET_TYPES.findIndex((t) => t.id === ticketType);
		const prevIndex = currentIndex === 0 ? TICKET_TYPES.length - 1 : currentIndex - 1;
		setTicketType(TICKET_TYPES[prevIndex].id);
	};

	const handleNextChart = () => {
		setChartPage((prev) => (prev + 1) % chartPages.length);
	};

	const handlePrevChart = () => {
		setChartPage((prev) => (prev - 1 + chartPages.length) % chartPages.length);
	};

	const chartPages = buildChartPages(metrics);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground text-balance">Reportes y métricas</h2>
					<p className="text-muted-foreground mt-1">Análisis de rendimiento y estadísticas</p>
				</div>
			</div>

			{/* Key metrics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					label="Clientes totales"
					value={metrics.totalClients}
					icon={Users}
					loading={loading}
					status={metrics.totalClients > 0}
				/>
				<MetricCard
					label="Presupuestos"
					value={metrics.totalBudgets}
					icon={FileText}
					loading={loading}
					status={metrics.totalBudgets > 0}
				/>
				<MetricCard
					label="Ventas cerradas"
					value={metrics.totalSales}
					icon={Package}
					loading={loading}
					status={metrics.totalSales > 0}
				/>
				<MetricCard
					label="Facturación"
					value={
						loading
							? '...'
							: metrics.totalRevenue > 0
								? formatCurrency(metrics.totalRevenue)
								: '--'
					}
					icon={DollarSign}
					loading={false}
					status={metrics.totalRevenue > 0}
				/>
			</div>

			{/* Tabs */}
			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList className="bg-card border border-border">
					<TabsTrigger value="overview">Resumen de ventas</TabsTrigger>
					<TabsTrigger value="performance">Rendimiento</TabsTrigger>
					<TabsTrigger value="sources">Fuentes y materiales</TabsTrigger>
				</TabsList>

				<OverviewTab
					metrics={metrics}
					loading={loading}
					chartPages={chartPages}
					chartPage={chartPage}
					ticketType={ticketType}
					ticketTypes={TICKET_TYPES}
					onPrevChart={handlePrevChart}
					onNextChart={handleNextChart}
					onSelectChart={(idx) => setChartPage(idx)}
					onPrevTicket={handlePrevTicket}
					onNextTicket={handleNextTicket}
					onSelectTicket={setTicketType}
					formatChartValue={formatChartValue}
					getCurrentTicketValue={getCurrentTicketValue}
					getCurrentTicketLabel={getCurrentTicketLabel}
				/>

				<PerformanceTab metrics={metrics} loading={loading} />

				<SourcesAndMaterialsTab metrics={metrics} loading={loading} />
			</Tabs>
		</div>
	);
}
