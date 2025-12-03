'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, MapPin, Phone, Mail, Eye, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { updateClient } from '@/lib/clients/clients';
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
import { Client, listClients, deleteClient } from '@/lib/clients/clients';
import { ClientsAddDialog } from '@/utils/clients/clients-add-dialog';

export function ClientManagement() {
	const [clients, setClients] = useState<Client[]>([])
	const [searchTerm, setSearchTerm] = useState('');
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [selectedClient, setSelectedClient] = useState<Client | null>(null);
	const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

	useEffect(() => {
		async function load() {
			try {
				const { data } = await listClients();
				setClients(data ?? []);
			} catch (err) {
				console.error('Error cargando clientes', err);
			}
		}
		load();
	}, []);

	const handleClientAdded = async () => {
		try {
			const { data } = await listClients();
			setClients(data ?? []);
		} catch (err) {
			console.error('Error refrescando clientes', err);
		}
	};

	const handleEditClient = (client: Client) => {
		setSelectedClient(client);
		setIsEditDialogOpen(true);
	};

	const handleUpdateClient = async (updatedClient: Client) => {
		try {
			await updateClient(updatedClient.id, updatedClient);
			const { data } = await listClients();
			setClients(data ?? []);
			setIsEditDialogOpen(false);
			setSelectedClient(null);
		} catch (err) {
			console.error('Error actualizando cliente:', err);
		}
	};

	const handleDeleteClick = (client: Client) => {
		setClientToDelete(client);
	};

	const confirmDelete = async () => {
		if (!clientToDelete) return;

		try {
			const { error } = await deleteClient(clientToDelete.id);
			if (error) throw error;

			// Refresh the clients list
			const { data } = await listClients();
			setClients(data ?? []);
			setClientToDelete(null);
		} catch (err) {
			console.error('Error eliminando el cliente:', err);
		}
	};

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
			{/* Delete Confirmation Dialog */}
			<Dialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle className="text-destructive flex items-center gap-2">
							<AlertTriangle className="h-5 w-5" />
							Eliminar cliente
						</DialogTitle>
						<DialogDescription>
							¿Estás seguro de que deseas eliminar a {clientToDelete?.name} {clientToDelete?.last_name}? Esta acción no se puede deshacer.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setClientToDelete(null)}>
							Cancelar
						</Button>
						<Button variant="destructive" onClick={confirmDelete}>
							<Trash2 className="mr-2 h-4 w-4" />
							Eliminar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground text-balance">Gestión de Clientes</h2>
					<p className="text-muted-foreground mt-1">Administración de clientes y contactos</p>
				</div>
				<Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
					<Plus className="h-4 w-4" />
					Nuevo cliente
				</Button>
				<ClientsAddDialog 
					open={isAddDialogOpen} 
					onOpenChange={setIsAddDialogOpen} 
					onClientAdded={handleClientAdded} 
				/>
				{selectedClient && (
					<ClientsAddDialog 
						open={isEditDialogOpen} 
						onOpenChange={setIsEditDialogOpen} 
						onClientAdded={handleClientAdded}
						clientToEdit={selectedClient}
						onUpdateClient={handleUpdateClient}
					/>
				)}
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
									<div className="flex items-center justify-between w-full">
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
											<div>
												<h3 className="font-semibold text-foreground">
													{client.name} {client.last_name}
												</h3>
											</div>
										</div>
										<button 
											onClick={() => handleDeleteClick(client)}
											className="text-muted-foreground hover:text-destructive transition-colors p-0.1 -mt-13 -mr-3"
											title="Eliminar cliente"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									</div>

									<div className="space-y-2 text-sm pt-2">
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
										<Button 
											variant="outline" 
											size="sm" 
											className="flex-1 gap-2 bg-transparent"
											onClick={() => handleEditClient(client)}
										>
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
