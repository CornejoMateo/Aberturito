import { AlertCircle, CheckCircle2, Clock, List } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { StatusFilter } from '@/constants/type-config';

interface StatsCardsWorksProps {
	stats: {
		totalCount: number;
		pendingCount: number;
		inProgressCount: number;
		completedCount: number;
	};
	statusFilter: StatusFilter;
	onStatusFilterChange: (filter: StatusFilter) => void;
}

export function StatsCardsWorks({
	stats,
	statusFilter,
	onStatusFilterChange,
}: StatsCardsWorksProps) {
	const handleStatusFilter = (filter: StatusFilter) => {
		onStatusFilterChange(filter);
	};

	return (
		<div className="space-y-4">
			{/* Stats */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card
					className={cn(
						'p-6 bg-card border-border cursor-pointer transition-all hover:shadow-md',
						statusFilter === 'all' ? 'ring-2 ring-primary' : ''
					)}
					onClick={() => handleStatusFilter('all')}
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Todas</p>
							<p className="text-2xl font-bold text-foreground mt-}2">{stats.totalCount}</p>
						</div>
						<div className="rounded-lg bg-secondary p-3 text-foreground/80">
							<List className="h-6 w-6" />
						</div>
					</div>
				</Card>
				<Card
					className={cn(
						'p-6 bg-card border-border cursor-pointer transition-all hover:shadow-md',
						statusFilter === 'pending' ? 'ring-2 ring-chart-3' : ''
					)}
					onClick={() => handleStatusFilter('pending')}
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Pendientes</p>
							<p className="text-2xl font-bold text-foreground mt-2">{stats.pendingCount}</p>
						</div>
						<div className="rounded-lg bg-secondary p-3 text-chart-3">
							<Clock className="h-6 w-6" />
						</div>
					</div>
				</Card>
				<Card
					className={cn(
						'p-6 bg-card border-border cursor-pointer transition-all hover:shadow-md',
						statusFilter === 'in_progress' ? 'ring-2 ring-chart-1' : ''
					)}
					onClick={() => handleStatusFilter('in_progress')}
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">En progreso</p>
							<p className="text-2xl font-bold text-foreground mt-2">{stats.inProgressCount}</p>
						</div>
						<div className="rounded-lg bg-secondary p-3 text-chart-1">
							<AlertCircle className="h-6 w-6" />
						</div>
					</div>
				</Card>
				<Card
					className={cn(
						'p-6 bg-card border-border cursor-pointer transition-all hover:shadow-md',
						statusFilter === 'completed' ? 'ring-2 ring-accent' : ''
					)}
					onClick={() => handleStatusFilter('completed')}
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Finalizadas</p>
							<p className="text-2xl font-bold text-foreground mt-2">{stats.completedCount}</p>
						</div>
						<div className="rounded-lg bg-secondary p-3 text-accent">
							<CheckCircle2 className="h-6 w-6" />
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
