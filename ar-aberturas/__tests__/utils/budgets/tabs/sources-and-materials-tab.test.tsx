import { render, screen } from '@testing-library/react';
import { SourcesAndMaterialsTab } from '@/utils/budgets/tabs/sources-and-materials-tab';

jest.mock('@/components/ui/tabs', () => ({
  TabsContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('recharts', () => ({
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: any) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Legend: () => <div data-testid="legend" />,
  Tooltip: () => <div data-testid="tooltip" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
}));

describe('SourcesAndMaterialsTab', () => {
  const metrics = {
    clientsByContactMethod: [{ method: 'whatsapp', count: 5 }],
    budgetsByMaterial: [{ material: 'Aluminio', count: 8 }],
    soldBudgetsByMaterial: [{ material: 'PVC', count: 4 }],
  } as any;

  it('renders all chart sections and stats cards', () => {
    render(<SourcesAndMaterialsTab metrics={metrics} loading={false} />);

    expect(screen.getByText('Distribución de presupuestos por material')).toBeInTheDocument();
    expect(screen.getByText('Distribución de presupuestos vendidos por material')).toBeInTheDocument();
    expect(screen.getByText('Clientes por medio de contacto')).toBeInTheDocument();
    expect(screen.getByText('Material más presupuestado')).toBeInTheDocument();
    expect(screen.getByText('Material más vendido')).toBeInTheDocument();
    expect(screen.getByText('8 presupuestos')).toBeInTheDocument();
    expect(screen.getByText('4 presupuestos vendidos')).toBeInTheDocument();
    expect(screen.getByText('Aluminio')).toBeInTheDocument();
    expect(screen.getByText('PVC')).toBeInTheDocument();
  });

  it('renders empty-state messages when lists are empty', () => {
    render(
      <SourcesAndMaterialsTab
        metrics={{
          clientsByContactMethod: [],
          budgetsByMaterial: [],
          soldBudgetsByMaterial: [],
        } as any}
        loading={false}
      />
    );

    expect(screen.getAllByText('Sin datos disponibles').length).toBeGreaterThan(0);
    expect(screen.getAllByText('--').length).toBeGreaterThan(0);
  });

});
