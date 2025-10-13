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
  material: "aluminio" | "pvc"
  quantity: number
  unit: string
  minStock: number
  location: string
  lastUpdate: string
}


// Esto se deberia borrar y hacer una funcion en db.ts para traer la lista de stock
const initialStock: StockItem[] = [
  // Stock de Aluminio
  {
    id: "1",
    name: "Perfil de Aluminio 6m",
    category: "Perfiles",
    material: "aluminio",
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
    material: "aluminio",
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
    material: "aluminio",
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
    material: "aluminio",
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
    material: "aluminio",
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
    material: "aluminio",
    quantity: 120,
    unit: "metros",
    minStock: 50,
    location: "Depósito B",
    lastUpdate: "2025-03-10",
  },
  // Stock de PVC
  {
    id: "7",
    name: "Perfil de PVC 6m Blanco",
    category: "Perfiles",
    material: "pvc",
    quantity: 98,
    unit: "unidades",
    minStock: 40,
    location: "Depósito A",
    lastUpdate: "2025-03-10",
  },
  {
    id: "8",
    name: "Vidrio 4mm Transparente",
    category: "Vidrios",
    material: "pvc",
    quantity: 35,
    unit: "m²",
    minStock: 25,
    location: "Depósito B",
    lastUpdate: "2025-03-09",
  },
  {
    id: "9",
    name: "Silicona Blanca",
    category: "Accesorios",
    material: "pvc",
    quantity: 12,
    unit: "tubos",
    minStock: 15,
    location: "Depósito C",
    lastUpdate: "2025-03-08",
  },
  {
    id: "10",
    name: "Manijas Blancas",
    category: "Herrajes",
    material: "pvc",
    quantity: 67,
    unit: "unidades",
    minStock: 25,
    location: "Depósito A",
    lastUpdate: "2025-03-10",
  },
  {
    id: "11",
    name: "Tornillos para PVC",
    category: "Herrajes",
    material: "pvc",
    quantity: 320,
    unit: "unidades",
    minStock: 150,
    location: "Depósito C",
    lastUpdate: "2025-03-09",
  },
  {
    id: "12",
    name: "Burletes de PVC",
    category: "Accesorios",
    material: "pvc",
    quantity: 85,
    unit: "metros",
    minStock: 40,
    location: "Depósito B",
    lastUpdate: "2025-03-10",
  },
]

interface StockManagementProps {
  materialType?: "aluminio" | "pvc" | "all"
}

export function StockManagement({ materialType = "all" }: StockManagementProps) {
  const [stock, setStock] = useState<StockItem[]>(initialStock)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Perfiles")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredStock = stock.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "Perfiles" || item.category === selectedCategory
    const matchesMaterial = materialType === "all" || item.material === materialType
    return matchesSearch && matchesCategory && matchesMaterial
  })

  const lowStockItems = stock.filter((item) => item.quantity < item.minStock)
  const totalItems = stock.reduce((sum, item) => sum + item.quantity, 0)

  // Títulos dinámicos según el tipo de material
  const getTitle = () => {
    switch (materialType) {
      case "aluminio":
        return "Stock de Aluminio"
      case "pvc":
        return "Stock de PVC"
      default:
        return "Gestión de Stock"
    }
  }

  const getDescription = () => {
    switch (materialType) {
      case "aluminio":
        return "Control de inventario de productos de aluminio"
      case "pvc":
        return "Control de inventario de productos de PVC"
      default:
        return "Control de inventario y materiales"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground text-balance">{getTitle()}</h2>
          <p className="text-muted-foreground mt-1">{getDescription()}</p>
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
