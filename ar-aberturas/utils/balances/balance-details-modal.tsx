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
import { format, set } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '../../helpers/format-prices.tsx/formats';
import { calculateBalanceSummary } from '../../helpers/balances/balance-calculations';
import { parseArsToNumber } from '@/utils/budgets/utils';
import { AddTransactionSection } from './add-transaction';
import { TransactionsTable } from './transactions-table';
import { BalanceInformation } from './balance-information';
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

	const totalPaid = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
	const totalPaidUSD = transactions.reduce((sum, t) => sum + (Number(t.usd_amount) || 0), 0);
	const summary = calculateBalanceSummary({
		budgetAmountArs: balance?.budget?.amount_ars,
		budgetAmountUsd: balance?.budget?.amount_usd,
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
							work={work}
							startDate={balance.start_date}
							contractDateUsd={balance.contract_date_usd}
							usdCurrent={balance.usd_current}
							totalPaid={totalPaid}
							totalPaidUsd={totalPaidUSD}
							summary={summary}
							formatDate={formatCreatedAt}
						/>

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
