import { Card } from '@/components/ui/card';
import { Package, PackagePlus, AlertTriangle } from 'lucide-react';
import type { ProfileItemStock } from '@/lib/profile-stock';
import type { AccessoryItemStock } from '@/lib/accesorie-stock';
import type { IronworkItemStock } from '@/lib/ironwork-stock';

interface StockStatsProps {
	categoryState: 'Perfiles' | 'Accesorios' | 'Herrajes';
	totalItems: number;
	lowStockCount: number;
	lastAddedItem?: ProfileItemStock | AccessoryItemStock | IronworkItemStock | null;
}

export function StockStats({
	categoryState,
	totalItems,
	lowStockCount,
	lastAddedItem,
}: StockStatsProps) {
	const getItemDisplay = () => {
		if (!lastAddedItem) return null;

		const item = lastAddedItem as any;

		if (categoryState === 'Perfiles') {
			return {
				line: item.line || 'Sin código',
				code: item.code || 'Sin código',
				color: item.color,
				extra: item.width ? `${item.width}mm` : '',
			};
		}

		if (categoryState === 'Accesorios') {
			return {
				line: item.accessory_line || 'Sin código',
				code: item.accessory_code || 'Sin código',
				color: item.accessory_color,
				extra: '',
			};
		}

		// Herrajes
		return {
			line: item.ironwork_line || 'Sin código',
			code: item.ironwork_code || 'Sin código',
			color: item.ironwork_color,
			extra: '',
		};
	};

	const displayItem = getItemDisplay();

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
						{displayItem ? (
							<div className="mt-2 space-y-1">
								<p className="text-sm font-medium text-foreground">
									{displayItem.line}, {displayItem.code}
								</p>
								<p className="text-xs text-muted-foreground">
									{displayItem.color ? `${displayItem.color}` : ''}
									{displayItem.extra ? ` • ${displayItem.extra}` : ''}
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
