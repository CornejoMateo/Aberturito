'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
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
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { type ProfileItemStock } from '@/lib/stock';
import { status, categories } from '@/constants/stock-constants';
import { listOptions, LineOption, TypeOption, ColorOption, SiteOption } from '@/lib/stock_options';
import { useState, useEffect } from 'react';
import { useOptions } from '@/hooks/useOptions';
import { useToast } from '@/hooks/use-toast';

interface StockFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (item: Partial<ProfileItemStock>) => void;
	materialType?: 'Aluminio' | 'PVC';
	editItem?: ProfileItemStock | null;
	triggerButton?: boolean;
}

export function StockFormDialog({
	open,
	onOpenChange,
	onSave,
	materialType = 'Aluminio',
	editItem = null,
	triggerButton = true,
}: StockFormDialogProps) {
	const isEditing = !!editItem;

	const [category, setCategory] = useState('');
	const [type, setType] = useState('');
	const [line, setLine] = useState('');
	const [color, setColor] = useState('');
	const [itemStatus, setItemStatus] = useState('');
	const [quantity, setQuantity] = useState(0);
	const [site, setSite] = useState('');
	const [width, setWidth] = useState(0);

	// Status and options for selects
	const [categoriesOptions, setCategoriesOptions] = useState(categories);

	const {
		options: linesOptions,
		loading: loadingLines,
		error: errorLines,
	} = useOptions<LineOption>('lines', () =>
		listOptions('lines').then((res) => (res.data ?? []) as LineOption[])
	);
	const {
		options: typesOptions,
		loading: loadingTypes,
		error: errorTypes,
	} = useOptions<TypeOption>('types', () =>
		listOptions('types').then((res) => (res.data ?? []) as TypeOption[])
	);
	const {
		options: colorsOptions,
		loading: loadingColors,
		error: errorColors,
	} = useOptions<ColorOption>('colors', () =>
		listOptions('colors').then((res) => (res.data ?? []) as ColorOption[])
	);
	const {
		options: sitesOptions,
		loading: loadingSites,
		error: errorSites,
	} = useOptions<SiteOption>('sites', () =>
		listOptions('sites').then((res) => (res.data ?? []) as SiteOption[])
	);
	const [statusOptions, setStatusOptions] = useState<string[]>([...status]);
	const { toast } = useToast();

	// Loading data into form when editItem changes
	useEffect(() => {
		if (editItem) {
			setCategory(editItem.category || '');
			setType(editItem.type || '');
			setLine(editItem.line || '');
			setColor(editItem.color || '');
			setItemStatus(editItem.status || '');
			setQuantity(editItem.quantity || 0);
			setSite(editItem.site || '');
			setWidth(editItem.width || 0);
		} else {
			// Reset form when not editing
			resetForm();
		}
	}, [editItem]);

	const resetForm = () => {
		setCategory('');
		setType('');
		setLine('');
		setColor('');
		setItemStatus('');
		setQuantity(0);
		setSite('');
		setWidth(0);
	};

	const handleSave = () => {
		// Validate required fields
		if (!category || !type || !line || !color || !site || quantity <= 0 || width <= 0) {
			toast({
				title: 'Error de validación',
				description: 'Por favor complete todos los campos obligatorios',
				variant: 'destructive',
				duration: 5000,
			});
			return;
		}

		try {
			onSave({
				category,
				type,
				line,
				color,
				status: itemStatus,
				quantity,
				site,
				width,
				material: materialType?.toLowerCase(),
				created_at: isEditing ? editItem.created_at : new Date().toISOString().split('T')[0],
			});

			// Show success message
			toast({
				title: '¡Éxito!',
				description: isEditing ? 'Item actualizado correctamente' : 'Item agregado correctamente',
				duration: 3000,
			});

			// Reset form after save if not editing
			if (!isEditing) {
				resetForm();
			}

			onOpenChange(false);
		} catch (error) {
			console.error('Error al guardar el item:', error);
			toast({
				title: 'Error',
				description: 'Ocurrió un error al guardar el item. Por favor, intente nuevamente.',
				variant: 'destructive',
				duration: 5000,
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{triggerButton && (
				<DialogTrigger asChild>
					<Button className="gap-2">
						<Plus className="h-4 w-4" />
						Agregar Item
					</Button>
				</DialogTrigger>
			)}
			<DialogContent showCloseButton={false} className="bg-card max-h-[90vh] flex flex-col">
				<DialogHeader className="flex-shrink-0">
					<DialogTitle className="text-foreground">
						{isEditing ? 'Editar item' : 'Agregar nuevo item'}
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						{isEditing
							? 'Modifique los datos del material o producto'
							: 'Ingrese los datos del nuevo material o producto'}
					</DialogDescription>
				</DialogHeader>
				<div className="overflow-y-auto flex-1 py-4 pr-2 -mr-2">
					<div className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="category" className="text-foreground">
								Categoria
							</Label>
							<Select value={category} onValueChange={setCategory}>
								<SelectTrigger className="bg-background w-full">
									<SelectValue placeholder="Seleccionar categoria" />
								</SelectTrigger>
								<SelectContent>
									{categoriesOptions.map((cat) => (
										<SelectItem key={cat} value={cat}>
											{cat}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="line" className="text-foreground">
								Línea
							</Label>
							<Select value={line} onValueChange={setLine}>
								<SelectTrigger className="bg-background w-full">
									<SelectValue placeholder="Seleccionar línea" />
								</SelectTrigger>
								<SelectContent>
									{linesOptions
										.filter((l) => l.opening === materialType)
										.map((l, idx) => (
											<SelectItem key={`${l.id}-${idx}`} value={l.name_line ?? ''}>
												{l.name_line}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="type" className="text-foreground">
								Tipo
							</Label>
							<Select value={type} onValueChange={setType}>
								<SelectTrigger className="bg-background w-full">
									<SelectValue placeholder="Seleccionar tipo" />
								</SelectTrigger>
								<SelectContent>
									{typesOptions
										.filter((t) => t.line_name === line)
										.map((t) => (
											<SelectItem key={t.id} value={t.name_type ?? ''}>
												{t.name_type}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="color" className="text-foreground">
								Color
							</Label>
							<Select value={color} onValueChange={setColor}>
								<SelectTrigger className="bg-background w-full">
									<SelectValue placeholder="Seleccionar color" />
								</SelectTrigger>
								<SelectContent>
									{colorsOptions
										.filter((c) => c.line_name === line)
										.map((c, idx) => (
											<SelectItem key={`${c.id}-${idx}`} value={c.name_color ?? ''}>
												{c.name_color}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="estado" className="text-foreground">
								Estado
							</Label>
							<Select value={itemStatus} onValueChange={setItemStatus}>
								<SelectTrigger className="bg-background w-full">
									<SelectValue placeholder="Seleccionar estado" />
								</SelectTrigger>
								<SelectContent>
									{statusOptions.map((est) => (
										<SelectItem key={est} value={est}>
											{est}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="cantidad" className="text-foreground">
								Cantidad
							</Label>
							<Input
								id="cantidad"
								type="number"
								placeholder="0"
								className="bg-background"
								value={quantity || ''}
								onChange={(e) => setQuantity(Number(e.target.value))}
								required
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="site" className="text-foreground">
								Ubicación
							</Label>
							<Select value={site} onValueChange={setSite}>
								<SelectTrigger className="bg-background w-full">
									<SelectValue placeholder="Seleccionar ubicación" />
								</SelectTrigger>
								<SelectContent>
									{sitesOptions.map((s) => (
										<SelectItem key={s.id} value={s.name_site ?? ''}>
											{s.name_site}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="largo" className="text-foreground">
								Largo (mm)
							</Label>
							<Input
								id="largo"
								type="number"
								placeholder="0"
								className="bg-background"
								value={width || ''}
								onChange={(e) => setWidth(Number(e.target.value))}
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
						{isEditing ? 'Guardar cambios' : 'Guardar'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
