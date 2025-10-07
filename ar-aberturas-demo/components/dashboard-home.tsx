import { Card } from "@/components/ui/card"
import { Package, Users, FileText, ClipboardCheck, TrendingUp, AlertCircle } from "lucide-react"

const stats = [
  {
    name: "Stock Total",
    value: "1,247",
    change: "+12%",
    icon: Package,
    color: "text-chart-1",
  },
  {
    name: "Clientes Activos",
    value: "342",
    change: "+8%",
    icon: Users,
    color: "text-chart-2",
  },
  {
    name: "Presupuestos",
    value: "89",
    change: "+23%",
    icon: FileText,
    color: "text-chart-3",
  },
  {
    name: "Obras en Curso",
    value: "24",
    change: "+5%",
    icon: ClipboardCheck,
    color: "text-chart-4",
  },
]

const recentActivity = [
  {
    title: "Nuevo presupuesto creado",
    description: "Cliente: Juan Pérez - Ventana 150x120cm",
    time: "Hace 5 minutos",
  },
  {
    title: "Obra completada",
    description: "Instalación en Av. Libertador 1234",
    time: "Hace 1 hora",
  },
  {
    title: "Stock actualizado",
    description: "Perfiles de aluminio - 50 unidades",
    time: "Hace 2 horas",
  },
  {
    title: "Cliente registrado",
    description: "María González - Villa Carlos Paz",
    time: "Hace 3 horas",
  },
]

const alerts = [
  {
    title: "Stock bajo",
    description: "Silicona transparente - Solo 5 unidades",
    type: "warning",
  },
  {
    title: "Entrega pendiente",
    description: "Obra #1234 - Programada para mañana",
    type: "info",
  },
]

export function DashboardHome() {
  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground text-balance">Bienvenido al Sistema de Gestión</h2>
        <p className="text-muted-foreground mt-1">Resumen de actividades y métricas principales</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
                <p className="text-xs text-accent mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.change} vs. mes anterior
                </p>
              </div>
              <div className={`rounded-lg bg-secondary p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent activity */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex h-2 w-2 mt-2 rounded-full bg-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Alerts */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Alertas y Notificaciones</h3>
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <div key={index} className="flex gap-3 rounded-lg bg-secondary p-4 border border-border">
                <AlertCircle
                  className={`h-5 w-5 flex-shrink-0 ${alert.type === "warning" ? "text-chart-3" : "text-chart-1"}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{alert.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
