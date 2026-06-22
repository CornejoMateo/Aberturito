import { StockCategory } from '@/lib/stock/stock-config';

export function getRowClassName(
	itemId: number,
	quantity: number,
	category: StockCategory,
	thresholds: Record<number, { yellow: number; red: number }>
): string {
	// Only apply custom thresholds for Insumos category
	if (category !== 'Insumos') {
		return quantity === 0 ? 'bg-red-100' : 'hover:bg-secondary/50 transition-colors';
	}

	const threshold = thresholds[itemId];
	if (!threshold) {
		// Default behavior if no threshold configured
		return quantity === 0 ? 'bg-red-100' : 'hover:bg-secondary/50 transition-colors';
	}

	if (quantity <= threshold.red) {
		return 'bg-red-100';
	}
	if (quantity <= threshold.yellow) {
		return 'bg-yellow-100';
	}
	return 'hover:bg-secondary/50 transition-colors';
}
