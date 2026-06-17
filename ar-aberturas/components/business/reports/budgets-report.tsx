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
import { formatBudgetType, formatBudgetStatus } from '@/helpers/budget/formats';
import {
	BUDGETS_REPORT_COLUMNS,
	BUDGETS_REPORT_TITLE,
	BUDGET_TYPES,
	BUDGET_STATUS,
} from '@/constants/reports/budgets-report';
import { BudgetWithWorkAndClient, listBudgetsForReport } from '@/lib/budgets/budgets';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, Download, Filter } from 'lucide-react';
import { listSellers } from '@/lib/sellers/sellers';
import { BudgetsFilterDialog } from '@/utils/reports/budgets-filter-dialog';
import { translateError } from '@/lib/error-translator';

const ITEMS_PER_PAGE = 30;

type BudgetReportRow = {
	id: string;
	date: string;
	dateRaw: Date;
	client: string;
	number: string;
	type: string;
	work: string;
	amountArs: number;
	amountUsd: number;
	status: string;
	accepted: boolean;
	seller: string;
	sellerId: string;
};

export function BudgetsReport() {
	const [searchTerm, setSearchTerm] = useState('');
	const [rows, setRows] = useState<BudgetReportRow[]>([]);
	const [sortField, setSortField] = useState<keyof BudgetReportRow>('date');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
	const [typeFilter, setTypeFilter] = useState<string>('all');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [sellerFilter, setSellerFilter] = useState<string>('all');
	const [sellers, setSellers] = useState<Array<{ id: string; name: string }>>([]);
	const [amountMin, setAmountMin] = useState<string>('');
	const [amountMax, setAmountMax] = useState<string>('');
	const [amountMinUsd, setAmountMinUsd] = useState<string>('');
	const [amountMaxUsd, setAmountMaxUsd] = useState<string>('');
	const [filterDialogOpen, setFilterDialogOpen] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);

	const {
		data: budgets,
		loading,
		refresh,
	} = useOptimizedRealtime<BudgetWithWorkAndClient>(
		'budgets',
		async () => {
			const { data } = await listBudgetsForReport();
			return data ?? [];
		},
		'budgets_report_cache'
	);

	useEffect(() => {
		const loadSellers = async () => {
			const { data } = await listSellers();
			if (data) setSellers(data);
		};
		loadSellers();
	}, []);

	useEffect(() => {
		const build = async () => {
			if (!budgets?.length) {
				setRows([]);
				return;
			}

			const next: BudgetReportRow[] = budgets.map((b) => {
				const clientName = `${b.client?.last_name ?? ''} ${b.client?.name ?? ''}`.trim() || '-';
				const workZone = b.folder_budget?.work?.zone ?? '';
				const workHood = b.folder_budget?.work?.hood ?? '';
				const workLocality = b.folder_budget?.work?.locality ?? '';
				const workAddress = b.folder_budget?.work?.address ?? '';
				const workParts = [workZone, workHood, workLocality, workAddress].filter(Boolean);
				const work = workParts.join(' - ') || '-';
				const dateRaw = new Date(b.created_at);
				const sellerName = b.client?.seller?.name || '-';
				const sellerId = b.client?.seller?.id || '';

				return {
					id: String(b.id),
					date: formatShortDate(b.created_at),
					dateRaw,
					client: clientName,
					number: b.number || '-',
					type: formatBudgetType(b.type),
					work,
					amountArs: b.amount_ars || 0,
					amountUsd: b.amount_usd || 0,
					status: formatBudgetStatus(b.sold, b.lost),
					accepted: !!b.accepted,
					seller: sellerName,
					sellerId: sellerId,
				};
			});

			setRows(next);
		};

		build();
	}, [budgets]);

	const filteredRows = useMemo(() => {
		let filtered = rows;

		// Filter by type
		if (typeFilter !== 'all') {
			filtered = filtered.filter((r) => r.type === typeFilter);
		}

		// Filter by status
		if (statusFilter !== 'all') {
			filtered = filtered.filter((r) => {
				if (statusFilter === BUDGET_STATUS.ACCEPTED) return r.accepted;
				return r.status === statusFilter;
			});
		}

		// Filter by seller
		if (sellerFilter !== 'all') {
			if (sellerFilter === 'none') {
				filtered = filtered.filter((r) => !r.sellerId);
			} else {
				filtered = filtered.filter((r) => r.sellerId === sellerFilter);
			}
		}

		// Filter by amount range
		if (amountMin !== '') {
			const min = parseFloat(amountMin);
			if (!isNaN(min)) {
				filtered = filtered.filter((r) => r.amountArs >= min);
			}
		}
		if (amountMax !== '') {
			const max = parseFloat(amountMax);
			if (!isNaN(max)) {
				filtered = filtered.filter((r) => r.amountArs <= max);
			}
		}

		// Filter by USD amount range
		if (amountMinUsd !== '') {
			const min = parseFloat(amountMinUsd);
			if (!isNaN(min)) {
				filtered = filtered.filter((r) => r.amountUsd >= min);
			}
		}
		if (amountMaxUsd !== '') {
			const max = parseFloat(amountMaxUsd);
			if (!isNaN(max)) {
				filtered = filtered.filter((r) => r.amountUsd <= max);
			}
		}

		// Filter by text
		const s = searchTerm.trim().toLowerCase();
		if (s) {
			filtered = filtered.filter((r) => {
				return (
					r.client.toLowerCase().includes(s) ||
					r.work.toLowerCase().includes(s) ||
					r.number.toLowerCase().includes(s) ||
					r.type.toLowerCase().includes(s) ||
					r.status.toLowerCase().includes(s) ||
					r.seller.toLowerCase().includes(s)
				);
			});
		}

		// Order
		return filtered.sort((a, b) => {
			let aVal = a[sortField];
			let bVal = b[sortField];

			// for date, use raw Date
			if (sortField === 'date') {
				aVal = a.dateRaw;
				bVal = b.dateRaw;
			}

			// Management of strings vs numbers
			if (typeof aVal === 'string' && typeof bVal === 'string') {
				aVal = aVal.toLowerCase();
				bVal = bVal.toLowerCase();
			}

			if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});
	}, [rows, searchTerm, sortField, sortDirection, typeFilter, statusFilter, sellerFilter, amountMin, amountMax, amountMinUsd, amountMaxUsd]);

	const totalPages = Math.max(1, Math.ceil(filteredRows.length / ITEMS_PER_PAGE));

	const paginatedRows = useMemo(() => {
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		return filteredRows.slice(startIndex, startIndex + ITEMS_PER_PAGE);
	}, [filteredRows, currentPage]);

	useEffect(() => {
		setCurrentPage((page) => Math.min(page, totalPages));
	}, [totalPages]);

	const handleSort = (field: keyof BudgetReportRow) => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortDirection('asc');
		}
	};

	const getSortIcon = (field: keyof BudgetReportRow) => {
		if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
		return sortDirection === 'asc' ? (
			<ArrowUp className="h-4 w-4" />
		) : (
			<ArrowDown className="h-4 w-4" />
		);
	};

	const getRowClassName = (row: BudgetReportRow) => {
		if (row.status == 'Vendido') {
			return 'bg-green-500/10 hover:bg-green-500/15';
		}

		if (row.status == 'Perdido') {
			return 'bg-red-500/10 hover:bg-red-500/15';
		}

		return '';
	};

	const handleDownloadPDF = async () => {
		try {
			const { generateBudgetsReportPDF } = await import('@/lib/budgets/budgets-pdf');
			await generateBudgetsReportPDF(filteredRows, sellerFilter, amountMin, amountMax, amountMinUsd, amountMaxUsd);
		} catch (error) {
			const message = translateError(error);
			console.error('Error al generar PDF:', message);
		}
	};

	const handleApplyFilters = (filters: {
		typeFilter: string;
		statusFilter: string;
		sellerFilter: string;
		amountMin: string;
		amountMax: string;
		amountMinUsd: string;
		amountMaxUsd: string;
	}) => {
		setTypeFilter(filters.typeFilter);
		setStatusFilter(filters.statusFilter);
		setSellerFilter(filters.sellerFilter);
		setAmountMin(filters.amountMin);
		setAmountMax(filters.amountMax);
		setAmountMinUsd(filters.amountMinUsd);
		setAmountMaxUsd(filters.amountMaxUsd);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground text-balance">
						{BUDGETS_REPORT_TITLE}
					</h2>
					<p className="text-muted-foreground mt-1">Listado de todos los presupuestos realizados</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
					<Input
						placeholder="Buscar por cliente, obra, número..."
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

			<Card className="p-0 bg-card border-border overflow-x-auto">
				<div className="p-4 border-b flex items-center justify-between min-w-[1000px]">
					<div className="text-sm text-muted-foreground">
						{loading ? 'Cargando...' : `${filteredRows.length} presupuesto(s)`}
					</div>
					<div className="flex gap-2">
						<Button variant="outline" onClick={handleDownloadPDF} className="gap-2" disabled={loading || filteredRows.length === 0}>
							<Download className="h-4 w-4" />
							Descargar PDF
						</Button>
						<Button variant="outline" onClick={() => refresh()} className="gap-2">
							<RefreshCw className="h-4 w-4" />
							Actualizar
						</Button>
					</div>
				</div>

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead
								className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
								onClick={() => handleSort('date')}
							>
								<div className="flex items-center gap-1">
									{BUDGETS_REPORT_COLUMNS.date}
									{getSortIcon('date')}
								</div>
							</TableHead>
							<TableHead
								className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
								onClick={() => handleSort('client')}
							>
								<div className="flex items-center gap-1">
									{BUDGETS_REPORT_COLUMNS.client}
									{getSortIcon('client')}
								</div>
							</TableHead>
							<TableHead
								className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
								onClick={() => handleSort('number')}
							>
								<div className="flex items-center gap-1">
									{BUDGETS_REPORT_COLUMNS.number}
									{getSortIcon('number')}
								</div>
							</TableHead>
							<TableHead
								className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
								onClick={() => handleSort('type')}
							>
								<div className="flex items-center gap-1">
									{BUDGETS_REPORT_COLUMNS.type}
									{getSortIcon('type')}
								</div>
							</TableHead>
							<TableHead
								className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
								onClick={() => handleSort('work')}
							>
								<div className="flex items-center gap-1">
									{BUDGETS_REPORT_COLUMNS.work}
									{getSortIcon('work')}
								</div>
							</TableHead>
							<TableHead
								className="text-right whitespace-nowrap cursor-pointer hover:bg-muted/50"
								onClick={() => handleSort('amountArs')}
							>
								<div className="flex items-center justify-end gap-1">
									{BUDGETS_REPORT_COLUMNS.amountArs}
									{getSortIcon('amountArs')}
								</div>
							</TableHead>
							<TableHead
								className="text-right whitespace-nowrap cursor-pointer hover:bg-muted/50"
								onClick={() => handleSort('amountUsd')}
							>
								<div className="flex items-center justify-end gap-1">
									{BUDGETS_REPORT_COLUMNS.amountUsd}
									{getSortIcon('amountUsd')}
								</div>
							</TableHead>
							<TableHead
								className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
								onClick={() => handleSort('status')}
							>
								<div className="flex items-center gap-1">
									{BUDGETS_REPORT_COLUMNS.status}
									{getSortIcon('status')}
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
								<TableCell colSpan={9} className="text-center text-muted-foreground">
									Cargando presupuestos...
								</TableCell>
							</TableRow>
						) : filteredRows.length === 0 ? (
							<TableRow>
								<TableCell colSpan={9} className="text-center text-muted-foreground">
									No hay resultados
								</TableCell>
							</TableRow>
						) : (
							paginatedRows.map((r) => (
								<TableRow key={r.id} className={getRowClassName(r)}>
									<TableCell className="whitespace-nowrap">{r.date}</TableCell>
									<TableCell className="font-medium whitespace-nowrap">{r.client}</TableCell>
									<TableCell className="whitespace-nowrap">{r.number}</TableCell>
									<TableCell className="whitespace-nowrap">{r.type}</TableCell>
									<TableCell className="whitespace-nowrap">{r.work}</TableCell>
									<TableCell className="text-right whitespace-nowrap">
										{formatCurrency(r.amountArs)}
									</TableCell>
									<TableCell className="text-right whitespace-nowrap">
										{formatCurrencyUSD(r.amountUsd)}
									</TableCell>
									<TableCell className="whitespace-nowrap">{r.status}</TableCell>
									<TableCell className="whitespace-nowrap">{r.seller}</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>

				{filteredRows.length > 0 ? (
					<div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="text-sm text-muted-foreground">
							Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{' '}
							{Math.min(currentPage * ITEMS_PER_PAGE, filteredRows.length)} de {filteredRows.length}
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
								disabled={currentPage === 1}
							>
								Anterior
							</Button>
							<div className="text-sm text-muted-foreground">
								Página {currentPage} de {totalPages}
							</div>
							<Button
								variant="outline"
								onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
								disabled={currentPage === totalPages}
							>
								Siguiente
							</Button>
						</div>
					</div>
				) : null}
			</Card>

			<BudgetsFilterDialog
				open={filterDialogOpen}
				onOpenChange={setFilterDialogOpen}
				filters={{
					typeFilter,
					statusFilter,
					sellerFilter,
					amountMin,
					amountMax,
					amountMinUsd,
					amountMaxUsd,
				}}
				sellers={sellers}
				onApplyFilters={handleApplyFilters}
			/>
		</div>
	);
}
