'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Check, ChevronsUpDown, Search } from 'lucide-react';
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
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from '@/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { type ProfileItemStock } from '@/lib/profile-stock';
import { status, categories } from '@/constants/stock-constants';
import { listOptions, LineOption, CodeOption, ColorOption, SiteOption } from '@/lib/stock-options';
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
	const [code, setCode] = useState('');
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
		options: codesOptions,
		loading: loadingCodes,
		error: errorCodes,
	} = useOptions<CodeOption>('codes', () =>
		listOptions('codes').then((res) => (res.data ?? []) as CodeOption[])
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

	// Estados para controlar la apertura/cierre de los Popover
	const [openLine, setOpenLine] = useState(false);
	const [openCode, setOpenCode] = useState(false);
	const [openColor, setOpenColor] = useState(false);
	const [openSite, setOpenSite] = useState(false);

	// Loading data into form when editItem changes
	useEffect(() => {
		if (editItem) {
			setCategory(editItem.category || '');
			setCode(editItem.code || '');
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
		setCode('');
		setLine('');
		setColor('');
		setItemStatus('');
		setQuantity(0);
		setSite('');
		setWidth(0);
	};

	const handleSave = () => {
		// Validate required fields
		if (!category || !code || !line || !color || !site || quantity <= 0 || width <= 0) {
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
				code,
				line,
				color,
				status: itemStatus,
				quantity,
				site,
				width,
				material: materialType,
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
							<Select
								value={category}
								onValueChange={setCategory}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Seleccionar categoría" />
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
							<Popover open={openLine} onOpenChange={setOpenLine}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										role="combobox"
										className={cn(
											'w-full h-10 justify-between text-left font-normal',
											!line && 'text-muted-foreground',
											'border-input bg-background rounded-md border',
											'hover:bg-accent hover:text-accent-foreground',
											'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
											'disabled:opacity-50 disabled:pointer-events-none'
										)}
										disabled={loadingLines}
									>
										{line || 'Seleccionar línea'}
										<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-full p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
									<Command>
										<CommandInput placeholder="Buscar línea..." className="w-full" />
										<CommandEmpty>No se encontraron líneas.</CommandEmpty>
										<CommandGroup className="max-h-60 overflow-auto">
											{linesOptions
												.filter((l) => l.opening === materialType)
												.map((l) => (
													<CommandItem
														value={l.name_line ?? ''}
														key={`${l.id}-${l.name_line}`}
														onSelect={() => {
															setLine(l.name_line ?? '');
															setOpenLine(false);
														}}
													>
														<Check
															className={cn(
																'mr-2 h-4 w-4',
																line === l.name_line ? 'opacity-100' : 'opacity-0'
															)}
														/>
														{l.name_line}
													</CommandItem>
												))}
										</CommandGroup>
									</Command>
								</PopoverContent>
							</Popover>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="code" className="text-foreground">
								{materialType == "PVC" ? "Nombre" : "Código"}
							</Label>
							<Popover open={openCode} onOpenChange={setOpenCode}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										role="combobox"
										className={cn(
											'w-full h-10 justify-between text-left font-normal',
											!code && 'text-muted-foreground',
											'border-input bg-background rounded-md border',
											'hover:bg-accent hover:text-accent-foreground',
											'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
											'disabled:opacity-50 disabled:pointer-events-none'
										)}
										disabled={loadingCodes || !line}
									>
										{code ? code : materialType === "PVC" ? "Seleccionar nombre" : "Seleccionar código"}
										<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-full p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
									<Command>
										<CommandInput placeholder="Buscar código..." className="w-full" />
										<CommandEmpty>No se encontraron códigos.</CommandEmpty>
										<CommandGroup className="max-h-60 overflow-auto">
											{codesOptions
												.filter((cod) => cod.line_name === line)
												.map((cod) => (
													<CommandItem
														value={cod.name_code ?? ''}
														key={cod.id}
														onSelect={() => {
															setCode(cod.name_code ?? '');
															setOpenCode(false);
														}}
													>
														<Check
															className={cn(
																'mr-2 h-4 w-4',
																code === cod.name_code ? 'opacity-100' : 'opacity-0'
															)}
														/>
														{cod.name_code}
													</CommandItem>
												))}
										</CommandGroup>
									</Command>
								</PopoverContent>
							</Popover>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="color" className="text-foreground">
								Color
							</Label>
							<Popover open={openColor} onOpenChange={setOpenColor}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										role="combobox"
										className={cn(
											'w-full h-10 justify-between text-left font-normal',
											!color && 'text-muted-foreground',
											'border-input bg-background rounded-md border',
											'hover:bg-accent hover:text-accent-foreground',
											'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
											'disabled:opacity-50 disabled:pointer-events-none'
										)}
										disabled={loadingColors || !line}
									>
										{color || 'Seleccionar color'}
										<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-full p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
									<Command>
										<CommandInput placeholder="Buscar color..." className="w-full" />
										<CommandEmpty>No se encontraron colores.</CommandEmpty>
										<CommandGroup className="max-h-60 overflow-auto">
											{colorsOptions
												.filter((c) => c.line_name === line)
												.map((c) => (
													<CommandItem
														value={c.name_color ?? ''}
														key={`${c.id}-${c.name_color}`}
														onSelect={() => {
															setColor(c.name_color ?? '');
															setOpenColor(false);
														}}
													>
														<Check
															className={cn(
																'mr-2 h-4 w-4',
																color === c.name_color ? 'opacity-100' : 'opacity-0'
															)}
														/>
														{c.name_color}
													</CommandItem>
												))}
										</CommandGroup>
									</Command>
								</PopoverContent>
							</Popover>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="estado" className="text-foreground">
								Estado
							</Label>
							<Select
								value={itemStatus}
								onValueChange={setItemStatus}
							>
								<SelectTrigger className="w-full">
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
							<Popover open={openSite} onOpenChange={setOpenSite}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										role="combobox"
										className={cn(
											'w-full h-10 justify-between text-left font-normal',
											!site && 'text-muted-foreground',
											'border-input bg-background rounded-md border',
											'hover:bg-accent hover:text-accent-foreground',
											'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
											'disabled:opacity-50 disabled:pointer-events-none'
										)}
										disabled={loadingSites}
									>
										{site || 'Seleccionar ubicación'}
										<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-full p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
									<Command>
										<CommandInput placeholder="Buscar ubicación..." className="w-full" />
										<CommandEmpty>No se encontraron ubicaciones.</CommandEmpty>
										<CommandGroup className="max-h-60 overflow-auto">
											{sitesOptions.map((s) => (
												<CommandItem
													value={s.name_site ?? ''}
													key={s.id}
													onSelect={() => {
														setSite(s.name_site ?? '');
									setOpenSite(false);
													}}
												>
													<Check
														className={cn(
															'mr-2 h-4 w-4',
															site === s.name_site ? 'opacity-100' : 'opacity-0'
														)}
													/>
													{s.name_site}
												</CommandItem>
											))}
										</CommandGroup>
									</Command>
								</PopoverContent>
							</Popover>
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
