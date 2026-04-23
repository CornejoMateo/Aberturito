'use client';

import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Legend,
	Tooltip,
	BarChart,
	Bar,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
} from 'recharts';
import { SalesMetrics } from '../../../lib/budgets/types';
import { CONTACT_METHODS } from '@/constants/budgets/contact-methods';
import { COLORS } from '@/constants/budgets/colors';
import { ConversionRateCard } from '../conversion-rate-card';

interface SourcesAndMaterialsTabProps {
	metrics: SalesMetrics;
	loading: boolean;
}

export function SourcesAndMaterialsTab({ metrics, loading }: SourcesAndMaterialsTabProps) {

	const getMaterialCount = (materials: Array<{ material: string; count: number }>, aliases: string) => {
		const materialEntry = materials.find(item => aliases.includes(item.material));
		return materialEntry ? materialEntry.count : 0;
	};

	const contactMethodLabels: Record<string, string> = CONTACT_METHODS.reduce(
		(acc, method) => {
			acc[method.value] = method.label;
			return acc;
		},
		{} as Record<string, string>
	);

	const formatContactMethodData = metrics.clientsByContactMethod.map((item) => ({
		name: `${contactMethodLabels[item.method] || item.method}`,
		value: item.count,
	}));

	const aluminumBudgeted = getMaterialCount(metrics.budgetsByMaterial || [], 'Aluminio');
	const aluminumSold = getMaterialCount(metrics.soldBudgetsByMaterial || [], 'Aluminio');
	const pvcBudgeted = getMaterialCount(metrics.budgetsByMaterial || [], 'PVC');
	const pvcSold = getMaterialCount(metrics.soldBudgetsByMaterial || [], 'PVC');

	const conversionByMaterial = [
		{
			material: 'PVC',
			budgeted: pvcBudgeted,
			sold: pvcSold,
			rate: pvcBudgeted > 0 ? (pvcSold / pvcBudgeted) * 100 : 0,
		},
		{
			material: 'Aluminio',
			budgeted: aluminumBudgeted,
			sold: aluminumSold,
			rate: aluminumBudgeted > 0 ? (aluminumSold / aluminumBudgeted) * 100 : 0,
		},
	];

	const soldByMaterialByMonthData =
		metrics.soldBudgetsByMaterialByMonth && metrics.soldBudgetsByMaterialByMonth.length > 0
			? metrics.soldBudgetsByMaterialByMonth
			: [
					{ month: 'Ene', pvc: 0, aluminio: 0 },
					{ month: 'Feb', pvc: 0, aluminio: 0 },
					{ month: 'Mar', pvc: 0, aluminio: 0 },
					{ month: 'Abr', pvc: 0, aluminio: 0 },
					{ month: 'May', pvc: 0, aluminio: 0 },
					{ month: 'Jun', pvc: 0, aluminio: 0 },
					{ month: 'Jul', pvc: 0, aluminio: 0 },
					{ month: 'Ago', pvc: 0, aluminio: 0 },
					{ month: 'Sep', pvc: 0, aluminio: 0 },
					{ month: 'Oct', pvc: 0, aluminio: 0 },
					{ month: 'Nov', pvc: 0, aluminio: 0 },
					{ month: 'Dic', pvc: 0, aluminio: 0 },
				];

	return (
		<TabsContent value="sources" className="space-y-4">
			{/* Charts Section */}
			<div className="grid gap-4 md:grid-cols-1">
				{/* Material Distribution Chart */}
				<Card className="p-6 bg-card border-border">
					<h3 className="text-lg font-semibold text-foreground mb-6">
						Distribución de presupuestos por material
					</h3>
					{metrics.budgetsByMaterial && metrics.budgetsByMaterial.length > 0 ? (
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={metrics.budgetsByMaterial}>
								<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
								<XAxis dataKey="material" interval={0} />
								<YAxis />
								<Tooltip formatter={(value) => `${value} presupuestos`} />
								<Bar dataKey="count" fill="#06b6d4" name="Presupuestos" radius={[8, 8, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					) : (
						<div className="h-[300px] flex items-center justify-center text-muted-foreground">
							<p>Sin datos disponibles</p>
						</div>
					)}
				</Card>

        		{/* Sold Budgets Material Distribution Chart */}
				<Card className="p-6 bg-card border-border">
					<h3 className="text-lg font-semibold text-foreground mb-6">
						Distribución de presupuestos vendidos por material
					</h3>
					{metrics.soldBudgetsByMaterial && metrics.soldBudgetsByMaterial.length > 0 ? (
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={metrics.soldBudgetsByMaterial}>
								<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
								<XAxis dataKey="material"  interval={0}/>
								<YAxis />
								<Tooltip formatter={(value) => `${value} presupuestos vendidos`} />
								<Bar
									dataKey="count"
									fill="#10b981"
									name="Presupuestos vendidos"
									radius={[8, 8, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					) : (
						<div className="h-[300px] flex items-center justify-center text-muted-foreground">
							<p>Sin datos disponibles</p>
						</div>
					)}
				</Card>

			</div>

			<Card className="p-6 bg-card border-border">
				<h3 className="text-lg font-semibold text-foreground mb-2">
					Presupuestos vendidos por mes (PVC vs Aluminio)
				</h3>
				<p className="text-xs text-muted-foreground mb-4">
					Evolución mensual de ventas por material
				</p>
				{metrics.totalSales > 0 ? (
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={soldByMaterialByMonthData}>
							<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
							<XAxis dataKey="month" />
							<YAxis />
							<Tooltip formatter={(value) => Math.round(value as number)} />
							<Legend />
							<Line
								type="monotone"
								dataKey="pvc"
								stroke="#10b981"
								strokeWidth={2}
								dot={{ fill: '#10b981', r: 4 }}
								activeDot={{ r: 6 }}
								name="PVC"
							/>
							<Line
								type="monotone"
								dataKey="aluminio"
								stroke="#8b5cf6"
								strokeWidth={2}
								dot={{ fill: '#8b5cf6', r: 4 }}
								activeDot={{ r: 6 }}
								name="Aluminio"
							/>
						</LineChart>
					</ResponsiveContainer>
				) : (
					<div className="h-[300px] flex items-center justify-center text-muted-foreground">
						<p>Sin datos disponibles</p>
					</div>
				)}
			</Card>

			<div className="grid gap-4 md:grid-cols-2">
				{conversionByMaterial.map((item) => (
					<ConversionRateCard
						key={item.material}
						title={`Tasa de concreción ${item.material}`}
						label="Presupuestos -> Vendidos"
						conversionRate={item.rate}
						totalBudgets={item.budgeted}
						totalSales={item.sold}
					/>
				))}
			</div>

			<div className="grid gap-4 md:grid-cols-2">

        		{/* Contact Method Chart */}
				<Card className="p-6 bg-card border-border">
					<h3 className="text-lg font-semibold text-foreground mb-6">
						Clientes por medio de contacto
					</h3>
					{formatContactMethodData && formatContactMethodData.length > 0 ? (
						<ResponsiveContainer width="100%" height={300}>
							<PieChart>
								<Pie
									data={formatContactMethodData}
									cx="50%"
									cy="45%"
									labelLine={false}
									outerRadius={80}
									fill="#8884d8"
									dataKey="value"
									nameKey="name"
								>
									{formatContactMethodData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
									))}
								</Pie>
								<Tooltip formatter={(value) => `${value}`} />
								<Legend
									formatter={(value, entry) => `${value} (${entry.payload?.value})`}
								/>
							</PieChart>
						</ResponsiveContainer>
					) : (
						<div className="h-[300px] flex items-center justify-center text-muted-foreground">
							<p>Sin datos disponibles</p>
						</div>
					)}
				</Card>

				{/* Statistics Cards */}
				<div className="grid gap-4 md:grid-cols-1">

					<Card className="p-6 bg-card border-border hover:shadow-md transition-shadow">
						<div className="space-y-2">
							<p className="text-sm font-medium text-muted-foreground">
								Material más presupuestado
							</p>
							<p className="text-3xl font-bold text-foreground">
								{metrics.budgetsByMaterial && metrics.budgetsByMaterial.length > 0
									? metrics.budgetsByMaterial[0].material
									: '--'}
							</p>
							<p className="text-xs text-muted-foreground">
								{metrics.budgetsByMaterial && metrics.budgetsByMaterial.length > 0
									? `${metrics.budgetsByMaterial[0].count} presupuestos`
									: 'Sin datos'}
							</p>
						</div>
					</Card>

					<Card className="p-6 bg-card border-border hover:shadow-md transition-shadow">
						<div className="space-y-2">
							<p className="text-sm font-medium text-muted-foreground">Material más vendido</p>
							<p className="text-3xl font-bold text-foreground">
								{metrics.soldBudgetsByMaterial && metrics.soldBudgetsByMaterial.length > 0
									? metrics.soldBudgetsByMaterial[0].material
									: '--'}
							</p>
							<p className="text-xs text-muted-foreground">
								{metrics.soldBudgetsByMaterial && metrics.soldBudgetsByMaterial.length > 0
									? `${metrics.soldBudgetsByMaterial[0].count} presupuestos vendidos`
									: 'Sin datos'}
							</p>
						</div>
					</Card>

          			<Card className="p-6 bg-card border-border hover:shadow-md transition-shadow">
						<div className="space-y-2">
							<p className="text-sm font-medium text-muted-foreground">
								Medio de Contacto principal
							</p>
							<p className="text-3xl font-bold text-foreground">
								{formatContactMethodData && formatContactMethodData.length > 0
									? formatContactMethodData[0].name.split(':')[0]
									: '--'}
							</p>
							<p className="text-xs text-muted-foreground">
								{formatContactMethodData && formatContactMethodData.length > 0
									? `${formatContactMethodData[0].value} clientes`
									: 'Sin datos'}
							</p>
						</div>
					</Card>

				</div>
			</div>
		</TabsContent>
	);
}
