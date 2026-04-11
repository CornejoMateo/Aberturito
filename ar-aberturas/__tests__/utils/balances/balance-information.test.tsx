import { render, screen } from '@testing-library/react';
import { BalanceInformation } from '@/utils/balances/balance-information';
import { BalanceSummary } from '@/helpers/balances/balance-calculations';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

jest.mock('@/helpers/format-prices.tsx/formats', () => ({
	formatCurrency: (value: number | null | undefined) =>
		value ? `$${(value || 0).toLocaleString('es-AR')}` : '$0',
	formatCurrencyUSD: (value: number | null | undefined) =>
		value ? `USD ${(value || 0).toFixed(2)}` : 'USD 0.00',
}));

describe('BalanceInformation', () => {
	const mockWork = {
		locality: 'Buenos Aires',
		address: 'Test Street 123',
	};

	const mockSummary: BalanceSummary = {
		budgetArsInitial: 500000,
		budgetUsd: 5000,
		budgetArsCurrent: 550000,
		totalPaidArs: 100000,
		totalPaidUsd: 900,
		remainingArs: 450000,
		remainingUsd: 4100,
		progressPercentage: 18,
		isDebtor: true,
	};

	const defaultProps = {
		work: mockWork,
		startDate: '2024-01-15',
		contractDateUsd: 1000,
		usdCurrent: 1100,
		totalPaid: 100000,
		summary: mockSummary,
		formatDate: (dateStr: string | null | undefined) => {
			if (!dateStr) return '-';
			try {
				const date = new Date(dateStr);
				return format(date, 'PPP', { locale: es });
			} catch {
				return '-';
			}
		},
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

	describe('Rendering', () => {
		it('should render all information sections', () => {
			render(<BalanceInformation {...defaultProps} />);

			expect(screen.getByText(/Obra/i)).toBeInTheDocument();
			expect(screen.getByText(/Fecha de inicio/i)).toBeInTheDocument();
			expect(screen.getByText(/Dolar en fecha contratacion/i)).toBeInTheDocument();
			expect(screen.getByText(/Dolar actual/i)).toBeInTheDocument();
			expect(screen.getByText(/Presupuesto inicial/i)).toBeInTheDocument();
			expect(screen.getByText(/Presupuesto actual/i)).toBeInTheDocument();
			expect(screen.getByText(/Entregado/i)).toBeInTheDocument();
			expect(screen.getByText(/Saldo/i)).toBeInTheDocument();
		});

		it('should render work information', () => {
			render(<BalanceInformation {...defaultProps} />);

			expect(screen.getByText('Buenos Aires')).toBeInTheDocument();
			expect(screen.getByText('Test Street 123')).toBeInTheDocument();
		});

		it('should render budget amounts', () => {
			render(<BalanceInformation {...defaultProps} />);

			expect(screen.getByText('$500.000')).toBeInTheDocument(); // budgetArsInitial
			expect(screen.getByText('$550.000')).toBeInTheDocument(); // budgetArsCurrent
		});

		it('should render payment information', () => {
			render(<BalanceInformation {...defaultProps} />);

			expect(screen.getByText('$100.000')).toBeInTheDocument(); // totalPaid
		});

		it('should render balance remaining', () => {
			render(<BalanceInformation {...defaultProps} />);

			expect(screen.getByText('$450.000')).toBeInTheDocument(); // remainingArs
		});
	});

	describe('Work Information', () => {
		it('should display work locality and address', () => {
			render(<BalanceInformation {...defaultProps} />);

			expect(screen.getByText('Buenos Aires')).toBeInTheDocument();
			expect(screen.getByText('Test Street 123')).toBeInTheDocument();
		});

		it('should display placeholder when work is missing', () => {
			render(
				<BalanceInformation
					{...defaultProps}
					work={null}
					formatDate={formatDate}
				/>
			);

			expect(screen.getByText('Sin obra asignada')).toBeInTheDocument();
		});

		it('should handle partial work information', () => {
			const partialWork = { locality: 'Buenos Aires', address: null };

			render(
				<BalanceInformation
					{...defaultProps}
					work={partialWork}
					formatDate={formatDate}
				/>
			);

			expect(screen.getByText('Buenos Aires')).toBeInTheDocument();
		});
	});

	describe('Date Formatting', () => {
		it('should format start date correctly', () => {
			render(<BalanceInformation {...defaultProps} formatDate={formatDate} />);

			const formattedDate = formatDate('2024-01-15');
			expect(screen.getByText(formattedDate)).toBeInTheDocument();
		});

		it('should display dash when start date is null', () => {
			render(
				<BalanceInformation
					{...defaultProps}
					startDate={null}
					formatDate={formatDate}
				/>
			);

			expect(screen.getAllByText('-').length).toBeGreaterThan(0);
		});

		it('should display dash when start date is undefined', () => {
			render(
				<BalanceInformation
					{...defaultProps}
					startDate={undefined}
					formatDate={formatDate}
				/>
			);

			expect(screen.getAllByText('-').length).toBeGreaterThan(0);
		});
	});

	describe('Currency Display', () => {
		it('should display contract date USD', () => {
			render(<BalanceInformation {...defaultProps} formatDate={formatDate} />);

			expect(screen.getByText('USD 1000.00')).toBeInTheDocument();
		});

		it('should display current USD rate', () => {
			render(<BalanceInformation {...defaultProps} formatDate={formatDate} />);

			expect(screen.getByText('USD 1100.00')).toBeInTheDocument();
		});

		it('should display USD budget amount', () => {
			render(<BalanceInformation {...defaultProps} formatDate={formatDate} />);

			const usdBudgetText = screen.getAllByText('USD 5000.00');
			expect(usdBudgetText.length).toBeGreaterThan(0);
		});

		it('should display USD payment amount', () => {
			render(<BalanceInformation {...defaultProps} formatDate={formatDate} />);

			expect(screen.getByText('USD 90.91')).toBeInTheDocument();
		});

		it('should display USD remaining amount', () => {
			render(<BalanceInformation {...defaultProps} formatDate={formatDate} />);

			expect(screen.getByText('USD 4100.00')).toBeInTheDocument();
		});

		it('should handle null currency values', () => {
			render(
				<BalanceInformation
					{...defaultProps}
					contractDateUsd={null}
					usdCurrent={null}
					formatDate={formatDate}
				/>
			);

			expect(screen.getAllByText('USD 0.00').length).toBeGreaterThanOrEqual(2);
		});
	});

	describe('Budget Calculations', () => {
		it('should display initial budget correctly', () => {
			render(<BalanceInformation {...defaultProps} formatDate={formatDate} />);

			expect(screen.getByText('$500.000')).toBeInTheDocument(); // budgetArsInitial
		});

		it('should display current budget (adjusted by USD rate)', () => {
			render(<BalanceInformation {...defaultProps} formatDate={formatDate} />);

			expect(screen.getByText('$550.000')).toBeInTheDocument(); // budgetArsCurrent
		});

		it('should display both ARS and USD for budget amounts', () => {
			const { container } = render(
				<BalanceInformation {...defaultProps} formatDate={formatDate} />
			);

			const text = container.textContent;
			expect(text).toContain('$500.000');
			expect(text).toContain('$550.000');
			expect(text).toContain('USD 5000.00');
		});
	});

	describe('Balance Summary', () => {
		it('should display total paid amount', () => {
			render(<BalanceInformation {...defaultProps} formatDate={formatDate} />);

			expect(screen.getByText('$100.000')).toBeInTheDocument();
		});

		it('should display remaining balance in ARS', () => {
			render(<BalanceInformation {...defaultProps} formatDate={formatDate} />);

			expect(screen.getByText('$450.000')).toBeInTheDocument();
		});

		it('should display remaining balance in USD conversion', () => {
			render(<BalanceInformation {...defaultProps} formatDate={formatDate} />);

			expect(screen.getByText('USD 4100.00')).toBeInTheDocument();
		});

		it('should handle zero balance', () => {
			const zeroPaidSummary = { ...mockSummary, totalPaidArs: 0 };

			render(
				<BalanceInformation
					{...defaultProps}
					summary={zeroPaidSummary}
					totalPaid={0}
					formatDate={formatDate}
				/>
			);

			expect(screen.getByText('$0')).toBeInTheDocument();
		});

		it('should handle fully paid balance', () => {
			const fullyPaidSummary = {
				...mockSummary,
				totalPaidArs: 550000,
				remainingArs: 0,
				remainingUsd: 0,
			};

			render(
				<BalanceInformation
					{...defaultProps}
					summary={fullyPaidSummary}
					totalPaid={550000}
					formatDate={formatDate}
				/>
			);

			expect(screen.getByText('$0')).toBeInTheDocument();
		});
	});

	describe('Styling and Layout', () => {
		it('should render grid layout container', () => {
			const { container } = render(
				<BalanceInformation {...defaultProps} formatDate={formatDate} />
			);

			const gridContainer = container.querySelector(
				'.grid.grid-cols-2.md\\:grid-cols-4'
			);
			expect(gridContainer).toBeInTheDocument();
		});

		it('should apply muted background styling', () => {
			const { container } = render(
				<BalanceInformation {...defaultProps} formatDate={formatDate} />
			);

			const styledContainer = container.querySelector('.bg-muted\\/50');
			expect(styledContainer).toBeInTheDocument();
		});
	});

	describe('Edge Cases', () => {
		it('should handle very large amounts', () => {
			const largeAmounts = {
				...mockSummary,
				budgetArsInitial: 999999999999,
				budgetArsCurrent: 999999999999,
				totalPaidArs: 999999999999,
				remainingArs: 999999999999,
			};

			render(
				<BalanceInformation
					{...defaultProps}
					summary={largeAmounts}
					totalPaid={999999999999}
					formatDate={formatDate}
				/>
			);

			expect(screen.getAllByText('$999.999.999.999').length).toBeGreaterThanOrEqual(1);
		});

		it('should handle decimal USD amounts', () => {
			render(
				<BalanceInformation
					{...defaultProps}
					contractDateUsd={1000.50}
					usdCurrent={1100.75}
					formatDate={formatDate}
				/>
			);

			expect(screen.getByText('USD 1000.50')).toBeInTheDocument();
			expect(screen.getByText('USD 1100.75')).toBeInTheDocument();
		});

		it('should calculate USD conversion correctly', () => {
			const { container } = render(
				<BalanceInformation
					{...defaultProps}
					usdCurrent={100}
					totalPaid={10000}
					formatDate={formatDate}
				/>
			);

			const text = container.textContent;
			expect(text).toContain('$10.000');
		});
	});

	describe('Accessibility', () => {
		it('should have proper heading structure', () => {
			const { container } = render(
				<BalanceInformation {...defaultProps} formatDate={formatDate} />
			);

			const labels = container.querySelectorAll('p.text-xs.text-muted-foreground');
			expect(labels.length).toBeGreaterThan(0);
		});

		it('should display labels for all sections', () => {
			render(<BalanceInformation {...defaultProps} formatDate={formatDate} />);

			expect(screen.getByText(/Obra/i)).toBeInTheDocument();
			expect(screen.getByText(/Fecha de inicio/i)).toBeInTheDocument();
			expect(screen.getByText(/Dolar en fecha contratacion/i)).toBeInTheDocument();
			expect(screen.getByText(/Dolar actual/i)).toBeInTheDocument();
			expect(screen.getByText(/Presupuesto inicial/i)).toBeInTheDocument();
			expect(screen.getByText(/Presupuesto actual/i)).toBeInTheDocument();
			expect(screen.getByText(/Entregado/i)).toBeInTheDocument();
			expect(screen.getByText(/Saldo/i)).toBeInTheDocument();
		});
	});
});
