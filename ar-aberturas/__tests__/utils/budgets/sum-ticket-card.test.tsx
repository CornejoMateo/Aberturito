import { render, screen } from '@testing-library/react';
import { SumTicketCard } from '@/utils/budgets/sum-ticket-card';

describe('SumTicketCard', () => {
	const baseProps = {
		loading: false,
		ticketValue: 2500000,
		ticketLabel: 'Presupuestos vendidos',
		ticketType: 'sold' as const,
		ticketTypes: [
			{ id: 'sold', description: 'Presupuestos vendidos', label: '' },
			{ id: 'chosen', description: 'Presupuestos elegidos', label: '' },
			{ id: 'total', description: 'Todos los presupuestos', label: '' },
			{ id: 'lost', description: 'Presupuestos perdidos', label: '' },
		] as const,
		onPrevTicket: jest.fn(),
		onNextTicket: jest.fn(),
		onSelectTicket: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders a totals card similar to the average ticket card', () => {
		render(<SumTicketCard {...baseProps} />);

		expect(screen.getByText('Ticket total')).toBeInTheDocument();
		expect(screen.getByText('Presupuestos vendidos')).toBeInTheDocument();
		expect(
			screen.getAllByText((_, element) => element?.textContent?.includes('2.500.000') ?? false)
		).not.toHaveLength(0); // totalRevenue
		expect(screen.getByText('1 / 4')).toBeInTheDocument();
	});

	it('calls navigation handlers', () => {
		render(<SumTicketCard {...baseProps} />);

		const buttons = screen.getAllByRole('button');
		buttons[0].click();
		buttons[1].click();

		expect(baseProps.onPrevTicket).toHaveBeenCalledTimes(1);
		expect(baseProps.onNextTicket).toHaveBeenCalledTimes(1);
	});
});
