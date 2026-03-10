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
import React from 'react';
import { DialogFooter } from '@/components/ui/dialog';
import { Claim } from '@/lib/claims/claims';

interface ClaimsFormProps {
	formData: any;
	isLoading: boolean;
	claimToEdit?: Claim;
	onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
	onSelectChange: (field: string, value: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	onCancel: () => void;
}

export function ClaimsForm({
	formData,
	isLoading,
	claimToEdit,
	onInputChange,
	onSelectChange,
	onSubmit,
	onCancel,
}: ClaimsFormProps) {
	return (
		<form onSubmit={onSubmit} className="grid gap-4 py-4">
			<div className="grid grid-cols-2 gap-4">
				<div className="grid gap-2">
					<Label htmlFor="client_name" className="text-foreground">
						Apellido y Nombre del cliente
					</Label>
					<Input
						id="client_name"
						value={formData.client_name}
						onChange={onInputChange}
						className="bg-background"
					/>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="client_phone" className="text-foreground">
						Teléfono del cliente
					</Label>
					<Input
						id="client_phone"
						type="tel"
						value={formData.client_phone}
						onChange={onInputChange}
						className="bg-background"
					/>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="grid gap-2">
					<Label htmlFor="work_locality" className="text-foreground">
						Localidad de obra
					</Label>
					<Input
						id="work_locality"
						value={formData.work_locality}
						onChange={onInputChange}
						placeholder="Localidad"
						className="bg-background"
					/>
				</div>
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
