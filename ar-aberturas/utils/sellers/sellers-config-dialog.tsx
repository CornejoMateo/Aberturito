import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useState, useEffect } from 'react';
import { createSeller, deleteSeller, listSellers, updateSeller } from '@/lib/sellers/sellers';
import { useToast } from '@/components/ui/use-toast';
import { translateError } from '@/lib/error-translator';
import { Seller } from '@/lib/sellers/sellers';
import { Trash2, Edit, Plus } from 'lucide-react';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';

interface SellersConfigDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SellersConfigDialog({ open, onOpenChange }: SellersConfigDialogProps) {
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [isAdding, setIsAdding] = useState(false);
	const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
	const [sellerName, setSellerName] = useState('');

	const {
		data: sellers,
		loading,
		refresh,
	} = useOptimizedRealtime<Seller>(
		'sellers',
		async () => {
			const { data } = await listSellers();
			return data ?? [];
		},
		'sellers_cache'
	);

	useEffect(() => {
		if (!open) {
			setIsAdding(false);
			setEditingSeller(null);
			setSellerName('');
		}
	}, [open]);

	const handleAddSeller = async () => {
		if (!sellerName.trim()) return;

		setIsLoading(true);
		try {
			const { error } = await createSeller({ name: sellerName.trim() });
			if (error) throw error;

			toast({
				title: 'Vendedor agregado',
				description: `${sellerName} ha sido agregado correctamente.`,
			});
			setSellerName('');
			setIsAdding(false);
			await refresh();
		} catch (error) {
			console.error('Error al agregar vendedor:', error);
			const message = translateError(error);
			toast({
				title: 'Error',
				description: message,
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleUpdateSeller = async () => {
		if (!editingSeller || !sellerName.trim()) return;

		setIsLoading(true);
		try {
			const { error } = await updateSeller(editingSeller.id, { name: sellerName.trim() });
			if (error) throw error;

			toast({
				title: 'Vendedor actualizado',
				description: `El vendedor ha sido actualizado correctamente.`,
			});
			setEditingSeller(null);
			setSellerName('');
			await refresh();
		} catch (error) {
			console.error('Error al actualizar vendedor:', error);
			const message = translateError(error);
			toast({
				title: 'Error',
				description: message,
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteSeller = async (seller: Seller) => {
		setIsLoading(true);
		try {
			const { error } = await deleteSeller(seller.id);
			if (error) throw error;

			toast({
				title: 'Vendedor eliminado',
				description: `${seller.name} ha sido eliminado correctamente.`,
			});
			await refresh();
		} catch (error) {
			console.error('Error al eliminar vendedor:', error);
			const message = translateError(error);
			toast({
				title: 'Error',
				description: message,
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleEditClick = (seller: Seller) => {
		setEditingSeller(seller);
		setSellerName(seller.name);
		setIsAdding(false);
	};

	const handleCancelEdit = () => {
		setEditingSeller(null);
		setSellerName('');
		setIsAdding(false);
	};

	const handleSubmit = () => {
		if (editingSeller) {
			handleUpdateSeller();
		} else {
			handleAddSeller();
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-card max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-foreground">Configuración de Vendedores</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Agregue, edite o elimine vendedores del sistema
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Add/Edit Seller Form */}
					<div className="flex gap-2">
						<div className="flex-1">
							<Label htmlFor="sellerName" className="text-foreground">
								{editingSeller ? 'Editar vendedor' : 'Nuevo vendedor'}
							</Label>
							<Input
								id="sellerName"
								value={sellerName}
								onChange={(e) => setSellerName(e.target.value)}
								placeholder="Nombre del vendedor"
								className="bg-background mt-2"
								disabled={isLoading}
							/>
						</div>
						<div className="flex gap-2 items-end">
							{editingSeller ? (
								<>
									<Button onClick={handleSubmit} disabled={isLoading || !sellerName.trim()}>
										<Edit className="mr-2 h-4 w-4" />
										Actualizar
									</Button>
									<Button variant="outline" onClick={handleCancelEdit} disabled={isLoading}>
										Cancelar
									</Button>
								</>
							) : (
								<Button onClick={handleSubmit} disabled={isLoading || !sellerName.trim()}>
									<Plus className="mr-2 h-4 w-4" />
									Agregar
								</Button>
							)}
						</div>
					</div>

					{/* Sellers List */}
					<div className="space-y-2">
						{loading ? (
							<p className="text-sm text-muted-foreground">Cargando vendedores...</p>
						) : sellers.length === 0 ? (
							<p className="text-sm text-muted-foreground">No hay vendedores registrados</p>
						) : (
							sellers.map((seller) => (
								<div
									key={seller.id}
									className="flex items-center justify-between p-3 border rounded-lg bg-card"
								>
									<span className="text-foreground">{seller.name}</span>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleEditClick(seller)}
											disabled={isLoading}
										>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => handleDeleteSeller(seller)}
											disabled={isLoading}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))
						)}
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cerrar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
