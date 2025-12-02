'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, MapPin, Phone, Mail, Eye, Edit, TrendingUp } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Client } from '@/lib/clients/clients';
import { ClientsAddDialog } from '@/utils/clients/clients-add-dialog';

export function ClientManagement() {
	const [clients, setClients] = useState<Client[]>([])
	const [searchTerm, setSearchTerm] = useState('');
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [selectedClient, setSelectedClient] = useState<Client | null>(null);

	const filteredClients = clients.filter(
		(client) =>
			client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			client.locality?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Hacer en handle preguntando por el nombre y el apellido antes de guardar, NADA MÁS
	// Sacar tabs porque no usamos
	// Agregar paginación si hay mas de 10 clientes (o otra forma para evitar renderizaciones)

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground text-balance">Gestión de Clientes</h2>
					<p className="text-muted-foreground mt-1">Administración de clientes y contactos</p>
				</div>
				<ClientsAddDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
			</div>

			{/* Stats */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card className="p-6 bg-card border-border">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Total clientes</p>
							<p className="text-2xl font-bold text-foreground mt-2">{clients.length}</p>
						</div>
						<div className="rounded-lg bg-secondary p-3 text-chart-1">
							<Users className="h-6 w-6" />
						</div>
					</div>
				</Card>
			</div>

			<Tabs defaultValue="list" className="space-y-4">

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
							<Card
								key={client.id}
								className="p-6 bg-card border-border hover:border-primary/50 transition-colors"
							>
								<div className="space-y-4">
									<div className="flex items-start justify-between">
										<div className="flex items-center gap-3">
											<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
												<span className="font-semibold text-primary text-lg">
													{client.name
														.split(' ')
														.map((n) => n[0])
														.join('')
														.toUpperCase()
														.slice(0, 2)}
												</span>
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
											<span>{client.phone_number}</span>
										</div>
										<div className="flex items-center gap-2 text-muted-foreground">
											<MapPin className="h-4 w-4" />
											<span>{client.locality}</span>
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

			</Tabs>
		</div>
	);
}
