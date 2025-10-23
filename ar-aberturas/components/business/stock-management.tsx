"use client"

import { useEffect, useState } from "react"
import { StockFormDialog } from "../../utils/stock/stock-add-dialog"
import { StockStats } from "../../utils/stock/stock-stats"
import { StockLowAlert } from "../../utils/stock/stock-low-alert"
import { StockFilters } from "../../utils/stock/stock-filters"
import { StockTable } from "../../utils/stock/stock-table"
import { listStock, createProfileStock, deleteProfileStock, type ProfileItemStock, updateProfileStock } from "@/lib/stock"

interface StockManagementProps {
  materialType?: "Aluminio" | "PVC"
}

export function StockManagement({ materialType = "Aluminio" }: StockManagementProps) {
  const [stock, setStock] = useState<ProfileItemStock[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Perfiles")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ProfileItemStock | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      const { data, error } = await listStock()
      if (!mounted) return
      if (error) {
        setError(error.message ?? String(error))
      } else if (data) {
        setStock(data ?? [])
      }
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  const filteredStock = stock.filter((item) => {
    const matchesSearch = (item.category?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (item.type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (item.line?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (item.color?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "Perfiles" || item.category === selectedCategory
    const matchesMaterial = !materialType || item.material?.toLowerCase() === materialType.toLowerCase()
    return matchesSearch && matchesCategory && matchesMaterial
  })

  const lowStockItems = stock.filter((item) => (item.quantity ?? 0) < 10)
  const totalItems = stock.reduce((sum, item) => sum + (item.quantity ?? 0), 0)

  // Dinamic titles based on material type
  const getTitle = () => {
    switch (materialType) {
      case "Aluminio":
        return "Stock de Aluminio"
      case "PVC":
        return "Stock de PVC"
      default:
        return "Gestión de Stock"
    }
  }

  const getDescription = () => {
    switch (materialType) {
      case "Aluminio":
        return "Control de inventario de productos de aluminio"
      case "PVC":
        return "Control de inventario de productos de PVC"
      default:
        return "Control de inventario y materiales"
    }
  }

  const handleEdit = (id: string) => {
    const item = stock.find(s => s.id === id)
    if (item) {
      setEditingItem(item)
      setIsEditDialogOpen(true)
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
          <StockFormDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onSave={async (newItem) => {
              const { data, error } = await createProfileStock(newItem)
              if (error) {
                setError(error.message ?? String(error))
                return
              }
              if (data) {
                setStock((s) => [data, ...s])
              }
              setIsAddDialogOpen(false)
            }}
            materialType={materialType}
            triggerButton={true}
          />
        </div>
          {/* form for edit item */}
          <StockFormDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSave={async (changes) => {
              if (!editingItem?.id) return
              const { data, error } = await updateProfileStock(editingItem.id, changes)
              if (error) {
                setError(error.message ?? String(error))
                return
              }
              if (data) {
                setStock(stock.map(item => item.id === editingItem.id ? data : item))
              }
              setIsEditDialogOpen(false)
            }}
            materialType={materialType}
            editItem={editingItem}
            triggerButton={false}
          />
      </div>

      { /* stats */}
      <StockStats 
        totalItems={totalItems}
        categoriesCount={5}
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
      {loading ? (
        <p>Cargando stock...</p>
      ) : error ? (
        <p className="text-destructive">Error: {error}</p>
      ) : (
        <StockTable
          filteredStock={filteredStock}
          onEdit={handleEdit}
          onDelete={async (id) => {
            const { error } = await deleteProfileStock(id)
            if (error) {
              setError(error.message ?? String(error))
              return
            }
            setStock((s) => s.filter(item => item.id !== id))
          }}
          onUpdateQuantity={async (id, newQuantity) => {
            if (newQuantity < 0) return; // Prevent negative quantities
            
            const { data, error } = await updateProfileStock(id, { quantity: newQuantity })
            if (error) {
              setError(error.message ?? 'Error al actualizar la cantidad')
              throw error // This will be caught by the StockTable
            }
            if (data) {
              setStock(stock.map(item => item.id === id ? { ...item, quantity: newQuantity } : item))
            }
          }}
        />
      )}
    </div>
  )
}

export type { ProfileItemStock }