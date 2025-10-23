import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, TrendingDown, TrendingUp, Edit, Trash2 } from "lucide-react"
import { type ProfileItemStock } from "@/lib/stock"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
} from "@/components/ui/alert-dialog"

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
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Linea
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Color
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
                Fecha de creación.
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredStock.length === 0 ? ( 
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Package className="h-12 w-12 opacity-50" />
                    <p className="text-lg font-medium">No hay items en stock</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredStock.map((item) => {
                const isLowStock = (item.quantity ?? 0) < 10 // threshold fixed at 10

                return (
                  <tr key={item.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="bg-secondary">
                        {item.category || 'Sin categoría'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.line || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.type || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.color || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-foreground">
                        {item.quantity ?? 0} unidades
                      </p>
                      <p className="text-xs text-muted-foreground">{item.width ? `${item.width}mm` : ''}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        let badgeColor = "bg-green-500 text-white";
                        let label = item.status || 'N/A';
                        if (label === "Malo") {
                          badgeColor = "bg-red-500 text-white";
                        } else if (label === "Medio") {
                          badgeColor = "bg-yellow-400 text-white";
                        } else if (label === "Bueno") {
                          badgeColor = "bg-green-500 text-white";
                        } else {
                          badgeColor = "bg-muted-foreground text-white";
                        }
                        return (
                          <Badge className={`gap-1 ${badgeColor}`}>
                            {label}
                          </Badge>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{item.site || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {item.created_at
                        ? item.created_at.split('T')[0]
                        : item.last_update
                          ? item.last_update.split('T')[0]
                          : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => item.id && onEdit(item.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogTitle>¿Eliminar perfil del stock?</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Estás seguro que deseas eliminar este perfil? Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                            <div className="flex justify-end gap-2 mt-4">
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-white hover:bg-destructive/90"
                                onClick={() => item.id && onDelete(item.id)}
                              >
                                Eliminar
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
