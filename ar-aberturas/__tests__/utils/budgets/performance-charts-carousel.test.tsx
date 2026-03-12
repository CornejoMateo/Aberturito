import { fireEvent, render, screen } from '@testing-library/react';
import { PerformanceChartsCarousel } from '@/utils/budgets/performance-charts-carousel';

jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
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
    budgetsByMonth: [{ month: 'Ene', presupuestos: 10, vendidos: 4 }],
    budgetsByLocation: [{ location: 'Córdoba', count: 3 }],
  } as any;

  it('renders first chart by default', () => {
    render(<PerformanceChartsCarousel metrics={metrics} />);

    expect(screen.getByText('Presupuestos realizados por mes')).toBeInTheDocument();
    expect(screen.getByText('Gráfico 1 de 3')).toBeInTheDocument();
  });

  it('navigates to next chart and previous chart', () => {
    render(<PerformanceChartsCarousel metrics={metrics} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(screen.getByText('Promedio de presupuestos por día')).toBeInTheDocument();

    fireEvent.click(buttons[0]);
    expect(screen.getByText('Presupuestos realizados por mes')).toBeInTheDocument();
  });

  it('shows empty state when totals are zero', () => {
    render(<PerformanceChartsCarousel metrics={{ ...metrics, totalBudgets: 0, budgetsByLocation: [] }} />);

    expect(screen.getByText('Sin datos disponibles')).toBeInTheDocument();
  });
});
