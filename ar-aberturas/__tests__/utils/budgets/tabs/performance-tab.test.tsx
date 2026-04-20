import { render, screen } from '@testing-library/react';
import { PerformanceTab } from '@/utils/budgets/tabs/performance-tab';

jest.mock('@/components/ui/tabs', () => ({
	TabsContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/utils/budgets/performance-charts-carousel', () => ({
	PerformanceChartsCarousel: () => <div data-testid="performance-carousel" />,
}));

describe('PerformanceTab', () => {
	it('renders cards with metrics information', () => {
		render(
			<PerformanceTab
				metrics={
					{
						clientsWithBudget: 8,
						totalClients: 10,
						totalSales: 5,
						totalBudgets: 10,
						totalRevenue: 1500000,
					} as any
				}
				loading={false}
			/>
		);

		expect(screen.getByTestId('performance-carousel')).toBeInTheDocument();
		expect(screen.getByText('Clientes con presupuesto')).toBeInTheDocument();
		expect(screen.getByText('Ventas cerradas')).toBeInTheDocument();
		expect(screen.getByText('Facturación total')).toBeInTheDocument();
		expect(screen.getByText('$1.5M')).toBeInTheDocument();
	});

	it('renders no-data placeholders', () => {
		render(
			<PerformanceTab
				metrics={
					{
						clientsWithBudget: 0,
						totalClients: 0,
						totalSales: 0,
						totalBudgets: 0,
						totalRevenue: 0,
					} as any
				}
				loading={false}
			/>
		);

		expect(screen.getAllByText('Sin datos').length).toBeGreaterThan(0);
	});
});
