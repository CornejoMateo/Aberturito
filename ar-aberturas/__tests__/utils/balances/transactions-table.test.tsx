import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionsTable } from '@/utils/balances/transactions-table';
import { BalanceTransaction } from '@/lib/works/balance_transactions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

jest.mock('@/helpers/format-prices.tsx/formats', () => ({
	formatCurrency: (value: number | null | undefined) =>
		value ? `$${(value || 0).toLocaleString('es-AR')}` : '$0',
	formatCurrencyUSD: (value: number | null | undefined) =>
		value ? `USD ${(value || 0).toFixed(2)}` : 'USD 0.00',
}));

describe('TransactionsTable', () => {
	const mockTransaction: BalanceTransaction = {
		id: '1',
		balance_id: 'balance-1',
		amount: 50000,
		usd_amount: 300,
		quote_usd: 150,
		payment_method: 'Transferencia',
		date: '2024-03-15',
		notes: 'Test transaction',
		created_at: '2024-03-15',
	};

	const mockOnDeleteTransaction = jest.fn();

	const defaultProps = {
		isLoading: false,
		transactions: [mockTransaction],
		formatDate: (dateStr: string | null | undefined) => {
			if (!dateStr) return '-';
			try {
				const date = new Date(dateStr);
				return format(date, 'PPP', { locale: es });
			} catch {
				return '-';
			}
		},
		onDeleteTransaction: mockOnDeleteTransaction,
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('Rendering', () => {
		it('should render table with all headers', () => {
			render(<TransactionsTable {...defaultProps} />);

			expect(screen.getByText('Fecha')).toBeInTheDocument();
			expect(screen.getByText('Metodo de pago')).toBeInTheDocument();
			expect(screen.getByText('Observaciones')).toBeInTheDocument();
			expect(screen.getByText('Monto pesos/USD')).toBeInTheDocument();
			expect(screen.getByText('Cotizacion USD')).toBeInTheDocument();
			expect(screen.getByText('Accion')).toBeInTheDocument();
		});

		it('should render loading message when isLoading is true', () => {
			render(<TransactionsTable {...defaultProps} isLoading={true} />);

			expect(screen.getByText('Cargando transacciones...')).toBeInTheDocument();
		});

		it('should render empty message when no transactions', () => {
			render(<TransactionsTable {...defaultProps} transactions={[]} />);

			expect(screen.getByText('No hay transacciones registradas')).toBeInTheDocument();
		});
	});

	describe('Transaction Display', () => {
		it('should render transaction data in table row', () => {
			render(<TransactionsTable {...defaultProps} />);

			expect(screen.getByText(/March|marzo/i)).toBeInTheDocument(); // Date formatting
			expect(screen.getByText('Transferencia')).toBeInTheDocument();
			expect(screen.getByText('Test transaction')).toBeInTheDocument();
		});

		it('should render formatted ARS amount', () => {
			render(<TransactionsTable {...defaultProps} />);

			expect(screen.getByText('$50.000')).toBeInTheDocument();
		});

		it('should render formatted USD amount', () => {
			render(<TransactionsTable {...defaultProps} />);

			expect(screen.getByText('USD 300.00')).toBeInTheDocument();
		});

		it('should render formatted quote USD', () => {
			render(<TransactionsTable {...defaultProps} />);

			expect(screen.getByText('USD 150.00')).toBeInTheDocument();
		});

		it('should render multiple transactions', () => {
			const transactions = [
				mockTransaction,
				{
					...mockTransaction,
					id: '2',
					amount: 75000,
					payment_method: 'Efectivo',
					notes: 'Second transaction',
				},
			];

			render(<TransactionsTable {...defaultProps} transactions={transactions} />);

			expect(screen.getByText('Test transaction')).toBeInTheDocument();
			expect(screen.getByText('Second transaction')).toBeInTheDocument();
			expect(screen.getByText('Efectivo')).toBeInTheDocument();
		});

		it('should handle transaction without notes', () => {
			const transactionWithoutNotes = { ...mockTransaction, notes: null };

			render(
				<TransactionsTable
					{...defaultProps}
					transactions={[transactionWithoutNotes]}
				/>
			);

			expect(screen.queryByText('Test transaction')).not.toBeInTheDocument();
		});

		it('should handle transaction with null USD amount', () => {
			const transactionWithoutUsd = { ...mockTransaction, usd_amount: null };

			render(
				<TransactionsTable
					{...defaultProps}
					transactions={[transactionWithoutUsd]}
				/>
			);

			expect(screen.getByText('USD 0.00')).toBeInTheDocument();
		});

		it('should format date correctly', () => {
			const formatDateCount = jest.fn((dateStr: string | null | undefined) => {
				if (!dateStr) return '-';
				try {
					const date = new Date(dateStr);
					return format(date, 'PPP', { locale: es });
				} catch {
					return '-';
				}
			});

			render(
				<TransactionsTable
					{...defaultProps}
					formatDate={formatDateCount}
				/>
			);

			expect(formatDateCount).toHaveBeenCalledWith('2024-03-15');
		});

		it('should return dash when date is null', () => {
			const formatDate = (dateStr: string | null | undefined) => {
				if (!dateStr) return '-';
				try {
					const date = new Date(dateStr);
					return format(date, 'PPP', { locale: es });
				} catch {
					return '-';
				}
			};

			const transactionWithoutDate = { ...mockTransaction, date: null };

			render(
				<TransactionsTable
					{...defaultProps}
					transactions={[transactionWithoutDate]}
					formatDate={formatDate}
				/>
			);

			const cells = screen.getAllByText('-');
			expect(cells.length).toBeGreaterThan(0);
		});
	});

	describe('Delete Button', () => {
		it('should render delete button for each transaction', () => {
			render(<TransactionsTable {...defaultProps} />);

			const deleteButtons = screen.getAllByRole('button');
			expect(deleteButtons.length).toBeGreaterThan(0);
		});

		it('should call onDeleteTransaction when delete button is clicked', async () => {
			const user = userEvent.setup();
			render(<TransactionsTable {...defaultProps} />);

			const deleteButton = screen.getAllByRole('button')[0];
			await user.click(deleteButton);

			expect(mockOnDeleteTransaction).toHaveBeenCalledWith(mockTransaction);
		});

		it('should pass correct transaction to delete handler', async () => {
			const user = userEvent.setup();
			const transactions = [
				mockTransaction,
				{
					...mockTransaction,
					id: '2',
					amount: 75000,
					notes: 'Second transaction',
				},
			];

			render(<TransactionsTable {...defaultProps} transactions={transactions} />);

			const deleteButtons = screen.getAllByRole('button');
			await user.click(deleteButtons[0]);

			expect(mockOnDeleteTransaction).toHaveBeenCalledWith(mockTransaction);

			await user.click(deleteButtons[1]);

			expect(mockOnDeleteTransaction).toHaveBeenCalledWith(transactions[1]);
		});
	});

	describe('Column Styling', () => {
		it('should render observations column with text wrapping class', () => {
			const { container } = render(<TransactionsTable {...defaultProps} />);

			const observationsCell = container.querySelector(
				'td.text-center.whitespace-normal'
			);
			expect(observationsCell).toBeInTheDocument();
		});

		it('should render amount columns with proper styling', () => {
			const { container } = render(<TransactionsTable {...defaultProps} />);

			const amountCells = container.querySelectorAll(
				'td.text-center.font-sm'
			);
			expect(amountCells.length).toBeGreaterThan(0);
		});
	});

	describe('Edge Cases', () => {
		it('should handle large currency amounts', () => {
			const largeTransaction = {
				...mockTransaction,
				amount: 999999999,
				usd_amount: 9999999,
			};

			render(<TransactionsTable {...defaultProps} transactions={[largeTransaction]} />);

			expect(screen.getByText('$999.999.999')).toBeInTheDocument();
		});

		it('should handle decimal USD amounts', () => {
			const decimalTransaction = {
				...mockTransaction,
				usd_amount: 150.67,
			};

			render(
				<TransactionsTable
					{...defaultProps}
					transactions={[decimalTransaction]}
				/>
			);

			expect(screen.getByText('USD 150.67')).toBeInTheDocument();
		});

		it('should handle special characters in notes', () => {
			const specialTransaction = {
				...mockTransaction,
				notes: 'Test & <special> "characters"',
			};

			render(
				<TransactionsTable
					{...defaultProps}
					transactions={[specialTransaction]}
				/>
			);

			expect(screen.getByText(/Test & <special>/)).toBeInTheDocument();
		});

		it('should handle very long notes text', () => {
			const longTransaction = {
				...mockTransaction,
				notes: 'A'.repeat(100),
			};

			render(
				<TransactionsTable
					{...defaultProps}
					transactions={[longTransaction]}
				/>
			);

			const truncatedCell = screen.getByText('A'.repeat(100));
			expect(truncatedCell).toBeInTheDocument();
		});

		it('should handle different payment methods', () => {
			const paymentMethods = [
				'Efectivo',
				'Transferencia',
				'Débito',
				'Crédito',
				'Cheque (físico)',
				'Echeq',
				'Dólar',
			];

			const transactions = paymentMethods.map((method, index) => ({
				...mockTransaction,
				id: (index + 1).toString(),
				payment_method: method,
			}));

			render(<TransactionsTable {...defaultProps} transactions={transactions} />);

			paymentMethods.forEach((method) => {
				expect(screen.getByText(method)).toBeInTheDocument();
			});
		});
	});

	describe('Accessibility', () => {
		it('should have proper table structure', () => {
			const { container } = render(<TransactionsTable {...defaultProps} />);

			const table = container.querySelector('table');
			expect(table).toBeInTheDocument();

			const thead = container.querySelector('thead');
			expect(thead).toBeInTheDocument();

			const tbody = container.querySelector('tbody');
			expect(tbody).toBeInTheDocument();
		});

		it('should render delete buttons with proper accessibility', () => {
			render(<TransactionsTable {...defaultProps} />);

			const deleteButtons = screen.getAllByRole('button');
			expect(deleteButtons.length).toBeGreaterThan(0);

			deleteButtons.forEach((button) => {
				expect(button).toHaveClass('h-8', 'w-8');
			});
		});
	});
});
