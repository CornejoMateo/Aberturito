import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import React from 'react';

interface ClientsAddDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ClientsAddDialog({ open, onOpenChange }: ClientsAddDialogProps) {
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
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="clientName" className="text-foreground">
							Nombre
						</Label>
						<Input id="clientName" className="bg-background" />
					</div>
					<div className="grid gap-2">
						<Label htmlFor="clientLastName" className="text-foreground">
							Apellido
						</Label>
						<Input id="clientLastName" className="bg-background" />
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
							<Input id="phone" className="bg-background" />
						</div>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="locality" className="text-foreground">
							Localidad
						</Label>
						<Input id="locality" className="bg-background" />
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancelar
					</Button>
					<Button onClick={() => onOpenChange(false)}>Guardar cliente</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
