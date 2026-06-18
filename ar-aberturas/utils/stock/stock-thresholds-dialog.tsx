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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { listSuppliesStock } from '@/lib/stock/supplies-stock';
import { listStockThresholds, upsertStockThreshold, deleteStockThreshold } from '@/lib/stock/stock-thresholds';
import { useToast } from '@/components/ui/use-toast';
import { translateError } from '@/lib/error-translator';
import { Trash2, Save, Plus } from 'lucide-react';

interface StockThresholdsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function StockThresholdsDialog({ open, onOpenChange }: StockThresholdsDialogProps) {
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [supplies, setSupplies] = useState<any[]>([]);
	const [thresholds, setThresholds] = useState<Record<number, { yellow: number; red: number }>>({});
	const [selectedSupplyId, setSelectedSupplyId] = useState<string>('');
	const [yellowThreshold, setYellowThreshold] = useState<string>('5');
	const [redThreshold, setRedThreshold] = useState<string>('0');

	useEffect(() => {
		if (!open) return;

		const loadData = async () => {
			setIsLoading(true);
			try {
				// Load supplies
				const { data: suppliesData, error: suppliesError } = await listSuppliesStock();
				if (suppliesError) throw suppliesError;
				setSupplies(suppliesData || []);

				// Load thresholds
				const { data: thresholdsData, error: thresholdsError } = await listStockThresholds();
				if (thresholdsError) throw thresholdsError;

				// Convert thresholds to map
				const thresholdsMap = (thresholdsData || []).reduce<Record<number, { yellow: number; red: number }>>(
					(acc, t) => {
						acc[t.item_id] = {
							yellow: t.yellow_threshold,
							red: t.red_threshold,
						};
						return acc;
					},
					{}
				);
				setThresholds(thresholdsMap);
			} catch (error) {
				console.error('Error loading data:', error);
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

		loadData();
	}, [open]);

	const handleSaveThreshold = async () => {
		if (!selectedSupplyId) {
			toast({
				title: 'Error',
				description: 'Seleccione un insumo',
				variant: 'destructive',
			});
			return;
		}

		const itemId = parseInt(selectedSupplyId);
		const yellow = parseInt(yellowThreshold);
		const red = parseInt(redThreshold);

		if (isNaN(yellow) || isNaN(red)) {
			toast({
				title: 'Error',
				description: 'Los umbrales deben ser números válidos',
				variant: 'destructive',
			});
			return;
		}

		if (red > yellow) {
			toast({
				title: 'Error',
				description: 'El umbral rojo debe ser menor o igual al umbral amarillo',
				variant: 'destructive',
			});
			return;
		}

		setIsLoading(true);
		try {
			const { error } = await upsertStockThreshold(itemId, 'Insumos', yellow, red);
			if (error) throw error;

			// Update local state
			setThresholds((prev) => ({
				...prev,
				[itemId]: { yellow, red },
			}));

			toast({
				title: 'Umbral guardado',
				description: 'El umbral de stock ha sido configurado correctamente',
			});

			// Reset form
			setSelectedSupplyId('');
			setYellowThreshold('5');
			setRedThreshold('0');
		} catch (error) {
			console.error('Error saving threshold:', error);
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

	const handleDeleteThreshold = async (itemId: number) => {
		const threshold = await listStockThresholds();
		const existing = threshold.data?.find((t) => t.item_id === itemId);
		
		if (!existing) return;

		setIsLoading(true);
		try {
			const { error } = await deleteStockThreshold(existing.id);
			if (error) throw error;

			// Update local state
			setThresholds((prev) => {
				const updated = { ...prev };
				delete updated[itemId];
				return updated;
			});

			toast({
				title: 'Umbral eliminado',
				description: 'El umbral de stock ha sido eliminado',
			});
		} catch (error) {
			console.error('Error deleting threshold:', error);
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

	const handleSelectSupply = (supplyId: string) => {
		setSelectedSupplyId(supplyId);
		const itemId = parseInt(supplyId);
		const existingThreshold = thresholds[itemId];
		if (existingThreshold) {
			setYellowThreshold(existingThreshold.yellow.toString());
			setRedThreshold(existingThreshold.red.toString());
		} else {
			setYellowThreshold('5');
			setRedThreshold('0');
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-card max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-foreground">Configuración de Umbrales de Stock</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Configure umbrales de alerta para los insumos. Cuando el stock baje del umbral amarillo se mostrará en amarillo, y cuando baje del umbral rojo se mostrará en rojo.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* Add/Edit Threshold Form */}
					<div className="space-y-4 p-4 border rounded-lg bg-secondary/30">
						<h3 className="text-sm font-medium text-foreground">Configurar umbral</h3>
						<div className="grid gap-4">
							<div>
								<Label htmlFor="supply" className="text-foreground">
									Insumo
								</Label>
								<Select value={selectedSupplyId} onValueChange={handleSelectSupply}>
									<SelectTrigger className="bg-background mt-2">
										<SelectValue placeholder="Seleccione un insumo" />
									</SelectTrigger>
									<SelectContent>
										{supplies.map((supply) => (
											<SelectItem key={supply.id} value={supply.id.toString()}>
												{supply.supply_code} - {supply.supply_description || 'Sin descripción'}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="yellowThreshold" className="text-foreground">
										Umbral Amarillo (unidades)
									</Label>
									<Input
										id="yellowThreshold"
										type="number"
										value={yellowThreshold}
										onChange={(e) => setYellowThreshold(e.target.value)}
										placeholder="5"
										className="bg-background mt-2"
										min="0"
									/>
								</div>
								<div>
									<Label htmlFor="redThreshold" className="text-foreground">
										Umbral Rojo (unidades)
									</Label>
									<Input
										id="redThreshold"
										type="number"
										value={redThreshold}
										onChange={(e) => setRedThreshold(e.target.value)}
										placeholder="0"
										className="bg-background mt-2"
										min="0"
									/>
								</div>
							</div>
							<Button onClick={handleSaveThreshold} disabled={isLoading || !selectedSupplyId} className="w-full">
								<Save className="mr-2 h-4 w-4" />
								Guardar Umbral
							</Button>
						</div>
					</div>

					{/* Configured Thresholds List */}
					<div className="space-y-2">
						<h3 className="text-sm font-medium text-foreground">Umbrales Configurados</h3>
						{isLoading ? (
							<p className="text-sm text-muted-foreground">Cargando...</p>
						) : Object.keys(thresholds).length === 0 ? (
							<p className="text-sm text-muted-foreground">No hay umbrales configurados</p>
						) : (
							Object.entries(thresholds).map(([itemId, threshold]) => {
								const supply = supplies.find((s) => s.id === parseInt(itemId));
								if (!supply) return null;
								return (
									<div
										key={itemId}
										className="flex items-center justify-between p-3 border rounded-lg bg-card"
									>
										<div>
											<p className="text-sm font-medium text-foreground">
												{supply.supply_code} - {supply.supply_description || 'Sin descripción'}
											</p>
											<p className="text-xs text-muted-foreground">
												Amarillo: {threshold.yellow} | Rojo: {threshold.red}
											</p>
										</div>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => handleDeleteThreshold(parseInt(itemId))}
											disabled={isLoading}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								);
							})
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
