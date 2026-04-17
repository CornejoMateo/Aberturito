import { render, screen } from '@testing-library/react';
import { BudgetManagement } from '@/components/business/budget-management';

jest.mock('@/hooks/budgets/use-budget-metrics', () => ({
  useBudgetMetrics: jest.fn(),
}));

jest.mock('@/utils/budgets/tabs/overview-tab', () => ({
  OverviewTab: () => <div data-testid="overview-tab" />,
}));

jest.mock('@/utils/budgets/tabs/performance-tab', () => ({
  PerformanceTab: () => <div data-testid="performance-tab" />,
}));

jest.mock('@/utils/budgets/tabs/sources-and-materials-tab', () => ({
  SourcesAndMaterialsTab: () => <div data-testid="sources-tab" />,
}));

const hookModule = require('@/hooks/budgets/use-budget-metrics');

describe('BudgetManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    hookModule.useBudgetMetrics.mockReturnValue({
      loading: false,
      metrics: {
        totalClients: 12,
        totalBudgets: 7,
        totalSales: 4,
        totalRevenue: 2500000,
        chosenRevenue: 900000,
        lostRevenue: 120000,
        totalBudgetsRevenue: 3520000,
        soldAverageTicket: 12000,
        chosenAverageTicket: 9000,
        totalAverageTicket: 11000,
      },
    });
  });

  it('renders dashboard header, metric cards and tabs', () => {
    render(<BudgetManagement />);

    expect(screen.getByText('Reportes y métricas')).toBeInTheDocument();
    expect(screen.getByText('Clientes totales')).toBeInTheDocument();
    expect(screen.getByText('Presupuestos')).toBeInTheDocument();
    expect(screen.getByText('Ventas cerradas')).toBeInTheDocument();
    expect(screen.getByText('Facturación')).toBeInTheDocument();

    expect(screen.getByText('12')).toBeInTheDocument(); // totalClients
    expect(screen.getByText('7')).toBeInTheDocument(); // totalBudgets
    expect(screen.getByText('4')).toBeInTheDocument(); // totalSales
    expect(
      screen.getAllByText((_, element) => element?.textContent?.includes('2.500.000') ?? false)
    ).not.toHaveLength(0); // totalRevenue

    expect(screen.getByTestId('overview-tab')).toBeInTheDocument();
    expect(screen.getByTestId('performance-tab')).toBeInTheDocument();
    expect(screen.getByTestId('sources-tab')).toBeInTheDocument();
  });
});
