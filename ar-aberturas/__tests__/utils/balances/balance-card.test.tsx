import { render, screen, fireEvent } from '@testing-library/react';
import { BalanceCard } from '@/utils/balances/balance-card';
import { BalanceSummary } from '@/helpers/balances/balance-calculations';
import { BalanceWithBudget } from '@/lib/works/balances';

jest.mock('@/helpers/format-prices.tsx/formats', () => ({
	formatCurrency: (value: number) => `$${value.toLocaleString('es-AR')}`,
	formatCurrencyUSD: (value: number) => `USD ${value.toFixed(2)}`,
}));

describe('BalanceCard', () => {
	const mockBalance: BalanceWithBudget & { totalPaid?: number; totalPaidUSD?: number } = {
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

	const mockSummary: BalanceSummary = {
		budgetArsInitial: 500000,
		budgetUsd: 5000,
		budgetArsCurrent: 5500000,
		totalPaidArs: 100000,
		totalPaidUsd: 900,
		remainingArs: 5400000,
		remainingUsd: 4100,
		progressPercentage: 2,
		isDebtor: true,
	};

	const mockCardClick = jest.fn();
	const mockDollarUpdate = jest.fn();
	const mockDeleteClick = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('Rendering', () => {
		it('should render balance card with work information', () => {
			render(
				<BalanceCard
					balance={mockBalance}
					summary={mockSummary}
					onCardClick={mockCardClick}
					onDollarUpdate={mockDollarUpdate}
					onDeleteClick={mockDeleteClick}
				/>
			);

			expect(screen.getByText('Buenos Aires')).toBeInTheDocument();
			expect(screen.getByText('Test Street 123')).toBeInTheDocument();
		});

		it('should render debtor status when isDebtor is true', () => {
			render(
				<BalanceCard
					balance={mockBalance}
					summary={mockSummary}
					onCardClick={mockCardClick}
					onDollarUpdate={mockDollarUpdate}
					onDeleteClick={mockDeleteClick}
				/>
			);

			expect(screen.getByText('Deudor')).toBeInTheDocument();
		});

		it('should render creditor status when isDebtor is false', () => {
			const creditorSummary = { ...mockSummary, isDebtor: false };

			render(
				<BalanceCard
					balance={mockBalance}
					summary={creditorSummary}
					onCardClick={mockCardClick}
					onDollarUpdate={mockDollarUpdate}
					onDeleteClick={mockDeleteClick}
				/>
			);

			expect(screen.getByText('Acreedor')).toBeInTheDocument();
		});

		it('should render budget, paid, and balance amounts', () => {
			render(
				<BalanceCard
					balance={mockBalance}
					summary={mockSummary}
					onCardClick={mockCardClick}
					onDollarUpdate={mockDollarUpdate}
					onDeleteClick={mockDeleteClick}
				/>
			);

			expect(screen.getByText(/Presupuesto/)).toBeInTheDocument();
			expect(screen.getByText(/Entregado/)).toBeInTheDocument();
			expect(screen.getByText(/Saldo/)).toBeInTheDocument();
		});

		it('should render progress bar when budgetUsd > 0', () => {
			render(
				<BalanceCard
					balance={mockBalance}
					summary={mockSummary}
					onCardClick={mockCardClick}
					onDollarUpdate={mockDollarUpdate}
					onDeleteClick={mockDeleteClick}
				/>
			);

			expect(screen.getByText('Progreso')).toBeInTheDocument();
			expect(screen.getByText('2%')).toBeInTheDocument();
		});

		it('should not render progress bar when budgetUsd is 0', () => {
			const noUsdSummary = { ...mockSummary, budgetUsd: 0 };

			render(
				<BalanceCard
					balance={mockBalance}
					summary={noUsdSummary}
					onCardClick={mockCardClick}
					onDollarUpdate={mockDollarUpdate}
					onDeleteClick={mockDeleteClick}
				/>
			);

			expect(screen.queryByText('Progreso')).not.toBeInTheDocument();
		});

		it('should render no budget assigned when work is missing', () => {
			const balanceWithoutWork: BalanceWithBudget & { totalPaid?: number; totalPaidUSD?: number } = {
				...mockBalance,
				budget: null,
			};
			render(
				<BalanceCard
					balance={balanceWithoutWork}
					summary={mockSummary}
					onCardClick={mockCardClick}
					onDollarUpdate={mockDollarUpdate}
					onDeleteClick={mockDeleteClick}
				/>
			);

			expect(screen.getByText('Sin presupuesto asignado')).toBeInTheDocument();
		});
	});

	describe('Event Handlers', () => {
		it('should call onCardClick when card is clicked', () => {
			render(
				<BalanceCard
					balance={mockBalance}
					summary={mockSummary}
					onCardClick={mockCardClick}
					onDollarUpdate={mockDollarUpdate}
					onDeleteClick={mockDeleteClick}
				/>
			);

			const cardContent = screen.getByText('Buenos Aires').closest(
				'[class*="shadow"]'
			) as HTMLElement;

			fireEvent.click(cardContent);

			expect(mockCardClick).toHaveBeenCalled();
		});

		it('should call onDollarUpdate when dollar update button is clicked', () => {
			render(
				<BalanceCard
					balance={mockBalance}
					summary={mockSummary}
					onCardClick={mockCardClick}
					onDollarUpdate={mockDollarUpdate}
					onDeleteClick={mockDeleteClick}
				/>
			);

			const dollarButton = screen.getByTitle('Actualizar precios con dólar actual');

			fireEvent.click(dollarButton);

			expect(mockDollarUpdate).toHaveBeenCalled();
		});

		it('should call onDeleteClick when delete button is clicked', () => {
			render(
				<BalanceCard
					balance={mockBalance}
					summary={mockSummary}
					onCardClick={mockCardClick}
					onDollarUpdate={mockDollarUpdate}
					onDeleteClick={mockDeleteClick}
				/>
			);

			const buttons = screen.getAllByRole('button');
			const deleteButton = buttons[buttons.length - 1]; // Last button is delete

			fireEvent.click(deleteButton);

			expect(mockDeleteClick).toHaveBeenCalled();
		});

		it('should prevent card click when dollar update button is clicked', () => {
			render(
				<BalanceCard
					balance={mockBalance}
					summary={mockSummary}
					onCardClick={mockCardClick}
					onDollarUpdate={mockDollarUpdate}
					onDeleteClick={mockDeleteClick}
				/>
			);

			const dollarButton = screen.getByTitle('Actualizar precios con dólar actual');

			fireEvent.click(dollarButton);

			expect(mockDollarUpdate).toHaveBeenCalledTimes(1);
			expect(mockCardClick).not.toHaveBeenCalled();
		});

		it('should prevent card click when delete button is clicked', () => {
			render(
				<BalanceCard
					balance={mockBalance}
					summary={mockSummary}
					onCardClick={mockCardClick}
					onDollarUpdate={mockDollarUpdate}
					onDeleteClick={mockDeleteClick}
				/>
			);

			const buttons = screen.getAllByRole('button');
			const deleteButton = buttons[buttons.length - 1];

			fireEvent.click(deleteButton);

			expect(mockDeleteClick).toHaveBeenCalledTimes(1);
			expect(mockCardClick).not.toHaveBeenCalled();
		});
	});

	describe('Currency Formatting', () => {
		it('should display USD currency for budget amount when budgetUsd > 0', () => {
			render(
				<BalanceCard
					balance={mockBalance}
					summary={mockSummary}
					onCardClick={mockCardClick}
					onDollarUpdate={mockDollarUpdate}
					onDeleteClick={mockDeleteClick}
				/>
			);

			expect(screen.getAllByText(/USD/).length).toBeGreaterThan(0);
		});

		it('should display ARS currency for amounts', () => {
			render(
				<BalanceCard
					balance={mockBalance}
					summary={mockSummary}
					onCardClick={mockCardClick}
					onDollarUpdate={mockDollarUpdate}
					onDeleteClick={mockDeleteClick}
				/>
			);

			// Checking for formatted numbers with ARS formatting
			const formattedElements = screen.getAllByText(/\$/);
			expect(formattedElements.length).toBeGreaterThan(0);
		});
	});

	describe('Edge Cases', () => {
		it('should handle balance without totalPaid', () => {
			const balanceWithoutTotalPaid = { ...mockBalance, totalPaid: undefined };

			render(
				<BalanceCard
					balance={balanceWithoutTotalPaid}
					summary={mockSummary}
					onCardClick={mockCardClick}
					onDollarUpdate={mockDollarUpdate}
					onDeleteClick={mockDeleteClick}
				/>
			);

			expect(screen.getByText(/Entregado/)).toBeInTheDocument();
		});

		it('should display zero budget ARS when budget is zero', () => {
			const zeroSummary = { ...mockSummary, budgetArsCurrent: 0 };

			render(
				<BalanceCard
					balance={mockBalance}
					summary={zeroSummary}
					onCardClick={mockCardClick}
					onDollarUpdate={mockDollarUpdate}
					onDeleteClick={mockDeleteClick}
				/>
			);

			expect(screen.getByText(/Presupuesto/)).toBeInTheDocument();
		});

		it('should handle 100% progress correctly', () => {
			const fullProgressSummary = { ...mockSummary, progressPercentage: 100 };

			render(
				<BalanceCard
					balance={mockBalance}
					summary={fullProgressSummary}
					onCardClick={mockCardClick}
					onDollarUpdate={mockDollarUpdate}
					onDeleteClick={mockDeleteClick}
				/>
			);

			expect(screen.getByText('100%')).toBeInTheDocument();
		});
	});
});
