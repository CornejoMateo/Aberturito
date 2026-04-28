'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { BalanceWithBudget } from '@/lib/works/balances';
import {
	BalanceTransaction,
	getTransactionsByBalanceId,
	createTransaction,
	deleteTransaction,
} from '@/lib/works/balance_transactions';
import { updateBalance } from '@/lib/works/balances';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '../../helpers/format-prices.tsx/formats';
import { calculateBalanceSummary } from '../../helpers/balances/balance-calculations';
import { parseArsToNumber } from '@/utils/budgets/utils';
import { AddTransactionSection } from './add-transaction';
import { TransactionsTable } from './transactions-table';
import { BalanceInformation } from './balance-information';
import { NotesInput } from '@/components/ui/notes-input';
import { translateError } from '@/lib/error-translator';
import { formatCreatedAt } from '@/helpers/date/format-date';

interface BalanceDetailsModalProps {
	balance: BalanceWithBudget | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onTransactionCreated?: () => void;
}

export function BalanceDetailsModal({
	balance,
	isOpen,
	onOpenChange,
	onTransactionCreated,
}: BalanceDetailsModalProps) {
	const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isAddingTransaction, setIsAddingTransaction] = useState(false);
	const [transactionToDelete, setTransactionToDelete] = useState<BalanceTransaction | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isEditingNotes, setIsEditingNotes] = useState(false);
	const [balanceNotes, setBalanceNotes] = useState('');
	const { toast } = useToast();

	// Form state
	const [transactionDate, setTransactionDate] = useState<Date>(new Date());
	const [transactionAmount, setTransactionAmount] = useState('');
	const [paymentMethod, setPaymentMethod] = useState('');
	const [notes, setNotes] = useState('');
	const [quoteUsd, setQuoteUsd] = useState('');
	const [usdAmount, setUsdAmount] = useState('');

	useEffect(() => {
		if (balance && isOpen) {
			loadTransactions();
			setBalanceNotes(balance.notes ?? ''); // notes is a string (or null)
		}
	}, [balance, isOpen]);

	const loadTransactions = async () => {
		if (!balance) return;

		try {
			setIsLoading(true);
			const { data, error } = await getTransactionsByBalanceId(balance.id);

			if (error) {
				console.error('Error al cargar transacciones:', error);
				return;
			}

			setTransactions(data || []);
		} catch (error) {
			console.error('Error inesperado al cargar transacciones:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddTransaction = async () => {
		if (!balance || !transactionAmount) return;

		try {
			const { data, error } = await createTransaction({
				balance_id: balance.id,
				date: format(transactionDate, 'yyyy-MM-dd'),
				amount: parseArsToNumber(transactionAmount),
				payment_method: paymentMethod || null,
				notes: notes || null,
				quote_usd: quoteUsd ? parseFloat(quoteUsd) : null,
				usd_amount: usdAmount ? parseFloat(usdAmount) : null,
			});

			if (error) {
				toast({
					variant: 'destructive',
					title: 'Error al crear transacción',
					description: 'Hubo un problema al crear la transacción. Intente nuevamente.',
				});
				return;
			}

			toast({
				title: 'Transacción creada',
				description: 'La transacción se ha creado exitosamente.',
			});

			// Reset form
			setTransactionDate(new Date());
			setTransactionAmount('');
			setPaymentMethod('');
			setNotes('');
			setQuoteUsd('');
			setUsdAmount('');
			setIsAddingTransaction(false);

			// Reload transactions
			await loadTransactions();
			onTransactionCreated?.();
		} catch (error) {
			console.error('Error inesperado al crear transacción:', error);
		}
	};

	const handleDeleteTransaction = async () => {
		if (!transactionToDelete) return;

		try {
			const { error } = await deleteTransaction(transactionToDelete.id);

			if (error) {
				toast({
					variant: 'destructive',
					title: 'Error al eliminar transacción',
					description: translateError(error) || 'Hubo un problema al eliminar la transacción. Intente nuevamente.',
				});
				return;
			}

			toast({
				title: 'Transacción eliminada',
				description: 'La transacción se ha eliminado exitosamente.',
			});

			// Reload transactions
			await loadTransactions();
			onTransactionCreated?.();
		} catch (error) {
			toast({
				variant: 'destructive',
				title: 'Error inesperado',
				description: translateError(error) || 'Ocurrió un error inesperado. Intente nuevamente.',
			});
		} finally {
			setIsDeleteDialogOpen(false);
			setTransactionToDelete(null);
		}
	};

	const handleUpdateBalanceNotes = async () => {
		if (!balance) return;

		try {
			const { error } = await updateBalance(balance.id, {
				notes: balanceNotes ? balanceNotes : null,
			});

			if (error) {
				toast({
					variant: 'destructive',
					title: 'Error al actualizar notas',
					description: translateError(error) || 'Hubo un problema al actualizar las notas.',
				});
				return;
			}

			toast({
				title: 'Notas actualizadas',
				description: 'Las notas del saldo se han actualizado exitosamente.',
			});

			setIsEditingNotes(false);
			onTransactionCreated?.();
		} catch (error) {
			toast({
				variant: 'destructive',
				title: 'Error inesperado',
				description: translateError(error) || 'Ocurrió un error inesperado. Intente nuevamente.',
			});
		}
	};

	const totalPaid = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
	const totalPaidUSD = transactions.reduce((sum, t) => sum + (Number(t.usd_amount) || 0), 0);
	const summary = calculateBalanceSummary({
		budgetAmountArs: balance?.balance_amount_ars,
		budgetAmountUsd: balance?.balance_amount_usd,
		budgetInitialArs: balance?.budget?.amount_ars,
		usdCurrent: balance?.usd_current,
		totalPaidArs: totalPaid,
		totalPaidUsd: totalPaidUSD,
	});
	const work = balance?.budget?.folder_budget?.work;

	useEffect(() => {
		if (transactionAmount && quoteUsd && isAddingTransaction) {
			const normalizedAmount = transactionAmount
				.replace(/\./g, '') // remove thousand separators
				.replace(',', '.'); // decimal separator to dot for parsing

			const amountNumber = Number(normalizedAmount);
			const rateNumber = Number(quoteUsd);

			if (!isNaN(amountNumber) && !isNaN(rateNumber)) {
				const calculatedUsd = (amountNumber / rateNumber).toFixed(2);

				setUsdAmount(calculatedUsd);
			}
		}
	}, [quoteUsd, transactionAmount]);

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="!max-w-5xl !max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Detalle del saldo</DialogTitle>
					<DialogDescription>
						Información completa del saldo, pagos realizados y estado de la obra.
					</DialogDescription>
				</DialogHeader>

				{balance && (
					<div className="space-y-6">
						<BalanceInformation
							balanceId={balance.id}
							work={work}
							startDate={balance.start_date}
							contractDateUsd={balance.contract_date_usd}
							usdCurrent={balance.usd_current}
							totalPaid={totalPaid}
							totalPaidUsd={totalPaidUSD}
							summary={summary}
							formatDate={formatCreatedAt}
						/>

						{/* Balance Notes Section */}
						<div className="border rounded-lg p-4">
							<div className="flex items-center justify-between mb-3">
								<h4 className="font-semibold">Notas del saldo</h4>
								{!isEditingNotes && (
								<button
									onClick={() => setIsEditingNotes(true)}
									className="text-sm text-primary hover:underline"
								>
									{balance.notes && String(balance.notes).trim() !== '' ? 'Editar notas' : 'Agregar notas'}
								</button>
								)}
							</div>
							{isEditingNotes ? (
								<div className="space-y-3">
									<NotesInput
										value={balanceNotes}
										onChange={setBalanceNotes}
										placeholder="Agregar notas sobre este saldo (opcional)"
										rows={3}
										showLabel={false}
									/>
									<div className="flex justify-end gap-2">
										<button
											onClick={() => {
												setIsEditingNotes(false);
												setBalanceNotes(balance.notes ?? '');
											}}
											className="px-4 py-2 text-sm border rounded-md hover:bg-secondary"
										>
											Cancelar
										</button>
										<button
											onClick={handleUpdateBalanceNotes}
											className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
										>
											Guardar
										</button>
									</div>
								</div>
							) : (
								<div>
									{balance.notes && balance.notes.length > 0 ? (
										<div className="text-sm text-muted-foreground whitespace-pre-wrap">
											{balance.notes}
										</div>
									) : (
										<p className="text-sm text-muted-foreground italic">
											No hay notas agregadas
										</p>
									)}
								</div>
							)}
						</div>

						<AddTransactionSection
							isAddingTransaction={isAddingTransaction}
							transactionDate={transactionDate}
							onTransactionDateChange={setTransactionDate}
							transactionAmount={transactionAmount}
							onTransactionAmountChange={setTransactionAmount}
							usdAmount={usdAmount}
							onUsdAmountChange={setUsdAmount}
							quoteUsd={quoteUsd}
							onQuoteUsdChange={setQuoteUsd}
							notes={notes}
							onNotesChange={setNotes}
							paymentMethod={paymentMethod}
							onPaymentMethodChange={setPaymentMethod}
							onCancel={() => {
								setIsAddingTransaction(false);
								setTransactionDate(new Date());
								setTransactionAmount('');
								setPaymentMethod('');
								setNotes('');
								setQuoteUsd('');
								setUsdAmount('');
							}}
							onSave={handleAddTransaction}
							onStartAdd={() => setIsAddingTransaction(true)}
							saveDisabled={!transactionAmount}
						/>

						{/* Transactions Table */}
						<div className="border rounded-lg">
							<TransactionsTable
								isLoading={isLoading}
								transactions={transactions}
								formatDate={formatCreatedAt}
								onDeleteTransaction={(transaction) => {
									setTransactionToDelete(transaction);
									setIsDeleteDialogOpen(true);
								}}
							/>
						</div>
					</div>
				)}
			</DialogContent>

			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Eliminar transacción?</AlertDialogTitle>
						<AlertDialogDescription>
							Esta acción no se puede deshacer. Se eliminará permanentemente la transacción
							{transactionToDelete && (
								<>
									{' '}
									de {formatCurrency(transactionToDelete.amount)} del{' '}
									{formatCreatedAt(transactionToDelete.date)}
								</>
							)}
							.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteTransaction}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Eliminar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Dialog>
	);
}
