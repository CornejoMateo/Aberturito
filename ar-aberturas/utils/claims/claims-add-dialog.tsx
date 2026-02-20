import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog';
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
import { Checkbox } from '@/components/ui/checkbox';
import React, { useState, useEffect } from 'react';
import { createClaim, updateClaim, Claim } from '@/lib/claims/claims';
import { useToast } from '@/components/ui/use-toast';

interface ClaimsAddDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onClaimAdded?: () => void;
	claimToEdit?: Claim;
}

export function ClaimsAddDialog({
	open,
	onOpenChange,
	onClaimAdded,
	claimToEdit,
}: ClaimsAddDialogProps) {
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		client_id: claimToEdit?.client_id?.toString() || '',
		work_id: claimToEdit?.work_id || '',
		daily: claimToEdit?.daily || false,
		alum_pvc: claimToEdit?.alum_pvc || '',
		attend: claimToEdit?.attend || '',
		description: claimToEdit?.description || '',
		date: claimToEdit?.date || new Date().toISOString().split('T')[0],
	});

	useEffect(() => {
		if (claimToEdit && open) {
			setFormData({
				client_id: claimToEdit.client_id?.toString() || '',
				work_id: claimToEdit.work_id || '',
				daily: claimToEdit.daily || false,
				alum_pvc: claimToEdit.alum_pvc || '',
				attend: claimToEdit.attend || '',
				description: claimToEdit.description || '',
				date: claimToEdit.date || new Date().toISOString().split('T')[0],
			});
		} else if (!claimToEdit && open) {
			setFormData({
				client_id: '',
				work_id: '',
				daily: false,
				alum_pvc: '',
				attend: '',
				description: '',
				date: new Date().toISOString().split('T')[0],
			});
		}
	}, [open, claimToEdit]);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { id, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[id]: value,
		}));
	};

	const handleSelectChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleCheckboxChange = (checked: boolean) => {
		setFormData((prev) => ({
			...prev,
			daily: checked,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			const payload = {
				client_id: formData.client_id ? parseInt(formData.client_id) : null,
				work_id: formData.work_id || null,
				daily: formData.daily,
				alum_pvc: formData.alum_pvc || null,
				attend: formData.attend || null,
				description: formData.description || null,
				date: formData.date || null,
			};

			if (claimToEdit) {
				// Update existing claim
				const { error } = await updateClaim(claimToEdit.id, payload);
				if (error) throw error;
				toast({
					title: 'Reclamo actualizado',
					description: 'El reclamo ha sido actualizado correctamente.',
				});
			} else {
				// Create new claim
				const { error } = await createClaim(payload);
				if (error) throw error;
				toast({
					title: 'Reclamo creado',
					description: 'El reclamo ha sido agregado correctamente.',
				});
			}

			onClaimAdded?.();
			onOpenChange(false);
			setFormData({
				client_id: '',
				work_id: '',
				daily: false,
				alum_pvc: '',
				attend: '',
				description: '',
				date: new Date().toISOString().split('T')[0],
			});
		} catch (error) {
			console.error('Error al procesar el reclamo:', error);
			toast({
				title: 'Error',
				description: claimToEdit
					? 'No se pudo actualizar el reclamo. Por favor, intenta nuevamente.'
					: 'No se pudo crear el reclamo. Por favor, intenta nuevamente.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-card max-w-2xl">
				<DialogHeader>
					<DialogTitle className="text-foreground">
						{claimToEdit ? 'Editar reclamo' : 'Registrar nuevo reclamo'}
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						{claimToEdit
							? 'Actualice los datos del reclamo'
							: 'Complete los datos del reclamo para agregarlo al sistema'}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="grid gap-4 py-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label htmlFor="work_id" className="text-foreground">
								Obra
							</Label>
							<Input
								id="work_id"
								value={formData.work_id}
								onChange={handleInputChange}
								placeholder="ID de obra"
								className="bg-background"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="date" className="text-foreground">
								Fecha
							</Label>
							<Input
								id="date"
								type="date"
								value={formData.date}
								onChange={handleInputChange}
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
								onValueChange={(value) => handleSelectChange('alum_pvc', value)}
							>
								<SelectTrigger className="bg-background">
									<SelectValue placeholder="Seleccionar tipo" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Aluminio">Aluminio</SelectItem>
									<SelectItem value="PVC">PVC</SelectItem>
									<SelectItem value="Ambos">Ambos</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="attend" className="text-foreground">
								Atendido por
							</Label>
							<Input
								id="attend"
								value={formData.attend}
								onChange={handleInputChange}
								placeholder="Nombre del responsable"
								className="bg-background"
							/>
						</div>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="client_id" className="text-foreground">
							ID de Cliente (opcional)
						</Label>
						<Input
							id="client_id"
							type="number"
							value={formData.client_id}
							onChange={handleInputChange}
							placeholder="1234"
							className="bg-background"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="description" className="text-foreground">
							Descripción
						</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={handleInputChange}
							placeholder="Describa el reclamo..."
							className="bg-background min-h-[100px]"
						/>
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="daily"
							checked={formData.daily}
							onCheckedChange={handleCheckboxChange}
						/>
						<Label
							htmlFor="daily"
							className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						>
							Reclamo diario
						</Label>
					</div>

					<DialogFooter>
						<Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
							Cancelar
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? 'Guardando...' : claimToEdit ? 'Actualizar reclamo' : 'Guardar reclamo'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
