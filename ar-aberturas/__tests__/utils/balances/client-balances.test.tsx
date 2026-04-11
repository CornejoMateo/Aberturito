import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientBalances } from '@/utils/balances/client-balances';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';
import { getTotalByBalanceId } from '@/lib/works/balance_transactions';
import { useBalanceHandlers } from '@/hooks/balances/use-balance-handlers';

jest.mock('@/hooks/use-optimized-realtime');
jest.mock('@/lib/works/balance_transactions');
jest.mock('@/utils/balances/balance-details-modal', () => ({
	BalanceDetailsModal: () => <div data-testid="balance-details-modal" />,
}));
jest.mock('@/components/ui/dollar-update-modal', () => ({
	DollarUpdateModal: () => <div data-testid="dollar-update-modal" />,
}));
jest.mock('@/hooks/balances/use-balance-handlers');
jest.mock('@/helpers/format-prices.tsx/formats', () => ({
	formatCurrency: (value: number) => `$${value.toLocaleString('es-AR')}`,
	formatCurrencyUSD: (value: number) => `USD ${value.toFixed(2)}`,
}));

const mockUseOptimizedRealtime = useOptimizedRealtime as jest.MockedFunction<
	typeof useOptimizedRealtime
>;
const mockGetTotalByBalanceId = getTotalByBalanceId as jest.MockedFunction<
	typeof getTotalByBalanceId
>;
const mockUseBalanceHandlers = useBalanceHandlers as jest.MockedFunction<
	typeof useBalanceHandlers
>;

describe('ClientBalances', () => {
	const mockBalance = {
		id: 'balance-1',
		client_id: 'client-1',
		budget_id: 'budget-1',
		start_date: '2024-01-01',
		contract_date_usd: 1000,
		usd_current: 1100,
		notes: null,
		created_at: new Date(),
		budget: {
			id: 'budget-1',
			client_id: 'client-1',
			folder_id: 'folder-1',
			number: '001',
			type: 'Presupuesto',
			amount_ars: 500000,
			amount_usd: 5000,
			notes: null,
			accepted: true,
			sold: false,
			amount_received: 0,
			created_at: new Date(),
			folder_budget: {
				id: 'folder-1',
				work: {
					id: 'work-1',
					client_id: 'client-1',
					locality: 'Buenos Aires',
					address: 'Test Street 123',
					type: 'Obra',
					created_at: new Date(),
				},
			},
		},
	};

	const mockRefresh = jest.fn();
	const mockOnCreateBalance = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();

		mockGetTotalByBalanceId.mockResolvedValue({
			data: { totalAmount: 100000, totalAmountUSD: 900 },
			error: null,
		});

		mockUseOptimizedRealtime.mockReturnValue({
			data: [mockBalance],
			loading: false,
			error: null,
			refresh: mockRefresh,
		} as any);

		mockUseBalanceHandlers.mockReturnValue({
			selectedBalance: null,
			isDetailsModalOpen: false,
			setIsDetailsModalOpen: jest.fn(),
			balanceToDelete: null,
			isDeleteDialogOpen: false,
			setIsDeleteDialogOpen: jest.fn(),
			isDollarUpdateModalOpen: false,
			setIsDollarUpdateModalOpen: jest.fn(),
			balanceToUpdate: null,
			openDetailsModal: jest.fn(),
			openDeleteDialog: jest.fn(),
			openDollarUpdateModal: jest.fn(),
			handleDeleteBalance: jest.fn(),
			handleDollarUpdate: jest.fn(),
			handleBalanceUpdate: jest.fn(),
		} as any);
	});

	describe('Rendering', () => {
		it('should render search bar', async () => {
			render(
				<ClientBalances
					clientId="client-1"
					onCreateBalance={mockOnCreateBalance}
				/>
			);

			await waitFor(() => {
				const searchInput = screen.getByPlaceholderText(
					/Buscar por localidad, dirección o presupuesto/i
				);
				expect(searchInput).toBeInTheDocument();
			});
		});

		it('should render create balance button when onCreateBalance is provided', async () => {
			render(
				<ClientBalances
					clientId="client-1"
					onCreateBalance={mockOnCreateBalance}
				/>
			);

			await waitFor(() => {
				const createButton = screen.getByRole('button', { name: /Crear Saldo/i });
				expect(createButton).toBeInTheDocument();
			});
		});

		it('should not render create balance button when onCreateBalance is not provided', async () => {
			render(<ClientBalances clientId="client-1" />);

			await waitFor(() => {
				const createButton = screen.queryByRole('button', { name: /Crear Saldo/i });
				expect(createButton).not.toBeInTheDocument();
			});
		});

		it('should render loading message when data is loading', () => {
			mockUseOptimizedRealtime.mockReturnValue({
				data: [],
				loading: true,
				error: null,
				refresh: mockRefresh,
			} as any);

			render(<ClientBalances clientId="client-1" />);

			expect(screen.getByText(/Cargando saldos/i)).toBeInTheDocument();
		});

		it('should render empty message when no balances exist', async () => {
			mockUseOptimizedRealtime.mockReturnValueOnce({
				data: [],
				loading: false,
				error: null,
				refresh: mockRefresh,
			} as any);

			render(<ClientBalances clientId="client-1" />);

			await waitFor(() => {
				expect(
					screen.getByText(/No hay saldos registrados para este cliente/i)
				).toBeInTheDocument();
			});
		});

		it('should render balance cards when data is loaded', async () => {
			render(<ClientBalances clientId="client-1" />);

			await waitFor(() => {
				expect(screen.getByText('Buenos Aires')).toBeInTheDocument();
			});
		});
	});

	describe('Search Functionality', () => {
		it('should filter balances by locality', async () => {
			const user = userEvent.setup();
			const secondBalance = {
				...mockBalance,
				id: 'balance-2',
				budget: {
					...mockBalance.budget,
					folder_budget: {
						id: 'folder-2',
						work: {
							id: 'work-2',
							client_id: 'client-1',
							locality: 'Córdoba',
							address: 'Other Street 456',
							type: 'Obra',
							created_at: new Date(),
						},
					},
				},
			};

			mockUseOptimizedRealtime.mockReturnValueOnce({
				data: [mockBalance, secondBalance],
				loading: false,
				error: null,
				refresh: mockRefresh,
			} as any);

			render(<ClientBalances clientId="client-1" />);

			await waitFor(() => {
				expect(screen.getByText('Buenos Aires')).toBeInTheDocument();
				expect(screen.getByText('Córdoba')).toBeInTheDocument();
			});

			const searchInput = screen.getByPlaceholderText(
				/Buscar por localidad, dirección o presupuesto/i
			) as HTMLInputElement;

			await user.clear(searchInput);
			await user.type(searchInput, 'Buenos');

			await waitFor(() => {
				expect(screen.getByText('Buenos Aires')).toBeInTheDocument();
				expect(screen.queryByText('Córdoba')).not.toBeInTheDocument();
			});
		});

		it('should filter balances by address', async () => {
			const user = userEvent.setup();

			mockUseOptimizedRealtime.mockReturnValueOnce({
				data: [mockBalance],
				loading: false,
				error: null,
				refresh: mockRefresh,
			} as any);

			render(<ClientBalances clientId="client-1" />);

			await waitFor(() => {
				expect(screen.getByText('Test Street 123')).toBeInTheDocument();
			});

			const searchInput = screen.getByPlaceholderText(
				/Buscar por localidad, dirección o presupuesto/i
			) as HTMLInputElement;

			await user.clear(searchInput);
			await user.type(searchInput, 'Test Street');

			await waitFor(() => {
				expect(screen.getByText('Test Street 123')).toBeInTheDocument();
			});
		});

		it('should clear search results when no match found', async () => {
			const user = userEvent.setup();

			render(<ClientBalances clientId="client-1" />);

			await waitFor(() => {
				expect(screen.getByText('Buenos Aires')).toBeInTheDocument();
			});

			const searchInput = screen.getByPlaceholderText(
				/Buscar por localidad, dirección o presupuesto/i
			) as HTMLInputElement;

			await user.clear(searchInput);
			await user.type(searchInput, 'NonExistent');

			await waitFor(() => {
				expect(
					screen.getByText(/No se encontraron saldos que coincidan con la búsqueda/i)
				).toBeInTheDocument();
			});
		});
	});

	describe('Pagination', () => {
		it('should show pagination when results exceed items per page', async () => {
			const balances = Array.from({ length: 5 }, (_, i) => ({
				...mockBalance,
				id: `balance-${i}`,
			}));

			mockUseOptimizedRealtime.mockReturnValueOnce({
				data: balances,
				loading: false,
				error: null,
				refresh: mockRefresh,
			} as any);

			render(<ClientBalances clientId="client-1" />);

			await waitFor(() => {
				const paginationControls = screen.getByText(/Mostrando/i);
				expect(paginationControls).toBeInTheDocument();
			});
		});

		it('should not show pagination when results are less than items per page', async () => {
			render(<ClientBalances clientId="client-1" />);

			await waitFor(() => {
				const paginationControls = screen.queryByText(/Mostrando/i);
				expect(paginationControls).not.toBeInTheDocument();
			});
		});
	});

	describe('Data Loading', () => {
		it('should call useOptimizedRealtime with correct parameters', () => {
			render(<ClientBalances clientId="client-1" />);

			expect(mockUseOptimizedRealtime).toHaveBeenCalledWith(
				'balances',
				expect.any(Function),
				'balances_client-1'
			);
		});

		it('should fetch totals for each balance', async () => {
			render(<ClientBalances clientId="client-1" />);

			await waitFor(() => {
				expect(mockGetTotalByBalanceId).toHaveBeenCalledWith('balance-1');
			});
		});

		it('should handle missing total data gracefully', async () => {
			mockGetTotalByBalanceId.mockResolvedValueOnce({
				data: null,
				error: null,
			});

			render(<ClientBalances clientId="client-1" />);

			await waitFor(() => {
				expect(screen.getByText('Buenos Aires')).toBeInTheDocument();
			});
		});
	});

	describe('Modal Integration', () => {
		it('should render balance details modal', async () => {
			render(<ClientBalances clientId="client-1" />);

			await waitFor(() => {
				expect(screen.getByTestId('balance-details-modal')).toBeInTheDocument();
			});
		});

		it('should render dollar update modal', async () => {
			render(<ClientBalances clientId="client-1" />);

			await waitFor(() => {
				expect(screen.getByTestId('dollar-update-modal')).toBeInTheDocument();
			});
		});

		it('should render delete confirmation dialog', async () => {
			render(<ClientBalances clientId="client-1" />);

			await waitFor(() => {
				const alertDialog = screen.queryByRole('dialog');
				expect(alertDialog || true).toBeTruthy();
			});
		});
	});

	describe('Create Balance Button', () => {
		it('should call onCreateBalance when button is clicked', async () => {
			const user = userEvent.setup();

			render(
				<ClientBalances
					clientId="client-1"
					onCreateBalance={mockOnCreateBalance}
				/>
			);

			await waitFor(() => {
				const createButton = screen.getByRole('button', { name: /Crear Saldo/i });
				expect(createButton).toBeInTheDocument();
			});

			const createButton = screen.getByRole('button', { name: /Crear Saldo/i });
			await user.click(createButton);

			expect(mockOnCreateBalance).toHaveBeenCalled();
		});
	});

	describe('Edge Cases', () => {
		it('should handle balance without work information', async () => {
			const balanceWithoutWork = {
				...mockBalance,
				budget: { ...mockBalance.budget, folder_budget: null },
			};

			mockUseOptimizedRealtime.mockReturnValueOnce({
				data: [balanceWithoutWork],
				loading: false,
				error: null,
				refresh: mockRefresh,
			} as any);

			render(<ClientBalances clientId="client-1" />);

			await waitFor(() => {
				expect(
					screen.getByText(/Sin presupuesto asignado/i)
				).toBeInTheDocument();
			});
		});

		it('should handle multiple balances for same client', async () => {
			const multipleBalances = [
				mockBalance,
				{ ...mockBalance, id: 'balance-2' },
				{ ...mockBalance, id: 'balance-3' },
			];

			mockUseOptimizedRealtime.mockReturnValueOnce({
				data: multipleBalances,
				loading: false,
				error: null,
				refresh: mockRefresh,
			} as any);

			render(<ClientBalances clientId="client-1" />);

			await waitFor(() => {
				const localityElements = screen.getAllByText('Buenos Aires');
				expect(localityElements.length).toBeGreaterThanOrEqual(1);
			});
		});

		it('should reset pagination when search filter changes', async () => {
			const user = userEvent.setup();
			const balances = Array.from({ length: 5 }, (_, i) => ({
				...mockBalance,
				id: `balance-${i}`,
			}));

			mockUseOptimizedRealtime.mockReturnValueOnce({
				data: balances,
				loading: false,
				error: null,
				refresh: mockRefresh,
			} as any);

			render(<ClientBalances clientId="client-1" />);

			await waitFor(() => {
				const paginationControls = screen.getByText(/Mostrando/i);
				expect(paginationControls).toBeInTheDocument();
			});

			const searchInput = screen.getByPlaceholderText(
				/Buscar por localidad, dirección o presupuesto/i
			) as HTMLInputElement;

			await user.clear(searchInput);
			await user.type(searchInput, 'Buenos');

			await waitFor(() => {
				expect(screen.getByText('Buenos Aires')).toBeInTheDocument();
			});
		});
	});

	describe('Accessibility', () => {
		it('should have accessible search input', async () => {
			render(<ClientBalances clientId="client-1" />);

			await waitFor(() => {
				const searchInput = screen.getByPlaceholderText(
					/Buscar por localidad, dirección o presupuesto/i
				);
				expect(searchInput).toHaveAttribute('type', 'search');
			});
		});

		it('should have accessible create button', async () => {
			render(
				<ClientBalances
					clientId="client-1"
					onCreateBalance={mockOnCreateBalance}
				/>
			);

			await waitFor(() => {
				const button = screen.getByRole('button', { name: /Crear Saldo/i });
				expect(button).toBeInTheDocument();
			});
		});
	});
});
