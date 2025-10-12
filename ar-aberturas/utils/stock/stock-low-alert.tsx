import { Card } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { StockItem } from "../../components/business/stock-management"

interface StockLowAlertProps {
  lowStockItems: StockItem[]
}

export function StockLowAlert({ lowStockItems }: StockLowAlertProps) {
  if (lowStockItems.length === 0) return null

  return (
    <Card className="p-4 bg-destructive/10 border-destructive/20">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Alerta de stock bajo</p>
          <p className="text-sm text-muted-foreground mt-1">
            {lowStockItems.length} {lowStockItems.length === 1 ? "producto tiene" : "productos tienen"} stock por
            debajo del mínimo recomendado
          </p>
        </div>
      </div>
    </Card>
  )
}
