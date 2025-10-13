"use client"

import { useState } from "react"
import { categories } from "@/constants/categories"
import { StockAddDialog } from "../../utils/stock/stock-add-dialog"
import { StockStats } from "../../utils/stock/stock-stats"
import { StockLowAlert } from "../../utils/stock/stock-low-alert"
import { StockFilters } from "../../utils/stock/stock-filters"
import { StockTable } from "../../utils/stock/stock-table"

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


// Esto se deberia borrar y hacer una funcion en db.ts para traer la lista de stock
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

export function StockManagement() {
  const [stock, setStock] = useState<StockItem[]>(initialStock)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Perfiles")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredStock = stock.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "Perfiles" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const lowStockItems = stock.filter((item) => item.quantity < item.minStock)
  const totalItems = stock.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground text-balance">Gestión de Stock</h2>
          <p className="text-muted-foreground mt-1">Control de inventario y materiales</p>
        </div>
        {/* form for new item */}
        <div className="flex gap-2">
          <StockAddDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onSave={(newItem) => {
              setStock([...stock, { ...newItem, id: Date.now().toString() }])
              setIsAddDialogOpen(false)
            }}
          />
        </div>
      </div>

      { /* stats */}
      <StockStats 
        totalItems={totalItems}
        categoriesCount={categories.length - 1}
        lowStockCount={lowStockItems.length}
      />

      { /* stock alert */}
      <StockLowAlert lowStockItems={lowStockItems} />

      { /* filters */}
      <StockFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      { /* main table */}
      <StockTable
        filteredStock={filteredStock}
        onEdit={(id) => {/* implement edit logic */}}
        onDelete={(id) => setStock(stock.filter(item => item.id !== id))}
      />
    </div>
  )
}

export type { StockItem }
