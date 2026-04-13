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
	XAxis,
	YAxis,
	CartesianGrid,
} from 'recharts';
import { SalesMetrics } from '../../../lib/budgets/types';
import { CONTACT_METHODS } from '@/constants/budgets/contact-methods';
import { COLORS } from '@/constants/budgets/colors';

interface SourcesAndMaterialsTabProps {
	metrics: SalesMetrics;
	loading: boolean;
}

export function SourcesAndMaterialsTab({ metrics, loading }: SourcesAndMaterialsTabProps) {
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

	return (
		<TabsContent value="sources" className="space-y-4">
			{/* Charts Section */}
			<div className="grid gap-4 md:grid-cols-2">
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
