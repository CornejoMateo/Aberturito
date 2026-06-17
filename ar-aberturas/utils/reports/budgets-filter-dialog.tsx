import { useState, useEffect } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
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

type BudgetFilters = {
	typeFilter: string;
	statusFilter: string;
	sellerFilter: string;
	amountMin: string;
	amountMax: string;
};

interface BudgetsFilterDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	filters: BudgetFilters;
	sellers: Array<{ id: string; name: string }>;
	onApplyFilters: (filters: BudgetFilters) => void;
}

export function BudgetsFilterDialog({
	open,
	onOpenChange,
	filters,
	sellers,
	onApplyFilters,
}: BudgetsFilterDialogProps) {
	const [localFilters, setLocalFilters] = useState<BudgetFilters>(filters);

	useEffect(() => {
		setLocalFilters(filters);
	}, [filters]);

	const handleApply = () => {
		onApplyFilters(localFilters);
		onOpenChange(false);
	};

	const handleClear = () => {
		const clearedFilters: BudgetFilters = {
			typeFilter: 'all',
			statusFilter: 'all',
			sellerFilter: 'all',
			amountMin: '',
			amountMax: '',
		};
		setLocalFilters(clearedFilters);
		onApplyFilters(clearedFilters);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-card max-w-md">
				<DialogHeader>
					<DialogTitle className="text-foreground">Filtros de Presupuestos</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="type">Tipo de presupuesto</Label>
						<Select
							value={localFilters.typeFilter}
							onValueChange={(value) =>
								setLocalFilters((prev) => ({ ...prev, typeFilter: value }))
							}
						>
							<SelectTrigger className="bg-background">
								<SelectValue placeholder="Todos los tipos" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todos los tipos</SelectItem>
								<SelectItem value="Estándar">Estándar</SelectItem>
								<SelectItem value="Óptimo">Óptimo</SelectItem>
								<SelectItem value="Mínimo">Mínimo</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="status">Estado</Label>
						<Select
							value={localFilters.statusFilter}
							onValueChange={(value) =>
								setLocalFilters((prev) => ({ ...prev, statusFilter: value }))
							}
						>
							<SelectTrigger className="bg-background">
								<SelectValue placeholder="Todos los estados" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todos los estados</SelectItem>
								<SelectItem value="Pendiente">Pendiente</SelectItem>
								<SelectItem value="Vendido">Vendido</SelectItem>
								<SelectItem value="Perdido">Perdido</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="seller">Vendedor</Label>
						<Select
							value={localFilters.sellerFilter}
							onValueChange={(value) =>
								setLocalFilters((prev) => ({ ...prev, sellerFilter: value }))
							}
						>
							<SelectTrigger className="bg-background">
								<SelectValue placeholder="Todos los vendedores" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todos los vendedores</SelectItem>
								<SelectItem value="none">Sin vendedor</SelectItem>
								{sellers.map((seller) => (
									<SelectItem key={seller.id} value={seller.id}>
										{seller.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="amountMin">Monto mínimo ARS</Label>
						<Input
							id="amountMin"
							type="number"
							placeholder="0"
							value={localFilters.amountMin}
							onChange={(e) =>
								setLocalFilters((prev) => ({ ...prev, amountMin: e.target.value }))
							}
							className="bg-background"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="amountMax">Monto máximo ARS</Label>
						<Input
							id="amountMax"
							type="number"
							placeholder="Sin límite"
							value={localFilters.amountMax}
							onChange={(e) =>
								setLocalFilters((prev) => ({ ...prev, amountMax: e.target.value }))
							}
							className="bg-background"
						/>
					</div>
				</div>

				<DialogFooter className="gap-2">
					<Button variant="outline" onClick={handleClear}>
						Limpiar filtros
					</Button>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancelar
					</Button>
					<Button onClick={handleApply}>Aplicar filtros</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
