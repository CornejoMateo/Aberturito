import { fireEvent, render, screen } from '@testing-library/react';
import { AverageTicketCard } from '@/utils/budgets/average-ticket-card';

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: { value: number }) => <div data-testid="progress">{value}</div>,
}));

const baseProps = {
  loading: false,
  ticketValue: 15000,
  ticketLabel: 'Sold budgets',
  ticketType: 'sold' as const,
  ticketTypes: [
    { id: 'sold', description: 'Sold budgets', label: '' },
    { id: 'chosen', description: 'Chosen budgets', label: ''},
    { id: 'total', description: 'All budgets', label: ''},
  ] as const,
  onPrevTicket: jest.fn(),
  onNextTicket: jest.fn(),
  onSelectTicket: jest.fn(),
};

describe('AverageTicketCard', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders ticket info and computed value', () => {
    render(<AverageTicketCard {...baseProps} />);

    expect(screen.getByText('Ticket promedio')).toBeInTheDocument();
    expect(screen.getByText('Sold budgets')).toBeInTheDocument();
    expect(screen.getByText('$15k')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('calls previous and next handlers', () => {
    render(<AverageTicketCard {...baseProps} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);

    expect(baseProps.onPrevTicket).toHaveBeenCalledTimes(1);
    expect(baseProps.onNextTicket).toHaveBeenCalledTimes(1);
  });

  it('calls onSelectTicket when indicators are clicked', () => {
    render(<AverageTicketCard {...baseProps} />);

    const indicatorButtons = screen.getAllByRole('button').slice(2);
    fireEvent.click(indicatorButtons[1]);

    expect(baseProps.onSelectTicket).toHaveBeenCalledWith('chosen');
  });

  it('shows loading state when loading is true', () => {
    render(<AverageTicketCard {...baseProps} loading={true} />);

    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });
});
