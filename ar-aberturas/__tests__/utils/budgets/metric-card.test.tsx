import { render, screen } from '@testing-library/react';
import { MetricCard } from '@/utils/budgets/metric-card';

const MockIcon = () => <svg data-testid="mock-icon" />;

describe('MetricCard', () => {
  it('renders value and available status', () => {
    render(<MetricCard label="Clientes" value={12} icon={MockIcon as any} status={true} />);

    expect(screen.getByText('Clientes')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Datos disponibles')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('renders loading placeholders', () => {
    render(<MetricCard label="Clientes" value={12} icon={MockIcon as any} loading={true} />);

    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('renders custom status text', () => {
    render(<MetricCard label="Clientes" value={12} icon={MockIcon as any} status="Custom status" />);

    expect(screen.getByText('Custom status')).toBeInTheDocument();
  });
});
