import { Card } from '@/components/ui/card';
import { Package, Users, FileText, ClipboardCheck, TrendingUp, AlertCircle } from 'lucide-react';

const stats = [
	{
		name: 'Stock total',
		value: '',
		change: '',
		icon: Package,
		color: 'text-chart-1',
	},
	{
		name: 'Clientes activos',
		value: '',
		change: '',
		icon: Users,
		color: 'text-chart-2',
	},
	{
		name: 'Presupuestos',
		value: '',
		change: '',
		icon: FileText,
		color: 'text-chart-3',
	},
	{
		name: 'Obras en curso',
		value: '',
		change: '',
		icon: ClipboardCheck,
		color: 'text-chart-4',
	},
];

const recentActivity = [
	{
		title: '',
		description: '',
		time: '',
	},
	{
		title: '',
		description: '',
		time: '',
	},
	{
		title: '',
		description: '',
		time: '',
	},
];

const alerts = [
	{
		title: '',
		description: '',
		type: '',
	},
];

export function DashboardHome() {
	return (
		<div className="space-y-6">
			{/* Welcome section */}
			<div>
				<h2 className="text-2xl font-bold text-foreground text-balance">
					Bienvenido al Sistema de Gestión
				</h2>
				<p className="text-muted-foreground mt-1">Resumen de actividades y métricas principales</p>
				<h2 className="text-2xl font-bold text-foreground text-balance">
					Módulo opcional
				</h2>
			</div>

			{/* Stats grid
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat) => (
					<Card key={stat.name} className="p-6 bg-card border-border">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
								<p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
								<p className="text-xs text-accent mt-1 flex items-center gap-1">
									<TrendingUp className="h-3 w-3" />
									{stat.change}
								</p>
							</div>
							<div className={`rounded-lg bg-secondary p-3 ${stat.color}`}>
								<stat.icon className="h-6 w-6" />
							</div>
						</div>
					</Card>
				))}
			</div>
			*/}

			{/* Recent activity and alerts
			<div className="grid gap-6 lg:grid-cols-2">
				<Card className="p-6 bg-card border-border">
					<h3 className="text-lg font-semibold text-foreground mb-4">Actividad reciente</h3>
					<div className="space-y-4">
						{recentActivity.map((activity, index) => (
							<div key={index} className="flex gap-4">
								<div className="flex h-2 w-2 mt-2 rounded-full bg-primary" />
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-foreground">{activity.title}</p>
									<p className="text-sm text-muted-foreground truncate">{activity.description}</p>
									<p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
								</div>
							</div>
						))}
					</div>
				</Card>

				<Card className="p-6 bg-card border-border">
					<h3 className="text-lg font-semibold text-foreground mb-4">Alertas y notificaciones</h3>
					<div className="space-y-4">
						{alerts.map((alert, index) => (
							<div
								key={index}
								className="flex gap-3 rounded-lg bg-secondary p-4 border border-border"
							>
								<AlertCircle
									className={`h-5 w-5 flex-shrink-0 ${alert.type === 'warning' ? 'text-chart-3' : 'text-chart-1'}`}
								/>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-foreground">{alert.title}</p>
									<p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
								</div>
							</div>
						))}
					</div>
				</Card>
			</div>
			*/}
		</div>
	);
}
