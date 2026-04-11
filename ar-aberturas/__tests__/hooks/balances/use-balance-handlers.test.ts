import { renderHook, act } from '@testing-library/react';
import { useBalanceHandlers } from '@/hooks/balances/use-balance-handlers';
import { deleteBalance } from '@/lib/works/balances';
import { BalanceWithTotals } from '@/utils/balances/client-balances';
import { toast } from '@/components/ui/use-toast';
import { translateError } from '@/lib/error-translator';

jest.mock('@/lib/works/balances', () => ({
	deleteBalance: jest.fn(),
}));

jest.mock('@/components/ui/use-toast', () => ({
	toast: jest.fn(),
}));

jest.mock('@/lib/error-translator', () => ({
	translateError: jest.fn(),
}));

const mockDeleteBalance = deleteBalance as jest.MockedFunction<typeof deleteBalance>;
const mockToast = toast as jest.MockedFunction<typeof toast>;
const mockTranslateError = translateError as jest.MockedFunction<typeof translateError>;

describe('useBalanceHandlers', () => {
	const mockRefresh = jest.fn();
	const mockOnBalanceDeleted = jest.fn();

	const mockBalance: BalanceWithTotals = {
		id: '1',
		client_id: 'client-1',
		budget_id: 'budget-1',
		start_date: '2024-01-01',
		contract_date_usd: 1000,
		usd_current: 1100,
		notes: [],
		created_at: '2024-01-01',
		budget: {
			id: 'budget-1',
			created_at: '2024-01-01',
			amount_ars: 500000,
			amount_usd: 5000,
			folder_budget: {
				id: 'folder-1',
				work: {
					locality: 'Buenos Aires',
					address: 'Test Street 123',
				},
			},
		},
		totalPaid: 100000,
		totalPaidUSD: 900,
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockTranslateError.mockImplementation((error: unknown) => {
			if (error && typeof error === 'object' && 'message' in error) {
				return String((error as { message?: unknown }).message ?? '');
			}
			return '';
		});
	});

	describe('State Management', () => {
		it('should initialize with default state', () => {
			const { result } = renderHook(() =>
				useBalanceHandlers({
					onRefresh: mockRefresh,
				})
			);

			expect(result.current.selectedBalance).toBeNull();
			expect(result.current.isDetailsModalOpen).toBe(false);
			expect(result.current.balanceToDelete).toBeNull();
			expect(result.current.isDollarUpdateModalOpen).toBe(false);
			expect(result.current.balanceToUpdate).toBeNull();
		});

		it('should open details modal with selected balance', () => {
			const { result } = renderHook(() =>
				useBalanceHandlers({
					onRefresh: mockRefresh,
				})
			);

			act(() => {
				result.current.openDetailsModal(mockBalance);
			});

			expect(result.current.selectedBalance).toEqual(mockBalance);
			expect(result.current.isDetailsModalOpen).toBe(true);
		});

		it('should open delete dialog with balance to delete', () => {
			const { result } = renderHook(() =>
				useBalanceHandlers({
					onRefresh: mockRefresh,
				})
			);

			act(() => {
				result.current.openDeleteDialog(mockBalance);
			});

			expect(result.current.balanceToDelete).toEqual(mockBalance);
			expect(result.current.isDeleteDialogOpen).toBe(true);
		});

		it('should open dollar update modal with balance to update', () => {
			const { result } = renderHook(() =>
				useBalanceHandlers({
					onRefresh: mockRefresh,
				})
			);

			act(() => {
				result.current.openDollarUpdateModal(mockBalance);
			});

			expect(result.current.balanceToUpdate).toEqual(mockBalance);
			expect(result.current.isDollarUpdateModalOpen).toBe(true);
		});

		it('should toggle details modal open/close', () => {
			const { result } = renderHook(() =>
				useBalanceHandlers({
					onRefresh: mockRefresh,
				})
			);

			act(() => {
				result.current.openDetailsModal(mockBalance);
			});

			expect(result.current.isDetailsModalOpen).toBe(true);

			act(() => {
				result.current.setIsDetailsModalOpen(false);
			});

			expect(result.current.isDetailsModalOpen).toBe(false);
		});
	});

	describe('handleDeleteBalance', () => {
		it('should delete balance and refresh', async () => {
			mockDeleteBalance.mockResolvedValue({ error: null, data: null });

			const { result } = renderHook(() =>
				useBalanceHandlers({
					onRefresh: mockRefresh,
					onBalanceDeleted: mockOnBalanceDeleted,
				})
			);

			act(() => {
				result.current.openDeleteDialog(mockBalance);
			});

			await act(async () => {
				await result.current.handleDeleteBalance();
			});

			expect(mockDeleteBalance).toHaveBeenCalledWith('1');
			expect(mockRefresh).toHaveBeenCalled();
			expect(mockOnBalanceDeleted).toHaveBeenCalled();
			expect(result.current.isDeleteDialogOpen).toBe(false);
			expect(result.current.balanceToDelete).toBeNull();
		});

		it('should handle delete error gracefully', async () => {
			mockDeleteBalance.mockResolvedValue({ error: { message: 'Delete failed' }, data: null });

			const { result } = renderHook(() =>
				useBalanceHandlers({
					onRefresh: mockRefresh,
				})
			);

			act(() => {
				result.current.openDeleteDialog(mockBalance);
			});

			await act(async () => {
				await result.current.handleDeleteBalance();
			});

			expect(mockToast).toHaveBeenCalledWith({
				variant: 'destructive',
				title: 'Error al eliminar saldo',
				description: 'Delete failed',
			});
			expect(mockRefresh).not.toHaveBeenCalled();
		});

		it('should not delete if no balance selected', async () => {
			const { result } = renderHook(() =>
				useBalanceHandlers({
					onRefresh: mockRefresh,
				})
			);

			await act(async () => {
				await result.current.handleDeleteBalance();
			});

			expect(mockDeleteBalance).not.toHaveBeenCalled();
			expect(mockRefresh).not.toHaveBeenCalled();
		});
	});

	describe('handleDollarUpdate', () => {
		it('should update dollar rate and refresh', async () => {
			global.fetch = jest.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ success: true }),
				} as Response)
			);

			const { result } = renderHook(() =>
				useBalanceHandlers({
					onRefresh: mockRefresh,
				})
			);

			act(() => {
				result.current.openDollarUpdateModal(mockBalance);
			});

			await act(async () => {
				await result.current.handleDollarUpdate(1200);
			});

			expect(global.fetch).toHaveBeenCalledWith('/api/dollar-rate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					balanceId: '1',
					newUsdRate: 1200,
				}),
			});
			expect(mockRefresh).toHaveBeenCalled();
		});

		it('should handle dollar update API error', async () => {
			global.fetch = jest.fn(() =>
				Promise.resolve({
					ok: false,
					json: () => Promise.resolve({ error: 'API error' }),
				} as Response)
			);

			const { result } = renderHook(() =>
				useBalanceHandlers({
					onRefresh: mockRefresh,
				})
			);

			act(() => {
				result.current.openDollarUpdateModal(mockBalance);
			});

			await expect(
				act(async () => {
					await result.current.handleDollarUpdate(1200);
				})
			).rejects.toThrow();

			expect(mockRefresh).not.toHaveBeenCalled();
		});

		it('should not update if no balance selected', async () => {
			const { result } = renderHook(() =>
				useBalanceHandlers({
					onRefresh: mockRefresh,
				})
			);

			await act(async () => {
				await result.current.handleDollarUpdate(1200);
			});

			expect(global.fetch).not.toHaveBeenCalled();
		});
	});

	describe('handleBalanceUpdate', () => {
		it('should call refresh', () => {
			const { result } = renderHook(() =>
				useBalanceHandlers({
					onRefresh: mockRefresh,
				})
			);

			act(() => {
				result.current.handleBalanceUpdate();
			});

			expect(mockRefresh).toHaveBeenCalled();
		});
	});
});
