'use client';

import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Plus, Calendar as CalendarIcon, DollarSign, Trash2 } from 'lucide-react';
import { Balance } from '@/lib/works/balances';
import {
	BalanceTransaction,
	getTransactionsByBalanceId,
	createTransaction,
	deleteTransaction,
} from '@/lib/works/balance_transactions';
import { Work } from '@/lib/works/works';
import { format, set } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatCurrencyUSD } from './formats';

interface BalanceDetailsModalProps {
	balance: Balance | null;
	work: Work | null;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onTransactionCreated?: () => void;
}

export function BalanceDetailsModal({
	balance,
	work,
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
				amount: parseFloat(transactionAmount),
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
					description: 'Hubo un problema al eliminar la transacción. Intente nuevamente.',
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
			console.error('Error inesperado al eliminar transacción:', error);
		} finally {
			setIsDeleteDialogOpen(false);
			setTransactionToDelete(null);
		}
	};

	const formatDate = (dateStr: string | null | undefined) => {
		if (!dateStr) return '-';
		try {
			const date = new Date(dateStr);
			return format(date, 'PPP', { locale: es });
		} catch {
			return '-';
		}
	};

	const totalPaid = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
	const totalPaidUSD = transactions.reduce((sum, t) => sum + (Number(t.usd_amount) || 0), 0);
	//const remaining = (balance?.budget || 0) - totalPaid;
	const remainingUSD = (balance?.budget_usd || 0) - totalPaidUSD;

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="!max-w-5xl !max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Detalle del saldo</DialogTitle>
				</DialogHeader>

				{balance && (
					<div className="space-y-6">
						{/* Balance Info Header */}
						<div className="grid grid-cols-2 md:grid-cols-7 gap-4 p-4 bg-muted/50 rounded-lg">
							<div>
								<p className="text-xs text-muted-foreground mb-1">Obra</p>
								<p className="text-sm font-medium">
									{work ? (
										<>
											<span className="block">{work.locality}</span>
											<span className="text-xs text-muted-foreground">{work.address}</span>
										</>
									) : (
										'Sin obra asignada'
									)}
								</p>
							</div>

							<div>
								<p className="text-xs text-muted-foreground mb-1">Fecha de inicio</p>
								<p className="text-sm font-medium">{formatDate(balance.start_date)}</p>
							</div>

							<div>
								<p className="text-xs text-muted-foreground mb-1">Dólar en fecha contratación</p>
								<p className="text-sm font-bold text-blue-600">
									{formatCurrencyUSD(balance.contract_date_usd)}
								</p>
							</div>

							<div>
								<p className="text-xs text-muted-foreground mb-1">Dólar actual</p>
								<p className="text-sm font-bold text-blue-600">
									{formatCurrencyUSD(balance.usd_current)}
								</p>
							</div>

							<div>
								<p className="text-xs text-muted-foreground mb-1">Presupuesto</p>
								<div className="flex flex-col">
									<p className="text-sm font-bold text-primary">{formatCurrency((balance.budget_usd || 1) * (balance.usd_current || 1))}</p>
									{balance.contract_date_usd && (
										<p className="text-xs text-muted-foreground">
											{formatCurrencyUSD(balance.budget_usd)}
										</p>
									)}
								</div>
							</div>

							<div>
								<p className="text-xs text-muted-foreground mb-1">Entregado</p>
								<div className="flex flex-col">
									<p className="text-sm font-bold text-green-600">{formatCurrency(totalPaid)}</p>
									{balance.contract_date_usd && (
										<p className="text-xs text-muted-foreground">
											{formatCurrencyUSD(totalPaid / (balance.usd_current || 1))}
										</p>
									)}
								</div>
							</div>

							<div>
								<p className="text-xs text-muted-foreground mb-1">Falta</p>
								<div className="flex flex-col">
									<p className="text-sm font-bold text-orange-600">{formatCurrency(remainingUSD * (balance.usd_current || 1))}</p> 
									{balance.contract_date_usd && (
										<p className="text-xs text-muted-foreground">
											{formatCurrencyUSD(remainingUSD || 0)}
										</p>
									)}
								</div>
							</div>
						</div>

						{/* Add Transaction Form */}
						{isAddingTransaction ? (
							<div className="space-y-4 p-4 border rounded-lg">
								<h3 className="text-sm font-semibold">Nueva transacción</h3>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="transaction-date">Fecha</Label>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													className={cn(
														'w-full justify-start text-left font-normal',
														!transactionDate && 'text-muted-foreground'
													)}
												>
													<CalendarIcon className="mr-2 h-4 w-4" />
													{transactionDate
														? format(transactionDate, 'PPP', { locale: es })
														: 'Seleccionar fecha'}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={transactionDate}
													onSelect={(date) => date && setTransactionDate(date)}
													initialFocus
													locale={es}
												/>
											</PopoverContent>
										</Popover>
									</div>

									<div className="space-y-2">
										<Label htmlFor="transaction-amount">Monto en pesos</Label>
										<Input
											id="transaction-amount"
											type="number"
											step="0.01"
											value={transactionAmount}
											onChange={(e) => setTransactionAmount(e.target.value)}
										/>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="usd-amount">Monto en USD</Label>
										<Input
											id="usd-amount"
											type="text"
											value={usdAmount}
											onChange={(e) => setUsdAmount(e.target.value)}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="quote-usd">Cotización USD</Label>
										<Input
											id="quote-usd"
											type="text"
											value={quoteUsd}
											onChange={(e) => setQuoteUsd(e.target.value)}
										/>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="notes">Observaciones</Label>
										<Input
											id="notes"
											type="text"
											value={notes}
											onChange={(e) => setNotes(e.target.value)}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="payment-method">Método de pago</Label>
										<Select value={paymentMethod} onValueChange={setPaymentMethod}>
											<SelectTrigger id="payment-method">
												<SelectValue placeholder="Seleccionar método" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Efectivo">Efectivo</SelectItem>
												<SelectItem value="Transferencia">Transferencia</SelectItem>
												<SelectItem value="Debito">Débito</SelectItem>
												<SelectItem value="Credito">Crédito</SelectItem>
												<SelectItem value="Cheque">Cheque (físico)</SelectItem>		
												<SelectItem value="Echeq">Echeq</SelectItem>
												<SelectItem value="Cheque">Dólar</SelectItem>																						
											</SelectContent>
										</Select>
									</div>
								</div>
								<div className="flex gap-1 justify-end">
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											setIsAddingTransaction(false);
											setTransactionDate(new Date());
											setTransactionAmount('');
											setPaymentMethod('');
											setNotes('');
										}}
									>
										Cancelar
									</Button>
									<Button size="sm" onClick={handleAddTransaction} disabled={!transactionAmount}>
										Guardar
									</Button>
								</div>
							</div>
						) : (
							<Button
								variant="outline"
								size="sm"
								className="w-60 items-center flex justify-center mx-auto"
								onClick={() => setIsAddingTransaction(true)}
							>
								<Plus className="h-4 w-4 mr-2" />
								Agregar transacción
							</Button>
						)}

						{/* Transactions Table */}
						<div className="border rounded-lg">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Fecha</TableHead>
										<TableHead className="text-center">Método de pago</TableHead>
										<TableHead className="text-center w-[200px]">Observaciones</TableHead>
										<TableHead className="text-center">Monto pesos/USD</TableHead>
										<TableHead className="text-center">Cotización USD</TableHead>
										<TableHead className="text-center w-[50px]">Acción</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{isLoading ? (
										<TableRow>
											<TableCell colSpan={6} className="text-center text-muted-foreground">
												Cargando transacciones...
											</TableCell>
										</TableRow>
									) : transactions.length === 0 ? (
										<TableRow>
											<TableCell colSpan={6} className="text-center text-muted-foreground">
												No hay transacciones registradas
											</TableCell>
										</TableRow>
									) : (
										transactions.map((transaction) => (
											<TableRow key={transaction.id}>
												<TableCell>{formatDate(transaction.date)}</TableCell>
												<TableCell className="text-center font-sm">
													{transaction.payment_method}
												</TableCell>
												<TableCell className="text-center font-sm w-[200px] whitespace-normal break-words">
													{transaction.notes}
												</TableCell>
												<TableCell className="text-center font-sm">
												<div className="flex flex-col">
													<span>{formatCurrency(transaction.amount)}</span>
													<span className="text-muted-foreground text-xs">
														{formatCurrencyUSD(transaction.usd_amount)}
													</span>
												</div>
												</TableCell>
												<TableCell className="text-center font-sm">
													{formatCurrencyUSD(transaction.quote_usd)}
												</TableCell>
												<TableCell className="text-center">
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
														onClick={() => {
															setTransactionToDelete(transaction);
															setIsDeleteDialogOpen(true);
														}}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
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
									{formatDate(transactionToDelete.date)}
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
