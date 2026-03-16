import { fireEvent, render, screen } from '@testing-library/react';
import { ChartsCarousel } from '@/utils/budgets/charts-carousel';

jest.mock('recharts', () => ({
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: any) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Legend: () => <div data-testid="legend" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

const props = {
  chartPages: [
    {
      charts: [
        {
          title: 'First chart',
          data: [
            { name: 'A', value: 10, color: '#111' },
            { name: 'B', value: 20, color: '#222' },
          ],
        },
        {
          title: 'Second chart',
          data: [{ name: 'C', value: 30, color: '#333' }],
        },
      ],
    },
  ],
  currentPage: {
    charts: [
      {
        title: 'First chart',
        data: [
          { name: 'A', value: 10, color: '#111' },
          { name: 'B', value: 20, color: '#222' },
        ],
      },
      {
        title: 'Second chart',
        data: [{ name: 'C', value: 30, color: '#333' }],
      },
    ],
  },
  currentPageIndex: 0,
  onPrevChart: jest.fn(),
  onNextChart: jest.fn(),
  onSelectChart: jest.fn(),
  formatChartValue: (value: number) => `${value}`,
  percentageLabels: { A: 33 },
};

describe('ChartsCarousel', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders chart titles and page indicator', () => {
    render(<ChartsCarousel {...props} />);

    expect(screen.getByText('Gráficos (1 / 1)')).toBeInTheDocument();
    expect(screen.getByText('First chart')).toBeInTheDocument();
    expect(screen.getByText('Second chart')).toBeInTheDocument();
    expect(screen.getAllByTestId('pie-chart')).toHaveLength(2);
  });

  it('calls previous and next handlers', () => {
    render(<ChartsCarousel {...props} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);

    expect(props.onPrevChart).toHaveBeenCalledTimes(1);
    expect(props.onNextChart).toHaveBeenCalledTimes(1);
  });

  it('renders empty-state message when chart has no data', () => {
    const emptyProps = {
      ...props,
      currentPage: {
        charts: [{ title: 'Empty chart', data: [] }],
      },
    };

    render(<ChartsCarousel {...emptyProps} />);

    expect(screen.getByText('Sin datos disponibles')).toBeInTheDocument();
  });
});
