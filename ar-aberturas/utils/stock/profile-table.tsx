import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingDown, TrendingUp, Edit, Trash2, Plus, Minus } from 'lucide-react';
import { type ProfileItemStock } from '@/lib/profile-stock';
import { useState } from 'react';
import { ConfirmUpdateDialog } from '@/components/stock/confirm-update-dialog';
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogCancel,
} from '@/components/ui/alert-dialog';

interface ProfileTableProps {
	filteredStock: ProfileItemStock[];
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
	onUpdateQuantity: (id: string, newQuantity: number) => Promise<void>;
}

export function ProfileTable({ filteredStock, onEdit, onDelete, onUpdateQuantity }: ProfileTableProps) {
	const [updatingId, setUpdatingId] = useState<string | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [currentAction, setCurrentAction] = useState<{
		id: string;
		action: 'increment' | 'decrement';
		currentQty: number;
	} | null>(null);

	const handleQuantityAction = (
		id: string,
		action: 'increment' | 'decrement',
		currentQty: number
	) => {
		setCurrentAction({ id, action, currentQty });
		setConfirmDialogOpen(true);
	};

	const handleConfirmUpdate = async () => {
		if (!currentAction) return;

		const { id, action, currentQty } = currentAction;
		const newQuantity = action === 'increment' ? currentQty + 1 : currentQty - 1;

		try {
			setIsUpdating(true);
			setUpdatingId(id);
			await onUpdateQuantity(id, newQuantity);
		} finally {
			setIsUpdating(false);
			setUpdatingId(null);
			setConfirmDialogOpen(false);
			setCurrentAction(null);
		}
	};

	const getItemName = (item: ProfileItemStock) => {
		return [item.line, item.code, item.color].filter(Boolean).join(' ') || 'este ítem';
	};
	return (
		<Card className="bg-card border-border overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="border-b border-border bg-secondary">
						<tr>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Categoria
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Linea
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Código
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Color
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Largo (mm)
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Cantidad
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Estado
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Ubicación
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Fecha de creación
							</th>
							<th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
								Acciones
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border">
						{filteredStock.length === 0 ? (
							<tr>
								<td colSpan={10} className="px-6 py-12 text-center">
									<div className="flex flex-col items-center gap-2 text-muted-foreground">
										<Package className="h-12 w-12 opacity-50" />
										<p className="text-lg font-medium">No hay items en stock</p>
									</div>
								</td>
							</tr>
						) : (
							filteredStock.map((item) => {
								const isLowStock = (item.quantity ?? 0) < 10; // threshold fixed at 10

								return (
									<tr key={item.id} className="hover:bg-secondary/50 transition-colors">
										<td className="px-2 py-2 whitespace-nowrap">
											<div className="flex justify-center">
												<Badge variant="outline" className="bg-secondary text-xs">
													{item.category || 'Sin categoría'}
												</Badge>
											</div>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<p className="text-center text-sm text-foreground">{item.line || 'N/A'}</p>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<p className="text-center text-sm text-foreground">{item.code || 'N/A'}</p>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<p className="text-center text-sm text-foreground">{item.color || 'N/A'}</p>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<p className="text-center text-sm text-foreground">
												{item.width ? `${item.width} mm` : 'N/A'}
											</p>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<div className="flex items-center justify-center gap-1">
												<Button
													variant="outline"
													size="icon"
													className="h-7 w-7"
													onClick={() =>
														handleQuantityAction(item.id!, 'decrement', item.quantity ?? 0)
													}
													disabled={
														(isUpdating && updatingId === item.id) || (item.quantity ?? 0) <= 0
													}
												>
													<Minus className="h-3.5 w-3.5" />
												</Button>
												<div className="text-center min-w-[50px]">
													<p className="text-sm font-medium">{item.quantity ?? 0}</p>
													<p className="text-xs text-muted-foreground">unidades</p>
												</div>
												<Button
													variant="outline"
													size="icon"
													className="h-7 w-7"
													onClick={() =>
														handleQuantityAction(item.id!, 'increment', item.quantity ?? 0)
													}
													disabled={isUpdating && updatingId === item.id}
												>
													<Plus className="h-3.5 w-3.5" />
												</Button>
											</div>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<div className="flex justify-center">
												{(() => {
													let badgeColor = 'bg-green-500 text-white';
													let label = item.status || 'N/A';
													if (label === 'Malo') {
														badgeColor = 'bg-red-500 text-white';
													} else if (label === 'Medio') {
														badgeColor = 'bg-yellow-400 text-white';
													} else if (label === 'Bueno') {
														badgeColor = 'bg-green-500 text-white';
													} else {
														badgeColor = 'bg-muted-foreground text-white';
													}
													return <Badge className={`gap-1 text-sm ${badgeColor}`}>{label}</Badge>;
												})()}
											</div>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<p className="text-center text-sm text-muted-foreground">
												{item.site || 'N/A'}
											</p>
										</td>
										<td className="px-2 py-2 whitespace-nowrap">
											<p className="text-center text-xs text-muted-foreground">
												{item.created_at
													? item.created_at.split('T')[0]
													: item.last_update
														? item.last_update.split('T')[0]
														: 'N/A'}
											</p>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right">
											<div className="flex justify-end gap-2">
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													onClick={() => item.id && onEdit(item.id)}
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
														<AlertDialogTitle>¿Eliminar perfil del stock?</AlertDialogTitle>
														<AlertDialogDescription>
															¿Estás seguro que deseas eliminar este perfil? Esta acción no se puede
															deshacer.
														</AlertDialogDescription>
														<div className="flex justify-end gap-2 mt-4">
															<AlertDialogCancel>Cancelar</AlertDialogCancel>
															<AlertDialogAction
																className="bg-destructive text-white hover:bg-destructive/90"
																onClick={() => item.id && onDelete(item.id)}
															>
																Eliminar
															</AlertDialogAction>
														</div>
													</AlertDialogContent>
												</AlertDialog>
											</div>
										</td>
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>

			{currentAction && (
				<ConfirmUpdateDialog
					open={confirmDialogOpen}
					onOpenChange={setConfirmDialogOpen}
					onConfirm={handleConfirmUpdate}
					itemName={getItemName(
						filteredStock.find((item) => item.id === currentAction.id) || ({} as ProfileItemStock)
					)}
					action={currentAction.action}
					quantity={currentAction.currentQty}
					isLoading={isUpdating && updatingId === currentAction.id}
				/>
			)}
		</Card>
	);
}
