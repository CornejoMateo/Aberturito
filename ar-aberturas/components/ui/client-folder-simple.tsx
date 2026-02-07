'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
	Mail, 
	Phone, 
	MapPin, 
	Eye, 
	Edit, 
	Trash2,
	Building2
} from 'lucide-react';
import { Client } from '@/lib/clients/clients';

interface ClientFolderSimpleProps {
	client: Client;
	onView: (client: Client) => void;
	onEdit: (client: Client) => void;
	onDelete: (client: Client) => void;
}

export function ClientFolderSimple({ client, onView, onEdit, onDelete }: ClientFolderSimpleProps) {
	return (
		<div className="relative">
			{/* Folder Tab */}
			<div className="absolute -top-2 left-0 right-0 h-6 bg-gradient-to-b from-primary to-primary/80 rounded-t-lg border-t border-x border-primary/60 shadow-sm z-10">
				<div className="flex items-center justify-between px-3 py-1">
					<div className="flex items-center gap-2">
						<Building2 className="h-3 w-3 text-primary-foreground" />
						<span className="text-xs font-medium text-primary-foreground truncate max-w-[120px]">
							{client.name} {client.last_name}
						</span>
					</div>
					{/* Delete button on tab */}
					<button
						onClick={(e) => {
							e.stopPropagation();
							onDelete(client);
						}}
						className="opacity-0 group-hover:opacity-100 transition-opacity text-primary-foreground hover:text-destructive"
						title="Eliminar cliente"
					>
						<Trash2 className="h-3 w-3" />
					</button>
				</div>
			</div>

			{/* Main Card with folder styling */}
			<Card 
				className="
					relative pt-4 p-6 bg-card border-border hover:border-primary/50 transition-colors
					border-t-0 rounded-t-none shadow-md hover:shadow-lg
					group cursor-pointer
				"
				onClick={() => onView(client)}
			>
				<div className="space-y-4">
					<div className="flex items-center justify-between w-full">
						<div className="flex items-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
								<span className="font-semibold text-primary text-lg">
									{client.name
										?.split(' ')
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
						<Button
							variant="outline"
							size="sm"
							className="flex-1 gap-2 bg-transparent"
							onClick={(e) => {
								e.stopPropagation();
								onView(client);
							}}
						>
							<Eye className="h-4 w-4" />
							Ver
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="flex-1 gap-2 bg-transparent"
							onClick={(e) => {
								e.stopPropagation();
								onEdit(client);
							}}
						>
							<Edit className="h-4 w-4" />
							Editar
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
}
