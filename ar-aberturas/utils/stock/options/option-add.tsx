'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';

import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from '@/components/ui/select';
import {
	createOption,
	updateOption,
	type LineOption,
	CodeOption,
	ColorOption,
	SiteOption,
} from '@/lib/stock/stock-options';
import React from 'react';
import { LineSelect } from '@/components/stock/line-select';
import { translateError } from '@/lib/error-translator';

interface OptionFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave?: (option: LineOption | CodeOption | ColorOption | SiteOption) => Promise<void>;
	triggerButton?: boolean;
	materialType?: 'Aluminio' | 'PVC';
	table?: 'lines' | 'codes' | 'colors' | 'sites';
	editingItem?: LineOption | CodeOption | ColorOption | SiteOption | null;
}

export function OptionDialog({
	table,
	open,
	onOpenChange,
	onSave,
	triggerButton = true,
	materialType = 'Aluminio',
	editingItem = null,
}: OptionFormDialogProps) {
	const [option, setOption] = useState('');
	const [dependence, setDependence] = useState('');
	const [tableName, setTableName] = useState(table);
	const [title, setTitle] = useState('');
	const [name, setName] = useState('');
	const [optionName, setOptionName] = useState('');
	const isEditing = !!editingItem;

	React.useEffect(() => {
		if (table === 'lines') {
			setTitle(isEditing ? 'Editar Línea' : 'Agregar Linea');
			setName('Nombre de la línea');
			setOptionName('Línea');
		} else if (table === 'codes') {
			setTitle(isEditing ? 'Editar Código' : 'Agregar Código');
			setName('Nombre del código');
			setOptionName('Código');
		} else if (table === 'colors') {
			setTitle(isEditing ? 'Editar Color' : 'Agregar Color');
			setName('Nombre del color');
			setOptionName('Color');
		} else if (table === 'sites') {
			setTitle(isEditing ? 'Editar Ubicación' : 'Agregar Ubicación');
			setName('Nombre de la ubicación');
			setOptionName('Ubicación');
		} else {
			setTitle(isEditing ? 'Editar opción' : 'Agregar opción');
		}
	}, [table, isEditing]);

	// Load existing data into form when editing, or clear form when creating new
	React.useEffect(() => {
		if (open && isEditing) {
			if (table === 'lines' && 'name_line' in editingItem) {
				setOption(editingItem.name_line);
				setDependence(editingItem.opening);
			} else if (table === 'codes' && 'name_code' in editingItem) {
				setOption(editingItem.name_code);
				setDependence(editingItem.line_name);
			} else if (table === 'colors' && 'name_color' in editingItem) {
				setOption(editingItem.name_color);
				setDependence(editingItem.line_name);
			} else if (table === 'sites' && 'name_site' in editingItem) {
				setOption(editingItem.name_site);
			}
		} else if (open && !isEditing) {
			// Clear form when opening for new option
			setOption('');
			if (table === 'lines') {
				setDependence(materialType || 'Aluminio');
			} else {
				setDependence('');
			}
		}
	}, [open, editingItem, isEditing, table, materialType]);

	// Set default value for 'Abertura' select when dialog opens for lines (solo si no es edición)
	React.useEffect(() => {
		if (open && table === 'lines' && !isEditing) {
			setDependence(materialType || 'Aluminio');
		}
	}, [open, table, materialType, isEditing]);

	const handleSave = async () => {
		if (!option) {
			toast({
				title: 'Error de validación',
				description: 'El nombre es obligatorio',
				variant: 'destructive',
				duration: 5000,
			});
			console.log('Mostrando toast de validación');
			return;
		}

		let fields: any = {};
		let fieldName: string = '';
		let successMessage: string = '';
		if (tableName === 'lines') {
			fields.name_line = option ?? '';
			fields.opening = dependence ?? '';
			fieldName = 'línea';
			successMessage = isEditing ? 'Línea actualizada correctamente' : 'Línea guardada correctamente';
			setOptionName('Linea');
		} else if (tableName === 'codes') {
			fields.name_code = option ?? '';
			fields.line_name = dependence ?? '';
			fieldName = 'código';
			successMessage = isEditing ? 'Código actualizado correctamente' : 'Código guardado correctamente';
			setOptionName('Código');
		} else if (tableName === 'colors') {
			fields.name_color = option ?? '';
			fields.line_name = dependence ?? '';
			fieldName = 'color';
			successMessage = isEditing ? 'Color actualizado correctamente' : 'Color guardado correctamente';
			setOptionName('Color');
		} else if (tableName === 'sites') {
			fields.name_site = option ?? '';
			fieldName = 'ubicación';
			successMessage = isEditing ? 'Ubicación actualizada correctamente' : 'Ubicación guardada correctamente';
			setOptionName('Ubicación');
		}

		let data: any = null;
		let error: any = null;

		if (isEditing && editingItem && 'id' in editingItem) {
			// Modo edición - actualizar los campos editados
			const result = await updateOption(tableName ?? '', editingItem.id, fields);
			data = result.data;
			error = result.error;

			// Si no hay error pero tampoco data, usamos los datos editados
			if (!error && !data) {
				data = { ...editingItem, ...fields };
			}
		} else {
			// Mode creation
			const result = await createOption(tableName ?? '', fields);
			data = result.data;
			error = result.error;
		}

		if (error) {
			console.error('Supabase error:', error);
			let errorMessage = translateError(error);
			toast({
				title: isEditing ? 'Error al actualizar' : 'Error al guardar',
				description: errorMessage,
				variant: 'destructive',
				duration: 5000,
			});
			return;
		}

		if (onSave && data) {
			await onSave(data as LineOption | CodeOption | ColorOption | SiteOption);
		}

		toast({
			title: 'Éxito',
			description: successMessage,
			duration: 3000,
		});

		setOption('');
		setDependence('');
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{triggerButton && (
				<DialogTrigger asChild>
					<Button className="gap-2" size="sm">
						<Plus className="h-4 w-4" />
						{title}
					</Button>
				</DialogTrigger>
			)}

			<DialogContent showCloseButton={false} className="bg-card max-h-[90vh] flex flex-col">
				<DialogHeader className="flex-shrink-0">
					<DialogTitle>{isEditing ? 'Editar opción' : 'Agregar nueva opción'}</DialogTitle>
					<DialogDescription>
						{isEditing ? 'Actualice los datos' : 'Ingrese los datos'}
					</DialogDescription>
				</DialogHeader>

				<div className="overflow-y-auto flex-1 py-4 pr-2 -mr-2">
					<div className="grid gap-4">
						{(table === 'codes' || table === 'colors') && (
							<div className="grid gap-2">
								<Label htmlFor="dependence">Linea</Label>
								<LineSelect
									value={dependence}
									onValueChange={setDependence}
									materialType={materialType}
								/>
							</div>
						)}
						{table === 'lines' && (
							<div className="grid gap-2">
								<Label htmlFor="dependence">Abertura</Label>
								<Select value={dependence} onValueChange={setDependence}>
									<SelectTrigger className="bg-background w-full">
										<SelectValue placeholder="Selecciona una abertura" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Aluminio">Aluminio</SelectItem>
										<SelectItem value="PVC">PVC</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}
						<div className="grid gap-2">
							<Label htmlFor="optionName">{optionName}</Label>
							<Input
								id="optionName"
								type="text"
								placeholder={name}
								value={option}
								onChange={(e) => setOption(e.target.value)}
								required
							/>
						</div>
					</div>
				</div>

				<DialogFooter className="flex-shrink-0 pt-4 border-t border-border">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="w-full sm:w-auto"
					>
						Cancelar
					</Button>
					<Button onClick={handleSave} className="w-full sm:w-auto">
						{isEditing ? 'Actualizar' : 'Guardar'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
