import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { categories } from '@/constants/stock-constants';

interface StockFiltersProps {
	searchTerm: string;
	setSearchTerm: (term: string) => void;
	selectedCategory: string;
	setSelectedCategory: (category: string) => void;
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
				<div className="flex gap-2 overflow-x-auto">
					{categories.map((categoria) => (
						<Button
							key={categoria}
							variant={selectedCategory === categoria ? 'default' : 'outline'}
							size="sm"
							onClick={() => setSelectedCategory(categoria)}
							className="whitespace-nowrap"
						>
							{categoria}
						</Button>
					))}
				</div>
			</div>
		</Card>
	);
}
