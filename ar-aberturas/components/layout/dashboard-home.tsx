import { Card } from '@/components/ui/card';
import { useLoadEvents } from '@/hooks/use-load-events';
import { useEffect, useState } from 'react';
import { getClientsCount } from '@/lib/clients/clients';
import { getWorksInProgressCount } from '@/lib/works/works';
import { getSoldBudgetsCount, getLostBudgetsCount } from '@/lib/budgets/budgets';

export function DashboardHome() {
	const { events, isLoading } = useLoadEvents();
	const overdueEvents = events.filter((event) => event.is_overdue === true);
	const [totalClients, setTotalClients] = useState(0);
	const [worksInProgress, setWorksInProgress] = useState(0);
	const [soldBudgets, setSoldBudgets] = useState(0);
	const [lostBudgets, setLostBudgets] = useState(0);

	useEffect(() => {
		let isMounted = true;

		const fetchCounts = async () => {
			const [clientsResult, worksResult, budgetsSoldResult, budgetsLostResult] = await Promise.all([
				getClientsCount(),
				getWorksInProgressCount(),
				getSoldBudgetsCount(),
				getLostBudgetsCount(),
			]);

			if (!isMounted) return;

			if (!clientsResult.error && clientsResult.data !== null) {
				setTotalClients(clientsResult.data);
			}
			if (!worksResult.error && worksResult.data !== null) {
				setWorksInProgress(worksResult.data);
			}
			if (!budgetsSoldResult.error && budgetsSoldResult.data !== null) {
				setSoldBudgets(budgetsSoldResult.data);
			}
			if (!budgetsLostResult.error && budgetsLostResult.data !== null) {
				setLostBudgets(budgetsLostResult.data);
			}
		};

		fetchCounts();

		return () => {
			isMounted = false;
		};
	}, []);

	const [displayedCount, setDisplayedCount] = useState(5);

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

		if (scrollTop + clientHeight >= scrollHeight - 20) {
			setDisplayedCount((prev) => Math.min(prev + 5, overdueEvents.length));
		}
	};

	const visibleEvents = overdueEvents.slice(0, displayedCount);

	return (
		<div className="space-y-6">
			{/* Welcome section */}
			<div>
				<h2 className="text-2xl font-bold text-foreground text-balance">
					Bienvenido al Sistema de Gestión
				</h2>
				<p className="text-muted-foreground mt-1">Resumen de actividades y alertas</p>
			</div>

			<div className="grid gap-4 lg:grid-cols-3">
				<Card className="p-4">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-sm font-medium text-muted-foreground">Eventos vencidos</h3>
						<span className="text-xs rounded-full bg-red-500/10 text-red-600 px-2 py-0.5">
							{overdueEvents.length}
						</span>
					</div>

					<div className="space-y-3 max-h-[500px] overflow-y-auto" onScroll={handleScroll}>
						{isLoading ? (
							<p className="text-sm text-muted-foreground">Cargando eventos...</p>
						) : overdueEvents.length > 0 ? (
							visibleEvents.map((event) => (
								<div
									key={event.id}
									className="group flex gap-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 transition hover:bg-red-500/10"
								>
									<p>-</p>

									<div className="flex-1 space-y-1 min-w-0">
										<div className="flex items-center justify-between gap-2">
											<p className="text-sm font-medium truncate">{event.title}</p>
											<span className="text-xs rounded-md bg-background px-2 py-0.5 text-muted-foreground border">
												{event.type}
											</span>
										</div>

										<p className="text-sm text-muted-foreground truncate">{event.client}</p>

										<p className="text-xs text-muted-foreground truncate">
											{event.location} · {event.address}
										</p>

										<p className="text-xs text-red-600 pt-1">Venció el {event.date}</p>
									</div>
								</div>
							))
						) : (
							<p className="text-sm text-muted-foreground text-center">No hay eventos vencidos</p>
						)}
					</div>
				</Card>

				<div className="lg:col-span-2 grid grid-cols-2 gap-4">
					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Clientes activos</p>
								<p className="text-2xl font-bold text-foreground mt-2">{totalClients}</p>
							</div>
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Presupuestos vendidos</p>
								<p className="text-2xl font-bold text-foreground mt-2">{soldBudgets}</p>
							</div>
						</div>
					</Card>

					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Obras en curso</p>
								<p className="text-2xl font-bold text-foreground mt-2">{worksInProgress}</p>
							</div>
						</div>
					</Card>

					{/* Cambiar esto por otra cosa, no sabemos que poner todavia */}
					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Presupuestos perdidos</p>
								<p className="text-2xl font-bold text-foreground mt-2">{lostBudgets}</p>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
