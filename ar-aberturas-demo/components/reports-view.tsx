"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Download, TrendingUp, Users, FileText, Package, DollarSign } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

const monthlyData = [
  { month: "Ene", clients: 28, budgets: 45, sales: 32, revenue: 1250000 },
  { month: "Feb", clients: 35, budgets: 52, sales: 38, revenue: 1480000 },
  { month: "Mar", clients: 42, budgets: 68, sales: 48, revenue: 1890000 },
]

const locationData = [
  { location: "Córdoba Capital", clients: 145, percentage: 45 },
  { location: "Villa Carlos Paz", clients: 89, percentage: 28 },
  { location: "Alta Gracia", clients: 52, percentage: 16 },
  { location: "Río Ceballos", clients: 35, percentage: 11 },
]

const conversionData = [
  { category: "Presupuestos Emitidos", value: 165, total: 165, percentage: 100 },
  { category: "Presupuestos Aceptados", value: 112, total: 165, percentage: 68 },
  { category: "Obras Completadas", value: 98, total: 112, percentage: 87 },
]

export function ReportsView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground text-balance">Reportes y Métricas</h2>
          <p className="text-muted-foreground mt-1">Análisis de rendimiento y estadísticas</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Exportar Reporte
        </Button>
      </div>

      {/* Key metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Clientes Totales</p>
              <p className="text-2xl font-bold text-foreground mt-2">342</p>
              <p className="text-xs text-accent mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +18% vs. mes anterior
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-chart-1">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Presupuestos</p>
              <p className="text-2xl font-bold text-foreground mt-2">165</p>
              <p className="text-xs text-accent mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +23% vs. mes anterior
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-chart-2">
              <FileText className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ventas Cerradas</p>
              <p className="text-2xl font-bold text-foreground mt-2">118</p>
              <p className="text-xs text-accent mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +15% vs. mes anterior
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-chart-3">
              <Package className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Facturación</p>
              <p className="text-2xl font-bold text-foreground mt-2">$4.6M</p>
              <p className="text-xs text-accent mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +28% vs. mes anterior
              </p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-chart-4">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="monthly">Rendimiento Mensual</TabsTrigger>
          <TabsTrigger value="locations">Por Localidad</TabsTrigger>
          <TabsTrigger value="conversion">Conversión</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-6">Evolución Trimestral</h3>
            <div className="space-y-6">
              {monthlyData.map((data, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{data.month} 2025</span>
                    <span className="text-sm text-muted-foreground">
                      ${(data.revenue / 1000000).toFixed(1)}M facturado
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Clientes</span>
                        <span className="font-semibold text-foreground">{data.clients}</span>
                      </div>
                      <Progress value={(data.clients / 50) * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Presupuestos</span>
                        <span className="font-semibold text-foreground">{data.budgets}</span>
                      </div>
                      <Progress value={(data.budgets / 80) * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Ventas</span>
                        <span className="font-semibold text-foreground">{data.sales}</span>
                      </div>
                      <Progress value={(data.sales / 60) * 100} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Tasa de Conversión</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Presupuestos → Ventas</span>
                  <span className="text-2xl font-bold text-foreground">68%</span>
                </div>
                <Progress value={68} className="h-3" />
                <p className="text-xs text-muted-foreground">112 de 165 presupuestos convertidos en ventas</p>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Ticket Promedio</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Por Venta</span>
                  <span className="text-2xl font-bold text-foreground">$39k</span>
                </div>
                <Progress value={75} className="h-3" />
                <p className="text-xs text-muted-foreground">Basado en 118 ventas cerradas en el trimestre</p>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-6">Distribución de Clientes por Localidad</h3>
            <div className="space-y-4">
              {locationData.map((location, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{location.location}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{location.clients} clientes</span>
                      <span className="text-sm font-semibold text-foreground">{location.percentage}%</span>
                    </div>
                  </div>
                  <Progress value={location.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Insights de Marketing</h3>
            <div className="space-y-3">
              <div className="flex gap-3 p-4 rounded-lg bg-secondary border border-border">
                <BarChart3 className="h-5 w-5 text-chart-1 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Mayor concentración en Córdoba Capital</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    45% de los clientes están en la capital. Considerar expandir presencia en otras localidades.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-4 rounded-lg bg-secondary border border-border">
                <TrendingUp className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Crecimiento en Villa Carlos Paz</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    28% de participación con tendencia al alza. Oportunidad para campañas focalizadas.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-6">Embudo de Conversión</h3>
            <div className="space-y-6">
              {conversionData.map((item, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{item.category}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {item.value} de {item.total}
                      </span>
                      <span className="text-sm font-semibold text-foreground">{item.percentage}%</span>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress value={item.percentage} className="h-8" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-foreground">{item.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6 bg-card border-border">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Tasa de Aceptación</p>
                <p className="text-3xl font-bold text-foreground">68%</p>
                <p className="text-xs text-accent flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +5% vs. trimestre anterior
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Tasa de Finalización</p>
                <p className="text-3xl font-bold text-foreground">87%</p>
                <p className="text-xs text-accent flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +3% vs. trimestre anterior
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Conversión Total</p>
                <p className="text-3xl font-bold text-foreground">59%</p>
                <p className="text-xs text-accent flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +8% vs. trimestre anterior
                </p>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
