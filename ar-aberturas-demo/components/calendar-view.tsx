"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, User, Package, Wrench } from "lucide-react"

type Event = {
  id: string
  title: string
  type: "entrega" | "instalacion" | "medicion"
  date: string
  time: string
  client: string
  location: string
  installer?: string
  status: "programado" | "confirmado" | "completado"
}

const events: Event[] = [
  {
    id: "1",
    title: "Entrega de ventanas",
    type: "entrega",
    date: "2025-03-11",
    time: "10:00",
    client: "Juan Pérez",
    location: "Av. Colón 1234",
    status: "confirmado",
  },
  {
    id: "2",
    title: "Instalación de puerta",
    type: "instalacion",
    date: "2025-03-12",
    time: "09:00",
    client: "María González",
    location: "Calle San Martín 567",
    installer: "Roberto Silva",
    status: "programado",
  },
  {
    id: "3",
    title: "Medición en obra",
    type: "medicion",
    date: "2025-03-13",
    time: "14:00",
    client: "Carlos López",
    location: "Av. Libertador 890",
    status: "programado",
  },
  {
    id: "4",
    title: "Instalación ventanas",
    type: "instalacion",
    date: "2025-03-14",
    time: "08:30",
    client: "Laura Martínez",
    location: "Río Ceballos",
    installer: "Carlos Gómez",
    status: "confirmado",
  },
  {
    id: "5",
    title: "Entrega de materiales",
    type: "entrega",
    date: "2025-03-15",
    time: "11:00",
    client: "Roberto Fernández",
    location: "Alta Gracia",
    status: "programado",
  },
]

const typeConfig = {
  entrega: { label: "Entrega", icon: Package, color: "bg-chart-1 text-chart-1" },
  instalacion: { label: "Instalación", icon: Wrench, color: "bg-chart-2 text-chart-2" },
  medicion: { label: "Medición", icon: User, color: "bg-chart-3 text-chart-3" },
}

const statusConfig = {
  programado: { label: "Programado", color: "bg-muted text-muted-foreground" },
  confirmado: { label: "Confirmado", color: "bg-accent/10 text-accent" },
  completado: { label: "Completado", color: "bg-primary/10 text-primary" },
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 2, 11)) // March 11, 2025

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return events.filter((event) => event.date === dateStr)
  }

  const upcomingEvents = events.filter((event) => {
    const eventDate = new Date(event.date)
    return eventDate >= new Date(2025, 2, 11)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground text-balance">Calendario</h2>
          <p className="text-muted-foreground mt-1">Entregas, instalaciones y eventos programados</p>
        </div>
        <Button className="gap-2">
          <Calendar className="h-4 w-4" />
          Nuevo Evento
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="p-6 bg-card border-border lg:col-span-2">
          <div className="space-y-4">
            {/* Calendar header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day names */}
              {dayNames.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {/* Calendar days */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1
                const dayEvents = getEventsForDate(day)
                const isToday = day === 11 // Demo: March 11 is today

                return (
                  <div
                    key={day}
                    className={`aspect-square p-2 rounded-lg border transition-colors ${
                      isToday
                        ? "border-primary bg-primary/5"
                        : dayEvents.length > 0
                          ? "border-border bg-secondary hover:bg-secondary/80"
                          : "border-border hover:bg-secondary/50"
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <span
                        className={`text-sm font-medium ${isToday ? "text-primary" : dayEvents.length > 0 ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <div className="flex-1 flex items-center justify-center mt-1">
                          <div className="flex gap-1">
                            {dayEvents.slice(0, 3).map((event, i) => {
                              const typeInfo = typeConfig[event.type]
                              return (
                                <div key={i} className={`h-1.5 w-1.5 rounded-full ${typeInfo.color.split(" ")[0]}`} />
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Upcoming events */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Próximos Eventos</h3>
          <div className="space-y-3">
            {upcomingEvents.slice(0, 5).map((event) => {
              const typeInfo = typeConfig[event.type]
              const statusInfo = statusConfig[event.status]
              const TypeIcon = typeInfo.icon

              return (
                <div key={event.id} className="p-3 rounded-lg bg-secondary border border-border space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${typeInfo.color.split(" ")[0]}/10`}>
                        <TypeIcon className={`h-3.5 w-3.5 ${typeInfo.color.split(" ")[1]}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.client}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-xs ${statusInfo.color} flex-shrink-0`}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      <span>{event.time} hs</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    {event.installer && (
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3" />
                        <span>{event.installer}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Legend */}
      <Card className="p-4 bg-card border-border">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-1" />
            <span className="text-sm text-muted-foreground">Entregas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-2" />
            <span className="text-sm text-muted-foreground">Instalaciones</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-3" />
            <span className="text-sm text-muted-foreground">Mediciones</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
