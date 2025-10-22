import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, TrendingDown, TrendingUp, Edit, Trash2 } from "lucide-react"
import { type ProfileItemStock } from "@/lib/stock"

interface StockTableProps {
  filteredStock: ProfileItemStock[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function StockTable({ filteredStock, onEdit, onDelete }: StockTableProps) {
  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border bg-secondary">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Última Act.
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredStock.map((item) => {
              const isLowStock = (item.quantity ?? 0) < 10 // threshold fijo por ahora

              return (
                <tr key={item.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.type || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{item.line || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline" className="bg-secondary">
                      {item.category || 'Sin categoría'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-foreground">
                      {item.quantity ?? 0} unidades
                    </p>
                    <p className="text-xs text-muted-foreground">{item.width ? `${item.width}mm` : ''}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isLowStock ? (
                      <Badge variant="destructive" className="gap-1">
                        <TrendingDown className="h-3 w-3" />
                        Bajo
                      </Badge>
                    ) : (
                      <Badge className="gap-1 bg-accent">
                        <TrendingUp className="h-3 w-3" />
                        Normal
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{item.site || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{item.last_update || item.created_at || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => item.id && onEdit(item.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => item.id && onDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
