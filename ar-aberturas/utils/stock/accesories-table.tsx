import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Edit, Trash2, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { ConfirmUpdateDialog } from '@/utils/stock/confirm-update-dialog';
import ImageViewer from '@/components/ui/image-viewer';
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/provider/auth-provider';
import { useToast } from '@/components/ui/use-toast';
import { STOCK_CONFIGS, type StockCategory } from '@/lib/stock-config';
import type { AccessoryItemStock } from '@/lib/accesorie-stock';
import type { IronworkItemStock } from '@/lib/ironwork-stock';
import type { SupplyItemStock } from '@/lib/supplies-stock';

interface AccesoriesTableProps {
	categoryState: StockCategory;
	filteredStock: AccessoryItemStock[] | IronworkItemStock[] | SupplyItemStock[];
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
	onUpdateQuantity: (id: string, newQuantity: number, field?: string) => Promise<void>;
}

export function AccesoriesTable({
	categoryState,
	filteredStock,
	onEdit,
	onDelete,
	onUpdateQuantity,
}: AccesoriesTableProps) {
	const { user } = useAuth();
	const { toast } = useToast();
	const [openImageUrl, setOpenImageUrl] = useState<string | null>(null);
	const [currentAction, setCurrentAction] = useState<{
		id: string;
		action: 'increment' | 'decrement';
		currentQty: number;
	} | null>(null);
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [updatingId, setUpdatingId] = useState<string | null>(null);
	const [showQuantityDialog, setShowQuantityDialog] = useState(false);
	const [quantityDialogType, setQuantityDialogType] = useState<'increase' | 'decrease' | null>(null);
	const [quantityChange, setQuantityChange] = useState<number | ''>('');
	const [currentItemId, setCurrentItemId] = useState<string | null>(null);
	const [currentItemTotal, setCurrentItemTotal] = useState<number>(0);

	const handleQuantityAction = (
		id: string,
		action: 'increment' | 'decrement',
		currentQty: number
	) => {
		setQuantityDialogType(action === 'increment' ? 'increase' : 'decrease');
		setQuantityChange('');
		setCurrentItemId(id);
		setCurrentItemTotal(currentQty);
		setShowQuantityDialog(true);
	};

	const handleConfirmUpdate = async () => {
		if (!currentItemId || quantityChange === '' || !quantityDialogType) {
			toast({
				title: 'Error',
				description: 'Ingrese una cantidad válida',
				variant: 'destructive',
				duration: 3000,
			});
			return;
		}
		
		const adjustment = Number(quantityChange);
		
		if (adjustment < 0) {
			toast({
				title: 'Error',
				description: 'La cantidad debe ser un número positivo',
				variant: 'destructive',
				duration: 3000,
			});
			return;
		}
		
		const newQuantity = quantityDialogType === 'increase' 
			? currentItemTotal + adjustment 
			: currentItemTotal - adjustment;
		
		if (newQuantity < 0) {
			toast({
				title: 'Error',
				description: `No puede disminuir ${adjustment} unidades. Solo tiene ${currentItemTotal} disponibles`,
				variant: 'destructive',
				duration: 3000,
			});
			return;
		}
		
		try {
			setIsUpdating(true);
			setUpdatingId(currentItemId);
			await onUpdateQuantity(currentItemId, newQuantity);
		} finally {
			setIsUpdating(false);
			setUpdatingId(null);
			setShowQuantityDialog(false);
			setQuantityChange('');
			setQuantityDialogType(null);
			setCurrentItemId(null);
			setCurrentItemTotal(0);
		}
	};

	const config = STOCK_CONFIGS[categoryState];
	const keys = config.fields;

	const getItemName = (item: any) => {
		return (
			[(item as any)[keys.line], (item as any)[keys.code], (item as any)[keys.description]]
				.filter(Boolean)
				.join(' ') || 'este ítem'
		);
	};

	return (
		<Card className="bg-card border-border overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="border-b border-border bg-secondary">
						<tr>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Categoría
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Línea
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Marca
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Código
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Descripción
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Color
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Cant x bulto
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Bultos
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Total
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Ubicación
							</th>
							{user?.role === 'Admin' || user?.role === 'Ventas' ? (
								<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
									Precio
								</th>
							) : null}
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Fecha de creación
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Acciones
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Imagen
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border">
						{filteredStock.length === 0 ? (
							<tr>
								<td colSpan={12} className="px-6 py-12 text-center">
									<div className="flex flex-col items-center gap-2 text-muted-foreground">
										<Package className="h-12 w-12 opacity-50" />
										<p className="text-lg font-medium">No hay items</p>
									</div>
								</td>
							</tr>
						) : (
							filteredStock.map((item) => {
								const total =
									((item as any)[keys.quantityForLump] ?? 0) *
										((item as any)[keys.quantityLump] ?? 0) || 0;
								return (
									<tr key={(item as any).id} className="hover:bg-secondary/50 transition-colors">
										<td className="px-2 py-2 whitespace-nowrap">
											<p className="text-center text-sm text-foreground">
												{(item as any)[keys.category] || '—'}
											</p>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<p className="text-center text-sm text-foreground">
												{(item as any)[keys.line] || '-'}
											</p>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<p className="text-center text-sm text-foreground">
												{(item as any)[keys.brand] || '-'}
											</p>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<p className="text-center text-sm text-foreground">
												{(item as any)[keys.code] || '-'}
											</p>
										</td>
										<td className="px-2 py-2 max-w-[500px]">
											<p className="text-sm text-justify text-foreground whitespace-pre-line break-words">
												{((item as any)[keys.description] || '')
													.split(' ')
													.reduce(
														(acc: string[], word: string) => {
															const lastLine = acc[acc.length - 1] || '';
															if (lastLine.length + word.length <= 100) {
																acc[acc.length - 1] = lastLine ? `${lastLine} ${word}` : word;
															} else {
																acc.push(word);
															}
															return acc;
														},
														['']
													)
													.join('\n')}
											</p>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<p className="text-center text-sm text-foreground">
												{(item as any)[keys.color] || ''}
											</p>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<p className="text-center text-sm text-foreground">
												{(item as any)[keys.quantityForLump] ?? 0}
											</p>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<p className="text-center text-sm text-foreground">
												{(item as any)[keys.quantityLump] ?? 0}
											</p>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<div className="flex items-center justify-center gap-1">
												<Button
													variant="outline"
													size="icon"
													className="h-7 w-7"
													onClick={() =>
														handleQuantityAction(
															(item as any).id,
															'decrement',
															(item as any)[keys.quantity] ?? total
														)
													}
													disabled={
														(isUpdating && updatingId === (item as any).id) ||
														((item as any)[keys.quantity] ?? total) <= 0
													}
												>
													<Minus className="h-3.5 w-3.5" />
												</Button>
												<div className="text-center min-w-[70px]">
													<p className="text-sm font-medium">
														{(item as any)[keys.quantity] ?? total}
													</p>
													<p className="text-xs text-muted-foreground">unidades</p>
												</div>
												<Button
													variant="outline"
													size="icon"
													className="h-7 w-7"
													onClick={() =>
														handleQuantityAction(
															(item as any).id,
															'increment',
															(item as any)[keys.quantity] ?? total
														)
													}
													disabled={isUpdating && updatingId === (item as any).id}
												>
													<Plus className="h-3.5 w-3.5" />
												</Button>
											</div>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<p className="text-center text-sm text-muted-foreground">
												{(item as any)[keys.site] || ''}
											</p>
										</td>
										{user?.role === 'Admin' || user?.role === 'Ventas' ? (
											<td className="px-2 py-2 whitespace-nowrap">
												<p className="text-center text-sm text-foreground">
													{(item as any)[keys.price] ? `$${(item as any)[keys.price]}` : '—'}
												</p>
											</td>
										) : null}
										<td className="px-2 py-2 whitespace-nowrap">
											<p className="text-center text-xs text-muted-foreground">
												{(() => {
													const dateStr = (item as any)[keys.createdAt];
													if (!dateStr) return 'N/A';
													const d = new Date(dateStr);
													if (isNaN(d.getTime())) return 'N/A';
													const day = String(d.getUTCDate()).padStart(2, '0');
													const month = String(d.getUTCMonth() + 1).padStart(2, '0');
													const year = d.getUTCFullYear();
													return `${day}-${month}-${year}`;
												})()}
											</p>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right">
											<div className="flex justify-end gap-2">
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													onClick={() => onEdit((item as any).id)}
												>
													<Edit className="h-4 w-4" />
												</Button>
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8 text-destructive hover:text-destructive"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogTitle>¿Eliminar item?</AlertDialogTitle>
														<AlertDialogDescription>
															¿Estás seguro que deseas eliminar este item? Esta acción no se puede
															deshacer.
														</AlertDialogDescription>
														<div className="flex justify-end gap-2 mt-4">
															<AlertDialogCancel>Cancelar</AlertDialogCancel>
															<AlertDialogAction
																className="bg-destructive text-white hover:bg-destructive/90"
																onClick={() => onDelete((item as any).id)}
															>
																Eliminar
															</AlertDialogAction>
														</div>
													</AlertDialogContent>
												</AlertDialog>
											</div>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<div className="flex justify-center">
												{(item as any)[keys.image_url] ? (
													<Button
														variant="outline"
														size="sm"
														onClick={() => setOpenImageUrl((item as any)[keys.image_url]!)}
													>
														Ver
													</Button>
												) : (
													<span className="text-muted-foreground text-sm">No tiene</span>
												)}
											</div>
										</td>
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>

			{showQuantityDialog && (
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
							<Button onClick={handleConfirmUpdate}>
								{quantityDialogType === 'increase' ? 'Aumentar' : 'Disminuir'}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}

			<ImageViewer
				open={!!openImageUrl}
				onOpenChange={(v) => (v ? null : setOpenImageUrl(null))}
				src={openImageUrl}
			/>
		</Card>
	);
}
