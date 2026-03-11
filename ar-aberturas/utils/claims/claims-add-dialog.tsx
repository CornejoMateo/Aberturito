import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import React, { useState, useEffect } from 'react';
import { createClaim, updateClaim, Claim } from '@/lib/claims/claims';
import { toast } from '@/components/ui/use-toast';
import { ClaimsForm } from './claims-form';

interface ClaimsAddDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onClaimAdded?: () => void;
	claimToEdit?: Claim;
	mode?: 'reclamo' | 'diario';
}

export function ClaimsAddDialog({
	open,
	onOpenChange,
	onClaimAdded,
	claimToEdit,
	mode = 'reclamo',
}: ClaimsAddDialogProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		client_name: claimToEdit?.client_name || '',
		client_phone: claimToEdit?.client_phone || '',
		work_zone: claimToEdit?.work_zone || '',
		work_locality: claimToEdit?.work_locality || '',
		work_address: claimToEdit?.work_address || '',
		alum_pvc: claimToEdit?.alum_pvc || '',
		attend: claimToEdit?.attend || '',
		description: claimToEdit?.description || '',
		date: claimToEdit?.date || new Date().toISOString().split('T')[0],
	});

	useEffect(() => {
		if (claimToEdit && open) {
			setFormData({
				client_name: claimToEdit.client_name || '',
				client_phone: claimToEdit.client_phone || '',
				work_zone: claimToEdit.work_zone || '',
				work_locality: claimToEdit.work_locality || '',
				work_address: claimToEdit.work_address || '',
				alum_pvc: claimToEdit.alum_pvc || '',
				attend: claimToEdit.attend || '',
				description: claimToEdit.description || '',
				date: claimToEdit.date || new Date().toISOString().split('T')[0],
			});
		} else if (!claimToEdit && open) {
			resetForm();
		}
	}, [open, claimToEdit]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			const payload = {
				client_name: formData.client_name || null,
				client_phone: formData.client_phone || null,
				work_zone: formData.work_zone || null,
				work_locality: formData.work_locality || null,
				work_address: formData.work_address || null,
				daily: mode === 'diario' ? true : false,
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
					title: mode === 'reclamo' ? 'Reclamo actualizado' : 'Actividad actualizada',
					description:
						mode === 'reclamo'
							? 'El reclamo ha sido actualizado correctamente.'
							: 'La actividad diaria ha sido actualizada correctamente.',
				});
			} else {
				// Create new claim
				const { error } = await createClaim(payload);
				if (error) throw error;
				toast({
					title: mode === 'reclamo' ? 'Reclamo creado' : 'Actividad creada',
					description:
						mode === 'reclamo'
							? 'El reclamo ha sido creado correctamente.'
							: 'La actividad diaria ha sido creada correctamente.',
				});
			}

			onClaimAdded?.();
			onOpenChange(false);
			resetForm();
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

	const resetForm = () => {
		setFormData({
			client_name: '',
			client_phone: '',
			work_zone: '',
			work_locality: '',
			work_address: '',
			alum_pvc: '',
			attend: '',
			description: '',
			date: new Date().toISOString().split('T')[0],
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-card max-w-2xl">
				<DialogHeader>
					<DialogTitle className="text-foreground">
						{claimToEdit
							? mode === 'reclamo'
								? 'Editar reclamo'
								: 'Editar actividad'
							: mode === 'reclamo'
								? 'Registrar nuevo reclamo'
								: 'Registrar nueva actividad'}
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						{claimToEdit
							? mode === 'reclamo'
								? 'Actualice los datos del reclamo'
								: 'Actualice los datos de la actividad diaria'
							: mode === 'reclamo'
								? 'Complete los datos del reclamo para agregarlo al sistema'
								: 'Complete los datos de la actividad diaria para agregarla al sistema'}
					</DialogDescription>
				</DialogHeader>

				<ClaimsForm
					formData={formData}
					isLoading={isLoading}
					claimToEdit={claimToEdit}
					onInputChange={handleInputChange}
					onSelectChange={handleSelectChange}
					onSubmit={handleSubmit}
					onCancel={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}
