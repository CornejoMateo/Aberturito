"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"

interface DynamicSelectProps {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: string[]
  onAddOption: (newOption: string) => void
  placeholder?: string
}

export function DynamicSelect({ 
  label, 
  value, 
  onValueChange, 
  options, 
  onAddOption, 
  placeholder = "Seleccionar..." 
}: DynamicSelectProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newOption, setNewOption] = useState("")

  const handleAddOption = () => {
    if (newOption.trim()) {
      onAddOption(newOption.trim())
      setNewOption("")
      setIsAddDialogOpen(false)
    }
  }

  return (
    <div className="grid gap-2">
      <Label className="text-foreground">{label}</Label>
      <div className="flex gap-2">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="bg-background flex-1">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle className="text-foreground">Agregar nueva opción</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Ingrese el nuevo valor para {label.toLowerCase()}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="newOption" className="text-foreground">
                  Nuevo valor
                </Label>
                <Input
                  id="newOption"
                  placeholder={`Nuevo ${label.toLowerCase()}`}
                  className="bg-background"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddOption()
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddOption}>Agregar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}