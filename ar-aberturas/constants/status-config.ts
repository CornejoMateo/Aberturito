import { CheckCircle, XCircle, Clock, Play } from "lucide-react"

export const statusConfigCalendar = {
  programado: { label: "Programado", color: "bg-muted text-muted-foreground" },
  confirmado: { label: "Confirmado", color: "bg-accent/10 text-accent" },
  completado: { label: "Completado", color: "bg-primary/10 text-primary" },
}

export const statusConfigBudget = {
  emitido: { label: "Emitido", icon: Clock, color: "bg-chart-3 text-chart-3" },
  aceptado: { label: "Aceptado", icon: CheckCircle, color: "bg-accent text-accent" },
  rechazado: { label: "Rechazado", icon: XCircle, color: "bg-destructive text-destructive" },
  en_ejecucion: { label: "En ejecución", icon: Play, color: "bg-chart-1 text-chart-1" },
}