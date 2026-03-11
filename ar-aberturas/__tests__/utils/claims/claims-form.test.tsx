import { render, screen, fireEvent } from '@testing-library/react';
import { ClaimsForm } from '@/utils/claims/claims-form';

describe('ClaimsForm', () => {
	const mockOnInputChange = jest.fn();
	const mockOnSelectChange = jest.fn();
	const mockOnSubmit = jest.fn();
	const mockOnCancel = jest.fn();

	const defaultFormData = {
		client_name: '',
		client_phone: '',
		work_zone: '',
		work_locality: '',
		work_address: '',
		alum_pvc: '',
		attend: '',
		description: '',
		date: '2024-01-01',
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders all form fields', () => {
		render(
			<ClaimsForm
				formData={defaultFormData}
				isLoading={false}
				onInputChange={mockOnInputChange}
				onSelectChange={mockOnSelectChange}
				onSubmit={mockOnSubmit}
				onCancel={mockOnCancel}
			/>
		);

		expect(screen.getByLabelText(/apellido y nombre del cliente/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/teléfono del cliente/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/localidad de obra/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/zona de obra/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/dirección de obra/i)).toBeInTheDocument();
		expect(screen.getByText('Tipo')).toBeInTheDocument();
		expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
	});

	it('displays "Atendido por" field when editing', () => {
		const claimToEdit = {
			id: '1',
			client_name: 'Test',
			description: 'Test',
			resolved: false,
			daily: false,
			date: '2024-01-01',
			created_at: '2024-01-01',
		};

		render(
			<ClaimsForm
				formData={defaultFormData}
				isLoading={false}
				claimToEdit={claimToEdit}
				onInputChange={mockOnInputChange}
				onSelectChange={mockOnSelectChange}
				onSubmit={mockOnSubmit}
				onCancel={mockOnCancel}
			/>
		);

		expect(screen.getByLabelText(/atendido por/i)).toBeInTheDocument();
	});

	it('does not display "Atendido por" field when creating new claim', () => {
		render(
			<ClaimsForm
				formData={defaultFormData}
				isLoading={false}
				onInputChange={mockOnInputChange}
				onSelectChange={mockOnSelectChange}
				onSubmit={mockOnSubmit}
				onCancel={mockOnCancel}
			/>
		);

		expect(screen.queryByLabelText(/atendido por/i)).not.toBeInTheDocument();
	});

	it('calls onInputChange when text input changes', () => {
		render(
			<ClaimsForm
				formData={defaultFormData}
				isLoading={false}
				onInputChange={mockOnInputChange}
				onSelectChange={mockOnSelectChange}
				onSubmit={mockOnSubmit}
				onCancel={mockOnCancel}
			/>
		);

		const clientNameInput = screen.getByLabelText(/apellido y nombre del cliente/i);
		fireEvent.change(clientNameInput, { target: { value: 'Juan Perez' } });

		expect(mockOnInputChange).toHaveBeenCalled();
	});

	it('calls onSelectChange when select value changes', () => {
		render(
			<ClaimsForm
				formData={defaultFormData}
				isLoading={false}
				onInputChange={mockOnInputChange}
				onSelectChange={mockOnSelectChange}
				onSubmit={mockOnSubmit}
				onCancel={mockOnCancel}
			/>
		);

		const typeSelect = screen.getByRole('combobox');
		fireEvent.click(typeSelect);

		// Wait for options to appear and select one
		const aluminioOptions = screen.getAllByText('Aluminio');
		// Click the option (not the hidden one in the trigger)
		fireEvent.click(aluminioOptions[aluminioOptions.length - 1]);

		expect(mockOnSelectChange).toHaveBeenCalled();
	});

	it('calls onSubmit when form is submitted', () => {
		render(
			<ClaimsForm
				formData={defaultFormData}
				isLoading={false}
				onInputChange={mockOnInputChange}
				onSelectChange={mockOnSelectChange}
				onSubmit={mockOnSubmit}
				onCancel={mockOnCancel}
			/>
		);

		const form = screen.getByRole('button', { name: /guardar/i }).closest('form');
		if (form) {
			fireEvent.submit(form);
			expect(mockOnSubmit).toHaveBeenCalled();
		}
	});

	it('calls onCancel when cancel button is clicked', () => {
		render(
			<ClaimsForm
				formData={defaultFormData}
				isLoading={false}
				onInputChange={mockOnInputChange}
				onSelectChange={mockOnSelectChange}
				onSubmit={mockOnSubmit}
				onCancel={mockOnCancel}
			/>
		);

		const cancelButton = screen.getByRole('button', { name: /cancelar/i });
		fireEvent.click(cancelButton);

		expect(mockOnCancel).toHaveBeenCalled();
	});

	it('disables submit button when isLoading is true', () => {
		render(
			<ClaimsForm
				formData={defaultFormData}
				isLoading={true}
				onInputChange={mockOnInputChange}
				onSelectChange={mockOnSelectChange}
				onSubmit={mockOnSubmit}
				onCancel={mockOnCancel}
			/>
		);

		const submitButton = screen.getByRole('button', { name: /guardando/i });
		expect(submitButton).toBeDisabled();
	});

	it('shows "Guardar" text when creating new claim', () => {
		render(
			<ClaimsForm
				formData={defaultFormData}
				isLoading={false}
				onInputChange={mockOnInputChange}
				onSelectChange={mockOnSelectChange}
				onSubmit={mockOnSubmit}
				onCancel={mockOnCancel}
			/>
		);

		expect(screen.getByRole('button', { name: /^guardar$/i })).toBeInTheDocument();
	});

	it('shows "Actualizar" text when editing claim', () => {
		const claimToEdit = {
			id: '1',
			client_name: 'Test',
			description: 'Test',
			resolved: false,
			daily: false,
			date: '2024-01-01',
			created_at: '2024-01-01',
		};

		render(
			<ClaimsForm
				formData={defaultFormData}
				isLoading={false}
				claimToEdit={claimToEdit}
				onInputChange={mockOnInputChange}
				onSelectChange={mockOnSelectChange}
				onSubmit={mockOnSubmit}
				onCancel={mockOnCancel}
			/>
		);

		expect(screen.getByRole('button', { name: /actualizar/i })).toBeInTheDocument();
	});

	it('populates fields with form data', () => {
		const populatedFormData = {
			client_name: 'Juan Perez',
			client_phone: '123456789',
			work_zone: 'Centro',
			work_locality: 'Cordoba',
			work_address: 'Calle 123',
			alum_pvc: 'Aluminio',
			attend: '',
			description: 'Test description',
			date: '2024-01-15',
		};

		render(
			<ClaimsForm
				formData={populatedFormData}
				isLoading={false}
				onInputChange={mockOnInputChange}
				onSelectChange={mockOnSelectChange}
				onSubmit={mockOnSubmit}
				onCancel={mockOnCancel}
			/>
		);

		expect(screen.getByDisplayValue('Juan Perez')).toBeInTheDocument();
		expect(screen.getByDisplayValue('123456789')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Centro')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Cordoba')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Calle 123')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
		expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument();
	});
});
