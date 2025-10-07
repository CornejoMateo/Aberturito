"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Search, MapPin, Phone, Mail, Eye, Edit, TrendingUp } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Client = {
  id: string
  name: string
  email: string
  phone: string
  location: string
  budgets: number
  purchases: number
  totalSpent: number
  lastContact: string
  status: "active" | "inactive" | "potential"
}

const initialClients: Client[] = [
  {
    id: "1",
    name: "Juan Pérez",
    email: "juan.perez@email.com",
    phone: "+54 351 123-4567",
    location: "Córdoba Capital",
    budgets: 3,
    purchases: 2,
    totalSpent: 125000,
    lastContact: "2025-03-10",
    status: "active",
  },
  {
    id: "2",
    name: "María González",
    email: "maria.gonzalez@email.com",
    phone: "+54 351 234-5678",
    location: "Villa Carlos Paz",
    budgets: 1,
    purchases: 0,
    totalSpent: 0,
    lastContact: "2025-03-09",
    status: "potential",
  },
  {
    id: "3",
    name: "Roberto Fernández",
    email: "roberto.f@email.com",
    phone: "+54 351 345-6789",
    location: "Alta Gracia",
    budgets: 5,
    purchases: 4,
    totalSpent: 340000,
    lastContact: "2025-03-08",
    status: "active",
  },
  {
    id: "4",
    name: "Laura Martínez",
    email: "laura.martinez@email.com",
    phone: "+54 351 456-7890",
    location: "Río Ceballos",
    budgets: 2,
    purchases: 1,
    totalSpent: 85000,
    lastContact: "2025-03-07",
    status: "active",
  },
  {
    id: "5",
    name: "Carlos Rodríguez",
    email: "carlos.r@email.com",
    phone: "+54 351 567-8901",
    location: "Córdoba Capital",
    budgets: 1,
    purchases: 0,
    totalSpent: 0,
    lastContact: "2025-02-28",
    status: "inactive",
  },
]

const weeklyStats = [
  { week: "Semana 1", clients: 12 },
  { week: "Semana 2", clients: 15 },
  { week: "Semana 3", clients: 18 },
  { week: "Semana 4", clients: 21 },
]

export function ClientManagement() {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const activeClients = clients.filter((c) => c.status === "active").length
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalSpent, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground text-balance">Gestión de Clientes</h2>
          <p className="text-muted-foreground mt-1">Administración de clientes y contactos</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-foreground">Registrar Nuevo Cliente</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Complete los datos del cliente para agregarlo al sistema
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="clientName" className="text-foreground">
                  Nombre Completo
                </Label>
                <Input id="clientName" placeholder="Ej: Juan Pérez" className="bg-background" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email
                  </Label>
                  <Input id="email" type="email" placeholder="cliente@email.com" className="bg-background" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-foreground">
                    Teléfono
                  </Label>
                  <Input id="phone" placeholder="+54 351 123-4567" className="bg-background" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location" className="text-foreground">
                  Localidad
                </Label>
                <Input id="location" placeholder="Ej: Córdoba Capital" className="bg-background" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes" className="text-foreground">
                  Notas
                </Label>
                <Input id="notes" placeholder="Información adicional..." className="bg-background" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>Guardar Cliente</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Clientes</p>
              <p className="text-2xl font-bold text-foreground mt-2">{clients.length}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-chart-1">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Clientes Activos</p>
              <p className="text-2xl font-bold text-foreground mt-2">{activeClients}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-chart-2">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-card border-border col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Facturación Total</p>
              <p className="text-2xl font-bold text-foreground mt-2">${totalRevenue.toLocaleString("es-AR")}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-chart-3">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="list">Lista de Clientes</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Search */}
          <Card className="p-4 bg-card border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o localidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
          </Card>

          {/* Clients grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client) => (
              <Card key={client.id} className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <span className="font-semibold text-primary text-lg">
                          {client.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{client.name}</p>
                        <Badge
                          variant={
                            client.status === "active"
                              ? "default"
                              : client.status === "potential"
                                ? "secondary"
                                : "outline"
                          }
                          className="mt-1"
                        >
                          {client.status === "active"
                            ? "Activo"
                            : client.status === "potential"
                              ? "Potencial"
                              : "Inactivo"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{client.location}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Presupuestos</p>
                      <p className="text-lg font-semibold text-foreground">{client.budgets}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Compras</p>
                      <p className="text-lg font-semibold text-foreground">{client.purchases}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-lg font-semibold text-foreground">${(client.totalSpent / 1000).toFixed(0)}k</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2 bg-transparent">
                      <Eye className="h-4 w-4" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-2 bg-transparent">
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Clientes Ingresados por Semana</h3>
            <div className="space-y-4">
              {weeklyStats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{stat.week}</span>
                    <span className="font-semibold text-foreground">{stat.clients} clientes</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(stat.clients / 25) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Clientes por Localidad</h3>
              <div className="space-y-3">
                {[
                  { location: "Córdoba Capital", count: 45 },
                  { location: "Villa Carlos Paz", count: 28 },
                  { location: "Alta Gracia", count: 18 },
                  { location: "Río Ceballos", count: 12 },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.location}</span>
                    <span className="text-sm font-semibold text-foreground">{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Tasa de Conversión</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Presupuestos Aceptados</span>
                    <span className="font-semibold text-foreground">68%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: "68%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Clientes Recurrentes</span>
                    <span className="font-semibold text-foreground">42%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-chart-1 rounded-full" style={{ width: "42%" }} />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
