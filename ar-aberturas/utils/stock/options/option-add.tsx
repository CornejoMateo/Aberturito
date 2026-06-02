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
	updateLineWithDependencies,
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
	initialData?: LineOption | CodeOption | ColorOption | SiteOption;
}

export function OptionDialog({
	table,
	open,
	onOpenChange,
	onSave,
	triggerButton = true,
	materialType = 'Aluminio',
	initialData,
}: OptionFormDialogProps) {
	const [option, setOption] = useState('');
	const [dependence, setDependence] = useState('');
	const [tableName, setTableName] = useState(table);
	const [title, setTitle] = useState('');
	const [name, setName] = useState('');
	const [optionName, setOptionName] = useState('');
	const isEditMode = !!initialData;

	React.useEffect(() => {
		if (table === 'lines') {
			setTitle(isEditMode ? 'Editar Linea' : 'Agregar Linea');
			setName('Nombre de la línea');
		} else if (table === 'codes') {
			setTitle(isEditMode ? 'Editar Código' : 'Agregar Código');
			setName('Nombre del código');
		} else if (table === 'colors') {
			setTitle(isEditMode ? 'Editar Color' : 'Agregar Color');
			setName('Nombre del color');
		} else if (table === 'sites') {
			setTitle(isEditMode ? 'Editar Ubicación' : 'Agregar Ubicación');
			setName('Nombre de la ubicación');
		} else {
			setTitle(isEditMode ? 'Editar opción' : 'Agregar opción');
		}
	}, [table, isEditMode]);

	// Set default value for 'Abertura' select when dialog opens for lines
	React.useEffect(() => {
		if (open && table === 'lines') {
			setDependence(materialType || 'Aluminio');
		}
	}, [open, table, materialType]);

	// Populate form fields when editing
	React.useEffect(() => {
		if (initialData) {
			if (table === 'lines') {
				setOption((initialData as LineOption).name_line);
				setDependence((initialData as LineOption).opening);
				setOptionName('Linea');
			} else if (table === 'codes') {
				setOption((initialData as CodeOption).name_code);
				setDependence((initialData as CodeOption).line_name);
				setOptionName('Código');
			} else if (table === 'colors') {
				setOption((initialData as ColorOption).name_color);
				setDependence((initialData as ColorOption).line_name);
				setOptionName('Color');
			} else if (table === 'sites') {
				setOption((initialData as SiteOption).name_site);
				setOptionName('Ubicación');
			}
		} else {
			setOption('');
			setDependence('');
		}
	}, [initialData, table]);

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
			successMessage = isEditMode ? 'Línea actualizada correctamente' : 'Línea guardada correctamente';
			setOptionName('Linea');
		} else if (tableName === 'codes') {
			fields.name_code = option ?? '';
			fields.line_name = dependence ?? '';
			fieldName = 'código';
			successMessage = isEditMode ? 'Código actualizado correctamente' : 'Código guardado correctamente';
			setOptionName('Código');
		} else if (tableName === 'colors') {
			fields.name_color = option ?? '';
			fields.line_name = dependence ?? '';
			fieldName = 'color';
			successMessage = isEditMode ? 'Color actualizado correctamente' : 'Color guardado correctamente';
			setOptionName('Color');
		} else if (tableName === 'sites') {
			fields.name_site = option ?? '';
			fieldName = 'ubicación';
			successMessage = isEditMode ? 'Ubicación actualizada correctamente' : 'Ubicación guardada correctamente';
			setOptionName('Ubicación');
		}

		let data: any = null;
		let error: any = null;

		if (isEditMode && initialData) {
			// Handle update
			const id = initialData.id;

			// Special case for lines: cascade changes to codes and colors
			if (tableName === 'lines') {
				const oldLineName = (initialData as LineOption).name_line;
				const newLineName = fields.name_line;

				if (oldLineName !== newLineName) {
					const result = await updateLineWithDependencies(id, oldLineName, newLineName);
					if (result.error) {
						console.error('Error updating line with dependencies:', result.error);
						let errorMessage = translateError(result.error);
						toast({
							title: 'Error al actualizar',
							description: errorMessage,
							variant: 'destructive',
							duration: 5000,
						});
						return;
					}
					// Also update opening field after successful line name change
					const openingResult = await updateOption(tableName ?? '', id, { opening: fields.opening });
					if (openingResult.error) {
						console.error('Error updating opening:', openingResult.error);
						let errorMessage = translateError(openingResult.error);
						toast({
							title: 'Error al actualizar',
							description: errorMessage,
							variant: 'destructive',
							duration: 5000,
						});
						return;
					}
					data = { ...initialData, ...fields };
				} else {
					// Only update opening if line name didn't change
					const updateResult = await updateOption(tableName ?? '', id, { opening: fields.opening });
					data = updateResult.data;
					error = updateResult.error;
				}
			} else {
				// Regular update for codes, colors, sites
				const updateResult = await updateOption(tableName ?? '', id, fields);
				data = updateResult.data;
				error = updateResult.error;
			}
		} else {
			// Handle create
			const createResult = await createOption(tableName ?? '', fields);
			data = createResult.data;
			error = createResult.error;
		}

		if (error) {
			console.error('Supabase error:', error);
			let errorMessage = translateError(error);
			toast({
				title: isEditMode ? 'Error al actualizar' : 'Error al guardar',
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
					<DialogTitle>{isEditMode ? 'Editar opción' : 'Agregar nueva opción'}</DialogTitle>
					<DialogDescription>{isEditMode ? 'Modifique los datos' : 'Ingrese los datos'}</DialogDescription>
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
						Guardar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
