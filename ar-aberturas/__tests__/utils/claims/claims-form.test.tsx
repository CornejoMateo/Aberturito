import { render, screen, fireEvent } from '@testing-library/react';
import { ClaimsForm } from '@/utils/claims/claims-form';

describe('ClaimsForm', () => {
	const mockOnInputChange = jest.fn();
	const mockOnSelectChange = jest.fn();
	const mockOnSubmit = jest.fn();
	const mockOnCancel = jest.fn();

	const clients = [
		{ id: 'c1', name: 'Juan', last_name: 'Perez', phone_number: '123' },
	];

	const works = [
		{ id: 'w1', locality: 'Cordoba', address: 'Calle 123', client_id: 'c1' },
	];

	const defaultFormData = {
		client_id: null,
		selected_work_id: '',
		work_zone: '',
		work_locality: '',
		work_address: '',
		alum_pvc: '',
		attend: '',
		description: '',
		date: '2024-01-01',
	};

	const renderForm = (overrides: Record<string, unknown> = {}) =>
		render(
			<ClaimsForm
				formData={{ ...defaultFormData, ...overrides }}
				isLoading={false}
				onInputChange={mockOnInputChange}
				onSelectChange={mockOnSelectChange}
				onSubmit={mockOnSubmit}
				onCancel={mockOnCancel}
				clients={clients as any}
				works={works as any}
				isLoadingWorks={false}
			/>
		);

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders main fields', () => {
		renderForm();

		expect(screen.getByText('Cliente')).toBeInTheDocument();
		expect(screen.getByLabelText(/obra del cliente/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/localidad de obra/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/zona de obra/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
		expect(screen.getByText('Tipo')).toBeInTheDocument();
		expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
	});

	it('calls onInputChange when text input changes', () => {
		renderForm();
		const localityInput = screen.getByLabelText(/localidad de obra/i);
		fireEvent.change(localityInput, { target: { value: 'Nueva Cordoba' } });
		expect(mockOnInputChange).toHaveBeenCalled();
	});

	it('calls onSelectChange for work selector', () => {
		renderForm({ client_id: 'c1' });
		const workSelect = screen.getByLabelText(/obra del cliente/i);
		fireEvent.click(workSelect);
		const noneOptions = screen.getAllByText('Ninguna');
		fireEvent.click(noneOptions[noneOptions.length - 1]);
		expect(mockOnSelectChange).toHaveBeenCalledWith('selected_work_id', '__none__');
	});

	it('calls onSubmit when form is submitted', () => {
		renderForm();
		const form = screen.getByRole('button', { name: /guardar/i }).closest('form');
		if (!form) throw new Error('Form not found');
		fireEvent.submit(form);
		expect(mockOnSubmit).toHaveBeenCalled();
	});

	it('calls onCancel when cancel button is clicked', () => {
		renderForm();
		fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
		expect(mockOnCancel).toHaveBeenCalled();
	});

	it('shows atendido field only in edit mode', () => {
		const claimToEdit = {
			id: '1',
			description: 'Test',
			daily: false,
			resolved: false,
			date: '2024-01-01',
			created_at: '2024-01-01',
		};

		render(
			<ClaimsForm
				formData={defaultFormData}
				isLoading={false}
				claimToEdit={claimToEdit as any}
				onInputChange={mockOnInputChange}
				onSelectChange={mockOnSelectChange}
				onSubmit={mockOnSubmit}
				onCancel={mockOnCancel}
				clients={clients as any}
				works={works as any}
				isLoadingWorks={false}
			/>
		);

		expect(screen.getByLabelText(/atendido por/i)).toBeInTheDocument();
	});

	it('does not show atendido field in create mode', () => {
		renderForm();
		expect(screen.queryByLabelText(/atendido por/i)).not.toBeInTheDocument();
	});

	it('disables submit button when loading', () => {
		render(
			<ClaimsForm
				formData={defaultFormData}
				isLoading={true}
				onInputChange={mockOnInputChange}
				onSelectChange={mockOnSelectChange}
				onSubmit={mockOnSubmit}
				onCancel={mockOnCancel}
				clients={clients as any}
				works={works as any}
				isLoadingWorks={false}
			/>
		);

		expect(screen.getByRole('button', { name: /guardando/i })).toBeDisabled();
	});
});
