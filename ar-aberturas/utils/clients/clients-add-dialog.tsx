import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import { createClient } from '@/lib/clients/clients';
import { createClientFolder } from '@/lib/storage/client-folders';

interface ClientsAddDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onClientAdded?: () => void;
}

export function ClientsAddDialog({ open, onOpenChange, onClientAdded }: ClientsAddDialogProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		last_name: '',
		email: '',
		phone_number: '',
		locality: '',
	});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[id === 'clientName' ? 'name' : id === 'clientLastName' ? 'last_name' : id === 'phone' ? 'phone_number' : id]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			const payload = {
				name: formData.name,
				last_name: formData.last_name,
				email: formData.email || null,
				phone_number: formData.phone_number || null,
				locality: formData.locality || null,
			};

			const { data: client, error } = await createClient(payload);
			if (error) throw error;

			if (client) {
				// Crear la carpeta en Storage
				await createClientFolder(client.id);
				onClientAdded?.();
				onOpenChange(false);
				setFormData({ name: '', last_name: '', email: '', phone_number: '', locality: '' });
			}
		} catch (error) {
			console.error('Error al crear el cliente:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button className="gap-2">
					<Plus className="h-4 w-4" />
					Nuevo cliente
				</Button>
			</DialogTrigger>
			<DialogContent className="bg-card max-w-2xl">
				<DialogHeader>
					<DialogTitle className="text-foreground">Registrar nuevo cliente</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Complete los datos del cliente para agregarlo al sistema
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="clientName" className="text-foreground">
							Nombre
						</Label>
						<Input id="clientName" value={formData.name} onChange={handleInputChange} className="bg-background" />
					</div>
					<div className="grid gap-2">
						<Label htmlFor="clientLastName" className="text-foreground">
							Apellido
						</Label>
						<Input id="clientLastName" value={formData.last_name} onChange={handleInputChange} className="bg-background" />
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label htmlFor="email" className="text-foreground">
								Email
							</Label>
							<Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="cliente@email.com" className="bg-background" />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="phone" className="text-foreground">
								Teléfono
							</Label>
							<Input id="phone" value={formData.phone_number} onChange={handleInputChange} className="bg-background" />
						</div>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="locality" className="text-foreground">
							Localidad
						</Label>
						<Input id="locality" value={formData.locality} onChange={handleInputChange} className="bg-background" />
					</div>

					<DialogFooter>
						<Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
							Cancelar
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? 'Guardando...' : 'Guardar cliente'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
