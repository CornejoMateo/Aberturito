import { Card } from '@/components/ui/card';
import { Package, PackagePlus, AlertTriangle } from 'lucide-react';
import type { ProfileItemStock } from '@/lib/profile-stock';

interface StockStatsProps {
	totalItems: number;
	lowStockCount: number;
	lastAddedItem?: ProfileItemStock | null;
}

export function StockStats({ totalItems, lowStockCount, lastAddedItem }: StockStatsProps) {
	return (
		<div className="grid gap-4 md:grid-cols-3">
			<Card className="p-6 bg-card border-border">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-muted-foreground">Total items</p>
						<p className="text-2xl font-bold text-foreground mt-2">{totalItems}</p>
					</div>
					<div className="rounded-lg bg-secondary p-3 text-chart-1">
						<Package className="h-6 w-6" />
					</div>
				</div>
			</Card>
			<Card className="p-6 bg-card border-border">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-muted-foreground">Último agregado</p>
						{lastAddedItem ? (
							<div className="mt-2 space-y-1">
								<p className="text-sm font-medium text-foreground">
									{lastAddedItem.line || 'Sin código'}, {lastAddedItem.code || 'Sin código'}
								</p>
								<p className="text-xs text-muted-foreground">
									{lastAddedItem.color ? `${lastAddedItem.color} • ` : ''}
									{lastAddedItem.width ? `${lastAddedItem.width}mm` : ''}
								</p>
							</div>
						) : (
							<p className="text-sm text-muted-foreground mt-2">No hay registros</p>
						)}
					</div>
					<div className="rounded-lg bg-secondary p-3 text-chart-2">
						<PackagePlus className="h-6 w-6" />
					</div>
				</div>
			</Card>
			<Card className="p-6 bg-card border-border">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-muted-foreground">Stock bajo</p>
						<p className="text-2xl font-bold text-foreground mt-2">{lowStockCount}</p>
					</div>
					<div className="rounded-lg bg-secondary p-3 text-destructive">
						<AlertTriangle className="h-6 w-6" />
					</div>
				</div>
			</Card>
		</div>
	);
}
