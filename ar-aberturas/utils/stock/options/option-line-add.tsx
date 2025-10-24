"use client"

import { useState } from "react"
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

import { createOption, type LineOption} from "@/lib/stock_options"
import { create } from "domain"
import React from "react"

interface LineFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (line: LineOption) => void
  triggerButton?: boolean
  materialType?: "Aluminio" | "PVC"
}

export function OptionLineDialog({ open, onOpenChange, onSave, triggerButton = true, materialType = "Aluminio" }: LineFormDialogProps) {
  const [nameLine, setNameLine] = useState("")
  const [opening, setOpening] = useState<string>("")

  const handleSave = async () => {
    if (!nameLine) {
      alert("El nombre de la línea es obligatorio")
      return
    }

    const { data, error } = await createOption('lines', { name_line: nameLine, opening: opening})

    if (error) {
      console.error("Supabase error:", error)
      alert(`Error al guardar la línea: ${error.message || "Error desconocido"}`)
      return
    }
        
    if (onSave && data) {
      onSave(data)
    }

    setNameLine("")
    setOpening(materialType)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerButton && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar Línea
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="bg-card max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Agregar nueva línea</DialogTitle>
          <DialogDescription>Ingrese los datos de la nueva línea</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 py-4 pr-2 -mr-2">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nameLine">Nombre de la línea</Label>
              <Input
                id="nameLine"
                type="text"
                placeholder="Nombre de la línea"
                value={nameLine}
                onChange={(e) => setNameLine(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="opening">Abertura</Label>
              <Input
                id="opening"
                type="text"
                placeholder=""
                value={opening}
                onChange={(e) => setOpening(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="w-full sm:w-auto">
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
