import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BalanceDetailsModal } from '@/utils/balances/balance-details-modal';

jest.mock('@/lib/works/balance_transactions', () => ({
	getTransactionsByBalanceId: jest.fn(),
	createTransaction: jest.fn(),
	updateTransaction: jest.fn(),
	deleteTransaction: jest.fn(),
}));

jest.mock('@/lib/works/balances', () => ({
	updateBalance: jest.fn(),
}));

jest.mock('@/lib/clients/files', () => ({
	getClientFilesByTransaction: jest.fn(),
	uploadClientFile: jest.fn(),
	deleteClientFile: jest.fn(),
}));

jest.mock('@/helpers/images/optimization', () => ({
	optimizeFile: jest.fn(),
}));

jest.mock('@/lib/supabase-client', () => ({
	getSupabaseClient: jest.fn(),
}));

jest.mock('@/lib/error-translator', () => ({
	translateError: jest.fn(),
}));

const mockToast = jest.fn();
jest.mock('@/components/ui/use-toast', () => ({
	useToast: () => ({ toast: mockToast }),
}));

const mockFormatNumber = jest.fn((value: string) => value);
jest.mock('@/utils/budgets/utils', () => ({
	parseArsToNumber: jest.fn((val: string) => parseFloat(val.replace(/\./g, '').replace(',', '.'))),
	formatNumber: (value: string) => value,
}));

import { createTransaction, getTransactionsByBalanceId } from '@/lib/works/balance_transactions';

const mockCreateTransaction = createTransaction as jest.MockedFunction<typeof createTransaction>;
const mockGetTransactions = getTransactionsByBalanceId as jest.MockedFunction<
	typeof getTransactionsByBalanceId
>;
const mockTranslateError = jest.fn();

const mockBalance = {
	id: 1,
	client_id: 1,
	budget_id: 1,
	start_date: '2024-01-01',
	contract_date_usd: 1000,
	usd_current: 1100,
	notes: '',
	created_at: '2024-01-01',
	budget: {
		id: 1,
		created_at: '2024-01-01',
		amount_ars: 500000,
		amount_usd: 5000,
		folder_budget: {
			id: 1,
			work: {
				locality: 'Buenos Aires',
				address: 'Test Street 123',
			},
		},
	},
};

const mockTransactionResponse = {
	id: 1,
	created_at: '2024-03-20',
	balance_id: 1,
	date: '2024-03-20',
	amount: 50000,
	payment_method: null,
	notes: null,
	quote_usd: null,
	usd_amount: null,
	is_extra_amount: false,
};

beforeEach(() => {
	jest.clearAllMocks();
	mockGetTransactions.mockResolvedValue({ data: [], error: null });
	mockCreateTransaction.mockResolvedValue({ data: mockTransactionResponse, error: null });
});

describe('BalanceDetailsModal - handleSaveTransaction', () => {
	const renderModal = () =>
		render(
			<BalanceDetailsModal
				balance={mockBalance}
				isOpen={true}
				onOpenChange={jest.fn()}
				onTransactionCreated={jest.fn()}
			/>
		);

	it('should create a regular transaction without is_extra_amount', async () => {
		const user = userEvent.setup();
		renderModal();

		const transactionButton = screen.getByRole('button', { name: /Agregar transacción/i });
		await user.click(transactionButton);

		const amountInput = screen.getByLabelText(/Monto en pesos/i);
		await user.type(amountInput, '50000');

		const saveButton = screen.getByRole('button', { name: /Guardar/i });
		await user.click(saveButton);

		await waitFor(() => {
			expect(mockCreateTransaction).toHaveBeenCalledWith(
				expect.objectContaining({
					balance_id: 1,
					amount: 50000,
				})
			);
		});

		expect(mockCreateTransaction.mock.calls[0][0]).not.toHaveProperty('is_extra_amount');
	});

	it('should create an extra amount with is_extra_amount: true', async () => {
		const user = userEvent.setup();
		renderModal();

		const extraButton = screen.getByRole('button', { name: /Agregar monto extra/i });
		await user.click(extraButton);

		const amountInput = screen.getByLabelText(/Monto en pesos/i);
		await user.type(amountInput, '50000');

		const saveButton = screen.getByRole('button', { name: /Guardar/i });
		await user.click(saveButton);

		await waitFor(() => {
			expect(mockCreateTransaction).toHaveBeenCalledWith(
				expect.objectContaining({
					balance_id: 1,
					amount: 50000,
					is_extra_amount: true,
				})
			);
		});
	});

	it('should show success toast for regular transaction', async () => {
		const user = userEvent.setup();
		renderModal();

		const transactionButton = screen.getByRole('button', { name: /Agregar transacción/i });
		await user.click(transactionButton);

		const amountInput = screen.getByLabelText(/Monto en pesos/i);
		await user.type(amountInput, '50000');

		const saveButton = screen.getByRole('button', { name: /Guardar/i });
		await user.click(saveButton);

		await waitFor(() => {
			expect(mockToast).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Transacción creada',
					description: 'La transacción se ha creado exitosamente.',
				})
			);
		});
	});

	it('should show success toast for extra amount', async () => {
		const user = userEvent.setup();
		renderModal();

		const extraButton = screen.getByRole('button', { name: /Agregar monto extra/i });
		await user.click(extraButton);

		const amountInput = screen.getByLabelText(/Monto en pesos/i);
		await user.type(amountInput, '50000');

		const saveButton = screen.getByRole('button', { name: /Guardar/i });
		await user.click(saveButton);

		await waitFor(() => {
			expect(mockToast).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Monto extra creado',
					description: 'El monto extra se ha creado exitosamente.',
				})
			);
		});
	});

	it('should show error toast for regular transaction on failure', async () => {
		mockCreateTransaction.mockResolvedValueOnce({
			data: null,
			error: { message: 'DB error' },
		});
		mockTranslateError.mockReturnValueOnce('DB error');

		const user = userEvent.setup();
		renderModal();

		const transactionButton = screen.getByRole('button', { name: /Agregar transacción/i });
		await user.click(transactionButton);

		const amountInput = screen.getByLabelText(/Monto en pesos/i);
		await user.type(amountInput, '50000');

		const saveButton = screen.getByRole('button', { name: /Guardar/i });
		await user.click(saveButton);

		await waitFor(() => {
			expect(mockToast).toHaveBeenCalledWith(
				expect.objectContaining({
					variant: 'destructive',
					title: 'Error al crear transacción',
				})
			);
		});
	});

	it('should show error toast for extra amount on failure', async () => {
		mockCreateTransaction.mockResolvedValueOnce({
			data: null,
			error: { message: 'DB error' },
		});
		mockTranslateError.mockReturnValueOnce('DB error');

		const user = userEvent.setup();
		renderModal();

		const extraButton = screen.getByRole('button', { name: /Agregar monto extra/i });
		await user.click(extraButton);

		const amountInput = screen.getByLabelText(/Monto en pesos/i);
		await user.type(amountInput, '50000');

		const saveButton = screen.getByRole('button', { name: /Guardar/i });
		await user.click(saveButton);

		await waitFor(() => {
			expect(mockToast).toHaveBeenCalledWith(
				expect.objectContaining({
					variant: 'destructive',
					title: 'Error al crear monto extra',
				})
			);
		});
	});

	it('should not save if balance is null', async () => {
		render(
			<BalanceDetailsModal
				balance={null}
				isOpen={true}
				onOpenChange={jest.fn()}
				onTransactionCreated={jest.fn()}
			/>
		);

		expect(mockCreateTransaction).not.toHaveBeenCalled();
	});

	it('should not save if transactionAmount is empty', async () => {
		const user = userEvent.setup();
		render(
			<BalanceDetailsModal
				balance={mockBalance}
				isOpen={true}
				onOpenChange={jest.fn()}
				onTransactionCreated={jest.fn()}
			/>
		);

		const transactionButton = screen.getByRole('button', { name: /Agregar transacción/i });
		await user.click(transactionButton);

		const saveButton = screen.getByRole('button', { name: /Guardar/i });
		await user.click(saveButton);

		expect(mockCreateTransaction).not.toHaveBeenCalled();
	});
});
