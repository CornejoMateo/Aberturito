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
import { Plus, DollarSign, Search, Trash2, TrendingUp } from 'lucide-react';
import {
	Balance,
	BalanceWithBudget,
	getBalancesByClientId,
	deleteBalance,
} from '@/lib/works/balances';
import { getTotalByBalanceId } from '@/lib/works/balance_transactions';
import { Work } from '@/lib/works/works';
import { BalanceDetailsModal } from './balance-details-modal';
import { DollarUpdateModal } from '@/components/ui/dollar-update-modal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency, formatCurrencyUSD } from './formats';

interface ClientBalancesProps {
	clientId: string;
	onCreateBalance?: () => void;
}

export interface BalanceWithTotals extends BalanceWithBudget {
	totalPaid?: number;
	remaining?: number;
	totalPaidUSD?: number;
	remainingUSD?: number;
}

export function ClientBalances({ clientId, onCreateBalance }: ClientBalancesProps) {
	const [balances, setBalances] = useState<BalanceWithTotals[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedBalance, setSelectedBalance] = useState<BalanceWithTotals | null>(null);
	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
	const [balanceToDelete, setBalanceToDelete] = useState<BalanceWithTotals | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isDollarUpdateModalOpen, setIsDollarUpdateModalOpen] = useState(false);
	const [balanceToUpdate, setBalanceToUpdate] = useState<BalanceWithTotals | null>(null);
	const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
	const itemsPerPage = 2;

	const loadBalances = async () => {
		try {
			setIsLoading(true);
			const { data, error } = await getBalancesByClientId(clientId);

			if (error) {
				console.error('Error al cargar saldos:', error);
				return;
			}

			if (data) {
				const balancesWithTotals = await Promise.all(
					data.map(async (balance) => {
						const { data: totals } = await getTotalByBalanceId(balance.id);
						const totalPaid = totals?.totalAmount || 0;
						const totalPaidUSD = totals?.totalAmountUSD || 0;

						const budgetArs = balance.budget?.amount_ars || 0;
						const budgetUsd = balance.budget?.amount_usd || 0;

						const remaining = budgetArs - totalPaid;
						const remainingUSD = budgetUsd - totalPaidUSD;

						return {
							...balance,
							totalPaid,
							totalPaidUSD,
							remaining,
							remainingUSD,
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

	const handleDollarUpdate = async (newUsdRate: number) => {
		if (!balanceToUpdate) return;

		try {
			const response = await fetch('/api/dollar-rate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					balanceId: parseInt(balanceToUpdate.id),
					newUsdRate,
				}),
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.error || 'Error al actualizar el tipo de cambio');
			}

			// Refresh the list
			handleBalanceUpdate();
		} catch (error) {
			console.error('Error al actualizar tipo de dólar:', error);
			throw error;
		}
	};

	const openDollarUpdateModal = (balance: BalanceWithTotals) => {
		setBalanceToUpdate(balance);
		setIsDollarUpdateModalOpen(true);
	};

	const getProgressPercentage = (balance: BalanceWithTotals) => {
		const budgetArs = balance.budget?.amount_ars || 0;
		if (!budgetArs || budgetArs === 0) return 0;
		const percentage = ((balance.totalPaid || 0) / budgetArs) * 100;
		return Math.min(Math.round(percentage), 100);
	};

	// Filter balances based on search term
	const filteredBalances = useMemo(() => {
		return balances.filter((balance) => {
			const searchLower = searchTerm.toLowerCase();
			const work = balance.budget?.folder_budget?.work;
			return (
				work?.locality?.toLowerCase().includes(searchLower) ||
				work?.address?.toLowerCase().includes(searchLower) ||
				(balance.budget?.amount_ars?.toString() || '').includes(searchLower)
			);
		});
	}, [balances, searchTerm]);

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
				{onCreateBalance && (
					<Button
						onClick={onCreateBalance}
						size="default"
						className="w-full sm:w-auto whitespace-nowrap"
					>
						<Plus className="h-4 w-4 mr-2" />
						Crear Saldo
					</Button>
				)}
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
								className="absolute top-2 right-12 h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 z-10"
								onClick={(e) => {
									e.stopPropagation();
									openDollarUpdateModal(balance);
								}}
								title="Actualizar precios con dólar actual"
							>
								<TrendingUp className="h-4 w-4" />
							</Button>
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
							<CardContent className="pt-6">
								<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-3">
											<DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
											<span className="font-semibold text-sm">
												{(balance.budget?.amount_usd || 0) - (balance.totalPaidUSD || 0) > 0
													? 'Deudor'
													: 'Acreedor'}
											</span>
										</div>
										<div className="text-sm">
											{balance.budget?.folder_budget?.work ? (
												<div>
													<p className="font-medium">
														{balance.budget.folder_budget.work.locality}
													</p>
													<p className="text-muted-foreground text-xs">
														{balance.budget.folder_budget.work.address}
													</p>
												</div>
											) : (
												<span className="text-muted-foreground">Sin presupuesto asignado</span>
											)}
										</div>
									</div>

									<div className="flex flex-col gap-3 w-full lg:min-w-[280px] lg:max-w-[340px]">
										<div className="grid grid-cols-3 gap-2 sm:gap-4">
											<div className="flex flex-col">
												<p className="text-[10px] sm:text-xs text-muted-foreground mb-1 truncate">
													Presupuesto
												</p>
												<div className="flex flex-col">
													<p className="text-xs sm:text-sm font-bold text-primary truncate">
														{formatCurrency(
															(balance.budget?.amount_usd || 0) * (balance.usd_current || 1)
														)}
													</p>
													{balance.budget?.amount_usd && (
														<p className="text-[9px] sm:text-xs text-muted-foreground truncate">
															{formatCurrencyUSD(balance.budget.amount_usd)}
														</p>
													)}
												</div>
											</div>
											<div className="flex flex-col">
												<p className="text-[10px] sm:text-xs text-muted-foreground mb-1 truncate">
													Entregado
												</p>
												<div className="flex flex-col">
													<p className="text-xs sm:text-sm font-bold text-green-600 truncate">
														{formatCurrency(balance.totalPaid || 0)}
													</p>
													{balance.contract_date_usd && (
														<p className="text-[9px] sm:text-xs text-muted-foreground truncate">
															{formatCurrencyUSD(
																(balance.totalPaid || 0) / (balance.usd_current || 1)
															)}
														</p>
													)}
												</div>
											</div>
											<div className="flex flex-col">
												<p className="text-[10px] sm:text-xs text-muted-foreground mb-1 truncate">
													Saldo
												</p>
												<div className="flex flex-col">
													<p className="text-xs sm:text-sm font-bold text-orange-600 truncate">
														{formatCurrency(
															(balance.remaining || 0)
														)}
													</p>
													{balance.contract_date_usd && (
														<p className="text-[9px] sm:text-xs text-muted-foreground truncate">
															{formatCurrencyUSD(balance.remainingUSD || 0)}
														</p>
													)}
												</div>
											</div>
										</div>

										{balance.budget?.amount_usd && balance.budget.amount_usd > 0 && (
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
							{balanceToDelete?.budget?.folder_budget?.work &&
								` de la obra en ${balanceToDelete.budget.folder_budget.work.locality}`}{' '}
							y todas sus transacciones asociadas.
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

			<DollarUpdateModal
				isOpen={isDollarUpdateModalOpen}
				onOpenChange={setIsDollarUpdateModalOpen}
				balance={balanceToUpdate}
				onUpdateConfirmed={handleDollarUpdate}
			/>
		</div>
	);
}
