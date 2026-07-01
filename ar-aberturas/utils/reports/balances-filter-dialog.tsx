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
import { formatNumber } from '@/utils/budgets/utils';
import { BALANCE_TYPES } from '@/constants/reports/balances-report';

type BalanceFilters = {
	balanceTypeFilter: string;
	purchaseMin: string;
	purchaseMax: string;
	deliveriesMin: string;
	deliveriesMax: string;
	balanceAmountMin: string;
	balanceAmountMax: string;
	usdContractMin: string;
	usdContractMax: string;
	usdCurrentMin: string;
	usdCurrentMax: string;
	balanceInUseMin: string;
	balanceInUseMax: string;
};

interface BalancesFilterDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	filters: BalanceFilters;
	onApplyFilters: (filters: BalanceFilters) => void;
}

export function BalancesFilterDialog({
	open,
	onOpenChange,
	filters,
	onApplyFilters,
}: BalancesFilterDialogProps) {
	const [localFilters, setLocalFilters] = useState<BalanceFilters>(filters);

	useEffect(() => {
		if (!open) return;
		setLocalFilters(filters);
	}, [
		open,
		filters.balanceTypeFilter,
		filters.purchaseMin,
		filters.purchaseMax,
		filters.deliveriesMin,
		filters.deliveriesMax,
		filters.balanceAmountMin,
		filters.balanceAmountMax,
		filters.usdContractMin,
		filters.usdContractMax,
		filters.usdCurrentMin,
		filters.usdCurrentMax,
		filters.balanceInUseMin,
		filters.balanceInUseMax,
	]);

	const handleApply = () => {
		onApplyFilters(localFilters);
		onOpenChange(false);
	};

	const handleClear = () => {
		const clearedFilters: BalanceFilters = {
			balanceTypeFilter: 'all',
			purchaseMin: '',
			purchaseMax: '',
			deliveriesMin: '',
			deliveriesMax: '',
			balanceAmountMin: '',
			balanceAmountMax: '',
			usdContractMin: '',
			usdContractMax: '',
			usdCurrentMin: '',
			usdCurrentMax: '',
			balanceInUseMin: '',
			balanceInUseMax: '',
		};
		setLocalFilters(clearedFilters);
		onApplyFilters(clearedFilters);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-card max-w-md max-h-[90vh] flex flex-col">
				<DialogHeader>
					<DialogTitle className="text-foreground">Filtros de Saldos</DialogTitle>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto space-y-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="balanceType">Tipo de saldo</Label>
						<Select
							value={localFilters.balanceTypeFilter}
							onValueChange={(value) =>
								setLocalFilters((prev) => ({ ...prev, balanceTypeFilter: value }))
							}
						>
							<SelectTrigger className="bg-background">
								<SelectValue placeholder="Todos los tipos" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todos los tipos</SelectItem>
								<SelectItem value={BALANCE_TYPES.DEBTOR}>Deudor</SelectItem>
								<SelectItem value={BALANCE_TYPES.CREDITOR}>Acreedor</SelectItem>
								<SelectItem value={BALANCE_TYPES.CANCELLED}>Cancelado</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="purchaseMin">Compra mínima ARS</Label>
						<Input
							id="purchaseMin"
							type="text"
							placeholder="0"
							value={localFilters.purchaseMin}
							onChange={(e) => {
								const formatted = formatNumber(e.target.value);
								setLocalFilters((prev) => ({ ...prev, purchaseMin: formatted }));
							}}
							className="bg-background"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="purchaseMax">Compra máxima ARS</Label>
						<Input
							id="purchaseMax"
							type="text"
							placeholder="Sin límite"
							value={localFilters.purchaseMax}
							onChange={(e) => {
								const formatted = formatNumber(e.target.value);
								setLocalFilters((prev) => ({ ...prev, purchaseMax: formatted }));
							}}
							className="bg-background"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="deliveriesMin">Entregas mínimas ARS</Label>
						<Input
							id="deliveriesMin"
							type="text"
							placeholder="0"
							value={localFilters.deliveriesMin}
							onChange={(e) => {
								const formatted = formatNumber(e.target.value);
								setLocalFilters((prev) => ({ ...prev, deliveriesMin: formatted }));
							}}
							className="bg-background"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="deliveriesMax">Entregas máximas ARS</Label>
						<Input
							id="deliveriesMax"
							type="text"
							placeholder="Sin límite"
							value={localFilters.deliveriesMax}
							onChange={(e) => {
								const formatted = formatNumber(e.target.value);
								setLocalFilters((prev) => ({ ...prev, deliveriesMax: formatted }));
							}}
							className="bg-background"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="balanceAmountMin">Saldo mínimo ARS</Label>
						<Input
							id="balanceAmountMin"
							type="text"
							placeholder="0"
							value={localFilters.balanceAmountMin}
							onChange={(e) => {
								const formatted = formatNumber(e.target.value);
								setLocalFilters((prev) => ({ ...prev, balanceAmountMin: formatted }));
							}}
							className="bg-background"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="balanceAmountMax">Saldo máximo ARS</Label>
						<Input
							id="balanceAmountMax"
							type="text"
							placeholder="Sin límite"
							value={localFilters.balanceAmountMax}
							onChange={(e) => {
								const formatted = formatNumber(e.target.value);
								setLocalFilters((prev) => ({ ...prev, balanceAmountMax: formatted }));
							}}
							className="bg-background"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="usdContractMin">USD Contrato mínimo</Label>
						<Input
							id="usdContractMin"
							type="text"
							placeholder="0"
							value={localFilters.usdContractMin}
							onChange={(e) => {
								const formatted = formatNumber(e.target.value);
								setLocalFilters((prev) => ({ ...prev, usdContractMin: formatted }));
							}}
							className="bg-background"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="usdContractMax">USD Contrato máximo</Label>
						<Input
							id="usdContractMax"
							type="text"
							placeholder="Sin límite"
							value={localFilters.usdContractMax}
							onChange={(e) => {
								const formatted = formatNumber(e.target.value);
								setLocalFilters((prev) => ({ ...prev, usdContractMax: formatted }));
							}}
							className="bg-background"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="usdCurrentMin">USD Actual mínimo</Label>
						<Input
							id="usdCurrentMin"
							type="text"
							placeholder="0"
							value={localFilters.usdCurrentMin}
							onChange={(e) => {
								const formatted = formatNumber(e.target.value);
								setLocalFilters((prev) => ({ ...prev, usdCurrentMin: formatted }));
							}}
							className="bg-background"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="usdCurrentMax">USD Actual máximo</Label>
						<Input
							id="usdCurrentMax"
							type="text"
							placeholder="Sin límite"
							value={localFilters.usdCurrentMax}
							onChange={(e) => {
								const formatted = formatNumber(e.target.value);
								setLocalFilters((prev) => ({ ...prev, usdCurrentMax: formatted }));
							}}
							className="bg-background"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="balanceInUseMin">Saldo USD mínimo</Label>
						<Input
							id="balanceInUseMin"
							type="text"
							placeholder="0"
							value={localFilters.balanceInUseMin}
							onChange={(e) => {
								const formatted = formatNumber(e.target.value);
								setLocalFilters((prev) => ({ ...prev, balanceInUseMin: formatted }));
							}}
							className="bg-background"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="balanceInUseMax">Saldo USD máximo</Label>
						<Input
							id="balanceInUseMax"
							type="text"
							placeholder="Sin límite"
							value={localFilters.balanceInUseMax}
							onChange={(e) => {
								const formatted = formatNumber(e.target.value);
								setLocalFilters((prev) => ({ ...prev, balanceInUseMax: formatted }));
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
