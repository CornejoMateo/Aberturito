import { fireEvent, render, screen } from '@testing-library/react';
import { PerformanceChartsCarousel } from '@/utils/budgets/performance-charts-carousel';

jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: ({ dataKey }: any) => <div data-testid={`line-${dataKey}`} />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}));

describe('PerformanceChartsCarousel', () => {
  const metrics = {
    totalBudgets: 10,
    budgetsByMonth: [{ month: 'Ene', presupuestos: 10, vendidos: 4, perdidos: 2 }],
    budgetsByAmount: [{ amountRange: '$ 0 - 10.000', count: 2 }],
    budgetsByAmountChosen: [{ amountRange: '$ 0 - 10.000', count: 1 }],
    budgetsByAmountSold: [{ amountRange: '$ 0 - 10.000', count: 1 }],
    budgetsByAmountLost: [{ amountRange: '$ 0 - 10.000', count: 0 }],
    budgetsByLocation: [{ location: 'Córdoba', count: 3 }],
  } as any;

  it('renders first chart by default', () => {
    render(<PerformanceChartsCarousel metrics={metrics} />);

    expect(screen.getByText('Presupuestos realizados por mes')).toBeInTheDocument();
    expect(screen.getByText('Gráfico 1 de 3')).toBeInTheDocument();
    expect(screen.getByTestId('line-perdidos')).toBeInTheDocument();
  });

  it('navigates to next chart and previous chart', () => {
    render(<PerformanceChartsCarousel metrics={metrics} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(screen.getByText('Promedio de presupuestos por día')).toBeInTheDocument();

    fireEvent.click(buttons[1]);
    expect(screen.getByText('Cantidad de presupuestos por localidad')).toBeInTheDocument();

    fireEvent.click(buttons[0]);
    expect(screen.getByText('Promedio de presupuestos por día')).toBeInTheDocument();
  });

  it('renders amount range charts carousel with 4 charts', () => {
    render(<PerformanceChartsCarousel metrics={metrics} />);

    expect(screen.getByText('Presupuestos totales por monto')).toBeInTheDocument();
  });

  it('shows empty state when totals are zero', () => {
    render(<PerformanceChartsCarousel metrics={{ ...metrics, totalBudgets: 0, budgetsByAmount: [] }} />);

    const emptyStates = screen.getAllByText('Sin datos disponibles');
    expect(emptyStates.length).toBeGreaterThan(0);
  });

});
