import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddTransactionSection } from '@/utils/balances/add-transaction';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

jest.mock('@/utils/budgets/utils', () => ({
	formatNumber: (value: string) => value.replace(/[^\d,.-]/g, ''),
}));

describe('AddTransactionSection', () => {
	const mockOnTransactionDateChange = jest.fn();
	const mockOnTransactionAmountChange = jest.fn();
	const mockOnUsdAmountChange = jest.fn();
	const mockOnQuoteUsdChange = jest.fn();
	const mockOnNotesChange = jest.fn();
	const mockOnPaymentMethodChange = jest.fn();
	const mockOnCancel = jest.fn();
	const mockOnSave = jest.fn();
	const mockOnStartAdd = jest.fn();

	const defaultDate = new Date('2024-03-20');

	const defaultProps = {
		isAddingTransaction: false,
		transactionDate: defaultDate,
		onTransactionDateChange: mockOnTransactionDateChange,
		transactionAmount: '',
		onTransactionAmountChange: mockOnTransactionAmountChange,
		usdAmount: '',
		onUsdAmountChange: mockOnUsdAmountChange,
		quoteUsd: '',
		onQuoteUsdChange: mockOnQuoteUsdChange,
		notes: '',
		onNotesChange: mockOnNotesChange,
		paymentMethod: '',
		onPaymentMethodChange: mockOnPaymentMethodChange,
		onCancel: mockOnCancel,
		onSave: mockOnSave,
		onStartAdd: mockOnStartAdd,
		saveDisabled: false,
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('Collapsed View', () => {
		it('should render add transaction button when not adding', () => {
			render(<AddTransactionSection {...defaultProps} />);

			const button = screen.getByRole('button', { name: /Agregar transacción/i });
			expect(button).toBeInTheDocument();
		});

		it('should call onStartAdd when button is clicked', async () => {
			const user = userEvent.setup();
			render(<AddTransactionSection {...defaultProps} />);

			const button = screen.getByRole('button', { name: /Agregar transacción/i });
			await user.click(button);

			expect(mockOnStartAdd).toHaveBeenCalled();
		});

		it('should not display form fields when not adding', () => {
			render(<AddTransactionSection {...defaultProps} />);

			expect(screen.queryByLabelText(/Fecha/i)).not.toBeInTheDocument();
			expect(screen.queryByLabelText(/Monto en pesos/i)).not.toBeInTheDocument();
		});
	});

	describe('Expanded Form View', () => {
		const expandedProps = {
			...defaultProps,
			isAddingTransaction: true,
		};

		it('should display form when isAddingTransaction is true', () => {
			render(<AddTransactionSection {...expandedProps} />);

			expect(screen.getByText('Fecha')).toBeInTheDocument();
			expect(screen.getByRole('button', { name: format(defaultDate, 'PPP', { locale: es }) })).toBeInTheDocument();
			expect(screen.getByLabelText(/Monto en pesos/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/Monto en USD/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/Cotización USD/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/Observaciones/i)).toBeInTheDocument();
			expect(screen.getByRole('combobox', { name: /Método de pago/i })).toBeInTheDocument();
		});

		it('should render cancel and save buttons', () => {
			render(<AddTransactionSection {...expandedProps} />);

			expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /Guardar/i })).toBeInTheDocument();
		});

		it('should call onCancel when cancel button is clicked', async () => {
			const user = userEvent.setup();
			render(<AddTransactionSection {...expandedProps} />);

			const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
			await user.click(cancelButton);

			expect(mockOnCancel).toHaveBeenCalled();
		});

		it('should call onSave when save button is clicked', async () => {
			const user = userEvent.setup();
			render(<AddTransactionSection {...expandedProps} />);

			const saveButton = screen.getByRole('button', { name: /Guardar/i });
			await user.click(saveButton);

			expect(mockOnSave).toHaveBeenCalled();
		});

		it('should disable save button when saveDisabled is true', () => {
			render(<AddTransactionSection {...expandedProps} saveDisabled={true} />);

			const saveButton = screen.getByRole('button', { name: /Guardar/i });
			expect(saveButton).toBeDisabled();
		});

		it('should enable save button when saveDisabled is false', () => {
			render(<AddTransactionSection {...expandedProps} saveDisabled={false} />);

			const saveButton = screen.getByRole('button', { name: /Guardar/i });
			expect(saveButton).not.toBeDisabled();
		});
	});

	describe('Date Input', () => {
		const expandedProps = {
			...defaultProps,
			isAddingTransaction: true,
		};

		it('should display current date in date button', () => {
			const testDate = new Date('2024-03-20');
			const formattedDate = format(testDate, 'PPP', { locale: es });

			render(
				<AddTransactionSection
					{...expandedProps}
					transactionDate={testDate}
				/>
			);

			expect(screen.getByText(formattedDate)).toBeInTheDocument();
		});

		it('should show calendar popover when date button is clicked', async () => {
			const user = userEvent.setup();
			render(<AddTransactionSection {...expandedProps} />);

			const formattedDate = format(defaultDate, 'PPP', { locale: es });
			const dateButton = screen.getByRole('button', { name: formattedDate });
			await user.click(dateButton);

			expect(dateButton).toHaveAttribute('aria-expanded', 'true');
		});
	});

	describe('Amount Inputs', () => {
		const expandedProps = {
			...defaultProps,
			isAddingTransaction: true,
		};

		it('should update transaction amount when input changes', async () => {
			const user = userEvent.setup();
			render(<AddTransactionSection {...expandedProps} />);

			const amountInput = screen.getByLabelText(/Monto en pesos/i) as HTMLInputElement;
			await user.type(amountInput, '1000');

			expect(mockOnTransactionAmountChange).toHaveBeenCalled();
		});

		it('should update USD amount when input changes', async () => {
			render(<AddTransactionSection {...expandedProps} />);

			const usdInput = screen.getByLabelText(/Monto en USD/i) as HTMLInputElement;
			fireEvent.change(usdInput, { target: { value: '100' } });

			expect(mockOnUsdAmountChange).toHaveBeenCalledWith('100');
		});

		it('should update quote USD when input changes', async () => {
			render(<AddTransactionSection {...expandedProps} />);

			const quoteInput = screen.getByLabelText(/Cotización USD/i) as HTMLInputElement;
			fireEvent.change(quoteInput, { target: { value: '150' } });

			expect(mockOnQuoteUsdChange).toHaveBeenCalledWith('150');
		});

		it('should display current amount values', () => {
			render(
				<AddTransactionSection
					{...expandedProps}
					transactionAmount="50000"
					usdAmount="300"
					quoteUsd="150"
				/>
			);

			const amountInput = screen.getByLabelText(/Monto en pesos/i) as HTMLInputElement;
			const usdInput = screen.getByLabelText(/Monto en USD/i) as HTMLInputElement;
			const quoteInput = screen.getByLabelText(/Cotización USD/i) as HTMLInputElement;

			expect(amountInput.value).toBe('50000');
			expect(usdInput.value).toBe('300');
			expect(quoteInput.value).toBe('150');
		});
	});

	describe('Payment Method Selector', () => {
		const expandedProps = {
			...defaultProps,
			isAddingTransaction: true,
		};

		it('should render all payment method options', async () => {
			const user = userEvent.setup();
			render(<AddTransactionSection {...expandedProps} />);

			const selectTrigger = screen.getByRole('combobox');
			await user.click(selectTrigger);

			expect(await screen.findByRole('option', { name: 'Efectivo' })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: 'Transferencia' })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: 'Débito' })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: 'Crédito' })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: 'Cheque (físico)' })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: 'Echeq' })).toBeInTheDocument();
			expect(screen.getByRole('option', { name: 'Dólar' })).toBeInTheDocument();
		});

		it('should call onPaymentMethodChange when option is selected', async () => {
			const user = userEvent.setup();
			render(<AddTransactionSection {...expandedProps} />);

			const selectTrigger = screen.getByRole('combobox');
			await user.click(selectTrigger);

			const efectivoOption = await screen.findByRole('option', { name: 'Efectivo' });
			await user.click(efectivoOption);

			expect(mockOnPaymentMethodChange).toHaveBeenCalledWith('Efectivo');
		});

		it('should display selected payment method', () => {
			render(
				<AddTransactionSection
					{...expandedProps}
					paymentMethod="Transferencia"
				/>
			);

			expect(screen.getByText('Transferencia')).toBeInTheDocument();
		});
	});

	describe('Notes Input', () => {
		const expandedProps = {
			...defaultProps,
			isAddingTransaction: true,
		};

		it('should update notes when input changes', async () => {
			const user = userEvent.setup();
			render(<AddTransactionSection {...expandedProps} />);

			const notesInput = screen.getByLabelText(/Observaciones/i) as HTMLInputElement;
			await user.type(notesInput, 'Test note');

			expect(mockOnNotesChange).toHaveBeenCalled();
		});

		it('should display current notes value', () => {
			render(
				<AddTransactionSection
					{...expandedProps}
					notes="Existing note"
				/>
			);

			const notesInput = screen.getByLabelText(/Observaciones/i) as HTMLInputElement;
			expect(notesInput.value).toBe('Existing note');
		});
	});

	describe('Form Validation', () => {
		const expandedProps = {
			...defaultProps,
			isAddingTransaction: true,
		};

		it('should show disabled save button initially', () => {
			render(
				<AddTransactionSection
					{...expandedProps}
					saveDisabled={true}
				/>
			);

			const saveButton = screen.getByRole('button', { name: /Guardar/i });
			expect(saveButton).toBeDisabled();
		});

		it('should enable save button when form is valid', () => {
			render(
				<AddTransactionSection
					{...expandedProps}
					transactionAmount="50000"
					saveDisabled={false}
				/>
			);

			const saveButton = screen.getByRole('button', { name: /Guardar/i });
			expect(saveButton).not.toBeDisabled();
		});
	});

	describe('Accessibility', () => {
		const expandedProps = {
			...defaultProps,
			isAddingTransaction: true,
		};

		it('should have proper labels for all inputs', () => {
			render(<AddTransactionSection {...expandedProps} />);

			expect(screen.getByText('Fecha')).toBeInTheDocument();
			expect(screen.getByLabelText(/Monto en pesos/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/Monto en USD/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/Cotización USD/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/Observaciones/i)).toBeInTheDocument();
			expect(screen.getByRole('combobox', { name: /Método de pago/i })).toBeInTheDocument();
		});

		it('should have title on dollar update button', () => {
			const { container } = render(<AddTransactionSection {...defaultProps} />);

			expect(screen.getByRole('button', { name: /Agregar transacción/i })).toBeInTheDocument();
		});
	});
});
