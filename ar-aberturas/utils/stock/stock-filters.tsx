import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface StockFiltersProps {
	searchTerm: string;
	setSearchTerm: (term: string) => void;
	selectedCategory: 'Perfiles' | 'Accesorios' | 'Herrajes';
	setSelectedCategory: (category: 'Perfiles' | 'Accesorios' | 'Herrajes') => void;
}

export function StockFilters({
	searchTerm,
	setSearchTerm,
	selectedCategory,
	setSelectedCategory,
}: StockFiltersProps) {
	return (
		<Card className="p-4 bg-card border-border">
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
			</div>
		</Card>
	);
}
