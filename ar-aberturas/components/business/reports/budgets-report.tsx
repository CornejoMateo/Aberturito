'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';
import { formatCurrency, formatCurrencyUSD } from '@/helpers/format-prices.tsx/formats';
import { formatShortDate } from '@/helpers/date/formats';
import { formatBudgetType, formatBudgetStatus } from '@/helpers/budget/formats';
import { BUDGETS_REPORT_COLUMNS, BUDGETS_REPORT_TITLE, BUDGET_TYPES, BUDGET_STATUS } from '@/constants/reports/budgets-report';
import { BudgetWithWorkAndClient, listBudgetsForReport } from '@/lib/budgets/budgets';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';

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
};

export function BudgetsReport() {
	const [searchTerm, setSearchTerm] = useState('');
	const [rows, setRows] = useState<BudgetReportRow[]>([]);
	const [sortField, setSortField] = useState<keyof BudgetReportRow>('date');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
	const [typeFilter, setTypeFilter] = useState<string>('all');
	const [statusFilter, setStatusFilter] = useState<string>('all');

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
		const build = async () => {
			if (!budgets?.length) {
				setRows([]);
				return;
			}

			const next: BudgetReportRow[] = budgets.map((b) => {
				const clientName = `${b.client?.last_name ?? ''} ${b.client?.name ?? ''}`.trim() || '-';
				const workLocality = b.folder_budget?.work?.locality ?? '';
				const workAddress = b.folder_budget?.work?.address ?? '';
				const work = `${workLocality}${workLocality && workAddress ? ' - ' : ''}${workAddress}`.trim() || '-';

				const dateRaw = new Date(b.created_at);

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
					status: formatBudgetStatus(b.accepted, b.sold),
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
			filtered = filtered.filter((r) => r.status === statusFilter);
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
					r.status.toLowerCase().includes(s)
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
	}, [rows, searchTerm, sortField, sortDirection, typeFilter, statusFilter]);

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
		return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-foreground text-balance">{BUDGETS_REPORT_TITLE}</h2>
					<p className="text-muted-foreground mt-1">Listado de todos los presupuestos realizados</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
					<Select value={typeFilter} onValueChange={setTypeFilter}>
						<SelectTrigger className="w-full sm:w-[140px]">
							<SelectValue placeholder="Tipo" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todos los tipos</SelectItem>
							<SelectItem value={BUDGET_TYPES.STANDARD}>{BUDGET_TYPES.STANDARD}</SelectItem>
							<SelectItem value={BUDGET_TYPES.OPTIMAL}>{BUDGET_TYPES.OPTIMAL}</SelectItem>
							<SelectItem value={BUDGET_TYPES.MINIMAL}>{BUDGET_TYPES.MINIMAL}</SelectItem>
						</SelectContent>
					</Select>

					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-full sm:w-[140px]">
							<SelectValue placeholder="Estado" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todos los estados</SelectItem>
							<SelectItem value={BUDGET_STATUS.PENDING}>{BUDGET_STATUS.PENDING}</SelectItem>
							<SelectItem value={BUDGET_STATUS.ACCEPTED}>{BUDGET_STATUS.ACCEPTED}</SelectItem>
							<SelectItem value={BUDGET_STATUS.SOLD}>{BUDGET_STATUS.SOLD}</SelectItem>
						</SelectContent>
					</Select>

					<Input
						placeholder="Buscar por cliente, obra, número..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full sm:w-[300px]"
					/>
				</div>
			</div>

			<Card className="p-0 bg-card border-border overflow-x-auto">
				<div className="p-4 border-b flex items-center justify-between min-w-[1000px]">
					<div className="text-sm text-muted-foreground">
						{loading ? 'Cargando...' : `${filteredRows.length} presupuesto(s)`}
					</div>
					<Button variant="outline" onClick={() => refresh()} className="gap-2">
						<RefreshCw className="h-4 w-4" />
						Actualizar
					</Button>
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
							filteredRows.map((r) => (
								<TableRow key={r.id}>
									<TableCell className="whitespace-nowrap">{r.date}</TableCell>
									<TableCell className="font-medium whitespace-nowrap">{r.client}</TableCell>
									<TableCell className="whitespace-nowrap">{r.number}</TableCell>
									<TableCell className="whitespace-nowrap">{r.type}</TableCell>
									<TableCell className="whitespace-nowrap">{r.work}</TableCell>
									<TableCell className="text-right whitespace-nowrap">{formatCurrency(r.amountArs)}</TableCell>
									<TableCell className="text-right whitespace-nowrap">{formatCurrencyUSD(r.amountUsd)}</TableCell>
									<TableCell className="whitespace-nowrap">{r.status}</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</Card>
		</div>
	);
}
