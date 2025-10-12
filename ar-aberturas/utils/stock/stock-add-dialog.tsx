"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StockItem } from "../../components/business/stock-management"
import { categories } from "@/constants/categories"
import { useState } from "react"

interface StockAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (item: Omit<StockItem, 'id'>) => void
}

export function StockAddDialog({ open, onOpenChange, onSave }: StockAddDialogProps) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [quantity, setQuantity] = useState(0)
  const [unit, setUnit] = useState("")
  const [minStock, setMinStock] = useState(0)
  const [location, setLocation] = useState("")

  const handleAddItem = () => {
    // Lógica para agregar el item al stock
    onSave({ 
      name, 
      category, 
      quantity, 
      unit, 
      minStock, 
      location, 
      lastUpdate: new Date().toISOString().split('T')[0] // Fecha actual en formato YYYY-MM-DD
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar Item
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">Agregar nuevo item</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Ingrese los datos del nuevo material o producto
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-foreground">
              Nombre
            </Label>
            <Input
              id="name"
              placeholder="Ej: Perfil de Aluminio"
              className="bg-background"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category" className="text-foreground">
              Categoría
            </Label>
            <Select
              value={category}
              onValueChange={setCategory}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="quantity" className="text-foreground">
                Cantidad
              </Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0"
                className="bg-background"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unit" className="text-foreground">
                Unidad
              </Label>
              <Input
                id="unit"
                placeholder="unidades"
                className="bg-background"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="minStock" className="text-foreground">
              Stock mínimo
            </Label>
            <Input
              id="minStock"
              type="number"
              placeholder="0"
              className="bg-background"
              value={minStock}
              onChange={(e) => setMinStock(Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location" className="text-foreground">
              Ubicación
            </Label>
            <Input
              id="location"
              placeholder="Ej: Depósito A"
              className="bg-background"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAddItem}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}