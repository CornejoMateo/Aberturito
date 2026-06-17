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
import { formatNumber, parseArsToNumber } from '@/utils/budgets/utils';

type BudgetFilters = {
	typeFilter: string;
	statusFilter: string;
	sellerFilter: string;
	amountMin: string;
	amountMax: string;
	amountMinUsd: string;
	amountMaxUsd: string;
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
	if (!open) return;
	setLocalFilters(filters);
}, [
	open,
	filters.typeFilter,
	filters.statusFilter,
	filters.sellerFilter,
	filters.amountMin,
	filters.amountMax,
	filters.amountMinUsd,
	filters.amountMaxUsd,
]);

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
			amountMinUsd: '',
			amountMaxUsd: '',
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
							type="text"
							placeholder="0"
							value={localFilters.amountMin}
							onChange={(e) => {
								const formatted = formatNumber(e.target.value);
								setLocalFilters((prev) => ({ ...prev, amountMin: formatted }));
							}}
							className="bg-background"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="amountMax">Monto máximo ARS</Label>
						<Input
							id="amountMax"
							type="text"
							placeholder="Sin límite"
							value={localFilters.amountMax}
							onChange={(e) => {
								const formatted = formatNumber(e.target.value);
								setLocalFilters((prev) => ({ ...prev, amountMax: formatted }));
							}}
							className="bg-background"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="amountMinUsd">Monto mínimo USD</Label>
						<Input
							id="amountMinUsd"
							type="text"
							placeholder="0"
							value={localFilters.amountMinUsd}
							onChange={(e) => {
								const formatted = formatNumber(e.target.value);
								setLocalFilters((prev) => ({ ...prev, amountMinUsd: formatted }));
							}}
							className="bg-background"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="amountMaxUsd">Monto máximo USD</Label>
						<Input
							id="amountMaxUsd"
							type="text"
							placeholder="Sin límite"
							value={localFilters.amountMaxUsd}
							onChange={(e) => {
								const formatted = formatNumber(e.target.value);
								setLocalFilters((prev) => ({ ...prev, amountMaxUsd: formatted }));
							}}
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
