import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkForm } from '@/utils/works/work-form';
import userEvent from '@testing-library/user-event';

const mockClientId = '1';
const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

describe('WorkForm', () => {

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('must be render all form fields', () => {
		render(
			<WorkForm
				clientId={mockClientId}
				onSubmit={mockOnSubmit}
				onCancel={mockOnCancel}
			/>
		);

		expect(screen.getByLabelText(/localidad/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
		expect(screen.getByText(/estado/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/arquitecto/i)).toBeInTheDocument();
	});

	it('must be render action buttons', () => {
		render(
			<WorkForm
				clientId={mockClientId}
				onSubmit={mockOnSubmit}
				onCancel={mockOnCancel}
			/>
		);

		expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /guardar obra/i })).toBeInTheDocument();
	});

	it('must be update field values when typing', async () => {
		const user = userEvent.setup();

		render(
			<WorkForm
				clientId={mockClientId}
				onSubmit={mockOnSubmit}
				onCancel={mockOnCancel}
			/>
		);

		const localityInput = screen.getByLabelText(/localidad/i) as HTMLInputElement;
		const addressInput = screen.getByLabelText(/dirección/i) as HTMLInputElement;
		const architectInput = screen.getByLabelText(/arquitecto/i) as HTMLInputElement;

		await user.type(localityInput, 'Córdoba Capital');
		await user.type(addressInput, 'Av. Colón 1234');
		await user.type(architectInput, 'Juan Pérez');

		expect(localityInput.value).toBe('Córdoba Capital');
		expect(addressInput.value).toBe('Av. Colón 1234');
		expect(architectInput.value).toBe('Juan Pérez');
	});

	it('must be call onSubmit with form data when submitted', async () => {
		const user = userEvent.setup();
		mockOnSubmit.mockResolvedValue(undefined);

		render(
			<WorkForm
				clientId={mockClientId}
				onSubmit={mockOnSubmit}
				onCancel={mockOnCancel}
			/>
		);

		await user.type(screen.getByLabelText(/localidad/i), 'Córdoba');
		await user.type(screen.getByLabelText(/dirección/i), 'Calle Test 123');
		await user.type(screen.getByLabelText(/arquitecto/i), 'Arq. Test');

		const submitButton = screen.getByRole('button', { name: /guardar obra/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(mockOnSubmit).toHaveBeenCalledWith({
				locality: 'Córdoba',
				address: 'Calle Test 123',
				status: 'Pendiente',
				architect: 'Arq. Test',
			});
		});
	});

	it('must be call onCancel when cancel button is clicked', async () => {
		const user = userEvent.setup();

		render(
			<WorkForm
				clientId={mockClientId}
				onSubmit={mockOnSubmit}
				onCancel={mockOnCancel}
			/>
		);

		const cancelButton = screen.getByRole('button', { name: /cancelar/i });
		await user.click(cancelButton);

		expect(mockOnCancel).toHaveBeenCalledTimes(1);
	});

	it('must be require locality and address fields', async () => {
		const user = userEvent.setup();

		render(
			<WorkForm
				clientId={mockClientId}
				onSubmit={mockOnSubmit}
				onCancel={mockOnCancel}
			/>
		);

		const localityInput = screen.getByLabelText(/localidad/i);
		const addressInput = screen.getByLabelText(/dirección/i);

		expect(localityInput).toBeRequired();
		expect(addressInput).toBeRequired();
	});

	it('must be not require architect field', () => {
		render(
			<WorkForm
				clientId={mockClientId}
				onSubmit={mockOnSubmit}
				onCancel={mockOnCancel}
			/>
		);

		const architectInput = screen.getByLabelText(/arquitecto/i);
		expect(architectInput).not.toBeRequired();
	});

	it('must be have default status value', () => {
		render(
			<WorkForm
				clientId={mockClientId}
				onSubmit={mockOnSubmit}
				onCancel={mockOnCancel}
			/>
		);

		const statusSelect = screen.getByDisplayValue(/pendiente/i);
		expect(statusSelect).toBeInTheDocument();
	});

	it('must be submit only with required fields', async () => {
		const user = userEvent.setup();
		mockOnSubmit.mockResolvedValue(undefined);

		render(
			<WorkForm
				clientId={mockClientId}
				onSubmit={mockOnSubmit}
				onCancel={mockOnCancel}
			/>
		);

		await user.type(screen.getByLabelText(/localidad/i), 'Córdoba');
		await user.type(screen.getByLabelText(/dirección/i), 'Calle 123');

		const submitButton = screen.getByRole('button', { name: /guardar obra/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(mockOnSubmit).toHaveBeenCalledWith({
				locality: 'Córdoba',
				address: 'Calle 123',
				status: 'Pendiente',
				architect: '',
			});
		});
	});
});
