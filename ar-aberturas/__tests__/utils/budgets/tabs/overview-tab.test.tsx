import { render, screen } from '@testing-library/react';
import { OverviewTab } from '@/utils/budgets/tabs/overview-tab';

jest.mock('@/components/ui/tabs', () => ({
  TabsContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/utils/budgets/charts-carousel', () => ({
  ChartsCarousel: () => <div data-testid="charts-carousel" />,
}));

jest.mock('@/utils/budgets/conversion-rate-card', () => ({
  ConversionRateCard: () => <div data-testid="conversion-rate-card" />,
}));

jest.mock('@/utils/budgets/average-ticket-card', () => ({
  AverageTicketCard: () => <div data-testid="average-ticket-card" />,
}));

describe('OverviewTab', () => {
  it('renders overview section and child cards', () => {
    const chartPages = [{ charts: [] }];

    render(
      <OverviewTab
        metrics={{ totalSales: 2, totalBudgets: 4, clientsWithBudget: 3, totalClients: 6, totalRevenue: 1000, soldAverageTicket: 200 } as any}
        loading={false}
        chartPages={chartPages}
        chartPage={0}
        ticketType="sold"
        ticketTypes={[{ id: 'sold', description: 'Sold' }] as any}
        onPrevChart={jest.fn()}
        onNextChart={jest.fn()}
        onSelectChart={jest.fn()}
        onPrevTicket={jest.fn()}
        onNextTicket={jest.fn()}
        onSelectTicket={jest.fn()}
        formatChartValue={(v) => `${v}`}
        getCurrentTicketValue={() => 10}
        getCurrentTicketLabel={() => 'Sold'}
      />
    );

    expect(screen.getByText('Resumen de ventas')).toBeInTheDocument();
    expect(screen.getByTestId('charts-carousel')).toBeInTheDocument();
    expect(screen.getByTestId('conversion-rate-card')).toBeInTheDocument();
    expect(screen.getByTestId('average-ticket-card')).toBeInTheDocument();
  });
});
