import { render, screen } from '@testing-library/react';
import { ClaimsStats } from '@/utils/claims/claim-stats';
import { Claim } from '@/lib/claims/claims';

const mockClaims: Claim[] = [
	{
		id: '1',
		client_name: 'Test Client 1',
		description: 'Test claim 1',
		resolved: false,
		daily: false,
		date: '2024-01-01',
		created_at: '2024-01-01',
	},
	{
		id: '2',
		client_name: 'Test Client 2',
		description: 'Test claim 2',
		resolved: true,
		daily: false,
		date: '2024-01-02',
		created_at: '2024-01-02',
		resolution_date: '2024-01-05',
	},
	{
		id: '3',
		client_name: 'Test Client 3',
		description: 'Daily activity',
		resolved: false,
		daily: true,
		date: '2024-01-03',
		created_at: '2024-01-03',
	},
	{
		id: '4',
		client_name: 'Test Client 4',
		description: 'Daily activity 2',
		resolved: true,
		daily: true,
		date: '2024-01-04',
		created_at: '2024-01-04',
		resolution_date: '2024-01-06',
	},
];

describe('ClaimsStats', () => {
	it('renders total claims count when filterType is "todos"', () => {
		render(<ClaimsStats claims={mockClaims} filterType="todos" />);

		expect(screen.getByText('Total reclamos')).toBeInTheDocument();
		expect(screen.getByText('2')).toBeInTheDocument(); // 2 claims (not daily)
	});

	it('renders total daily activities count when filterType is "diario"', () => {
		render(<ClaimsStats claims={mockClaims} filterType="diario" />);

		expect(screen.getByText('Total actividades diarias')).toBeInTheDocument();
		expect(screen.getByText('2')).toBeInTheDocument(); // 2 daily activities
	});

	it('renders pending and resolved counts when filterType is not "diario"', () => {
		render(<ClaimsStats claims={mockClaims} filterType="todos" />);

		expect(screen.getByText('Pendientes')).toBeInTheDocument();
		expect(screen.getByText('Resueltos')).toBeInTheDocument();
        expect(screen.getAllByText('1')).toHaveLength(2);
	});

	it('does not render pending and resolved counts when filterType is "diario"', () => {
		render(<ClaimsStats claims={mockClaims} filterType="diario" />);

		expect(screen.queryByText('Pendientes')).not.toBeInTheDocument();
		expect(screen.queryByText('Resueltos')).not.toBeInTheDocument();
	});

	it('handles empty claims array', () => {
		render(<ClaimsStats claims={[]} filterType="todos" />);

		expect(screen.getByText('Total reclamos')).toBeInTheDocument();
        expect(screen.getAllByText('0')).toHaveLength(3);
	});

	it('handles all claims resolved', () => {
        const resolvedClaims = mockClaims.map((claim) => ({ ...claim, resolved: true }));
        render(<ClaimsStats claims={resolvedClaims} filterType="todos" />);
        
        expect(screen.getByText('Total reclamos')).toBeInTheDocument();
        expect(screen.getAllByText('2')).toHaveLength(2);
        expect(screen.getByText('Pendientes')).toBeInTheDocument();
        expect(screen.getByText('Resueltos')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument(); // 0 pending claims
    });
});
