import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import React, { useEffect, useState } from 'react';
import { DialogFooter } from '@/components/ui/dialog';
import { Claim } from '@/lib/claims/claims';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from '@/components/ui/command';
import { Client } from '@/lib/clients/clients';
import { Work } from '@/lib/works/works';

const NO_WORK_VALUE = '__none__';

interface ClaimsFormProps {
	formData: any;
	isLoading: boolean;
	claimToEdit?: Claim;
	onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
	onSelectChange: (field: string, value: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	onCancel: () => void;
	clients: Client[];
	works: Work[];
	isLoadingWorks: boolean;
}

export function ClaimsForm({
	formData,
	isLoading,
	claimToEdit,
	onInputChange,
	onSelectChange,
	onSubmit,
	onCancel,
	clients,
	works,
	isLoadingWorks,
}: ClaimsFormProps) {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<Client | null>(null);

	useEffect(() => {
		const match = clients.find((client) => client.id === formData.client_id) ?? null;
		setSelected(match);
	}, [clients, formData.client_id]);

	const selectedClientLabel = selected
		? `${selected.name || ''} ${selected.last_name || ''}`.trim() || 'Cliente sin nombre'
		: 'Seleccionar cliente...';

	const selectedWorkId = String(formData.selected_work_id || '');

	return (
		<form onSubmit={onSubmit} className="grid gap-4 py-4">
			<div className="grid gap-2">
				<Label className="text-foreground">Cliente</Label>
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button variant="outline" className="w-full justify-start">
							{selectedClientLabel}
						</Button>
					</PopoverTrigger>

					<PopoverContent className="w-full p-0">
						<Command>
							<CommandInput placeholder="Buscar cliente..." />

							<CommandList>
								<CommandEmpty>No encontrado</CommandEmpty>

								{clients.map((client) => {
									const fullName = `${client.name || ''} ${client.last_name || ''}`.trim() || 'Cliente sin nombre';
									const searchableValue = `${fullName} ${client.phone_number || ''}`;

									return (
										<CommandItem
											key={client.id}
											value={searchableValue}
											onSelect={() => {
												setSelected(client);
												onSelectChange('client_id', client.id);
												setOpen(false);
											}}
										>
											{fullName}
										</CommandItem>
									);
								})}
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
				{formData.client_id && (
					<p className="text-xs text-muted-foreground">ID cliente: {formData.client_id}</p>
				)}
			</div>

			<div className="grid gap-2 w-full">
				<Label htmlFor="selected_work_id" className="text-foreground">
					Obra del cliente
				</Label>
				<Select
					value={selectedWorkId}
					onValueChange={(value) => onSelectChange('selected_work_id', value)}
					disabled={!formData.client_id || isLoadingWorks}
				>
					<SelectTrigger id="selected_work_id" className="bg-background">
						<SelectValue
							placeholder={
								!formData.client_id
									? 'Primero seleccioná un cliente'
									: isLoadingWorks
										? 'Cargando obras...'
										: works.length === 0
											? 'Sin obras para este cliente'
											: 'Seleccionar obra'
							}
						/>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={NO_WORK_VALUE}>Ninguna</SelectItem>
						{works.map((work) => (
							<SelectItem key={work.id} value={String(work.id)}>
								{work.locality || 'Sin localidad'} - {work.address || 'Sin dirección'}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="grid gap-2">
				<Label htmlFor="locality" className="text-foreground">
					Localidad de obra
				</Label>
				<Input
					id="locality"
					value={formData.work_locality}
					onChange={onInputChange}
					placeholder="Localidad"
					className="bg-background"
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="grid gap-2">
					<Label htmlFor="work_zone" className="text-foreground">
						Zona de obra
					</Label>
					<Input
						id="work_zone"
						value={formData.work_zone}
						onChange={onInputChange}
						placeholder="Zona"
						className="bg-background"
					/>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="work_address" className="text-foreground">
						Dirección de obra
					</Label>
					<Input
						id="work_address"
						value={formData.work_address}
						onChange={onInputChange}
						placeholder="Dirección completa"
						className="bg-background"
					/>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="grid gap-2">
					<Label htmlFor="alum_pvc" className="text-foreground">
						Tipo
					</Label>
					<Select
						value={formData.alum_pvc}
						onValueChange={(value) => onSelectChange('alum_pvc', value)}
					>
						<SelectTrigger className="bg-background">
							<SelectValue placeholder="Seleccionar tipo" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="Aluminio">Aluminio</SelectItem>
							<SelectItem value="PVC">PVC</SelectItem>
							<SelectItem value="Persiana">Persiana</SelectItem>
							<SelectItem value="Mampara">Mampara</SelectItem>
							<SelectItem value="Portón">Portón</SelectItem>
							<SelectItem value="Vidrio">Vidrio</SelectItem>
							<SelectItem value="Otros">Otros</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="date" className="text-foreground">
						Fecha
					</Label>
					<Input
						id="date"
						type="date"
						value={formData.date}
						onChange={onInputChange}
						className="bg-background"
					/>
				</div>
			</div>

			{claimToEdit && (
				<div className="grid gap-2">
					<Label htmlFor="attend" className="text-foreground">
						Atendido por
					</Label>
					<Input
						id="attend"
						value={formData.attend}
						onChange={onInputChange}
						placeholder="Nombre del responsable"
						className="bg-background"
					/>
				</div>
			)}

			<div className="grid gap-2">
				<Label htmlFor="description" className="text-foreground">
					Descripción
				</Label>
				<Textarea
					id="description"
					value={formData.description}
					onChange={onInputChange}
					placeholder="Describa el reclamo/actividad..."
					className="bg-background min-h-[100px]"
				/>
			</div>

			<DialogFooter>
				<Button variant="outline" type="button" onClick={() => onCancel()}>
					Cancelar
				</Button>
				<Button type="submit" disabled={isLoading}>
					{isLoading ? 'Guardando...' : claimToEdit ? 'Actualizar' : 'Guardar'}
				</Button>
			</DialogFooter>
		</form>
	);
}
