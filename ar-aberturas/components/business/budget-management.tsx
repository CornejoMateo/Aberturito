'use client';

import { useState } from 'react';
import { Users, FileText, Package, DollarSign } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBudgetMetrics } from '@/utils/budgets/hooks/use-budget-metrics';
import { buildChartPages, formatChartValue } from '@/utils/budgets/calculations';
import { MetricCard } from '@/utils/budgets/metric-card';
import { OverviewTab } from '@/utils/budgets/tabs/overview-tab';
import { PerformanceTab } from '@/utils/budgets/tabs/performance-tab';
import { ConversionTab } from '@/utils/budgets/tabs/conversion-tab';

const ticketTypes = [
	{ id: 'sold', label: 'Vendidos', description: 'Presupuestos vendidos' },
	{ id: 'chosen', label: 'Pendientes', description: 'Presupuestos pendientes' },
	{ id: 'total', label: 'General', description: 'Todos los presupuestos' }
] as const;

export function BudgetManagement() {
	const { metrics, loading } = useBudgetMetrics();
	const [ticketType, setTicketType] = useState<'sold' | 'chosen' | 'total'>('sold');
	const [chartPage, setChartPage] = useState(0);

	const getCurrentTicketValue = () => {
		switch (ticketType) {
			case 'sold': return metrics.soldAverageTicket;
			case 'chosen': return metrics.chosenAverageTicket;
			case 'total': return metrics.totalAverageTicket;
			default: return 0;
		}
	};

	const getCurrentTicketLabel = () => {
		const current = ticketTypes.find(t => t.id === ticketType);
		return current?.description || '';
	};

	const handleNextTicket = () => {
		const currentIndex = ticketTypes.findIndex(t => t.id === ticketType);
		const nextIndex = (currentIndex + 1) % ticketTypes.length;
		setTicketType(ticketTypes[nextIndex].id);
	};

	const handlePrevTicket = () => {
		const currentIndex = ticketTypes.findIndex(t => t.id === ticketType);
		const prevIndex = currentIndex === 0 ? ticketTypes.length - 1 : currentIndex - 1;
		setTicketType(ticketTypes[prevIndex].id);
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
					value={loading ? '...' : metrics.totalRevenue > 0 ? `${(metrics.totalRevenue / 1000000).toFixed(1)}M` : '--'}
					icon={DollarSign}
					loading={false}
					status={metrics.totalRevenue > 0}
				/>
			</div>

			{/* Tabs */}
			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList className="bg-card border border-border">
					<TabsTrigger value="overview">Resumen de Ventas</TabsTrigger>
					<TabsTrigger value="performance">Rendimiento</TabsTrigger>
					<TabsTrigger value="conversion">Conversión</TabsTrigger>
				</TabsList>

				<OverviewTab
					metrics={metrics}
					loading={loading}
					chartPages={chartPages}
					chartPage={chartPage}
					ticketType={ticketType}
					ticketTypes={ticketTypes}
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

				<ConversionTab metrics={metrics} loading={loading} />
			</Tabs>
		</div>
	);
}
