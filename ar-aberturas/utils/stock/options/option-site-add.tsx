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

import { createOption, type SiteOption} from "@/lib/stock_options"
import { create } from "domain"
import React from "react"

interface SiteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (type: SiteOption) => void
  triggerButton?: boolean
}

export function OptionSiteDialog({ open, onOpenChange, onSave, triggerButton = true}: SiteFormDialogProps) {
  const [name_site, setNameSite] = useState("")

  const handleSave = async () => {
    if (!name_site) {
      alert("El nombre de la ubicación es obligatorio")
      return
    }

    const { data, error } = await createOption('sites', { name_site: name_site})

    if (error) {
      console.error("Supabase error:", error)
      alert(`Error al guardar la ubicación: ${error.message || "Error desconocido"}`)
      return
    }
        
    if (onSave && data) {
      onSave(data)
    }

    setNameSite("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerButton && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar Ubicación
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="bg-card max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Agregar nueva ubicación</DialogTitle>
          <DialogDescription>Ingrese los datos de la nueva ubicación</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 py-4 pr-2 -mr-2">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nameSite">Nombre de la ubicación</Label>
              <Input
                id="nameSite"
                type="text"
                placeholder="Ubicación"
                value={name_site}
                onChange={(e) => setNameSite(e.target.value)}
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
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
