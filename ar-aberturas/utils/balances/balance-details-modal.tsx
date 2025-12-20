'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { Plus, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import { Balance } from '@/lib/works/balances';
import {
	BalanceTransaction,
	getTransactionsByBalanceId,
	createTransaction,
} from '@/lib/works/balance_transactions';
import { Work } from '@/lib/works/works';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

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
	const { toast } = useToast();

	// Form state
	const [transactionDate, setTransactionDate] = useState<Date>(new Date());
	const [transactionAmount, setTransactionAmount] = useState('');

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
			setIsAddingTransaction(false);

			// Reload transactions
			await loadTransactions();
			onTransactionCreated?.();
		} catch (error) {
			console.error('Error inesperado al crear transacción:', error);
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

	const formatCurrencyUSD = (amount: number | null | undefined) => {
		if (!amount) return 'US$0.00';
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
		}).format(amount);
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

	const totalPaid = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
	const remaining = (balance?.budget || 0) - totalPaid;

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="!max-w-5xl !max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Detalle del saldo</DialogTitle>
				</DialogHeader>

				{balance && (
					<div className="space-y-6">
						{/* Balance Info Header */}
						<div className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 bg-muted/50 rounded-lg">
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
								<p className="text-xs text-muted-foreground mb-1">Presupuesto</p>
								<p className="text-sm font-bold text-primary">{formatCurrency(balance.budget)}</p>
							</div>

							<div>
								<p className="text-xs text-muted-foreground mb-1">Dólar en fecha contratación</p>
								<p className="text-sm font-bold text-blue-600">
									{formatCurrencyUSD(balance.contract_date_usd)}
								</p>
							</div>

							<div>
								<p className="text-xs text-muted-foreground mb-1">Entregado</p>
								<p className="text-sm font-bold text-green-600">{formatCurrency(totalPaid)}</p>
							</div>

							<div>
								<p className="text-xs text-muted-foreground mb-1">Falta</p>
								<p className="text-sm font-bold text-orange-600">{formatCurrency(remaining)}</p>
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
										<Label htmlFor="transaction-amount">Monto</Label>
										<Input
											id="transaction-amount"
											type="number"
											step="0.01"
											placeholder="0.00"
											value={transactionAmount}
											onChange={(e) => setTransactionAmount(e.target.value)}
										/>
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
										<TableHead className="text-right">Monto</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{isLoading ? (
										<TableRow>
											<TableCell colSpan={2} className="text-center text-muted-foreground">
												Cargando transacciones...
											</TableCell>
										</TableRow>
									) : transactions.length === 0 ? (
										<TableRow>
											<TableCell colSpan={2} className="text-center text-muted-foreground">
												No hay transacciones registradas
											</TableCell>
										</TableRow>
									) : (
										transactions.map((transaction) => (
											<TableRow key={transaction.id}>
												<TableCell>{formatDate(transaction.date)}</TableCell>
												<TableCell className="text-right font-medium">
													{formatCurrency(transaction.amount)}
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
		</Dialog>
	);
}
