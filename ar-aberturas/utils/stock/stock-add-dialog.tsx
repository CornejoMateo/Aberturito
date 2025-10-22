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
import { DynamicSelect } from "./dynamic-select"
import { type ProfileItemStock } from "@/lib/stock"
import { types, lines, colors, status, sites, categories } from "@/constants/stock-constants"
import { useState } from "react"

interface StockAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (item: Partial<ProfileItemStock>) => void
  materialType?: "Aluminio" | "PVC"
}

export function StockAddDialog({ open, onOpenChange, onSave, materialType = "Aluminio" }: StockAddDialogProps) {
  const [category, setCategory] = useState("")
  const [type, setType] = useState("")
  const [line, setLine] = useState("")
  const [color, setColor] = useState("")
  const [itemStatus, setItemStatus] = useState<"Nuevo" | "Con detalles" | "Dañado">("Nuevo")
  const [quantity, setQuantity] = useState(0)
  const [site, setSite] = useState("")
  const [width, setWidth] = useState(0)

  // Estados para las opciones dinámicas
  const [categoriesOptions, setCategoriesOptions] = useState(categories)
  const [typesOptions, setTypesOptions] = useState(types)
  const [linesOptions, setLinesOptions] = useState(lines)
  const [coloresOptions, setColoresOptions] = useState(colors)
  const [ubicacionesOptions, setUbicacionesOptions] = useState(sites)

  const handleAddItem = () => {
    // Validar campos obligatorios
    if (!category || !type || !line || !color || !site || quantity <= 0 || width <= 0) {
      alert("Por favor complete todos los campos obligatorios")
      return
    }

    onSave({ 
      category,
      type,
      line,
      color,
      status: itemStatus,
      quantity,
      site,
      width,
      material: materialType?.toLowerCase(),
      created_at: new Date().toISOString().split('T')[0]
    })
    
    // Resetear formulario
    setCategory("")
    setType("")
    setLine("")
    setColor("")
    setItemStatus("Nuevo")
    setQuantity(0)
    setSite("")
    setWidth(0)
    
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
      <DialogContent className="bg-card max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-foreground">Agregar nuevo item</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Ingrese los datos del nuevo material o producto
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 py-4 pr-2 -mr-2">
          <div className="grid gap-4">
            <DynamicSelect
              label="Categoría"
              value={category}
              onValueChange={setCategory}
              options={categoriesOptions}
              onAddOption={(newOption) => setCategoriesOptions([...categoriesOptions, newOption])}
              placeholder="Seleccionar categoría"
            />

          <DynamicSelect
            label="Línea"
            value={line}
            onValueChange={setLine}
            options={linesOptions}
            onAddOption={(newOption) => setLinesOptions([...linesOptions, newOption])}
            placeholder="Seleccionar línea"
          />

          <DynamicSelect
            label="Tipo"
            value={type}
            onValueChange={setType}
            options={typesOptions}
            onAddOption={(newOption) => setTypesOptions([...typesOptions, newOption])}
            placeholder="Seleccionar tipo"
          />

          <DynamicSelect
            label="Color"
            value={color}
            onValueChange={setColor}
            options={coloresOptions}
            onAddOption={(newOption) => setColoresOptions([...coloresOptions, newOption])}
            placeholder="Seleccionar color"
          />

          <div className="grid gap-2 mb-2">
            <Label htmlFor="estado" className="text-foreground">
              Estado
            </Label>
            <Select value={itemStatus} onValueChange={(value: "Nuevo" | "Con detalles" | "Dañado") => setItemStatus(value)}>
              <SelectTrigger className="bg-background w-full">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {status.map((est) => (
                  <SelectItem key={est} value={est}>
                    {est}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cantidad" className="text-foreground">
              Cantidad
            </Label>
            <Input
              id="cantidad"
              type="number"
              placeholder="0"
              className="bg-background"
              value={quantity || ""}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </div>

          <DynamicSelect
            label="Ubicación"
            value={site}
            onValueChange={setSite}
            options={ubicacionesOptions}
            onAddOption={(newOption) => setUbicacionesOptions([...ubicacionesOptions, newOption])}
            placeholder="Seleccionar ubicación"
          />

          <div className="grid gap-2">
            <Label htmlFor="largo" className="text-foreground">
              Largo (mm)
            </Label>
            <Input
              id="largo"
              type="number"
              placeholder="0"
              className="bg-background"
              value={width || ""}
              onChange={(e) => setWidth(Number(e.target.value))}
              required
            />
          </div>
          </div>
        </div>
        <DialogFooter className="flex-shrink-0 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={handleAddItem} className="w-full sm:w-auto">
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}