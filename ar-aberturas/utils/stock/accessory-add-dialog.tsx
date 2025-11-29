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
import { useToast } from '@/hooks/use-toast';
import { SiteSelect } from '@/components/stock/site-select';
import { STOCK_CONFIGS, type StockCategory } from '@/lib/stock-config';
import { type AccessoryItemStock } from '@/lib/accesorie-stock';
import { type IronworkItemStock } from '@/lib/ironwork-stock';
import { type SupplyItemStock } from '@/lib/supplies-stock';
import { useAuth } from '@/components/provider/auth-provider';

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
	const [categoryHA, setCategoryHA] = useState('');
	const [line, setLine] = useState('');
	const [brand, setBrand] = useState('');
	const [code, setCode] = useState('');
	const [description, setDescription] = useState('');
	const [color, setColor] = useState('');
	const [quantityPerLump, setQuantityPerLump] = useState<number | ''>('');
	const [lumpCount, setLumpCount] = useState<number | ''>('');
	const [site, setSite] = useState('');
	const [price, setPrice] = useState<number | ''>('');
	const [showQuantityDialog, setShowQuantityDialog] = useState(false);
	const [quantityDialogType, setQuantityDialogType] = useState<'increase' | 'decrease' | null>(null);
	const [quantityChange, setQuantityChange] = useState<number | ''>('');
	const { toast } = useToast();

	const {user} = useAuth();

	useEffect(() => {
		if (editItem) {
			const fields = config.fields;
			const item = editItem as any;
			
			setCategoryHA(item[fields.category] || '');
			setLine(item[fields.line] || '');
			setBrand(item[fields.brand] || '');
			setCode(item[fields.code] || '');
			setDescription(item[fields.description] || '');
			setColor(item[fields.color] || '');
			setQuantityPerLump(item[fields.quantityForLump] ?? '');
			setLumpCount(item[fields.quantityLump] ?? '');
			setSite(item[fields.site] || '');
			setPrice(item[fields.price] ?? '');
		} else {
			resetForm();
		}
	}, [editItem, category]);

	const resetForm = () => {
		setCategoryHA('');
		setLine('');
		setBrand('');
		setCode('');
		setDescription('');
		setColor('');
		setQuantityPerLump('');
		setLumpCount('');
		setSite('');
		setPrice('');
		setQuantityChange('');
	};

	const handleQuantityAdjustment = () => {
		if (quantityChange === '') return;
		
		const currentTotal = (Number(quantityPerLump) || 0) * (Number(lumpCount) || 0);
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
		
		// Try to distribute the new total across lumps
		const currentQuantityPerLump = Number(quantityPerLump) || 1;
		const currentLumpCount = Number(lumpCount) || 1;
		
		// If we can keep the same quantity per lump and adjust lump count
		if (newTotal % currentQuantityPerLump === 0) {
			setLumpCount(newTotal / currentQuantityPerLump);
		} else {
			// Otherwise, adjust quantity per lump and keep lump count
			setQuantityPerLump(Math.ceil(newTotal / currentLumpCount));
			setLumpCount(currentLumpCount);
		}
		
		setShowQuantityDialog(false);
		setQuantityChange('');
		setQuantityDialogType(null);
	};

	const handleSave = () => {
		// validation
		if (
			!categoryHA ||
			!line ||
			!brand ||
			!code ||
			!color ||
			!site ||
			quantityPerLump === '' ||
			quantityPerLump < 0 ||
			lumpCount === '' ||
			lumpCount < 0
		) {
			toast({
				title: 'Error de validación',
				description: 'Complete todos los campos obligatorios',
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
			[fields.category]: categoryHA,
			[fields.line]: line,
			[fields.brand]: brand,
			[fields.code]: code,
			[fields.description]: description,
			[fields.color]: color,
			[fields.quantityForLump]: Number(quantityPerLump),
			[fields.quantityLump]: Number(lumpCount),
			[fields.quantity]: Number(quantityPerLump) * Number(lumpCount),
			[fields.site]: site,
			[fields.price]: price === '' ? null : Number(price),
		};

		onSave(payload);
		if (!isEditing) resetForm();
		onOpenChange(false);
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
							<Label>Categoría</Label>
							<Input
								value={categoryHA}
								onChange={(e) => setCategoryHA(e.target.value)}
								className="bg-background"
							/>
						</div>

						<div className="grid gap-2">
							<Label>Línea</Label>
							<Input 
								value={line} 
								onChange={(e) => setLine(e.target.value)} 
								placeholder="Ingrese la línea"
								className="bg-background"
							/>
						</div>

						<div className="grid gap-2">
							<Label>Marca</Label>
							<Input 
								value={brand} 
								onChange={(e) => setBrand(e.target.value)} 
								placeholder="Ingrese la marca"
								className="bg-background"
							/>
						</div>

						<div className="grid gap-2">
							<Label>Código</Label>
							<Input 
						value={code} 
						onChange={(e) => setCode(e.target.value)} 
						placeholder="Ingrese el código"
						className="bg-background"
					/>
						</div>

						<div className="grid gap-2">
							<Label>Descripción</Label>
							<Input
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="bg-background"
							/>
						</div>

						<div className="grid gap-2">
							<Label>Color</Label>
							<Input 
						value={color} 
						onChange={(e) => setColor(e.target.value)} 
						placeholder="Ingrese el color"
						className="bg-background"
					/>
						</div>

						<div className="grid gap-2 md:grid-cols-3">
							<div className="grid gap-2">
								<Label>Cantidad x bulto</Label>
								<Input
									type="number"
									value={quantityPerLump as any}
									onChange={(e) => setQuantityPerLump(e.target.value ? Number(e.target.value) : '')}
									className="bg-background"
								/>
							</div>
							<div className="grid gap-2">
								<Label>Cantidad de bultos</Label>
								<Input
									type="number"
									value={lumpCount as any}
									onChange={(e) => setLumpCount(e.target.value ? Number(e.target.value) : '')}
									className="bg-background"
								/>
							</div>
							<div className="grid gap-2">
								<Label>Cantidad total</Label>
								<Input
									type="number"
									value={(Number(quantityPerLump) || 0) * (Number(lumpCount) || 0) || 0}
									readOnly
									className="bg-background"
								/>
							</div>
						</div>

						<div className="grid gap-2">
							<Label>Ubicación</Label>
							<Input 
								value={site} 
								onChange={(e) => setSite(e.target.value)} 
								placeholder="Ingrese la ubicación"
								className="bg-background"
							/>
						</div>

                    {user?.role === 'Admin' || user?.role === 'Ventas' && (
						<div className="grid gap-2">
							<Label>Precio (opcional)</Label>
							<Input
								type="number"
								value={price as any}
								onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
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
