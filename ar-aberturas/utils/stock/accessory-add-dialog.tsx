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
import { type AccessoryItemStock } from '@/lib/accesorie-stock';
import { type IronworkItemStock } from '@/lib/ironwork-stock';
import { set } from 'date-fns';
import { useAuth } from '@/components/provider/auth-provider';

interface AccessoryFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (item: Partial<AccessoryItemStock> | Partial<IronworkItemStock>) => void;
	materialType?: 'Aluminio' | 'PVC';
	category: 'Accesorios' | 'Herrajes';
	editItem?: AccessoryItemStock | IronworkItemStock | null;
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
	const { toast } = useToast();

	const {user} = useAuth();

	useEffect(() => {
		if (editItem) {
			// map fields depending on category
			if (category === 'Accesorios') {
				const it = editItem as AccessoryItemStock;
				setCategoryHA(it.accessory_category || '');
				setLine(it.accessory_line || '');
				setBrand(it.accessory_brand || '');
				setCode(it.accessory_code || '');
				setDescription(it.accessory_description || '');
				setColor(it.accessory_color || '');
				setQuantityPerLump(it.accessory_quantity_for_lump ?? '');
				setLumpCount(it.accessory_quantity_lump ?? '');
				setSite(it.accessory_site || '');
				setPrice((it['accessory_price' as keyof AccessoryItemStock] as any) || '');
			} else {
				const it = editItem as IronworkItemStock;
				setCategoryHA(it.ironwork_category || '');
				setLine(it.ironwork_line || '');
				setBrand(it.ironwork_brand || '');
				setCode(it.ironwork_code || '');
				setDescription(it.ironwork_description || '');
				setColor(it.ironwork_color || '');
				setQuantityPerLump(it.ironwork_quantity_for_lump ?? '');
				setLumpCount(it.ironwork_quantity_lump ?? '');
				setSite(it.ironwork_site || '');
				setPrice(it.ironwork_price ?? '');
			}
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
	};

	const handleSave = () => {
		// validation
		if (
			!categoryHA ||
			!line ||
			!code ||
			!description ||
			!color ||
			!site ||
			!quantityPerLump ||
			!lumpCount
		) {
			toast({
				title: 'Error de validación',
				description: 'Complete todos los campos obligatorios',
				variant: 'destructive',
				duration: 4000,
			});
			return;
		}

		const payload: any = {
			created_at:
				isEditing && (editItem as any).created_at
					? (editItem as any).created_at
					: new Date().toISOString().split('T')[0],
			...(category === 'Accesorios'
				? { accessory_material: isEditing ? (editItem as any).accessory_material || materialType : materialType }
				: { ironwork_material: isEditing ? (editItem as any).ironwork_material || materialType : materialType }),
		};

		if (category === 'Accesorios') {
			Object.assign(payload, {
				accessory_category: categoryHA,
				accessory_line: line,
				accessory_brand: brand,
				accessory_code: code,
				accessory_description: description,
				accessory_color: color,
				accessory_quantity_for_lump: Number(quantityPerLump),
				accessory_quantity_lump: Number(lumpCount),
				accessory_quantity: Number(quantityPerLump) * Number(lumpCount),
				accessory_site: site,
				accessory_price: price === '' ? null : Number(price),
			});
		} else {
			Object.assign(payload, {
				ironwork_category: categoryHA,
				ironwork_line: line,
				ironwork_brand: brand,
				ironwork_code: code,
				ironwork_description: description,
				ironwork_color: color,
				ironwork_quantity_for_lump: Number(quantityPerLump),
				ironwork_quantity_lump: Number(lumpCount),
				ironwork_quantity: Number(quantityPerLump) * Number(lumpCount),
				ironwork_site: site,
				ironwork_price: price === '' ? null : Number(price),
			});
		}

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
						{`Agregar ${category === 'Herrajes' ? 'herraje' : 'accesorio'}`}
					</Button>
				</DialogTrigger>
			)}
			<DialogContent showCloseButton={false} className="bg-card max-h-[90vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>
						{isEditing
							? `Editar ${category === 'Herrajes' ? 'herraje' : 'accesorio'}`
							: `Agregar  ${category === 'Herrajes' ? 'herraje' : 'accesorio'}`}
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
									value={(Number(quantityPerLump) || 0) * (Number(lumpCount) || 0) || ''}
									readOnly
									className="bg-background"
								/>
							</div>
						</div>

						<div className="grid gap-2">
							<Label>Ubicación</Label>
							<SiteSelect value={site} onValueChange={setSite} />
						</div>

                    {(user?.role === 'Admin' || user?.role === 'Ventas') && (
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
		</Dialog>
	);
}
