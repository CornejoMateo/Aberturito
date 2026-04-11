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
import { useState, useEffect } from 'react';
import { STOCK_CONFIGS, type StockCategory } from '@/lib/stock/stock-config';
import { toast } from '@/components/ui/use-toast';
import { type AccessoryItemStock } from '@/lib/stock/accesorie-stock';
import { type IronworkItemStock } from '@/lib/stock/ironwork-stock';
import { type SupplyItemStock } from '@/lib/stock/supplies-stock';
import { useAuth } from '@/components/provider/auth-provider';

type FormData = {
  category: string;
  line: string;
  brand: string;
  code: string;
  description: string;
  color: string;
  quantityPerLump: number | '';
  lumpCount: number | '';
  quantity: number | '';
  site: string;
  price: number | '';
};

interface AccessoryFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (item: Partial<AccessoryItemStock> | Partial<IronworkItemStock> | Partial<SupplyItemStock>) => void;
	materialType?: 'Aluminio' | 'PVC';
	category: StockCategory;
	editItem?: AccessoryItemStock | IronworkItemStock | SupplyItemStock | null;
	triggerButton?: boolean;
}

export function AccessoryFormDialog({
	open,
	onOpenChange,
	onSave,
	materialType = 'Aluminio',
	category = 'Accesorios',
	editItem = null,
	triggerButton = true,
}: AccessoryFormDialogProps) {
	const isEditing = !!editItem;
	const config = STOCK_CONFIGS[category];

	// Fields common to accessories/ironworks
	const [formData, setFormData] = useState<FormData>({
  		category: '',
		line: '',
		brand: '',
		code: '',
		description: '',
		color: '',
		quantityPerLump: '',
		lumpCount: '',
		quantity: '',
		site: '',
		price: '',
	});

	const [showQuantityDialog, setShowQuantityDialog] = useState(false);
	const [quantityDialogType, setQuantityDialogType] = useState<'increase' | 'decrease' | null>(null);
	const [quantityChange, setQuantityChange] = useState<number | ''>('');
	const [changeQuantityFlag, setChangeQuantityFlag] = useState(false);

	const {user} = useAuth();
	const isAuthorized = user?.role === 'Admin' || user?.role === 'Ventas';

	useEffect(() => {
		if (editItem) {
			const fields = config.fields;
			const item = editItem as any;

			setFormData({
			category: item[fields.category] || '',
			line: item[fields.line] || '',
			brand: item[fields.brand] || '',
			code: item[fields.code] || '',
			description: item[fields.description] || '',
			color: item[fields.color] || '',
			quantityPerLump: item[fields.quantityForLump] ?? '',
			lumpCount: item[fields.quantityLump] ?? '',
			quantity: item[fields.quantity] ?? '',
			site: item[fields.site] || '',
			price: item[fields.price] ?? '',
			});
		} else {
			resetForm();
		}
	}, [editItem, category]);

	// Auto-calculate quantity when quantityPerLump or lumpCount changes
	useEffect(() => {
		if (formData.quantityPerLump !== '' && formData.lumpCount !== '' && changeQuantityFlag) {
			updateField('quantity', Number(formData.quantityPerLump) * Number(formData.lumpCount));
		}
	}, [formData.quantityPerLump, formData.lumpCount, changeQuantityFlag]);

	const resetForm = () => {
		setFormData({
			category: '',
			line: '',
			brand: '',
			code: '',
			description: '',
			color: '',
			quantityPerLump: '',
			lumpCount: '',
			quantity: '',
			site: '',
			price: '',
		});
		setChangeQuantityFlag(false);
	};

	const handleQuantityAdjustment = () => {
		if (quantityChange === '') return;
		
		const currentTotal = (formData.quantity as number) || 0;
		const adjustment = Number(quantityChange);
		
		if (quantityDialogType === 'decrease') {
			if (adjustment > currentTotal) {
				toast({
					title: 'Error',
					description: 'No puede disminuir más que la cantidad total actual',
					variant: 'destructive',
					duration: 3000,
				});
				return;
			}
			if (adjustment < 0) {
				toast({
					title: 'Error',
					description: 'La cantidad a disminuir debe ser positiva',
					variant: 'destructive',
					duration: 3000,
				});
				return;
			}
		}
		
		if (quantityDialogType === 'increase' && adjustment < 0) {
			toast({
				title: 'Error',
				description: 'La cantidad a aumentar debe ser positiva',
				variant: 'destructive',
				duration: 3000,
			});
			return;
		}
		
		const newTotal = quantityDialogType === 'increase' 
			? currentTotal + adjustment 
			: currentTotal - adjustment;
		
		if (newTotal < 0) {
			toast({
				title: 'Error',
				description: 'La cantidad total no puede ser negativa',
				variant: 'destructive',
				duration: 3000,
			});
			return;
		}
		
		updateField('quantity', newTotal);
		onSave({
			[config.fields.quantity]: newTotal,
		});
		setShowQuantityDialog(false);
		setQuantityChange('');
		setQuantityDialogType(null);
	};

	const handleSave = () => {
		// validation
		if (
			!formData.category ||
			!formData.code ||
			!formData.color ||
			!formData.site ||
			formData.quantityPerLump === '' ||
			formData.lumpCount === '' ||
			formData.quantity === ''
		) {
			toast({
				title: 'Error de validación',
				description: 'Complete todos los campos obligatorios',
				variant: 'destructive',
				duration: 4000,
			});
			return;
		}
		
		if (formData.quantityPerLump < 0 || formData.lumpCount < 0 || formData.quantity < 0) {
			toast({
				title: 'Error de validación',
				description: 'Las cantidades no pueden ser negativas',
				variant: 'destructive',
				duration: 4000,
			});
			return;
		}

		const fields = config.fields;

		const payload: any = {
			[fields.createdAt]:
				isEditing && (editItem as any)[fields.createdAt]
					? (editItem as any)[fields.createdAt]
					: new Date().toISOString().split('T')[0],
			[fields.material]: isEditing ? (editItem as any)[fields.material] || materialType : materialType,
			[fields.category]: formData.category,
			[fields.line]: formData.line,
			[fields.brand]: formData.brand,
			[fields.code]: formData.code,
			[fields.description]: formData.description,
			[fields.color]: formData.color,
			[fields.quantityForLump]: Number(formData.quantityPerLump),
			[fields.quantityLump]: Number(formData.lumpCount),
			[fields.quantity]: Number(formData.quantity),
			[fields.site]: formData.site,
			[fields.price]: formData.price === '' ? null : Number(formData.price),
		};

		onSave(payload);
		setChangeQuantityFlag(false);
		toast({
			title: isEditing ? 'Ítem actualizado' : 'Ítem agregado',
			description: `El ${config.title.slice(0, -1).toLowerCase()} ha sido ${isEditing ? 'actualizado' : 'agregado'} exitosamente`,
		});
		if (!isEditing) resetForm();
		onOpenChange(false);
	};

	const updateField = (field: keyof FormData, value: any) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{triggerButton && (
				<DialogTrigger asChild>
				<Button className="gap-2">
					<Plus className="h-4 w-4" />
					Agregar {config.title.slice(0, -1).toLowerCase()}
				</Button>
				</DialogTrigger>
			)}
			<DialogContent showCloseButton={false} className="bg-card max-h-[90vh] flex flex-col">
			<DialogHeader>
				<DialogTitle>
					{isEditing ? `Editar ${config.title.slice(0, -1).toLowerCase()}` : `Agregar ${config.title.slice(0, -1).toLowerCase()}`}
				</DialogTitle>
					<DialogDescription>
						{isEditing ? 'Modifique los datos' : 'Complete los datos del nuevo ítem'}
					</DialogDescription>
				</DialogHeader>
				<div className="overflow-y-auto flex-1 py-4 pr-2 -mr-2">
					<div className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="category">Categoría</Label>
							<Input
								id="category"
								value={formData.category}
								onChange={(e) => updateField('category', e.target.value)}
								className="bg-background"
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor='line'>Línea</Label>
							<Input 
								id='line'
								value={formData.line} 
								onChange={(e) => updateField('line', e.target.value)} 
								placeholder="Ingrese la línea"
								className="bg-background"
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor='brand'>Marca</Label>
							<Input 
								id="brand"
								value={formData.brand} 
								onChange={(e) => updateField('brand', e.target.value)} 
								placeholder="Ingrese la marca"
								className="bg-background"
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor='code'>Código</Label>
							<Input 
								id="code"
								value={formData.code} 
								onChange={(e) => updateField('code', e.target.value)} 
								placeholder="Ingrese el código"
								className="bg-background"
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor='description'>Descripción</Label>
							<Input
								id="description"
								value={formData.description}
								onChange={(e) => updateField('description', e.target.value)}
								className="bg-background"
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor='color'>Color</Label>
							<Input 
								id="color"
								value={formData.color} 
								onChange={(e) => updateField('color', e.target.value)} 
								placeholder="Ingrese el color"
								className="bg-background"
							/>
						</div>

						<div className="grid gap-2 md:grid-cols-3">
							<div className="grid gap-2">
								<Label htmlFor='quantityPerLump'>Cantidad x bulto</Label>
								<Input
									id="quantityPerLump"
									type="number"
									value={formData.quantityPerLump}
									onChange={(e) => {
										updateField('quantityPerLump', e.target.value ? Number(e.target.value) : ''); 
										setChangeQuantityFlag(true);
									}}
									className="bg-background"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor='lumpCount'>Cantidad de bultos</Label>
								<Input
									id="lumpCount"
									type="number"
									value={formData.lumpCount}
									onChange={(e) => {
										updateField('lumpCount', e.target.value ? Number(e.target.value) : '');
										setChangeQuantityFlag(true);
									}}
									className="bg-background"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor='quantity'>Cantidad total</Label>
								<Input
									id='quantity'
									type="number"
									value={formData.quantity}
									onChange={(e) => updateField('quantity', e.target.value ? Number(e.target.value) : '')}
									className="bg-background"
								/>
							</div>
						</div>

						<div className="grid gap-2">
							<Label htmlFor='site'>Ubicación</Label>
							<Input 
								id="site"
								value={formData.site} 
								onChange={(e) => updateField('site', e.target.value)} 
								placeholder="Ingrese la ubicación"
								className="bg-background"
							/>
						</div>

						{isAuthorized && (
							<div className="grid gap-2">
								<Label htmlFor='price'>Precio (opcional)</Label>
								<Input
									id='price'
									type="number"
									value={formData.price}
									onChange={(e) => updateField('price', e.target.value ? Number(e.target.value) : '')}
									className="bg-background"
								/>
							</div>
						)}
					</div>
				</div>
				<DialogFooter className="pt-4 border-t border-border">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancelar
					</Button>
					<Button onClick={handleSave}>{isEditing ? 'Guardar cambios' : 'Guardar'}</Button>
				</DialogFooter>
			</DialogContent>
			<Dialog open={showQuantityDialog} onOpenChange={setShowQuantityDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{quantityDialogType === 'increase' ? 'Aumentar cantidad' : 'Disminuir cantidad'}
						</DialogTitle>
						<DialogDescription>
							{quantityDialogType === 'increase' 
								? '¿Cuántas unidades desea aumentar?' 
								: '¿Cuántas unidades desea disminuir?'}
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Input
							type="number"
							value={quantityChange as any}
							onChange={(e) => setQuantityChange(e.target.value ? Number(e.target.value) : '')}
							placeholder="Ingrese la cantidad"
							className="bg-background"
							min="0"
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowQuantityDialog(false)}>
							Cancelar
						</Button>
						<Button onClick={handleQuantityAdjustment}>
							{quantityDialogType === 'increase' ? 'Aumentar' : 'Disminuir'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Dialog>
	);
}
