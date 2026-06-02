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
	type LineOption,
	CodeOption,
	ColorOption,
	SiteOption,
	updateOption,
} from '@/lib/stock/stock-options';
import React from 'react';
import { LineSelect } from '@/components/stock/line-select';
import { translateError } from '@/lib/error-translator';

type OptionItem = LineOption | CodeOption | ColorOption | SiteOption;

interface OptionFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave?: (option: OptionItem) => Promise<void>;
	triggerButton?: boolean;
	materialType?: 'Aluminio' | 'PVC';
	table?: 'lines' | 'codes' | 'colors' | 'sites';
	optionToEdit?: OptionItem | null;
}

export function OptionDialog({
	table,
	open,
	onOpenChange,
	onSave,
	triggerButton = true,
	materialType = 'Aluminio',
	optionToEdit = null,
}: OptionFormDialogProps) {
	const [option, setOption] = useState('');
	const [dependence, setDependence] = useState('');
	const [tableName, setTableName] = useState(table);
	const [title, setTitle] = useState('');
	const [name, setName] = useState('');
	const [optionName, setOptionName] = useState('');
	const isEditMode = Boolean(optionToEdit);

	const resetForm = React.useCallback(() => {
		if (table === 'lines') {
			setDependence((optionToEdit as LineOption | null)?.opening || materialType || 'Aluminio');
			setOption((optionToEdit as LineOption | null)?.name_line || '');
			return;
		}

		if (table === 'codes') {
			setDependence((optionToEdit as CodeOption | null)?.line_name || '');
			setOption((optionToEdit as CodeOption | null)?.name_code || '');
			return;
		}

		if (table === 'colors') {
			setDependence((optionToEdit as ColorOption | null)?.line_name || '');
			setOption((optionToEdit as ColorOption | null)?.name_color || '');
			return;
		}

		if (table === 'sites') {
			setDependence('');
			setOption((optionToEdit as SiteOption | null)?.name_site || '');
			return;
		}

		setOption('');
		setDependence('');
	}, [materialType, optionToEdit, table]);

	React.useEffect(() => {
		setTableName(table);
	}, [table]);

	React.useEffect(() => {
		if (table === 'lines') {
			setTitle(isEditMode ? 'Editar Línea' : 'Agregar Línea');
			setName('Nombre de la línea');
			setOptionName('Línea');
		} else if (table === 'codes') {
			setTitle(isEditMode ? 'Editar Código' : 'Agregar Código');
			setName('Nombre del código');
			setOptionName('Código');
		} else if (table === 'colors') {
			setTitle(isEditMode ? 'Editar Color' : 'Agregar Color');
			setName('Nombre del color');
			setOptionName('Color');
		} else if (table === 'sites') {
			setTitle(isEditMode ? 'Editar Ubicación' : 'Agregar Ubicación');
			setName('Nombre de la ubicación');
			setOptionName('Ubicación');
		} else {
			setTitle(isEditMode ? 'Editar opción' : 'Agregar opción');
		}
	}, [isEditMode, table]);

	React.useEffect(() => {
		if (open) {
			resetForm();
			return;
		}

		setOption('');
		setDependence('');
	}, [open, resetForm]);

	const handleSave = async () => {
		if (!option.trim()) {
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
		let successMessage: string = '';
		if (tableName === 'lines') {
			fields.name_line = option.trim();
			fields.opening = dependence ?? '';
			successMessage = isEditMode ? 'Línea actualizada correctamente' : 'Línea guardada correctamente';
		} else if (tableName === 'codes') {
			fields.name_code = option.trim();
			fields.line_name = dependence ?? '';
			successMessage = isEditMode ? 'Código actualizado correctamente' : 'Código guardado correctamente';
		} else if (tableName === 'colors') {
			fields.name_color = option.trim();
			fields.line_name = dependence ?? '';
			successMessage = isEditMode ? 'Color actualizado correctamente' : 'Color guardado correctamente';
		} else if (tableName === 'sites') {
			fields.name_site = option.trim();
			successMessage = isEditMode ? 'Ubicación actualizada correctamente' : 'Ubicación guardada correctamente';
		}
		const { data, error } = optionToEdit
			? await updateOption(tableName ?? '', optionToEdit.id, fields)
			: await createOption(tableName ?? '', fields);
		if (error) {
			console.error('Supabase error:', error);
			let errorMessage = translateError(error);
			toast({
				title: 'Error al guardar',
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
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>Ingrese los datos</DialogDescription>
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
						{isEditMode ? 'Guardar cambios' : 'Guardar'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
