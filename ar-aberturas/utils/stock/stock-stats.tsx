import { Card } from '@/components/ui/card';
import { Package, PackagePlus, AlertTriangle } from 'lucide-react';
import type { ProfileItemStock } from '@/lib/profile-stock';
import type { AccessoryItemStock } from '@/lib/accesorie-stock';
import type { IronworkItemStock } from '@/lib/ironwork-stock';
import type { SupplyItemStock } from '@/lib/supplies-stock';

interface StockStatsProps {
	categoryState: 'Perfiles' | 'Accesorios' | 'Herrajes' | 'Insumos';
	totalItems: number;
	lowStockCount: number;
	lastAddedItem?: ProfileItemStock | AccessoryItemStock | IronworkItemStock | SupplyItemStock | null;
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

		if (categoryState === 'Insumos') {
			return {
				line: item.supply_line || 'Sin código',
				code: item.supply_code || 'Sin código',
				color: item.supply_color,
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
		<div className="flex justify-start">
			<Card className="bg-card border-border w-80">
				<div className="flex items-center p-2">
					<div className="mr-3 rounded-lg bg-secondary p-2 text-chart-2">
						<PackagePlus className="h-5 w-5" />
					</div>
					<div>
						<p className="text-xs font-medium text-muted-foreground">Último agregado</p>
						{displayItem ? (
							<div className="space-y-0.5">
								<p className="text-lg font-medium text-foreground">
									{displayItem.line}, {displayItem.code}
								</p>
								{displayItem.color && (
									<p className="text-sm text-muted-foreground">
										{displayItem.color}{displayItem.extra ? ` • ${displayItem.extra}` : ''}
									</p>
								)}
							</div>
						) : (
							<p className="text-xs text-muted-foreground">No hay registros</p>
						)}
					</div>
				</div>
			</Card>
		</div>
	);
}
