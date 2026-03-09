'use client';

import { Card } from '@/components/ui/card';
import {
	BarChart3,
	Download,
	TrendingUp,
	Users,
	FileText,
	Package,
	DollarSign,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

// Datos dinámicos - se conectarán con APIs reales
interface SalesMetrics {
  totalClients: number;
  totalBudgets: number;
  totalSales: number;
  totalRevenue: number;
  conversionRate: number;
  averageTicket: number;
}

interface MonthlyData {
  month: string;
  clients: number;
  budgets: number;
  sales: number;
  revenue: number;
}

interface LocationData {
  location: string;
  clients: number;
  percentage: number;
}

interface ConversionData {
  category: string;
  value: number;
  total: number;
  percentage: number;
}

export function ReportsView() {
	// Placeholder para datos dinámicos
	const metrics: SalesMetrics = {
		totalClients: 0,
		totalBudgets: 0,
		totalSales: 0,
		totalRevenue: 0,
		conversionRate: 0,
		averageTicket: 0,
	};

	const monthlyData: MonthlyData[] = [];
	const locationData: LocationData[] = [];
	const conversionData: ConversionData[] = [];
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
				<Card className="p-6 bg-card border-border">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Clientes totales</p>
							<p className="text-2xl font-bold text-foreground mt-2">{metrics.totalClients || '--'}</p>
							<p className="text-xs text-muted-foreground mt-1">
							{metrics.totalClients > 0 ? 'Datos disponibles' : 'Sin datos'}
						</p>
						</div>
						<div className="rounded-lg bg-secondary p-3 text-chart-1">
							<Users className="h-6 w-6" />
						</div>
					</div>
				</Card>

				<Card className="p-6 bg-card border-border">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Presupuestos</p>
							<p className="text-2xl font-bold text-foreground mt-2">{metrics.totalBudgets || '--'}</p>
							<p className="text-xs text-muted-foreground mt-1">
							{metrics.totalBudgets > 0 ? 'Datos disponibles' : 'Sin datos'}
						</p>
						</div>
						<div className="rounded-lg bg-secondary p-3 text-chart-2">
							<FileText className="h-6 w-6" />
						</div>
					</div>
				</Card>

				<Card className="p-6 bg-card border-border">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Ventas cerradas</p>
							<p className="text-2xl font-bold text-foreground mt-2">{metrics.totalSales || '--'}</p>
							<p className="text-xs text-muted-foreground mt-1">
							{metrics.totalSales > 0 ? 'Datos disponibles' : 'Sin datos'}
						</p>
						</div>
						<div className="rounded-lg bg-secondary p-3 text-chart-3">
							<Package className="h-6 w-6" />
						</div>
					</div>
				</Card>

				<Card className="p-6 bg-card border-border">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Facturación</p>
							<p className="text-2xl font-bold text-foreground mt-2">
							{metrics.totalRevenue > 0 ? `$${(metrics.totalRevenue / 1000000).toFixed(1)}M` : '--'}
						</p>
							<p className="text-xs text-muted-foreground mt-1">
							{metrics.totalRevenue > 0 ? 'Datos disponibles' : 'Sin datos'}
						</p>
						</div>
						<div className="rounded-lg bg-secondary p-3 text-chart-4">
							<DollarSign className="h-6 w-6" />
						</div>
					</div>
				</Card>
			</div>

			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList className="bg-card border border-border">
					<TabsTrigger value="overview">Resumen de Ventas</TabsTrigger>
					<TabsTrigger value="performance">Rendimiento</TabsTrigger>
					<TabsTrigger value="conversion">Conversión</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4">
					<Card className="p-6 bg-card border-border">
						<h3 className="text-lg font-semibold text-foreground mb-6">Resumen de Ventas</h3>
						<div className="text-center py-12">
							<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-muted-foreground">No hay datos disponibles para mostrar</p>
							<p className="text-sm text-muted-foreground mt-2">Conecta las fuentes de datos para ver el resumen de ventas</p>
						</div>
					</Card>

					<div className="grid gap-4 md:grid-cols-2">
						<Card className="p-6 bg-card border-border">
							<h3 className="text-lg font-semibold text-foreground mb-4">Tasa de conversión</h3>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Presupuestos → Ventas</span>
									<span className="text-2xl font-bold text-foreground">{metrics.conversionRate > 0 ? `${metrics.conversionRate}%` : '--'}</span>
								</div>
								<Progress value={metrics.conversionRate} className="h-3" />
								<p className="text-xs text-muted-foreground">
									{metrics.totalBudgets > 0 ? `${metrics.totalSales} de ${metrics.totalBudgets} presupuestos convertidos` : 'Sin datos para calcular'}
								</p>
							</div>
						</Card>

						<Card className="p-6 bg-card border-border">
							<h3 className="text-lg font-semibold text-foreground mb-4">Ticket promedio</h3>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Por venta</span>
									<span className="text-2xl font-bold text-foreground">
										{metrics.averageTicket > 0 ? `$${(metrics.averageTicket / 1000).toFixed(0)}k` : '--'}
									</span>
								</div>
								<Progress value={metrics.averageTicket > 0 ? Math.min((metrics.averageTicket / 50000) * 100, 100) : 0} className="h-3" />
								<p className="text-xs text-muted-foreground">
									{metrics.totalSales > 0 ? `Basado en ${metrics.totalSales} ventas` : 'Sin datos para calcular'}
								</p>
							</div>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="performance" className="space-y-4">
					<Card className="p-6 bg-card border-border">
						<h3 className="text-lg font-semibold text-foreground mb-6">Rendimiento de Ventas</h3>
						<div className="text-center py-12">
							<BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-muted-foreground">No hay datos de rendimiento disponibles</p>
							<p className="text-sm text-muted-foreground mt-2">Conecta las fuentes de datos para ver métricas de rendimiento</p>
						</div>
					</Card>

					<div className="grid gap-4 md:grid-cols-3">
						<Card className="p-6 bg-card border-border">
							<div className="space-y-2">
								<p className="text-sm text-muted-foreground">Presupuestos del mes</p>
								<p className="text-3xl font-bold text-foreground">{metrics.totalBudgets || '--'}</p>
								<p className="text-xs text-muted-foreground">
									{metrics.totalBudgets > 0 ? 'Datos del mes actual' : 'Sin datos'}
								</p>
							</div>
						</Card>

						<Card className="p-6 bg-card border-border">
							<div className="space-y-2">
								<p className="text-sm text-muted-foreground">Ventas cerradas</p>
								<p className="text-3xl font-bold text-foreground">{metrics.totalSales || '--'}</p>
								<p className="text-xs text-muted-foreground">
									{metrics.totalSales > 0 ? 'Ventas del mes actual' : 'Sin datos'}
								</p>
							</div>
						</Card>

						<Card className="p-6 bg-card border-border">
							<div className="space-y-2">
								<p className="text-sm text-muted-foreground">Facturación mensual</p>
								<p className="text-3xl font-bold text-foreground">
									{metrics.totalRevenue > 0 ? `$${(metrics.totalRevenue / 1000000).toFixed(1)}M` : '--'}
								</p>
								<p className="text-xs text-muted-foreground">
									{metrics.totalRevenue > 0 ? 'Facturación del mes' : 'Sin datos'}
								</p>
							</div>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="conversion" className="space-y-4">
					<Card className="p-6 bg-card border-border">
						<h3 className="text-lg font-semibold text-foreground mb-6">Embudo de Conversión</h3>
						<div className="text-center py-12">
							<TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-muted-foreground">No hay datos de conversión disponibles</p>
							<p className="text-sm text-muted-foreground mt-2">Conecta las fuentes de datos para ver el embudo de conversión</p>
						</div>
					</Card>

					<div className="grid gap-4 md:grid-cols-3">
						<Card className="p-6 bg-card border-border">
							<div className="space-y-2">
								<p className="text-sm text-muted-foreground">Tasa de aceptación</p>
								<p className="text-3xl font-bold text-foreground">{metrics.conversionRate > 0 ? `${metrics.conversionRate}%` : '--'}</p>
								<p className="text-xs text-muted-foreground">
									{metrics.totalBudgets > 0 ? 'Presupuestos aceptados' : 'Sin datos'}
								</p>
							</div>
						</Card>

						<Card className="p-6 bg-card border-border">
							<div className="space-y-2">
								<p className="text-sm text-muted-foreground">Tasa de finalización</p>
								<p className="text-3xl font-bold text-foreground">--</p>
								<p className="text-xs text-muted-foreground">
									Obras completadas vs aceptadas
								</p>
							</div>
						</Card>

						<Card className="p-6 bg-card border-border">
							<div className="space-y-2">
								<p className="text-sm text-muted-foreground">Conversión total</p>
								<p className="text-3xl font-bold text-foreground">{metrics.conversionRate > 0 ? `${metrics.conversionRate}%` : '--'}</p>
								<p className="text-xs text-muted-foreground">
									{metrics.totalBudgets > 0 ? 'Del presupuesto a la venta final' : 'Sin datos'}
								</p>
							</div>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
