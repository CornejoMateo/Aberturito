'use client';

import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getClientsCount } from '@/lib/clients/clients';
import { getBudgetsCount, getBudgetsTotalAmount, getSoldBudgetsCount, getChosenBudgetsCount, getSoldBudgetsTotalAmount, getChosenBudgetsTotalAmount } from '@/lib/budgets/budgets';

// Datos dinámicos - se conectarán con APIs reales
interface SalesMetrics {
  totalClients: number;
  totalBudgets: number;
  totalSales: number;
  totalRevenue: number;
  conversionRate: number;
  averageTicket: number;
  soldAverageTicket: number;
  chosenAverageTicket: number;
  totalAverageTicket: number;
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

export function BudgetManagement() {
	// Placeholder para datos dinámicos
	const [metrics, setMetrics] = useState<SalesMetrics>({
		totalClients: 0,
		totalBudgets: 0,
		totalSales: 0,
		totalRevenue: 0,
		conversionRate: 0,
		averageTicket: 0,
		soldAverageTicket: 0,
		chosenAverageTicket: 0,
		totalAverageTicket: 0,
	});

	const [loading, setLoading] = useState(true);
	const [ticketType, setTicketType] = useState<'sold' | 'chosen' | 'total'>('sold');

	const ticketTypes = [
		{ id: 'sold', label: 'Vendidos', description: 'Presupuestos vendidos' },
		{ id: 'chosen', label: 'Elegidos', description: 'Presupuestos elegidos' },
		{ id: 'total', label: 'General', description: 'Todos los presupuestos' }
	] as const;

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

	// Obtener cantidad de clientes y presupuestos
	useEffect(() => {
		const fetchMetrics = async () => {
			try {
				// Obtener clientes
				const { data: clientsCount, error: clientsError } = await getClientsCount();
				if (!clientsError && clientsCount !== null) {
					setMetrics(prev => ({ ...prev, totalClients: clientsCount }));
				}

				// Obtener presupuestos totales
				const { data: budgetsCount, error: budgetsError } = await getBudgetsCount();
				if (!budgetsError && budgetsCount !== null) {
					setMetrics(prev => ({ ...prev, totalBudgets: budgetsCount }));
				}

				// Obtener presupuestos vendidos
				const { data: soldBudgetsCount, error: soldError } = await getSoldBudgetsCount();
				if (!soldError && soldBudgetsCount !== null) {
					setMetrics(prev => ({ 
						...prev, 
						totalSales: soldBudgetsCount,
						conversionRate: budgetsCount > 0 ? Math.round((soldBudgetsCount / budgetsCount) * 100) : 0
					}));
				}

				// Obtener monto total de presupuestos vendidos
				const { data: soldAmounts, error: soldAmountError } = await getSoldBudgetsTotalAmount();
				if (!soldAmountError && soldAmounts) {
					const soldCount = await getSoldBudgetsCount();
					if (!soldCount.error && soldCount.data > 0) {
						setMetrics(prev => ({ 
							...prev, 
							soldAverageTicket: Math.round(soldAmounts.totalArs / soldCount.data)
						}));
					}
				}

				// Obtener monto total de presupuestos elegidos
				const { data: chosenAmounts, error: chosenAmountError } = await getChosenBudgetsTotalAmount();
				if (!chosenAmountError && chosenAmounts) {
					const chosenCount = await getChosenBudgetsCount();
					if (!chosenCount.error && chosenCount.data > 0) {
						setMetrics(prev => ({ 
							...prev, 
							chosenAverageTicket: Math.round(chosenAmounts.totalArs / chosenCount.data)
						}));
					}
				}

				// Obtener monto total de presupuestos generales
				const { data: totalAmounts, error: amountError } = await getBudgetsTotalAmount();
				if (!amountError && totalAmounts) {
					setMetrics(prev => ({ 
						...prev, 
						totalRevenue: totalAmounts.totalArs
					}));
					
					// Obtener ticket promedio general
					if (budgetsCount > 0) {
						setMetrics(prev => ({ 
							...prev, 
							totalAverageTicket: Math.round(totalAmounts.totalArs / budgetsCount)
						}));
					}
				}
			} catch (err) {
				console.error('Error fetching metrics:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchMetrics();
	}, []);

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
							<p className="text-2xl font-bold text-foreground mt-2">
							{loading ? '...' : metrics.totalClients}
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							{loading ? 'Cargando...' : metrics.totalClients > 0 ? 'Datos disponibles' : 'Sin datos'}
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
							<p className="text-2xl font-bold text-foreground mt-2">
							{loading ? '...' : metrics.totalBudgets}
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							{loading ? 'Cargando...' : metrics.totalBudgets > 0 ? 'Datos disponibles' : 'Sin datos'}
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
							<p className="text-2xl font-bold text-foreground mt-2">
							{loading ? '...' : metrics.totalSales}
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							{loading ? 'Cargando...' : metrics.totalSales > 0 ? 'Datos disponibles' : 'Sin datos'}
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
							{loading ? '...' : metrics.totalRevenue > 0 ? `$${(metrics.totalRevenue / 1000000).toFixed(1)}M` : '--'}
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							{loading ? 'Cargando...' : metrics.totalRevenue > 0 ? 'Datos disponibles' : 'Sin datos'}
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
							<h3 className="text-lg font-semibold text-foreground mb-4">Tasa de concreción</h3>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Presupuestos → Ventas</span>
									<span className="text-2xl font-bold text-foreground">{metrics.conversionRate > 0 ? `${metrics.conversionRate}%` : '--'}</span>
								</div>
								<Progress value={metrics.conversionRate} className="h-3" />
								<p className="text-xs text-muted-foreground">
									{metrics.totalBudgets > 0 ? `${metrics.totalSales} de ${metrics.totalBudgets} presupuestos concretados` : 'Sin datos para calcular'}
								</p>
							</div>
						</Card>

						<Card className="p-6 bg-card border-border">
							<h3 className="text-lg font-semibold text-foreground mb-4">Ticket promedio</h3>
							<div className="space-y-4">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm text-muted-foreground">{getCurrentTicketLabel()}</span>
									<div className="flex items-center gap-2">
										<Button
											variant="ghost"
											size="sm"
											onClick={handlePrevTicket}
											className="h-8 w-8 p-0"
										>
											<ChevronLeft className="h-4 w-4" />
										</Button>
										<span className="text-xs text-muted-foreground min-w-[60px] text-center">
											{ticketTypes.findIndex(t => t.id === ticketType) + 1} / {ticketTypes.length}
										</span>
										<Button
											variant="ghost"
											size="sm"
											onClick={handleNextTicket}
											className="h-8 w-8 p-0"
										>
											<ChevronRight className="h-4 w-4" />
										</Button>
									</div>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Por presupuesto</span>
									<span className="text-2xl font-bold text-foreground">
										{loading ? '...' : getCurrentTicketValue() > 0 ? `$${(getCurrentTicketValue() / 1000).toFixed(0)}k` : '--'}
									</span>
								</div>
								<Progress value={getCurrentTicketValue() > 0 ? Math.min((getCurrentTicketValue() / 50000) * 100, 100) : 0} className="h-3" />
								<p className="text-xs text-muted-foreground">
									{loading ? 'Cargando...' : getCurrentTicketValue() > 0 ? `Basado en ${ticketType === 'sold' ? 'presupuestos vendidos' : ticketType === 'chosen' ? 'presupuestos elegidos' : 'todos los presupuestos'}` : 'Sin datos para calcular'}
								</p>
								<div className="flex justify-center gap-1 mt-2">
									{ticketTypes.map((type, index) => (
										<button
											key={type.id}
											onClick={() => setTicketType(type.id)}
											className={`h-1 w-8 rounded-full transition-colors ${
												ticketType === type.id ? 'bg-primary' : 'bg-muted'
											}`}
										/>
									))}
								</div>
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
