import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DollarUpdateModal } from '@/components/ui/dollar-update-modal';

const mockOnOpenChange = jest.fn();
const mockOnUpdateConfirmed = jest.fn();

const mockBalance = {
	id: '1',
	contract_date_usd: 1000,
	usd_current: 1100,
	balance_amount_ars: 1200000,
	balance_amount_usd: 1000,
	totalPaid: 200000,
	totalPaidUSD: 180,
	remaining: 1000000,
	remainingUSD: 820,
} as any;

describe('DollarUpdateModal', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('fetches and renders current dollar rate when opened', async () => {
		global.fetch = jest.fn(() =>
			Promise.resolve({
				ok: true,
				json: () =>
					Promise.resolve({
						success: true,
						data: {
							rate: 1200,
							buyRate: 1180,
							sellRate: 1200,
							name: 'Oficial',
							currency: 'ARS',
							lastUpdated: '2026-04-29T12:00:00.000Z',
						},
					}),
			} as Response)
		);

		render(
			<DollarUpdateModal
				isOpen={true}
				onOpenChange={mockOnOpenChange}
				balance={mockBalance}
				onUpdateConfirmed={mockOnUpdateConfirmed}
			/>
		);

		expect(await screen.findByText('Dólar Oficial')).toBeInTheDocument();
		expect(global.fetch).toHaveBeenCalledWith('/api/dollar-rate');
	});

	it('shows error when rate fetch fails', async () => {
		global.fetch = jest.fn(() =>
			Promise.resolve({
				ok: false,
				json: () => Promise.resolve({}),
			} as Response)
		);

		render(
			<DollarUpdateModal
				isOpen={true}
				onOpenChange={mockOnOpenChange}
				balance={mockBalance}
				onUpdateConfirmed={mockOnUpdateConfirmed}
			/>
		);

		expect(await screen.findByText('No se pudo obtener el tipo de cambio')).toBeInTheDocument();
	});

	it('sends update and triggers callbacks on confirm', async () => {
		global.fetch = jest
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					success: true,
					data: {
						rate: 1200,
						buyRate: 1180,
						sellRate: 1200,
						name: 'Oficial',
						currency: 'ARS',
						lastUpdated: '2026-04-29T12:00:00.000Z',
					},
				}),
			} as Response)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true }),
			} as Response);

		render(
			<DollarUpdateModal
				isOpen={true}
				onOpenChange={mockOnOpenChange}
				balance={mockBalance}
				onUpdateConfirmed={mockOnUpdateConfirmed}
			/>
		);

		await screen.findByText('Dólar Oficial');

		await userEvent.click(screen.getByRole('button', { name: 'Confirmar Actualización' }));

		await waitFor(() => {
			expect(global.fetch).toHaveBeenNthCalledWith(
				2,
				'/api/dollar-rate',
				expect.objectContaining({
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						balanceId: 1,
						newUsdRate: 1200,
						newBalanceAmountARS: 1200000,
					}),
				})
			);
		});

		expect(mockOnUpdateConfirmed).toHaveBeenCalledWith(1200, 1200000);
		expect(mockOnOpenChange).toHaveBeenCalledWith(false);
	});

	it('shows error when update fails', async () => {
		global.fetch = jest
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					success: true,
					data: {
						rate: 1200,
						buyRate: 1180,
						sellRate: 1200,
						name: 'Oficial',
						currency: 'ARS',
						lastUpdated: '2026-04-29T12:00:00.000Z',
					},
				}),
			} as Response)
			.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ error: 'API error' }),
			} as Response);

		render(
			<DollarUpdateModal
				isOpen={true}
				onOpenChange={mockOnOpenChange}
				balance={mockBalance}
				onUpdateConfirmed={mockOnUpdateConfirmed}
			/>
		);

		await screen.findByText('Dólar Oficial');

		await userEvent.click(screen.getByRole('button', { name: 'Confirmar Actualización' }));

		expect(await screen.findByText('API error')).toBeInTheDocument();
		expect(mockOnUpdateConfirmed).not.toHaveBeenCalled();
	});
});