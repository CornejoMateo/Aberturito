'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';
import { formatCurrency, formatCurrencyUSD } from '@/helpers/format-prices.tsx/formats';
import { formatShortDate } from '@/helpers/date/formats';
import { BALANCES_REPORT_COLUMNS, BALANCES_REPORT_TITLE, BALANCE_TYPES, DEFAULT_FALLBACK } from '@/constants/reports/balances-report';
import { BalanceWithBudgetAndClient, listBalancesForReport } from '@/lib/works/balances';
import { getLastTransactionUSD } from '@/lib/works/balance_transactions';
import { getTotalsByBalanceIds } from '@/lib/works/balance_transactions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { normalizeMoney} from '@/helpers/format-prices.tsx/formats';

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
};

export function BalancesReport() {
	const [searchTerm, setSearchTerm] = useState('');
	const [rows, setRows] = useState<BalanceReportRow[]>([]);
	const [sortField, setSortField] = useState<keyof BalanceReportRow>('contractDate');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
	const [balanceTypeFilter, setBalanceTypeFilter] = useState<string>('all');

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

			const ids = balances.map((b) => String(b.id));
			const { data: totals } = await getTotalsByBalanceIds(ids);

			const next: BalanceReportRow[] = await Promise.all(balances.map(async (b) => {
				const totalPaid = totals?.[String(b.id)]?.totalAmount ?? 0;
				const totalPaidUSD = totals?.[String(b.id)]?.totalAmountUSD ?? 0;
				const budgetArs = b.budget?.amount_ars ?? 0;
				const budgetUsd = b.budget?.amount_usd ?? 0;
				const remainingArs = normalizeMoney(budgetArs - totalPaid);
				const remainingUsd = normalizeMoney(budgetUsd - totalPaidUSD);

				const clientName = `${b.client?.last_name ?? ''} ${b.client?.name ?? ''}`.trim() || DEFAULT_FALLBACK;
				const workLocality = b.budget?.folder_budget?.work?.locality ?? '';
				const workAddress = b.budget?.folder_budget?.work?.address ?? '';
				const work = `${workLocality}${workLocality && workAddress ? ' - ' : ''}${workAddress}`.trim() || DEFAULT_FALLBACK;

				const conceptParts = [b.budget?.number ?? '', b.budget?.type ?? ''].filter(Boolean);
				const concept = conceptParts.join(' - ') || DEFAULT_FALLBACK;

				const usdContractRef = Number(b.contract_date_usd) || 0;

				const balanceType = remainingArs > 0 ? BALANCE_TYPES.DEBTOR : remainingArs < 0 ? BALANCE_TYPES.CREDITOR : BALANCE_TYPES.CANCELLED;
				const balanceAmountArs = remainingArs;
				const balanceInUseUsd = remainingUsd;

				const contractDateRaw = new Date(b.start_date || b.created_at);
				let usdCurrentToCancel: number | null = null;
				if (balanceType === BALANCE_TYPES.CANCELLED) {
					const { data: lastTransactionUsd } = await getLastTransactionUSD(String(b.id));
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
				};
			}));

			setRows(next);
		};

		build();
	}, [balances]);

	const filteredRows = useMemo(() => {
		let filtered = rows;

		// Filter to type 
		if (balanceTypeFilter !== 'all') {
			filtered = filtered.filter((r) => r.balanceType === balanceTypeFilter);
		}

		// Filter to text
		const s = searchTerm.trim().toLowerCase();
		if (s) {
			filtered = filtered.filter((r) => {
				return (
					r.client.toLowerCase().includes(s) ||
					r.work.toLowerCase().includes(s) ||
					r.concept.toLowerCase().includes(s) ||
					r.balanceType.toLowerCase().includes(s)
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
	}, [rows, searchTerm, sortField, sortDirection, balanceTypeFilter]);

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
		return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground text-balance">{BALANCES_REPORT_TITLE}</h2>
					<p className="text-muted-foreground mt-1">Reporte de saldos por cliente</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
					<Select value={balanceTypeFilter} onValueChange={setBalanceTypeFilter}>
						<SelectTrigger className="w-full sm:w-[180px]">
							<SelectValue placeholder="Tipo de saldo" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todos los tipos</SelectItem>
							<SelectItem value={BALANCE_TYPES.DEBTOR}>Deudor</SelectItem>
							<SelectItem value={BALANCE_TYPES.CREDITOR}>Acreedor</SelectItem>
							<SelectItem value={BALANCE_TYPES.CANCELLED}>Cancelado</SelectItem>
						</SelectContent>
					</Select>

					<Input
						placeholder="Buscar por cliente, obra, concepto..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full sm:w-[300px]"
					/>
				</div>
			</div>

			<Card className="p-0 bg-card border-border overflow-x-auto">
				<div className="p-4 border-b flex items-center justify-between min-w-[800px]">
					<div className="text-sm text-muted-foreground">
						{loading ? 'Cargando...' : `${filteredRows.length} fila(s)`}
					</div>
					<button
						onClick={() => refresh()}
						className="text-sm text-primary hover:underline"
						type="button"
					>
						Actualizar
					</button>
				</div>

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
						</TableRow>
					</TableHeader>

					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={11} className="text-center text-muted-foreground">
									Cargando saldos...
								</TableCell>
							</TableRow>
						) : filteredRows.length === 0 ? (
							<TableRow>
								<TableCell colSpan={11} className="text-center text-muted-foreground">
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
									<TableCell className="text-right whitespace-nowrap">{formatCurrency(r.purchaseArs)}</TableCell>
									<TableCell className="text-right whitespace-nowrap">{formatCurrency(r.deliveriesArs)}</TableCell>
									<TableCell className="whitespace-nowrap">{r.balanceType}</TableCell>
									<TableCell className="text-right whitespace-nowrap">{formatCurrency(r.balanceAmountArs)}</TableCell>
									<TableCell className="text-right whitespace-nowrap">{formatCurrencyUSD(r.usdContractRef)}</TableCell>
									<TableCell className="text-right whitespace-nowrap">{formatCurrencyUSD(r.usdCurrentToCancel)}</TableCell>
									<TableCell className="text-right whitespace-nowrap">{formatCurrencyUSD(r.balanceInUseUsd)}</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</Card>
		</div>
	);
}
