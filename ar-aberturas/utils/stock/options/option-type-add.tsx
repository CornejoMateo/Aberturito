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

import { createOption, type TypeOption} from "@/lib/stock_options"
import { create } from "domain"
import React from "react"

interface TypeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (type: TypeOption) => void
  triggerButton?: boolean
}

export function OptionTypeDialog({ open, onOpenChange, onSave, triggerButton = true}: TypeFormDialogProps) {
  const [name_type, setNameType] = useState("")
  const [line_name, setNameLine] = useState<string>("")

  const handleSave = async () => {
    if (!name_type) {
      alert("El nombre del tipo es obligatorio")
      return
    }

    const { data, error } = await createOption('types', { name_type: name_type, line_name: line_name})

    if (error) {
      console.error("Supabase error:", error)
      alert(`Error al guardar el tipo: ${error.message || "Error desconocido"}`)
      return
    }
        
    if (onSave && data) {
      onSave(data)
    }

    setNameType("")
    setNameLine("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerButton && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar Tipo
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="bg-card max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Agregar nuevo tipo</DialogTitle>
          <DialogDescription>Ingrese los datos del nuevo tipo</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 py-4 pr-2 -mr-2">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nameLine">Nombre del tipo</Label>
              <Input
                id="nameLine"
                type="text"
                placeholder="Nombre del tipo"
                value={name_type}
                onChange={(e) => setNameType(e.target.value)}
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
