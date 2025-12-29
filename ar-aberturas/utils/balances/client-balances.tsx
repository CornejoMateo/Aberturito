'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';
import { Plus, DollarSign, Search, Trash2 } from 'lucide-react';
import { Balance, getBalancesByClientId, deleteBalance } from '@/lib/works/balances';
import { getTotalByBalanceId } from '@/lib/works/balance_transactions';
import { Work } from '@/lib/works/works';
import { BalanceDetailsModal } from './balance-details-modal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ClientBalancesProps {
	clientId: string;
	works: Work[];
}

interface BalanceWithTotals extends Balance {
	totalPaid?: number;
	remaining?: number;
}

export function ClientBalances({ clientId, works }: ClientBalancesProps) {
	const [balances, setBalances] = useState<BalanceWithTotals[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedBalance, setSelectedBalance] = useState<BalanceWithTotals | null>(null);
	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
	const [balanceToDelete, setBalanceToDelete] = useState<BalanceWithTotals | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
	const itemsPerPage = 2;

	const loadBalances = async () => {
		try {
			setIsLoading(true);
			const { data, error } = await getBalancesByClientId(parseInt(clientId));

			if (error) {
				console.error('Error al cargar saldos:', error);
				return;
			}

			if (data) {
				const balancesWithTotals = await Promise.all(
					data.map(async (balance) => {
						const { data: totals } = await getTotalByBalanceId(balance.id);
						const totalPaid = totals?.totalAmount || 0;
						const remaining = (balance.budget || 0) - totalPaid;

						return {
							...balance,
							totalPaid,
							remaining,
						};
					})
				);
				setBalances(balancesWithTotals);
			} else {
				setBalances([]);
			}
		} catch (error) {
			console.error('Error inesperado al cargar saldos:', error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (clientId) {
			loadBalances();
		}
	}, [clientId]);

	useEffect(() => {
		if (lastUpdate && clientId) {
			loadBalances();
		}
	}, [lastUpdate]);

	const handleBalanceUpdate = () => {
		setLastUpdate(Date.now());
	};

	const handleDeleteBalance = async () => {
		if (!balanceToDelete) return;

		try {
			const { error } = await deleteBalance(parseInt(balanceToDelete.id));

			if (error) {
				console.error('Error al eliminar saldo:', error);
				return;
			}

			// Refresh the list
			handleBalanceUpdate();
		} catch (error) {
			console.error('Error inesperado al eliminar saldo:', error);
		} finally {
			setIsDeleteDialogOpen(false);
			setBalanceToDelete(null);
		}
	};

	const formatCurrency = (amount: number | null | undefined) => {
		if (!amount) return '$0.00';
		return new Intl.NumberFormat('es-AR', {
			style: 'currency',
			currency: 'ARS',
			minimumFractionDigits: 2,
		}).format(amount);
	};

	const getProgressPercentage = (balance: BalanceWithTotals) => {
		if (!balance.budget || balance.budget === 0) return 0;
		const percentage = ((balance.totalPaid || 0) / balance.budget) * 100;
		return Math.min(Math.round(percentage), 100);
	};

	// Filter balances based on search term
	const filteredBalances = useMemo(() => {
		return balances.filter((balance) => {
			const searchLower = searchTerm.toLowerCase();
			const work = works.find((w) => Number(w.id) === Number(balance.work_id));
			return (
				work?.locality?.toLowerCase().includes(searchLower) ||
				work?.address?.toLowerCase().includes(searchLower) ||
				(balance.budget?.toString() || '').includes(searchLower)
			);
		});
	}, [balances, searchTerm, works]);

	// Calculate pagination
	const totalPages = Math.ceil(filteredBalances.length / itemsPerPage);

	// Get current items
	const currentItems = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filteredBalances.slice(startIndex, startIndex + itemsPerPage);
	}, [filteredBalances, currentPage, itemsPerPage]);

	// Reset to first page when balances change
	useEffect(() => {
		setCurrentPage(1);
	}, [filteredBalances.length]);

	return (
		<div className="space-y-4 max-w-3xl mx-auto w-full">
			{/* Search Bar */}
			<div className="flex flex-col sm:flex-row gap-4 mb-6">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Buscar por localidad, dirección o presupuesto..."
						className="pl-9 w-full"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</div>

			{isLoading ? (
				<p className="text-sm text-muted-foreground text-center py-4">Cargando saldos...</p>
			) : filteredBalances.length === 0 ? (
				<p className="text-sm text-muted-foreground text-center py-4">
					{searchTerm
						? 'No se encontraron saldos que coincidan con la búsqueda.'
						: 'No hay saldos registrados para este cliente.'}
				</p>
			) : (
				<div className="space-y-3">
					{currentItems.map((balance) => (
						<Card
							key={balance.id}
							className="hover:shadow-md transition-shadow cursor-pointer relative"
							onClick={() => {
								setSelectedBalance(balance);
								setIsDetailsModalOpen(true);
							}}
						>
							<Button
								variant="ghost"
								size="icon"
								className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 z-10"
								onClick={(e) => {
									e.stopPropagation();
									setBalanceToDelete(balance);
									setIsDeleteDialogOpen(true);
								}}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
							<CardContent className="">
								<div className="flex items-center justify-between gap-4">
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-8">
											<DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
											<span className="font-semibold text-sm">
												{(balance.budget || 0) - (balance.totalPaid || 0) > 0
													? 'Deudor'
													: 'Acreedor'}
											</span>
										</div>
										<div className="text-sm">
											{(() => {
												if (!balance.work_id)
													return <span className="text-muted-foreground">Sin obra asignada</span>;
												const work = works.find((w) => Number(w.id) === Number(balance.work_id));
												if (!work)
													return <span className="text-muted-foreground">Obra no encontrada</span>;
												return (
													<div>
														<p className="font-medium">{work.locality}</p>
														<p className="text-muted-foreground text-xs">{work.address}</p>
													</div>
												);
											})()}
										</div>
									</div>

									<div className="flex flex-col gap-3 min-w-[320px]">
										<div className="flex gap-6 justify-between">
											<div className="text-center flex-1">
												<p className="text-xs text-muted-foreground mb-1">Presupuesto</p>
												<p className="text-sm font-bold text-primary">
													{formatCurrency(balance.budget)}
												</p>
											</div>
											<div className="text-center flex-1">
												<p className="text-xs text-muted-foreground mb-1">Entregado</p>
												<p className="text-sm font-bold text-green-600">
													{formatCurrency(balance.totalPaid)}
												</p>
											</div>
											<div className="text-center flex-1">
												<p className="text-xs text-muted-foreground mb-1">Falta</p>
												<p className="text-sm font-bold text-orange-600">
													{formatCurrency(balance.remaining)}
												</p>
											</div>
										</div>

										{balance.budget && balance.budget > 0 && (
											<div className="w-full">
												<div className="flex justify-between text-xs text-muted-foreground mb-1">
													<span>Progreso</span>
													<span>{getProgressPercentage(balance)}%</span>
												</div>
												<div className="w-full bg-secondary rounded-full h-2">
													<div
														className="bg-primary rounded-full h-2 transition-all duration-300"
														style={{ width: `${getProgressPercentage(balance)}%` }}
													/>
												</div>
											</div>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{filteredBalances.length > itemsPerPage && (
				<div className="flex items-center justify-between px-2 mt-6">
					<div className="text-sm text-muted-foreground">
						Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredBalances.length)}-
						{Math.min(currentPage * itemsPerPage, filteredBalances.length)} de{' '}
						{filteredBalances.length} saldos
					</div>

					<Pagination className="mx-0 w-auto">
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									onClick={(e) => {
										e.preventDefault();
										setCurrentPage((p) => Math.max(1, p - 1));
									}}
									className={
										currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
									}
								/>
							</PaginationItem>

							{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
								let pageNum = i + 1;
								if (totalPages > 5) {
									if (currentPage <= 3) {
										pageNum = i + 1;
									} else if (currentPage >= totalPages - 2) {
										pageNum = totalPages - 4 + i;
									} else {
										pageNum = currentPage - 2 + i;
									}
								}
								return (
									<PaginationItem key={pageNum}>
										<PaginationLink
											isActive={currentPage === pageNum}
											className="cursor-pointer"
											onClick={(e) => {
												e.preventDefault();
												setCurrentPage(pageNum);
											}}
										>
											{pageNum}
										</PaginationLink>
									</PaginationItem>
								);
							})}

							<PaginationItem>
								<PaginationNext
									onClick={(e) => {
										e.preventDefault();
										setCurrentPage((p) => Math.min(totalPages, p + 1));
									}}
									className={
										currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
									}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			)}

			<BalanceDetailsModal
				balance={selectedBalance}
				work={
					selectedBalance
						? works.find((w) => Number(w.id) === Number(selectedBalance.work_id)) || null
						: null
				}
				isOpen={isDetailsModalOpen}
				onOpenChange={setIsDetailsModalOpen}
				onTransactionCreated={handleBalanceUpdate}
			/>

			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Eliminar saldo?</AlertDialogTitle>
						<AlertDialogDescription>
							Esta acción no se puede deshacer. Se eliminará permanentemente el saldo
							{balanceToDelete && (() => {
								const work = works.find((w) => Number(w.id) === Number(balanceToDelete.work_id));
								return work ? ` de la obra en ${work.locality}` : '';
							})()} y todas sus transacciones asociadas.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteBalance}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Eliminar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
