'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';
import { formatCurrency, formatCurrencyUSD } from '@/helpers/format-prices.tsx/formats';
import { formatShortDate } from '@/helpers/date/formats';
import { calculateBalanceStats } from '@/helpers/balances/stats';
import {
	BALANCES_REPORT_COLUMNS,
	BALANCE_TYPES,
	DEFAULT_FALLBACK,
} from '@/constants/reports/balances-report';
import { StatsCardsBalances } from '@/utils/balances/stats-cards-balances';
import { BalanceWithBudgetAndClient, listBalancesForReport } from '@/lib/works/balances';
import { getLastTransactionUSD } from '@/lib/works/balance_transactions';
import { getTotalsByBalanceIds } from '@/lib/works/balance_transactions';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, Download, Filter } from 'lucide-react';
import { normalizeMoney } from '@/helpers/format-prices.tsx/formats';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BudgetsReport } from './budgets-report';
import { BalancesFilterDialog } from '@/utils/reports/balances-filter-dialog';
import { translateError } from '@/lib/error-translator';
import { parseArsToNumber } from '@/utils/budgets/utils';

type BalanceReportRow = {
	id: string;
	contractDate: string;
	contractDateRaw: Date;
	client: string;
	work: string;
	concept: string;
	purchaseArs: number;
	deliveriesArs: number;
	balanceType: string;
	balanceAmountArs: number;
	usdContractRef: number;
	usdCurrentToCancel: number | null;
	balanceInUseUsd: number;
	seller: string;
	sellerId: number | null;
};

export function BalancesReport() {
	const [searchTerm, setSearchTerm] = useState('');
	const [rows, setRows] = useState<BalanceReportRow[]>([]);
	const [sortField, setSortField] = useState<keyof BalanceReportRow>('contractDate');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
	const [balanceTypeFilter, setBalanceTypeFilter] = useState<string>('all');
	const [purchaseMin, setPurchaseMin] = useState<string>('');
	const [purchaseMax, setPurchaseMax] = useState<string>('');
	const [deliveriesMin, setDeliveriesMin] = useState<string>('');
	const [deliveriesMax, setDeliveriesMax] = useState<string>('');
	const [balanceAmountMin, setBalanceAmountMin] = useState<string>('');
	const [balanceAmountMax, setBalanceAmountMax] = useState<string>('');
	const [usdContractMin, setUsdContractMin] = useState<string>('');
	const [usdContractMax, setUsdContractMax] = useState<string>('');
	const [usdCurrentMin, setUsdCurrentMin] = useState<string>('');
	const [usdCurrentMax, setUsdCurrentMax] = useState<string>('');
	const [balanceInUseMin, setBalanceInUseMin] = useState<string>('');
	const [balanceInUseMax, setBalanceInUseMax] = useState<string>('');
	const [sellerFilter, setSellerFilter] = useState<string>('all');
	const [filterDialogOpen, setFilterDialogOpen] = useState(false);

	// Calculate stats
	const balanceStats = useMemo(() => {
		return calculateBalanceStats(rows);
	}, [rows]);

	const {
		data: balances,
		loading,
		refresh,
	} = useOptimizedRealtime<BalanceWithBudgetAndClient>(
		'balances',
		async () => {
			const { data } = await listBalancesForReport();
			return data ?? [];
		},
		'balances_report_cache'
	);

	useEffect(() => {
		const build = async () => {
			if (!balances?.length) {
				setRows([]);
				return;
			}

			const ids = balances.map((b) => b.id);
			const { data: totals } = await getTotalsByBalanceIds(ids);

			const next: BalanceReportRow[] = await Promise.all(
				balances.map(async (b) => {
					const totalPaid = totals?.[String(b.id)]?.totalAmount ?? 0;
					const totalPaidUSD = totals?.[String(b.id)]?.totalAmountUSD ?? 0;
					const budgetUsd = b.balance_amount_usd ?? 0;
					const budgetArs = b.balance_amount_ars ?? 0;
					const remainingUsd = normalizeMoney(budgetUsd - totalPaidUSD);
					const remainingArs = normalizeMoney(budgetArs - totalPaid);

					const clientName =
						`${b.client?.last_name ?? ''} ${b.client?.name ?? ''}`.trim() || DEFAULT_FALLBACK;
					const workLocality = b.budget?.folder_budget?.work?.locality ?? '';
					const workAddress = b.budget?.folder_budget?.work?.address ?? '';
					const work =
						`${workLocality}${workLocality && workAddress ? ' - ' : ''}${workAddress}`.trim() ||
						DEFAULT_FALLBACK;

					const conceptParts = [b.budget?.number ?? '', b.budget?.type ?? ''].filter(Boolean);
					const concept = conceptParts.join(' - ') || DEFAULT_FALLBACK;

					const sellerName = b.client?.seller?.name || 'Sin vendedor';
					const sellerId = b.client?.seller?.id || null;

					const usdContractRef = Number(b.contract_date_usd) || 0;

					const balanceType =
						remainingUsd > 0
							? BALANCE_TYPES.DEBTOR
							: remainingUsd < 0
								? BALANCE_TYPES.CREDITOR
								: BALANCE_TYPES.CANCELLED;
					const balanceAmountArs = remainingArs;
					const balanceInUseUsd = remainingUsd;

					const contractDateRaw = new Date(b.start_date || b.created_at);
					let usdCurrentToCancel: number | null = null;
					if (balanceType === BALANCE_TYPES.CANCELLED) {
						const { data: lastTransactionUsd } = await getLastTransactionUSD(b.id);
						usdCurrentToCancel = lastTransactionUsd ?? 0;
					}

					return {
						id: String(b.id),
						contractDate: formatShortDate(b.start_date || b.created_at),
						contractDateRaw,
						client: clientName,
						work,
						concept,
						purchaseArs: budgetArs,
						deliveriesArs: totalPaid,
						balanceType,
						balanceAmountArs,
						usdContractRef,
						usdCurrentToCancel: usdCurrentToCancel,
						balanceInUseUsd,
						seller: sellerName,
						sellerId,
					};
				})
			);

			setRows(next);
		};

		build();
	}, [balances]);

	const filteredRows = useMemo(() => {
		let filtered = rows;

		// Filter by balance type
		if (balanceTypeFilter !== 'all') {
			filtered = filtered.filter((r) => r.balanceType === balanceTypeFilter);
		}

		// Filter by purchase amount range
		if (purchaseMin !== '') {
			const min = parseArsToNumber(purchaseMin);
			if (!isNaN(min)) {
				filtered = filtered.filter((r) => r.purchaseArs >= min);
			}
		}
		if (purchaseMax !== '') {
			const max = parseArsToNumber(purchaseMax);
			if (!isNaN(max)) {
				filtered = filtered.filter((r) => r.purchaseArs <= max);
			}
		}

		// Filter by deliveries amount range
		if (deliveriesMin !== '') {
			const min = parseArsToNumber(deliveriesMin);
			if (!isNaN(min)) {
				filtered = filtered.filter((r) => r.deliveriesArs >= min);
			}
		}
		if (deliveriesMax !== '') {
			const max = parseArsToNumber(deliveriesMax);
			if (!isNaN(max)) {
				filtered = filtered.filter((r) => r.deliveriesArs <= max);
			}
		}

		// Filter by balance amount range
		if (balanceAmountMin !== '') {
			const min = parseArsToNumber(balanceAmountMin);
			if (!isNaN(min)) {
				filtered = filtered.filter((r) => r.balanceAmountArs >= min);
			}
		}
		if (balanceAmountMax !== '') {
			const max = parseArsToNumber(balanceAmountMax);
			if (!isNaN(max)) {
				filtered = filtered.filter((r) => r.balanceAmountArs <= max);
			}
		}

		// Filter by USD contract amount range
		if (usdContractMin !== '') {
			const min = parseArsToNumber(usdContractMin);
			if (!isNaN(min)) {
				filtered = filtered.filter((r) => r.usdContractRef >= min);
			}
		}
		if (usdContractMax !== '') {
			const max = parseArsToNumber(usdContractMax);
			if (!isNaN(max)) {
				filtered = filtered.filter((r) => r.usdContractRef <= max);
			}
		}

		// Filter by USD current amount range
		if (usdCurrentMin !== '') {
			const min = parseArsToNumber(usdCurrentMin);
			if (!isNaN(min)) {
				filtered = filtered.filter((r) => r.usdCurrentToCancel !== null && r.usdCurrentToCancel >= min);
			}
		}
		if (usdCurrentMax !== '') {
			const max = parseArsToNumber(usdCurrentMax);
			if (!isNaN(max)) {
				filtered = filtered.filter((r) => r.usdCurrentToCancel !== null && r.usdCurrentToCancel <= max);
			}
		}

		// Filter by balance in use USD range
		if (balanceInUseMin !== '') {
			const min = parseArsToNumber(balanceInUseMin);
			if (!isNaN(min)) {
				filtered = filtered.filter((r) => r.balanceInUseUsd >= min);
			}
		}
		if (balanceInUseMax !== '') {
			const max = parseArsToNumber(balanceInUseMax);
			if (!isNaN(max)) {
				filtered = filtered.filter((r) => r.balanceInUseUsd <= max);
			}
		}

		// Filter by seller
		if (sellerFilter !== 'all') {
			if (sellerFilter === 'none') {
				filtered = filtered.filter((r) => r.sellerId === null);
			} else {
				filtered = filtered.filter((r) => r.sellerId === Number(sellerFilter));
			}
		}

		// Filter by text
		const s = searchTerm.trim().toLowerCase();
		if (s) {
			filtered = filtered.filter((r) => {
				return (
					r.client.toLowerCase().includes(s) ||
					r.work.toLowerCase().includes(s) ||
					r.concept.toLowerCase().includes(s) ||
					r.balanceType.toLowerCase().includes(s) ||
					r.seller.toLowerCase().includes(s)
				);
			});
		}

		// Order
		return filtered.sort((a, b) => {
			let aVal = a[sortField];
			let bVal = b[sortField];

			// for date, use camp raw Date
			if (sortField === 'contractDate') {
				aVal = a.contractDateRaw;
				bVal = b.contractDateRaw;
			}

			// Management of strings vs numbers
			if (typeof aVal === 'string' && typeof bVal === 'string') {
				aVal = aVal.toLowerCase();
				bVal = bVal.toLowerCase();
			}

			if (aVal == null) aVal = '';
			if (bVal == null) bVal = '';
			if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});
	}, [
			rows,
			searchTerm,
			sortField,
			sortDirection,
			balanceTypeFilter,
			purchaseMin,
			purchaseMax,
			deliveriesMin,
			deliveriesMax,
			balanceAmountMin,
			balanceAmountMax,
			usdContractMin,
			usdContractMax,
			usdCurrentMin,
			usdCurrentMax,
			balanceInUseMin,
			balanceInUseMax,
			sellerFilter,
		]);

	const handleSort = (field: keyof BalanceReportRow) => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortDirection('asc');
		}
	};

	const getSortIcon = (field: keyof BalanceReportRow) => {
		if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
		return sortDirection === 'asc' ? (
			<ArrowUp className="h-4 w-4" />
		) : (
			<ArrowDown className="h-4 w-4" />
		);
	};

	const handleDownloadPDF = async () => {
		try {
			const { generateBalancesReportPDF } = await import('@/lib/works/balances-pdf');
			await generateBalancesReportPDF(
				filteredRows,
				balanceTypeFilter,
				purchaseMin,
				purchaseMax,
				deliveriesMin,
				deliveriesMax,
				balanceAmountMin,
				balanceAmountMax,
				usdContractMin,
				usdContractMax,
				usdCurrentMin,
				usdCurrentMax,
				balanceInUseMin,
				balanceInUseMax
			);
		} catch (error) {
			const message = translateError(error);
			console.error('Error al generar PDF:', message);
		}
	};

	const handleApplyFilters = (filters: {
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
		sellerFilter: string;
	}) => {
		setBalanceTypeFilter(filters.balanceTypeFilter);
		setPurchaseMin(filters.purchaseMin);
		setPurchaseMax(filters.purchaseMax);
		setDeliveriesMin(filters.deliveriesMin);
		setDeliveriesMax(filters.deliveriesMax);
		setBalanceAmountMin(filters.balanceAmountMin);
		setBalanceAmountMax(filters.balanceAmountMax);
		setUsdContractMin(filters.usdContractMin);
		setUsdContractMax(filters.usdContractMax);
		setUsdCurrentMin(filters.usdCurrentMin);
		setUsdCurrentMax(filters.usdCurrentMax);
		setBalanceInUseMin(filters.balanceInUseMin);
		setBalanceInUseMax(filters.balanceInUseMax);
		setSellerFilter(filters.sellerFilter);
	};

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<StatsCardsBalances stats={balanceStats} />

			{/* Tabs */}
			<Tabs defaultValue="balances" className="space-y-4">
				<TabsList className="bg-card border border-border">
					<TabsTrigger value="balances">Saldos</TabsTrigger>
					<TabsTrigger value="budgets">Presupuestos</TabsTrigger>
				</TabsList>

				<TabsContent value="balances" className="space-y-4">
					{/* Controls */}
					<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<div className="flex flex-col gap-3 md:flex-row md:items-center w-full">
							<Input
								placeholder="Buscar por cliente, obra, concepto..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full sm:w-[300px]"
							/>

							<Button variant="outline" onClick={() => setFilterDialogOpen(true)} className="gap-2">
								<Filter className="h-4 w-4" />
								Filtrar
							</Button>
						</div>
					</div>

					<Card className="p-0 bg-card border-border overflow-hidden">
						<div className="p-4 border-b flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div className="text-sm text-muted-foreground">
								{loading ? 'Cargando...' : `${filteredRows.length} fila(s)`}
							</div>
							<div className="flex gap-2">
								<Button
									variant="outline"
									onClick={handleDownloadPDF}
									className="gap-2"
									disabled={loading || filteredRows.length === 0}
								>
									<Download className="h-4 w-4" />
									<span className="hidden sm:inline">Descargar PDF</span>
									<span className="sm:hidden">PDF</span>
								</Button>
								<Button variant="outline" onClick={() => refresh()} className="gap-2">
									<RefreshCw className="h-4 w-4" />
									<span className="hidden sm:inline">Actualizar</span>
									<span className="sm:hidden">Act.</span>
								</Button>
							</div>
						</div>

						{/* Desktop Table View */}
						<div className="hidden md:block overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead
											className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
											onClick={() => handleSort('contractDate')}
										>
											<div className="flex items-center gap-1">
												{BALANCES_REPORT_COLUMNS.contractDate}
												{getSortIcon('contractDate')}
											</div>
										</TableHead>
										<TableHead
											className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
											onClick={() => handleSort('client')}
										>
											<div className="flex items-center gap-1">
												{BALANCES_REPORT_COLUMNS.client}
												{getSortIcon('client')}
											</div>
										</TableHead>
										<TableHead
											className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
											onClick={() => handleSort('work')}
										>
											<div className="flex items-center gap-1">
												{BALANCES_REPORT_COLUMNS.work}
												{getSortIcon('work')}
											</div>
										</TableHead>
										<TableHead
											className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
											onClick={() => handleSort('concept')}
										>
											<div className="flex items-center gap-1">
												{BALANCES_REPORT_COLUMNS.concept}
												{getSortIcon('concept')}
											</div>
										</TableHead>
										<TableHead
											className="text-right whitespace-nowrap cursor-pointer hover:bg-muted/50"
											onClick={() => handleSort('purchaseArs')}
										>
											<div className="flex items-center justify-end gap-1">
												{BALANCES_REPORT_COLUMNS.purchase}
												{getSortIcon('purchaseArs')}
											</div>
										</TableHead>
										<TableHead
											className="text-right whitespace-nowrap cursor-pointer hover:bg-muted/50"
											onClick={() => handleSort('deliveriesArs')}
										>
											<div className="flex items-center justify-end gap-1">
												{BALANCES_REPORT_COLUMNS.deliveries}
												{getSortIcon('deliveriesArs')}
											</div>
										</TableHead>
										<TableHead
											className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
											onClick={() => handleSort('balanceType')}
										>
											<div className="flex items-center gap-1">
												{BALANCES_REPORT_COLUMNS.balanceType}
												{getSortIcon('balanceType')}
											</div>
										</TableHead>
										<TableHead
											className="text-right whitespace-nowrap cursor-pointer hover:bg-muted/50"
											onClick={() => handleSort('balanceAmountArs')}
										>
											<div className="flex items-center justify-end gap-1">
												{BALANCES_REPORT_COLUMNS.balanceAmount}
												{getSortIcon('balanceAmountArs')}
											</div>
										</TableHead>
										<TableHead
											className="text-right whitespace-nowrap cursor-pointer hover:bg-muted/50"
											onClick={() => handleSort('usdContractRef')}
										>
											<div className="flex items-center justify-end gap-1">
												{BALANCES_REPORT_COLUMNS.usdContractRef}
												{getSortIcon('usdContractRef')}
											</div>
										</TableHead>
										<TableHead
											className="text-right whitespace-nowrap cursor-pointer hover:bg-muted/50"
											onClick={() => handleSort('usdCurrentToCancel')}
										>
											<div className="flex items-center justify-end gap-1">
												{BALANCES_REPORT_COLUMNS.usdCurrentToCancel}
												{getSortIcon('usdCurrentToCancel')}
											</div>
										</TableHead>
										<TableHead
											className="text-right whitespace-nowrap cursor-pointer hover:bg-muted/50"
											onClick={() => handleSort('balanceInUseUsd')}
										>
											<div className="flex items-center justify-end gap-1">
												{BALANCES_REPORT_COLUMNS.balanceInUseUsd}
												{getSortIcon('balanceInUseUsd')}
											</div>
										</TableHead>
										<TableHead
											className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
											onClick={() => handleSort('seller')}
										>
											<div className="flex items-center gap-1">
												Vendedor
												{getSortIcon('seller')}
											</div>
										</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody>
									{loading ? (
										<TableRow>
											<TableCell colSpan={12} className="text-center text-muted-foreground">
												Cargando saldos...
											</TableCell>
										</TableRow>
									) : filteredRows.length === 0 ? (
										<TableRow>
											<TableCell colSpan={12} className="text-center text-muted-foreground">
												No hay resultados
											</TableCell>
										</TableRow>
									) : (
										filteredRows.map((r) => (
											<TableRow key={r.id}>
												<TableCell className="whitespace-nowrap">{r.contractDate}</TableCell>
												<TableCell className="font-medium whitespace-nowrap">{r.client}</TableCell>
												<TableCell className="whitespace-nowrap">{r.work}</TableCell>
												<TableCell className="whitespace-nowrap">{r.concept}</TableCell>
												<TableCell className="text-right whitespace-nowrap">
													{formatCurrency(r.purchaseArs)}
												</TableCell>
												<TableCell className="text-right whitespace-nowrap">
													{formatCurrency(r.deliveriesArs)}
												</TableCell>
												<TableCell className="whitespace-nowrap">{r.balanceType}</TableCell>
												<TableCell className="text-right whitespace-nowrap">
													{formatCurrency(r.balanceAmountArs)}
												</TableCell>
												<TableCell className="text-right whitespace-nowrap">
													{formatCurrencyUSD(r.usdContractRef)}
												</TableCell>
												<TableCell className="text-right whitespace-nowrap">
													{formatCurrencyUSD(r.usdCurrentToCancel)}
												</TableCell>
												<TableCell className="text-right whitespace-nowrap">
													{formatCurrencyUSD(r.balanceInUseUsd)}
												</TableCell>
												<TableCell className="whitespace-nowrap">{r.seller}</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>

						{/* Mobile Card View */}
						<div className="md:hidden p-4 space-y-4">
							{loading ? (
								<div className="text-center py-8 text-muted-foreground">
									Cargando saldos...
								</div>
							) : filteredRows.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									No hay resultados
								</div>
							) : (
								filteredRows.map((r) => (
									<div key={r.id} className="p-4 rounded-lg border bg-card space-y-3">
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1 min-w-0">
												<div className="font-medium text-sm">{r.client}</div>
												<div className="text-xs text-muted-foreground mt-1">{r.contractDate}</div>
											</div>
											<div className={`text-xs px-2 py-1 rounded-full ${
												r.balanceType === 'Deudor' ? 'bg-orange-100 text-orange-800' :
												r.balanceType === 'Acreedor' ? 'bg-blue-100 text-blue-800' :
												'bg-green-100 text-green-800'
											}`}>
												{r.balanceType}
											</div>
										</div>

										<div className="space-y-2 text-xs">
											<div className="flex justify-between">
												<span className="text-muted-foreground">Obra:</span>
												<span className="truncate ml-2">{r.work}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">Concepto:</span>
												<span className="truncate ml-2">{r.concept}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">Compra:</span>
												<span className="ml-2">{formatCurrency(r.purchaseArs)}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">Entregas:</span>
												<span className="ml-2">{formatCurrency(r.deliveriesArs)}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">Saldo ARS:</span>
												<span className="ml-2">{formatCurrency(r.balanceAmountArs)}</span>
											</div>
											<div className="flex justify-between">
												<span className="text-muted-foreground">USD Contrato:</span>
												<span className="ml-2">{formatCurrencyUSD(r.usdContractRef)}</span>
											</div>
											{r.usdCurrentToCancel !== null && (
												<div className="flex justify-between">
													<span className="text-muted-foreground">USD Actual:</span>
													<span className="ml-2">{formatCurrencyUSD(r.usdCurrentToCancel)}</span>
												</div>
											)}
											<div className="flex justify-between">
												<span className="text-muted-foreground">Saldo USD:</span>
												<span className="ml-2">{formatCurrencyUSD(r.balanceInUseUsd)}</span>
											</div>
										</div>
									</div>
								))
							)}
						</div>
					</Card>
				</TabsContent>

				<TabsContent value="budgets" className="space-y-4">
					<BudgetsReport />
				</TabsContent>
			</Tabs>

			<BalancesFilterDialog
				open={filterDialogOpen}
				onOpenChange={setFilterDialogOpen}
				filters={{
					balanceTypeFilter,
					purchaseMin,
					purchaseMax,
					deliveriesMin,
					deliveriesMax,
					balanceAmountMin,
					balanceAmountMax,
					usdContractMin,
					usdContractMax,
					usdCurrentMin,
					usdCurrentMax,
					balanceInUseMin,
					balanceInUseMax,
					sellerFilter,
				}}
				onApplyFilters={handleApplyFilters}
			/>
		</div>
	);
}
