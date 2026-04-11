import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/budgets/utils';

interface AddTransactionSectionProps {
	isAddingTransaction: boolean;
	transactionDate: Date;
	onTransactionDateChange: (date: Date) => void;
	transactionAmount: string;
	onTransactionAmountChange: (value: string) => void;
	usdAmount: string;
	onUsdAmountChange: (value: string) => void;
	quoteUsd: string;
	onQuoteUsdChange: (value: string) => void;
	notes: string;
	onNotesChange: (value: string) => void;
	paymentMethod: string;
	onPaymentMethodChange: (value: string) => void;
	onCancel: () => void;
	onSave: () => void;
	onStartAdd: () => void;
	saveDisabled: boolean;
}

export function AddTransactionSection({
	isAddingTransaction,
	transactionDate,
	onTransactionDateChange,
	transactionAmount,
	onTransactionAmountChange,
	usdAmount,
	onUsdAmountChange,
	quoteUsd,
	onQuoteUsdChange,
	notes,
	onNotesChange,
	paymentMethod,
	onPaymentMethodChange,
	onCancel,
	onSave,
	onStartAdd,
	saveDisabled,
}: AddTransactionSectionProps) {
	if (!isAddingTransaction) {
		return (
			<Button
				variant="outline"
				size="sm"
				className="w-60 items-center flex justify-center mx-auto"
				onClick={onStartAdd}
			>
				<Plus className="h-4 w-4 mr-2" />
				Agregar transacción
			</Button>
		);
	}

	return (
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
								onSelect={(date) => date && onTransactionDateChange(date)}
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
						type="text"
						value={transactionAmount}
						onChange={(e) => onTransactionAmountChange(formatNumber(e.target.value))}
					/>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="quote-usd">Cotización USD</Label>
					<Input
						id="quote-usd"
						type="number"
						value={quoteUsd}
						onChange={(e) => onQuoteUsdChange(e.target.value)}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="usd-amount">Monto en USD</Label>
					<Input
						id="usd-amount"
						type="number"
						value={usdAmount}
						onChange={(e) => onUsdAmountChange(e.target.value)}
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
						onChange={(e) => onNotesChange(e.target.value)}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="payment-method">Método de pago</Label>
					<Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
						<SelectTrigger id="payment-method">
							<SelectValue placeholder="Seleccionar método" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="Efectivo">Efectivo</SelectItem>
							<SelectItem value="Transferencia">Transferencia</SelectItem>
							<SelectItem value="Debito">Débito</SelectItem>
							<SelectItem value="Credito">Crédito</SelectItem>
							<SelectItem value="Cheque Fisico">Cheque (físico)</SelectItem>
							<SelectItem value="Echeq">Echeq</SelectItem>
							<SelectItem value="Dólar">Dólar</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
			<div className="flex gap-1 justify-end">
				<Button variant="outline" size="sm" onClick={onCancel}>
					Cancelar
				</Button>
				<Button size="sm" onClick={onSave} disabled={saveDisabled}>
					Guardar
				</Button>
			</div>
		</div>
	);
}
