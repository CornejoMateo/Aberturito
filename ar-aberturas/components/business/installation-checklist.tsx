"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ClipboardCheck,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

type Task = {
  id: string
  name: string
  completed: boolean
}

type Installation = {
  id: string
  clientName: string
  address: string
  date: string
  status: "pendiente" | "en_progreso" | "completada"
  installer: string
  tasks: Task[]
  notes: string[]
}

const initialInstallations: Installation[] = [
  {
    id: "OBR-001",
    clientName: "Juan Pérez",
    address: "Av. Colón 1234, Córdoba",
    date: "2025-03-11",
    status: "en_progreso",
    installer: "Carlos Gómez",
    tasks: [
      { id: "1", name: "Verificar medidas en sitio", completed: true },
      { id: "2", name: "Preparar superficie de instalación", completed: true },
      { id: "3", name: "Colocar marco de ventana", completed: true },
      { id: "4", name: "Instalar vidrio", completed: false },
      { id: "5", name: "Sellar con silicona", completed: false },
      { id: "6", name: "Ajustar herrajes", completed: false },
      { id: "7", name: "Limpieza final", completed: false },
      { id: "8", name: "Verificación con cliente", completed: false },
    ],
    notes: ["Falta silicona transparente - traer mañana", "Cliente solicita instalación antes de las 14hs"],
  },
  {
    id: "OBR-002",
    clientName: "María González",
    address: "Calle San Martín 567, Villa Carlos Paz",
    date: "2025-03-12",
    status: "pendiente",
    installer: "Roberto Silva",
    tasks: [
      { id: "1", name: "Verificar medidas en sitio", completed: false },
      { id: "2", name: "Preparar superficie de instalación", completed: false },
      { id: "3", name: "Colocar marco de puerta", completed: false },
      { id: "4", name: "Instalar puerta", completed: false },
      { id: "5", name: "Ajustar bisagras", completed: false },
      { id: "6", name: "Instalar manija y cerradura", completed: false },
      { id: "7", name: "Sellar perímetro", completed: false },
      { id: "8", name: "Limpieza y verificación", completed: false },
    ],
    notes: ["Primera instalación - verificar todo el material"],
  },
  {
    id: "OBR-003",
    clientName: "Roberto Fernández",
    address: "Av. Libertador 890, Alta Gracia",
    date: "2025-03-08",
    status: "completada",
    installer: "Carlos Gómez",
    tasks: [
      { id: "1", name: "Verificar medidas en sitio", completed: true },
      { id: "2", name: "Preparar superficie de instalación", completed: true },
      { id: "3", name: "Colocar marcos", completed: true },
      { id: "4", name: "Instalar ventanas", completed: true },
      { id: "5", name: "Sellar con silicona", completed: true },
      { id: "6", name: "Ajustar herrajes", completed: true },
      { id: "7", name: "Limpieza final", completed: true },
      { id: "8", name: "Verificación con cliente", completed: true },
    ],
    notes: ["Instalación completada sin inconvenientes", "Cliente muy satisfecho"],
  },
]

export function InstallationChecklist() {
  const [installations, setInstallations] = useState<Installation[]>(initialInstallations)
  const [expandedId, setExpandedId] = useState<string | null>("OBR-001")

  const toggleTask = (installationId: string, taskId: string) => {
    setInstallations((prev) =>
      prev.map((installation) => {
        if (installation.id === installationId) {
          return {
            ...installation,
            tasks: installation.tasks.map((task) =>
              task.id === taskId ? { ...task, completed: !task.completed } : task,
            ),
          }
        }
        return installation
      }),
    )
  }

  const getProgress = (tasks: Task[]) => {
    const completed = tasks.filter((t) => t.completed).length
    return (completed / tasks.length) * 100
  }

  const pendingCount = installations.filter((i) => i.status === "pendiente").length
  const inProgressCount = installations.filter((i) => i.status === "en_progreso").length
  const completedCount = installations.filter((i) => i.status === "completada").length

  const statusConfig = {
    pendiente: { label: "Pendiente", icon: Clock, color: "text-chart-3 bg-chart-3/10" },
    en_progreso: { label: "En progreso", icon: AlertCircle, color: "text-chart-1 bg-chart-1/10" },
    completada: { label: "Completada", icon: CheckCircle2, color: "text-accent bg-accent/10" },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground text-balance">Checklist de obras</h2>
          <p className="text-muted-foreground mt-1">Seguimiento de instalaciones y tareas</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva obra
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold text-foreground mt-2">{pendingCount}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-chart-3">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">En progreso</p>
              <p className="text-2xl font-bold text-foreground mt-2">{inProgressCount}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-chart-1">
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completadas</p>
              <p className="text-2xl font-bold text-foreground mt-2">{completedCount}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-accent">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Installations list */}
      <div className="space-y-4">
        {installations.map((installation) => {
          const progress = getProgress(installation.tasks)
          const statusInfo = statusConfig[installation.status]
          const StatusIcon = statusInfo.icon
          const isExpanded = expandedId === installation.id

          return (
            <Card key={installation.id} className="bg-card border-border overflow-hidden">
              <Collapsible open={isExpanded} onOpenChange={() => setExpandedId(isExpanded ? null : installation.id)}>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                          <ClipboardCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-foreground">{installation.id}</h3>
                            <Badge variant="outline" className={`gap-1 ${statusInfo.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground mt-1">{installation.clientName}</p>
                        </div>
                      </div>

                      <div className="grid gap-2 md:grid-cols-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{installation.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>{installation.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <ClipboardCheck className="h-4 w-4 flex-shrink-0" />
                          <span>{installation.installer}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progreso</span>
                          <span className="font-semibold text-foreground">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>

                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="flex-shrink-0">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>

                <CollapsibleContent>
                  <div className="border-t border-border p-6 space-y-6 bg-secondary/30">
                    {/* Tasks checklist */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3">Tareas</h4>
                      <div className="space-y-2">
                        {installation.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                          >
                            <Checkbox
                              id={`${installation.id}-${task.id}`}
                              checked={task.completed}
                              onCheckedChange={() => toggleTask(installation.id, task.id)}
                              className="flex-shrink-0"
                            />
                            <label
                              htmlFor={`${installation.id}-${task.id}`}
                              className={`flex-1 text-sm cursor-pointer ${
                                task.completed ? "line-through text-muted-foreground" : "text-foreground"
                              }`}
                            >
                              {task.name}
                            </label>
                            {task.completed && <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {installation.notes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3">Notas y pendientes</h4>
                        <div className="space-y-2">
                          {installation.notes.map((note, index) => (
                            <div key={index} className="flex gap-2 p-3 rounded-lg bg-card border border-border">
                              <AlertCircle className="h-4 w-4 text-chart-3 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-muted-foreground">{note}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
