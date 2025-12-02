import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Check, Filter } from 'lucide-react';
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
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'flex items-center gap-1.5 text-xs h-8 px-2',
                showOutOfStock ? 'bg-accent' : 'hover:bg-accent/50'
              )}
              onClick={() => setShowOutOfStock(!showOutOfStock)}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Mostrar solo sin stock</span>
            </Button>
            {(selectedCategory === 'Accesorios' || selectedCategory === 'Herrajes' || selectedCategory === 'Insumos') && (
              <div className="[&_button]:h-8 [&_button]:text-xs [&_button]:px-2">
                <UpdatePricesDialog />
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
