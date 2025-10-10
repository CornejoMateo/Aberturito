"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Search, Download, Eye, CheckCircle, XCircle, Clock, Play } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Budget = {
  id: string
  clientName: string
  description: string
  amount: number
  status: "emitido" | "aceptado" | "rechazado" | "en_ejecucion"
  date: string
  validUntil: string
}

const initialBudgets: Budget[] = [
  {
    id: "PRE-001",
    clientName: "Juan Pérez",
    description: "Ventana corrediza 150x120cm con DVH",
    amount: 85000,
    status: "aceptado",
    date: "2025-03-10",
    validUntil: "2025-03-24",
  },
  {
    id: "PRE-002",
    clientName: "María González",
    description: "Puerta de aluminio 90x210cm",
    amount: 120000,
    status: "emitido",
    date: "2025-03-09",
    validUntil: "2025-03-23",
  },
  {
    id: "PRE-003",
    clientName: "Roberto Fernández",
    description: "3 ventanas + 1 puerta balcón",
    amount: 340000,
    status: "en_ejecucion",
    date: "2025-03-08",
    validUntil: "2025-03-22",
  },
  {
    id: "PRE-004",
    clientName: "Laura Martínez",
    description: "Ventana oscilobatiente 100x100cm",
    amount: 95000,
    status: "aceptado",
    date: "2025-03-07",
    validUntil: "2025-03-21",
  },
  {
    id: "PRE-005",
    clientName: "Carlos Rodríguez",
    description: "Cerramiento de balcón completo",
    amount: 450000,
    status: "rechazado",
    date: "2025-03-05",
    validUntil: "2025-03-19",
  },
]

const statusConfig = {
  emitido: { label: "Emitido", icon: Clock, color: "bg-chart-3 text-chart-3" },
  aceptado: { label: "Aceptado", icon: CheckCircle, color: "bg-accent text-accent" },
  rechazado: { label: "Rechazado", icon: XCircle, color: "bg-destructive text-destructive" },
  en_ejecucion: { label: "En Ejecución", icon: Play, color: "bg-chart-1 text-chart-1" },
}

export function BudgetManagement() {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredBudgets = budgets.filter(
    (budget) =>
      budget.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalBudgets = budgets.length
  const acceptedBudgets = budgets.filter((b) => b.status === "aceptado" || b.status === "en_ejecucion").length
  const conversionRate = ((acceptedBudgets / totalBudgets) * 100).toFixed(0)
  const totalAmount = budgets
    .filter((b) => b.status === "aceptado" || b.status === "en_ejecucion")
    .reduce((sum, b) => sum + b.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground text-balance">Gestión de Presupuestos</h2>
          <p className="text-muted-foreground mt-1">Creación y seguimiento de presupuestos</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Presupuesto
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-foreground">Crear Nuevo Presupuesto</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Complete los datos del presupuesto para el cliente
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="client" className="text-foreground">
                    Cliente
                  </Label>
                  <Input id="client" placeholder="Seleccionar o buscar cliente" className="bg-background" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description" className="text-foreground">
                    Descripción del Trabajo
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Detalle de productos y servicios..."
                    className="bg-background min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount" className="text-foreground">
                      Monto Total
                    </Label>
                    <Input id="amount" type="number" placeholder="0" className="bg-background" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="validUntil" className="text-foreground">
                      Válido Hasta
                    </Label>
                    <Input id="validUntil" type="date" className="bg-background" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>Crear Presupuesto</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Presupuestos</p>
              <p className="text-2xl font-bold text-foreground mt-2">{totalBudgets}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-chart-1">
              <FileText className="h-6 w-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Aceptados</p>
              <p className="text-2xl font-bold text-foreground mt-2">{acceptedBudgets}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-accent">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tasa Conversión</p>
              <p className="text-2xl font-bold text-foreground mt-2">{conversionRate}%</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-chart-2">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monto Total</p>
              <p className="text-2xl font-bold text-foreground mt-2">${(totalAmount / 1000).toFixed(0)}k</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-chart-3">
              <FileText className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4 bg-card border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente o número de presupuesto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </Card>

      {/* Budgets table */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Nº Presupuesto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBudgets.map((budget) => {
                const statusInfo = statusConfig[budget.status]
                const StatusIcon = statusInfo.icon

                return (
                  <tr key={budget.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-foreground">{budget.id}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-foreground">{budget.clientName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground max-w-xs truncate">{budget.description}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-foreground">${budget.amount.toLocaleString("es-AR")}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={`gap-1 ${statusInfo.color} bg-opacity-10`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-muted-foreground">{budget.date}</p>
                      <p className="text-xs text-muted-foreground">Vence: {budget.validUntil}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
