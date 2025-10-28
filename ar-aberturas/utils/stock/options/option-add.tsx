'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
	TypeOption,
	ColorOption,
	SiteOption,
} from '@/lib/stock_options';
import React from 'react';

interface OptionFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave?: (option: LineOption | TypeOption | ColorOption | SiteOption) => void;
	triggerButton?: boolean;
	materialType?: 'Aluminio' | 'PVC';
	table?: 'lines' | 'types' | 'colors' | 'sites';
}

export function OptionDialog({
	table,
	open,
	onOpenChange,
	onSave,
	triggerButton = true,
	materialType = 'Aluminio',
}: OptionFormDialogProps) {
	const [option, setOption] = useState('');
	const [dependence, setDependence] = useState('');
	const [tableName, setTableName] = useState(table);
	const [title, setTitle] = useState('');
	const [name, setName] = useState('');
	const { toast } = useToast();

	const [linesOptions, setLinesOptions] = useState<{ id: number; name_line: string }[]>([]);
	React.useEffect(() => {
		if ((table === 'types' || table === 'colors') && open) {
			const local = localStorage.getItem('lines');
			if (local) {
				try {
					const parsed = JSON.parse(local);
					setLinesOptions(parsed);
				} catch {}
			}
		}
	}, [table, open]);

	React.useEffect(() => {
		if (table === 'lines') {
			setTitle('Agregar Linea');
			setName('Nombre de la línea');
		} else if (table === 'types') {
			setTitle('Agregar Tipo');
			setName('Nombre del tipo');
		} else if (table === 'colors') {
			setTitle('Agregar Color');
			setName('Nombre del color');
		} else if (table === 'sites') {
			setTitle('Agregar Ubicación');
			setName('Nombre de la ubicación');
		} else {
			setTitle('Agregar opción');
		}
	}, [table]);

	// Set default value for 'Abertura' select when dialog opens for lines
	React.useEffect(() => {
		if (open && table === 'lines') {
			setDependence(materialType || 'Aluminio');
		}
	}, [open, table, materialType]);

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
		if (tableName === 'lines') {
			fields.name_line = option ?? '';
			fields.opening = dependence ?? '';
		} else if (tableName === 'types') {
			fields.name_type = option ?? '';
			fields.line_name = dependence ?? '';
		} else if (tableName === 'colors') {
			fields.name_color = option ?? '';
			fields.line_name = dependence ?? '';
		} else if (tableName === 'sites') {
			fields.name_site = option ?? '';
		}
		const { data, error } = await createOption(tableName ?? '', fields);
		if (error) {
			console.error('Supabase error:', error);
			let errorMessage = 'Ocurrió un error al guardar la opción';
			if (error.message?.includes('duplicate key value violates unique constraint')) {
				const fieldName = tableName === 'lines' ? 'línea' : 
									tableName === 'types' ? 'tipo' : 
									tableName === 'colors' ? 'color' : 'ubicación';
				errorMessage = `Ya existe un${fieldName === 'ubicación' ? 'a' : 'a'} ${fieldName} con ese nombre`;
			}

			toast({
				title: 'Error al guardar',
				description: errorMessage,
				variant: 'destructive',
				duration: 5000,
			});
			console.log('Mostrando toast de error:', errorMessage);
			return;
		}

		if (onSave && data) {
			onSave(data);
		}

		// Mostrar mensaje de éxito
		const successMessage = tableName === 'lines' ? 'Línea guardada correctamente' : 
						   tableName === 'types' ? 'Tipo guardado correctamente' :
						   tableName === 'colors' ? 'Color guardado correctamente' :
						   'Ubicación guardada correctamente';

		toast({
			title: 'Éxito',
			description: successMessage,
			duration: 3000,
		});
		console.log('Mostrando toast de éxito:', successMessage);

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
					<DialogTitle>Agregar nueva opción</DialogTitle>
					<DialogDescription>Ingrese los datos</DialogDescription>
				</DialogHeader>

				<div className="overflow-y-auto flex-1 py-4 pr-2 -mr-2">
					<div className="grid gap-4">
						{(table === 'types' || table === 'colors') && (
							<div className="grid gap-2">
								<Label htmlFor="dependence">Linea</Label>
								<Select value={dependence} onValueChange={setDependence}>
									<SelectTrigger className="bg-background w-full">
										<SelectValue placeholder="Selecciona una línea" />
									</SelectTrigger>
									<SelectContent>
										{linesOptions.map((line: { id: number; name_line: string }, idx: number) => {
											const key = `${line.id}-${line.name_line ?? idx}`;
											return (
												<SelectItem key={key} value={line.name_line ?? ''}>
													{line.name_line}
												</SelectItem>
											);
										})}
									</SelectContent>
								</Select>
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
							{table === 'lines' ? (
								<Label htmlFor="optionName">Línea</Label>
							) : table === 'types' ? (
								<Label htmlFor="optionName">Tipo</Label>
							) : table === 'colors' ? (
								<Label htmlFor="optionName">Color</Label>
							) : table === 'sites' ? (
								<Label htmlFor="optionName">Ubicación</Label>
							) : (
								<Label htmlFor="optionName">Nombre</Label>
							)}
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
