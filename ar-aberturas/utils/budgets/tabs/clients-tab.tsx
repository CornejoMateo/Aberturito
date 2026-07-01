'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';
import { formatCurrency } from '@/helpers/format-prices.tsx/formats';
import { ClientWithFirstBudget, getClientsWithFirstBudget } from '@/lib/clients/clients';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Cell,
} from 'recharts';
import { months } from '@/lib/budgets/budgets';

type ClientChartData = {
	month: string;
	clients: number;
};

type ClientStats = {
	totalClients: number;
	totalBudgets: number;
	totalSold: number;
	soldAmountArs: number;
	soldAmountUsd: number;
	averageBudgetsPerClient: number;
	conversionRate: number;
};

interface ClientsTabProps {
	loading?: boolean;
}

export function ClientsTab({ loading: externalLoading = false }: ClientsTabProps) {
	const [yearFilter, setYearFilter] = useState<string>('all');
	const [chartData, setChartData] = useState<ClientChartData[]>([]);
	const [stats, setStats] = useState<ClientStats>({
		totalClients: 0,
		totalBudgets: 0,
		totalSold: 0,
		soldAmountArs: 0,
		soldAmountUsd: 0,
		averageBudgetsPerClient: 0,
		conversionRate: 0,
	});

	const {
		data: clients,
		loading: internalLoading,
		refresh,
	} = useOptimizedRealtime<ClientWithFirstBudget>(
		'clients',
		async () => {
			const { data } = await getClientsWithFirstBudget();
			return data ?? [];
		},
		'clients_report_cache'
	);

	const loading = externalLoading || internalLoading;

	// Get available years from client data
	const availableYears = useMemo(() => {
		if (!clients?.length) return [];
		const years = new Set<number>();
		clients.forEach((client) => {
			if (client.first_budget_date) {
				years.add(new Date(client.first_budget_date).getFullYear());
			}
		});
		return Array.from(years).sort((a, b) => b - a);
	}, [clients]);

	const isInitialLoad = useRef(true);
	// Set default year to current year if available
	useEffect(() => {
		if (availableYears.length > 0 && yearFilter === 'all' && isInitialLoad.current) {
			isInitialLoad.current = false;
			const currentYear = new Date().getFullYear();
			if (availableYears.includes(currentYear)) {
				setYearFilter(String(currentYear));
			} else {
				setYearFilter(String(availableYears[0]));
			}
		}
	}, [availableYears]);

	useEffect(() => {
		if (!clients?.length) {
			setChartData([]);
			setStats({
				totalClients: 0,
				totalBudgets: 0,
				totalSold: 0,
				soldAmountArs: 0,
				soldAmountUsd: 0,
				averageBudgetsPerClient: 0,
				conversionRate: 0,
			});
			return;
		}

		// Filter clients by year if selected
		const filteredClients =
			yearFilter === 'all'
				? clients
				: clients.filter((client) => {
						if (!client.first_budget_date) return false;
						return new Date(client.first_budget_date).getFullYear() === Number(yearFilter);
					});

		// Calculate stats
		const totalClients = filteredClients.length;
		const totalBudgets = filteredClients.reduce((sum, c) => sum + (c.budget_count || 0), 0);
		const totalSold = filteredClients.reduce((sum, c) => sum + (c.sold_budgets_count || 0), 0);
		const soldAmountArs = filteredClients.reduce((sum, c) => sum + (c.sold_amount_ars || 0), 0);
		const soldAmountUsd = filteredClients.reduce((sum, c) => sum + (c.sold_amount_usd || 0), 0);
		const averageBudgetsPerClient = totalClients > 0 ? totalBudgets / totalClients : 0;
		const conversionRate = totalBudgets > 0 ? (totalSold / totalBudgets) * 100 : 0;

		setStats({
			totalClients,
			totalBudgets,
			totalSold,
			soldAmountArs,
			soldAmountUsd,
			averageBudgetsPerClient: Number(averageBudgetsPerClient.toFixed(1)),
			conversionRate: Number(conversionRate.toFixed(1)),
		});

		// Build chart data - group clients by month
		const monthMap = new Map<string, number>();
		months.forEach((month) => monthMap.set(month, 0));

		filteredClients.forEach((client) => {
			if (client.first_budget_date) {
				const date = new Date(client.first_budget_date);
				const monthIndex = date.getMonth();
				const monthName = months[monthIndex];
				monthMap.set(monthName, (monthMap.get(monthName) || 0) + 1);
			}
		});

		const chartData: ClientChartData[] = months.map((month) => ({
			month,
			clients: monthMap.get(month) || 0,
		}));

		setChartData(chartData);
	}, [clients, yearFilter]);

	const getBarColor = (index: number) => {
		const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#eab308', '#22c55e'];
		return colors[index % colors.length];
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground text-balance">Reporte de Clientes</h2>
					<p className="text-muted-foreground mt-1">
						Análisis de adquisición y conversión de clientes
					</p>
				</div>

				<div className="flex gap-2">
					<Select value={yearFilter} onValueChange={setYearFilter}>
						<SelectTrigger className="w-full sm:w-[140px]">
							<SelectValue placeholder="Año" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todos los años</SelectItem>
							{availableYears.map((year) => (
								<SelectItem key={year} value={String(year)}>
									{year}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Button variant="outline" onClick={() => refresh()} className="gap-2">
						<RefreshCw className="h-4 w-4" />
						Actualizar
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card className="p-4 sm:p-6">
					<div className="flex items-center gap-4">
						<div className="p-3 bg-blue-500/10 rounded-lg">
							<Users className="h-6 w-6 text-blue-500" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Total Clientes</p>
							<p className="text-2xl font-bold">{stats.totalClients}</p>
						</div>
					</div>
				</Card>

				<Card className="p-4 sm:p-6">
					<div className="flex items-center gap-4">
						<div className="p-3 bg-purple-500/10 rounded-lg">
							<TrendingUp className="h-6 w-6 text-purple-500" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Total Presupuestos</p>
							<p className="text-2xl font-bold">{stats.totalBudgets}</p>
						</div>
					</div>
				</Card>

				<Card className="p-4 sm:p-6">
					<div className="flex items-center gap-4">
						<div className="p-3 bg-green-500/10 rounded-lg">
							<DollarSign className="h-6 w-6 text-green-500" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Vendidos</p>
							<p className="text-2xl font-bold">{stats.totalSold}</p>
						</div>
					</div>
				</Card>

				<Card className="p-4 sm:p-6">
					<div className="flex items-center gap-4">
						<div className="p-3 bg-orange-500/10 rounded-lg">
							<Calendar className="h-6 w-6 text-orange-500" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Prom. Presupuestos/Cliente</p>
							<p className="text-2xl font-bold">{stats.averageBudgetsPerClient}</p>
						</div>
					</div>
				</Card>

				<Card className="p-4 sm:p-6">
					<div className="flex items-center gap-4">
						<div className="p-3 bg-emerald-500/10 rounded-lg">
							<TrendingUp className="h-6 w-6 text-emerald-500" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Tasa de Conversión</p>
							<p className="text-2xl font-bold">{stats.conversionRate}%</p>
						</div>
					</div>
				</Card>

				<Card className="p-4 sm:p-6">
					<div className="flex items-center gap-4">
						<div className="p-3 bg-cyan-500/10 rounded-lg">
							<DollarSign className="h-6 w-6 text-cyan-500" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Monto Vendido ARS</p>
							<p className="text-2xl font-bold">{formatCurrency(stats.soldAmountArs)}</p>
						</div>
					</div>
				</Card>
			</div>

			{/* Chart */}
			<Card className="p-4 sm:p-6">
				<h3 className="text-base sm:text-lg font-semibold mb-4">Clientes por mes</h3>
				{loading ? (
					<div className="h-[300px] flex items-center justify-center">
						<p className="text-muted-foreground">Cargando datos...</p>
					</div>
				) : chartData.length === 0 ? (
					<div className="h-[300px] flex items-center justify-center">
						<p className="text-muted-foreground">No hay datos disponibles</p>
					</div>
				) : (
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
							<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
							<XAxis dataKey="month" className="text-sm" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
							<YAxis className="text-sm" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
							<Tooltip
								contentStyle={{
									backgroundColor: 'hsl(var(--card))',
									border: '1px solid hsl(var(--border))',
									borderRadius: '8px',
								}}
								itemStyle={{ color: 'hsl(var(--foreground))' }}
							/>
							<Bar dataKey="clients" name="Clientes" radius={[4, 4, 0, 0]}>
								{chartData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={getBarColor(index)} />
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				)}
			</Card>
		</div>
	);
}
