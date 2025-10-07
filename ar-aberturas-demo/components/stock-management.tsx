"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Filter,
  Download,
  Edit,
  Trash2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type StockItem = {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  minStock: number
  location: string
  lastUpdate: string
}

const initialStock: StockItem[] = [
  {
    id: "1",
    name: "Perfil de Aluminio 6m",
    category: "Perfiles",
    quantity: 145,
    unit: "unidades",
    minStock: 50,
    location: "Depósito A",
    lastUpdate: "2025-03-10",
  },
  {
    id: "2",
    name: "Vidrio 4mm Transparente",
    category: "Vidrios",
    quantity: 28,
    unit: "m²",
    minStock: 30,
    location: "Depósito B",
    lastUpdate: "2025-03-09",
  },
  {
    id: "3",
    name: "Silicona Transparente",
    category: "Accesorios",
    quantity: 5,
    unit: "tubos",
    minStock: 20,
    location: "Depósito C",
    lastUpdate: "2025-03-08",
  },
  {
    id: "4",
    name: "Manijas Cromadas",
    category: "Herrajes",
    quantity: 89,
    unit: "unidades",
    minStock: 30,
    location: "Depósito A",
    lastUpdate: "2025-03-10",
  },
  {
    id: "5",
    name: "Tornillos Autoperforantes",
    category: "Herrajes",
    quantity: 450,
    unit: "unidades",
    minStock: 200,
    location: "Depósito C",
    lastUpdate: "2025-03-09",
  },
  {
    id: "6",
    name: "Burletes de Goma",
    category: "Accesorios",
    quantity: 120,
    unit: "metros",
    minStock: 50,
    location: "Depósito B",
    lastUpdate: "2025-03-10",
  },
]

const categories = ["Todos", "Perfiles", "Vidrios", "Herrajes", "Accesorios"]

export function StockManagement() {
  const [stock, setStock] = useState<StockItem[]>(initialStock)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredStock = stock.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "Todos" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const lowStockItems = stock.filter((item) => item.quantity < item.minStock)
  const totalItems = stock.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground text-balance">Gestión de Stock</h2>
          <p className="text-muted-foreground mt-1">Control de inventario y materiales</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Agregar Item
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader>
                <DialogTitle className="text-foreground">Agregar Nuevo Item</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Ingrese los datos del nuevo material o producto
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-foreground">
                    Nombre
                  </Label>
                  <Input id="name" placeholder="Ej: Perfil de Aluminio" className="bg-background" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category" className="text-foreground">
                    Categoría
                  </Label>
                  <Select>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="perfiles">Perfiles</SelectItem>
                      <SelectItem value="vidrios">Vidrios</SelectItem>
                      <SelectItem value="herrajes">Herrajes</SelectItem>
                      <SelectItem value="accesorios">Accesorios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity" className="text-foreground">
                      Cantidad
                    </Label>
                    <Input id="quantity" type="number" placeholder="0" className="bg-background" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit" className="text-foreground">
                      Unidad
                    </Label>
                    <Input id="unit" placeholder="unidades" className="bg-background" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="minStock" className="text-foreground">
                    Stock Mínimo
                  </Label>
                  <Input id="minStock" type="number" placeholder="0" className="bg-background" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location" className="text-foreground">
                    Ubicación
                  </Label>
                  <Input id="location" placeholder="Ej: Depósito A" className="bg-background" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Items</p>
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
              <p className="text-2xl font-bold text-foreground mt-2">{categories.length - 1}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-chart-2">
              <Filter className="h-6 w-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Stock Bajo</p>
              <p className="text-2xl font-bold text-foreground mt-2">{lowStockItems.length}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="p-4 bg-destructive/10 border-destructive/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Alerta de Stock Bajo</p>
              <p className="text-sm text-muted-foreground mt-1">
                {lowStockItems.length} {lowStockItems.length === 1 ? "producto tiene" : "productos tienen"} stock por
                debajo del mínimo recomendado
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4 bg-card border-border">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Stock table */}
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
                const isLowStock = item.quantity < item.minStock
                const stockPercentage = (item.quantity / item.minStock) * 100

                return (
                  <tr key={item.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="bg-secondary">
                        {item.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-foreground">
                        {item.quantity} {item.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">Mín: {item.minStock}</p>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{item.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{item.lastUpdate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
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
    </div>
  )
}
