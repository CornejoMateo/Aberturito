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
import { useState, useEffect } from "react"

interface StockFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (item: Partial<ProfileItemStock>) => void
  materialType?: "Aluminio" | "PVC"
  editItem?: ProfileItemStock | null
  triggerButton?: boolean 
}

export function StockFormDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  materialType = "Aluminio",
  editItem = null,
  triggerButton = true
}: StockFormDialogProps) {
  const isEditing = !!editItem
  
  const [category, setCategory] = useState("")
  const [type, setType] = useState("")
  const [line, setLine] = useState("")
  const [color, setColor] = useState("")
  const [itemStatus, setItemStatus] = useState("")
  const [quantity, setQuantity] = useState(0)
  const [site, setSite] = useState("")
  const [width, setWidth] = useState(0)

  // Status and options for selects
  const [categoriesOptions, setCategoriesOptions] = useState(categories)
  const [typesOptions, setTypesOptions] = useState(types)
  const [linesOptions, setLinesOptions] = useState(lines)
  const [colorsOptions, setColorsOptions] = useState(colors)
  const [sitesOptions, setSitesOptions] = useState(sites)
  const [statusOptions, setStatusOptions] = useState<string[]>([...status])

  // Loading data into form when editItem changes
  useEffect(() => {
    if (editItem) {
      setCategory(editItem.category || "")
      setType(editItem.type || "")
      setLine(editItem.line || "")
      setColor(editItem.color || "")
      setItemStatus(editItem.status || "")
      setQuantity(editItem.quantity || 0)
      setSite(editItem.site || "")
      setWidth(editItem.width || 0)
    } else {
      // Reset form when not editing
      resetForm()
    }
  }, [editItem])

  const resetForm = () => {
    setCategory("")
    setType("")
    setLine("")
    setColor("")
    setItemStatus("")
    setQuantity(0)
    setSite("")
    setWidth(0)
  }

  const handleSave = () => {
    // Validate require fields
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
      created_at: isEditing ? editItem.created_at : new Date().toISOString().split('T')[0]
    })
    
    // Reset form after save if not editing
    if (!isEditing) {
      resetForm()
    }
    
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerButton && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar Item
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="bg-card max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-foreground">
            {isEditing ? "Editar item" : "Agregar nuevo item"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing ? "Modifique los datos del material o producto" : "Ingrese los datos del nuevo material o producto"}
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
              options={colorsOptions}
              onAddOption={(newOption) => setColorsOptions([...colorsOptions, newOption])}
              placeholder="Seleccionar color"
            />

            <div className="grid gap-2">
              <Label htmlFor="estado" className="text-foreground">
                Estado
              </Label>
              <Select value={itemStatus} onValueChange={setItemStatus}>
                <SelectTrigger className="bg-background w-full">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((est) => (
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
              options={sitesOptions}
              onAddOption={(newOption) => setSitesOptions([...sitesOptions, newOption])}
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
          <Button onClick={handleSave} className="w-full sm:w-auto">
            {isEditing ? "Guardar cambios" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}