import { Card } from "@/components/ui/card"
import { Package, Filter, AlertTriangle } from "lucide-react"

interface StockStatsProps {
  totalItems: number
  categoriesCount: number
  lowStockCount: number
}

export function StockStats({ totalItems, categoriesCount, lowStockCount }: StockStatsProps) {
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
            <p className="text-sm font-medium text-muted-foreground">Categorías</p>
            <p className="text-2xl font-bold text-foreground mt-2">{categoriesCount}</p>
          </div>
          <div className="rounded-lg bg-secondary p-3 text-chart-2">
            <Filter className="h-6 w-6" />
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
  )
}
