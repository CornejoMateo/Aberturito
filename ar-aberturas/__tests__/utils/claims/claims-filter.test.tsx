import { render, screen, fireEvent } from '@testing-library/react';
import { ClaimsFilter } from '@/utils/claims/claims-filter';

describe('ClaimsFilter', () => {
	const mockSetFilterType = jest.fn();
	const mockSetSearchTerm = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders all filter buttons', () => {
		render(
			<ClaimsFilter
				filterType="todos"
				setFilterType={mockSetFilterType}
				searchTerm=""
				setSearchTerm={mockSetSearchTerm}
			/>
		);

		expect(screen.getByText('Todos')).toBeInTheDocument();
		expect(screen.getByText('Pendientes')).toBeInTheDocument();
		expect(screen.getByText('Resueltos')).toBeInTheDocument();
		expect(screen.getByText('Actividades diarias')).toBeInTheDocument();
	});

	it('renders search input with placeholder', () => {
		render(
			<ClaimsFilter
				filterType="todos"
				setFilterType={mockSetFilterType}
				searchTerm=""
				setSearchTerm={mockSetSearchTerm}
			/>
		);

		const searchInput = screen.getByPlaceholderText(
			/buscar por descripción, cliente, zona, localidad, dirección/i
		);
		expect(searchInput).toBeInTheDocument();
	});

	it('calls setFilterType when filter button is clicked', () => {
		render(
			<ClaimsFilter
				filterType="todos"
				setFilterType={mockSetFilterType}
				searchTerm=""
				setSearchTerm={mockSetSearchTerm}
			/>
		);

		const pendientesButton = screen.getByText('Pendientes');
		fireEvent.click(pendientesButton);

		expect(mockSetFilterType).toHaveBeenCalledWith('pendientes');
	});

	it('calls setSearchTerm when search input changes', () => {
		render(
			<ClaimsFilter
				filterType="todos"
				setFilterType={mockSetFilterType}
				searchTerm=""
				setSearchTerm={mockSetSearchTerm}
			/>
		);

		const searchInput = screen.getByPlaceholderText(
			/buscar por descripción, cliente, zona, localidad, dirección/i
		);
		fireEvent.change(searchInput, { target: { value: 'test search' } });

		expect(mockSetSearchTerm).toHaveBeenCalledWith('test search');
	});

	it('displays current search term in input', () => {
		render(
			<ClaimsFilter
				filterType="todos"
				setFilterType={mockSetFilterType}
				searchTerm="existing search"
				setSearchTerm={mockSetSearchTerm}
			/>
		);

		const searchInput = screen.getByDisplayValue('existing search');
		expect(searchInput).toBeInTheDocument();
	});

	it('highlights active filter button', () => {
		const { rerender } = render(
			<ClaimsFilter
				filterType="pendientes"
				setFilterType={mockSetFilterType}
				searchTerm=""
				setSearchTerm={mockSetSearchTerm}
			/>
		);

		const pendientesButton = screen.getByText('Pendientes');
		expect(pendientesButton).toHaveClass('bg-orange-500');

		rerender(
			<ClaimsFilter
				filterType="resueltos"
				setFilterType={mockSetFilterType}
				searchTerm=""
				setSearchTerm={mockSetSearchTerm}
			/>
		);

		const resueltosButton = screen.getByText('Resueltos');
		expect(resueltosButton).toHaveClass('bg-green-500');
	});

	it('allows changing filter types multiple times', () => {
		render(
			<ClaimsFilter
				filterType="todos"
				setFilterType={mockSetFilterType}
				searchTerm=""
				setSearchTerm={mockSetSearchTerm}
			/>
		);

		fireEvent.click(screen.getByText('Pendientes'));
		expect(mockSetFilterType).toHaveBeenCalledWith('pendientes');

		fireEvent.click(screen.getByText('Actividades diarias'));
		expect(mockSetFilterType).toHaveBeenCalledWith('diario');

		expect(mockSetFilterType).toHaveBeenCalledTimes(2);
	});
});
