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

import { createOption, type ColorOption} from "@/lib/stock_options"
import { create } from "domain"
import React from "react"

interface TypeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (color: ColorOption) => void
  triggerButton?: boolean
}

export function OptionColorDialog({ open, onOpenChange, onSave, triggerButton = true}: TypeFormDialogProps) {
  const [name_color, setNameColor] = useState("")
  const [line_name, setNameLine] = useState<string>("")

  const handleSave = async () => {
    if (!name_color) {
      alert("El nombre del color es obligatorio")
      return
    }

    const { data, error } = await createOption('colors', { name_color: name_color, line_name: line_name})

    if (error) {
      console.error("Supabase error:", error)
      alert(`Error al guardar el color: ${error.message || "Error desconocido"}`)
      return
    }
        
    if (onSave && data) {
      onSave(data)
    }

    setNameColor("")
    setNameLine("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerButton && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar Color
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="bg-card max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Agregar nuevo color</DialogTitle>
          <DialogDescription>Ingrese los datos del nuevo color</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 py-4 pr-2 -mr-2">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="color">Nombre del color</Label>
              <Input
                id="color"
                type="text"
                placeholder="Nombre del color"
                value={name_color}
                onChange={(e) => setNameColor(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="line">Linea</Label>
              <Input
                id="line"
                type="text"
                placeholder=""
                value={line_name}
                onChange={(e) => setNameLine(e.target.value)}
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
