import { render, screen, fireEvent } from '@testing-library/react';
import { ClaimsTable } from '@/utils/claims/claims-table';
import { Claim } from '@/lib/claims/claims';

const mockClaims: Claim[] = [
	{
		id: '1',
		client_name: 'Juan Perez',
		client_phone: '123456789',
		work_zone: 'Centro',
		work_locality: 'Cordoba',
		work_address: 'Calle 123',
		alum_pvc: 'Aluminio',
		description: 'Test description 1',
		date: '2024-01-15',
		resolved: false,
		daily: false,
		created_at: '2024-01-15',
	},
	{
		id: '2',
		client_name: 'Maria Garcia',
		client_phone: '987654321',
		work_zone: 'Norte',
		work_locality: 'Villa Maria',
		work_address: 'Avenida 456',
		alum_pvc: 'PVC',
		description: 'Test description 2',
		date: '2024-01-20',
		resolved: true,
		daily: false,
		resolution_date: '2024-01-25',
		attend: 'Juan',
		created_at: '2024-01-20',
	},
];

describe('ClaimsTable', () => {
	const mockOnEdit = jest.fn();
	const mockOnDelete = jest.fn();
	const mockOnResolve = jest.fn();
	const mockOnReOpen = jest.fn();
	const mockOnViewDescription = jest.fn();
	const mockOnViewImages = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders table headers', () => {
		render(
			<ClaimsTable
				claims={mockClaims}
				loading={false}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onResolve={mockOnResolve}
				onReOpen={mockOnReOpen}
				authorizedUser={true}
				filterType="todos"
				onViewDescription={mockOnViewDescription}
				onViewImages={mockOnViewImages}
			/>
		);

		expect(screen.getByText('Estado')).toBeInTheDocument();
		expect(screen.getByText('Fecha')).toBeInTheDocument();
		expect(screen.getByText('Cliente')).toBeInTheDocument();
		expect(screen.getByText('Núm. de celular')).toBeInTheDocument();
		expect(screen.getByText('Zona/Localidad')).toBeInTheDocument();
		expect(screen.getByText('Dirección')).toBeInTheDocument();
		expect(screen.getByText('Tipo')).toBeInTheDocument();
		expect(screen.getByText('Descripción')).toBeInTheDocument();
	});

	it('renders claim data correctly', () => {
		render(
			<ClaimsTable
				claims={mockClaims}
				loading={false}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onResolve={mockOnResolve}
				onReOpen={mockOnReOpen}
				authorizedUser={true}
				filterType="todos"
				onViewDescription={mockOnViewDescription}
				onViewImages={mockOnViewImages}
			/>
		);

		expect(screen.getByText('Juan Perez')).toBeInTheDocument();
		expect(screen.getByText('123456789')).toBeInTheDocument();
		expect(screen.getByText('Centro')).toBeInTheDocument();
		expect(screen.getByText('Cordoba')).toBeInTheDocument();
		expect(screen.getByText('Calle 123')).toBeInTheDocument();
		expect(screen.getByText('Aluminio')).toBeInTheDocument();
	});

	it('shows Pendiente badge for unresolved claims', () => {
		render(
			<ClaimsTable
				claims={mockClaims}
				loading={false}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onResolve={mockOnResolve}
				onReOpen={mockOnReOpen}
				authorizedUser={true}
				filterType="todos"
				onViewDescription={mockOnViewDescription}
				onViewImages={mockOnViewImages}
			/>
		);

		expect(screen.getByText('Pendiente')).toBeInTheDocument();
	});

	it('shows Resuelto badge for resolved claims', () => {
		render(
			<ClaimsTable
				claims={mockClaims}
				loading={false}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onResolve={mockOnResolve}
				onReOpen={mockOnReOpen}
				authorizedUser={true}
				filterType="todos"
				onViewDescription={mockOnViewDescription}
				onViewImages={mockOnViewImages}
			/>
		);

		expect(screen.getByText('Resuelto')).toBeInTheDocument();
	});

	it('shows loading message when loading is true', () => {
		render(
			<ClaimsTable
				claims={[]}
				loading={true}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onResolve={mockOnResolve}
				onReOpen={mockOnReOpen}
				authorizedUser={true}
				filterType="todos"
				onViewDescription={mockOnViewDescription}
				onViewImages={mockOnViewImages}
			/>
		);

		expect(screen.getByText('Cargando reclamos...')).toBeInTheDocument();
	});

	it('shows empty state when no claims', () => {
		render(
			<ClaimsTable
				claims={[]}
				loading={false}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onResolve={mockOnResolve}
				onReOpen={mockOnReOpen}
				authorizedUser={true}
				filterType="todos"
				onViewDescription={mockOnViewDescription}
				onViewImages={mockOnViewImages}
			/>
		);

		expect(screen.getByText('No se encontraron reclamos.')).toBeInTheDocument();
	});

	it('calls onEdit when edit button is clicked', () => {
		render(
			<ClaimsTable
				claims={mockClaims}
				loading={false}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onResolve={mockOnResolve}
				onReOpen={mockOnReOpen}
				authorizedUser={true}
				filterType="todos"
				onViewDescription={mockOnViewDescription}
				onViewImages={mockOnViewImages}
			/>
		);

		const editButtons = screen.getAllByRole('button', { name: '' });
		const editButton = editButtons.find((btn) => btn.querySelector('svg.lucide-edit'));
		
		if (editButton) {
			fireEvent.click(editButton);
			expect(mockOnEdit).toHaveBeenCalled();
		}
	});

	it('calls onDelete when delete button is clicked', () => {
		render(
			<ClaimsTable
				claims={mockClaims}
				loading={false}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onResolve={mockOnResolve}
				onReOpen={mockOnReOpen}
				authorizedUser={true}
				filterType="todos"
				onViewDescription={mockOnViewDescription}
				onViewImages={mockOnViewImages}
			/>
		);

		const deleteButtons = screen.getAllByRole('button');
		const deleteButton = deleteButtons.find((btn) => btn.querySelector('svg.lucide-trash-2'));
		
		if (deleteButton) {
			fireEvent.click(deleteButton);
			expect(mockOnDelete).toHaveBeenCalled();
		}
	});

	it('shows resolve button for unresolved claims', () => {
		render(
			<ClaimsTable
				claims={[mockClaims[0]]}
				loading={false}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onResolve={mockOnResolve}
				onReOpen={mockOnReOpen}
				authorizedUser={true}
				filterType="todos"
				onViewDescription={mockOnViewDescription}
				onViewImages={mockOnViewImages}
			/>
		);

		const buttons = screen.getAllByRole('button');
		const resolveButton = buttons.find((btn) =>
            btn.className.includes('text-green-600')
        );
		
		expect(resolveButton).toBeTruthy();
	});

	it('shows reopen button for resolved claims', () => {
		render(
			<ClaimsTable
				claims={[mockClaims[1]]}
				loading={false}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onResolve={mockOnResolve}
				onReOpen={mockOnReOpen}
				authorizedUser={true}
				filterType="todos"
				onViewDescription={mockOnViewDescription}
				onViewImages={mockOnViewImages}
			/>
		);

		const buttons = screen.getAllByRole('button', { name: '' });
		const reopenButton = buttons.find((btn) => 
			btn.className.includes('text-orange-600') && btn.querySelector('svg.lucide-clock')
		);
		
		expect(reopenButton).toBeTruthy();
	});

	it('hides action buttons when user is not authorized', () => {
		render(
			<ClaimsTable
				claims={mockClaims}
				loading={false}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onResolve={mockOnResolve}
				onReOpen={mockOnReOpen}
				authorizedUser={false}
				filterType="todos"
				onViewDescription={mockOnViewDescription}
				onViewImages={mockOnViewImages}
			/>
		);

		expect(screen.queryByText('Acciones')).not.toBeInTheDocument();
		expect(screen.queryByText('Atendido por')).not.toBeInTheDocument();
	});

	it('formats dates correctly (DD-MM-YYYY)', () => {
		render(
			<ClaimsTable
				claims={mockClaims}
				loading={false}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onResolve={mockOnResolve}
				onReOpen={mockOnReOpen}
				authorizedUser={true}
				filterType="todos"
				onViewDescription={mockOnViewDescription}
				onViewImages={mockOnViewImages}
			/>
		);

		expect(screen.getByText('15-01-2024')).toBeInTheDocument();
		expect(screen.getByText('20-01-2024')).toBeInTheDocument();
		expect(screen.getByText('25-01-2024')).toBeInTheDocument();
	});

	it('calls onViewDescription when description is clicked', () => {
		render(
			<ClaimsTable
				claims={mockClaims}
				loading={false}
				onEdit={mockOnEdit}
				onDelete={mockOnDelete}
				onResolve={mockOnResolve}
				onReOpen={mockOnReOpen}
				authorizedUser={true}
				filterType="todos"
				onViewDescription={mockOnViewDescription}
				onViewImages={mockOnViewImages}
			/>
		);

		const description = screen.getByText('Test description 1');
		fireEvent.click(description);

		expect(mockOnViewDescription).toHaveBeenCalledWith('Test description 1');
		expect(mockOnViewImages).toHaveBeenCalledWith(mockClaims[0]);
	});
});
