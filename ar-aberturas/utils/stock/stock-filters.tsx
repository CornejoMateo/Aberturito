import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Check } from 'lucide-react';
import { UpdatePricesDialog } from '@/components/stock/update-prices-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StockFiltersProps {
	searchTerm: string;
	setSearchTerm: (term: string) => void;
	selectedCategory: 'Perfiles' | 'Accesorios' | 'Herrajes' | 'Insumos';
	showOutOfStock: boolean;
	setShowOutOfStock: (show: boolean) => void;
	setSelectedCategory: (category: 'Perfiles' | 'Accesorios' | 'Herrajes' | 'Insumos') => void;
}

export function StockFilters({
	searchTerm,
	setSearchTerm,
	selectedCategory,
	showOutOfStock,
	setShowOutOfStock,
	setSelectedCategory,
}: StockFiltersProps) {
	return (
		<Card className="p-4 bg-card border-border">
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-4 md:flex-row md:items-center">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Buscar por ubicación, categoría, código, línea o color..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-9 bg-background"
						/>
					</div>
					{(selectedCategory === 'Accesorios' || selectedCategory === 'Herrajes' || selectedCategory === 'Insumos') && (
						<div className="ml-auto">
							<UpdatePricesDialog />
						</div>
					)}
				</div>
				<div className="flex items-center">
					<Button
						variant="ghost"
						size="sm"
						className={cn(
							'flex items-center gap-2 text-sm',
							showOutOfStock ? 'bg-accent' : 'hover:bg-accent/50'
						)}
						onClick={() => setShowOutOfStock(!showOutOfStock)}
					>
						<div className={cn(
							'flex items-center justify-center w-4 h-4 border rounded-sm',
							showOutOfStock ? 'bg-primary border-primary' : 'border-border'
						)}>
							{showOutOfStock && <Check className="h-3 w-3 text-primary-foreground" />}
						</div>
						<span>Mostrar solo sin stock</span>
					</Button>
				</div>
			</div>
		</Card>
	);
}
