import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { BalanceTransaction } from '@/lib/works/balance_transactions';
import { formatCurrency, formatCurrencyUSD } from '../../helpers/format-prices.tsx/formats';

interface TransactionsTableProps {
	isLoading: boolean;
	transactions: BalanceTransaction[];
	formatDate: (dateStr: string | null | undefined) => string;
	onDeleteTransaction: (transaction: BalanceTransaction) => void;
}

export function TransactionsTable({
	isLoading,
	transactions,
	formatDate,
	onDeleteTransaction,
}: TransactionsTableProps) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Fecha</TableHead>
					<TableHead className="text-center">Metodo de pago</TableHead>
					<TableHead className="text-center w-[200px]">Observaciones</TableHead>
					<TableHead className="text-center">Monto pesos/USD</TableHead>
					<TableHead className="text-center">Cotizacion USD</TableHead>
					<TableHead className="text-center w-[50px]">Accion</TableHead>
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
							<TableCell className="text-center font-sm">{transaction.payment_method}</TableCell>
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
									onClick={() => onDeleteTransaction(transaction)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</TableCell>
						</TableRow>
					))
				)}
			</TableBody>
		</Table>
	);
}
