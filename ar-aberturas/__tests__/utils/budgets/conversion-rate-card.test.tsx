import { render, screen } from '@testing-library/react';
import { ConversionRateCard } from '@/utils/budgets/conversion-rate-card';

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: { value: number }) => <div data-testid="progress">{value}</div>,
}));

describe('ConversionRateCard', () => {
  it('renders conversion data when totals are available', () => {
    render(<ConversionRateCard conversionRate={40} totalBudgets={10} totalSales={4} />);

    expect(screen.getByText('Tasa de concreción')).toBeInTheDocument();
    expect(screen.getByText('40.0%')).toBeInTheDocument();
    expect(screen.getByText('4 de 10 presupuestos concretados')).toBeInTheDocument();
  });

  it('renders custom title and label', () => {
    render(
      <ConversionRateCard
        conversionRate={25}
        totalBudgets={8}
        totalSales={2}
        title="Tasa de concrecion Aluminio"
        label="Presupuestos -> Vendidos"
      />
    );

    expect(screen.getByText('Tasa de concrecion Aluminio')).toBeInTheDocument();
    expect(screen.getByText('Presupuestos -> Vendidos')).toBeInTheDocument();
    expect(screen.getByText('25.0%')).toBeInTheDocument();
  });

  it('shows no-data state when there are no budgets', () => {
    render(<ConversionRateCard conversionRate={0} totalBudgets={0} totalSales={0} />);

    expect(screen.getByText('--')).toBeInTheDocument();
    expect(screen.getByText('Sin datos para calcular')).toBeInTheDocument();
  });
});
