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
import { type ProfileItemStock } from '@/lib/profile-stock';
import { status, categories } from '@/constants/stock-constants';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LineSelect } from '@/components/stock/line-select';
import { CodeSelect } from '@/components/stock/code-select';
import { ColorSelect } from '@/components/stock/color-select';
import { SiteSelect } from '@/components/stock/site-select';

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
	const [statusOptions, setStatusOptions] = useState<string[]>([...status]);
	const { toast } = useToast();

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
				description: isEditing ? 'Perfil actualizado correctamente' : 'Perfil agregado correctamente',
				duration: 3000,
			});

			// Reset form after save if not editing
			if (!isEditing) {
				resetForm();
			}

			onOpenChange(false);
		} catch (error) {
			console.error('Error al guardar el perfil:', error);
			toast({
				title: 'Error',
				description: 'Ocurrió un error al guardar el perfil. Por favor, intente nuevamente.',
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
						Agregar perfil
					</Button>
				</DialogTrigger>
			)}
			<DialogContent showCloseButton={false} className="bg-card max-h-[90vh] flex flex-col">
				<DialogHeader className="flex-shrink-0">
					<DialogTitle className="text-foreground">
						{isEditing ? 'Editar perfil' : 'Agregar nuevo perfil'}
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
							<LineSelect
								value={line}
								onValueChange={(value) => {
									setLine(value);
									setCode(''); // Reset code when line changes
									setColor(''); // Reset color when line changes
								}}
								materialType={materialType}
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="code" className="text-foreground">
								{materialType == 'PVC' ? 'Nombre' : 'Código'}
							</Label>
							<CodeSelect
								value={code}
								onValueChange={setCode}
								lineName={line}
								materialType={materialType}
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="color" className="text-foreground">
								Color
							</Label>
							<ColorSelect value={color} onValueChange={setColor} lineName={line} />
						</div>

						<div className="grid gap-2">
							<Label htmlFor="estado" className="text-foreground">
								Estado
							</Label>
							<Select value={itemStatus} onValueChange={setItemStatus}>
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
							<SiteSelect value={site} onValueChange={setSite} />
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
