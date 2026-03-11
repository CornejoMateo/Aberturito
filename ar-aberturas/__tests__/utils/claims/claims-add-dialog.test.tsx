import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClaimsAddDialog } from '@/utils/claims/claims-add-dialog';
import { createClaim, updateClaim } from '@/lib/claims/claims';
import { toast } from '@/components/ui/use-toast';

jest.mock('@/lib/claims/claims', () => ({
	createClaim: jest.fn(),
	updateClaim: jest.fn(),
}));

jest.mock('@/components/ui/use-toast', () => ({
	toast: jest.fn(),
}));

describe('ClaimsAddDialog', () => {
	const mockOnOpenChange = jest.fn();
	const mockOnClaimAdded = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders dialog when open is true', () => {
		render(
			<ClaimsAddDialog
				open={true}
				onOpenChange={mockOnOpenChange}
				onClaimAdded={mockOnClaimAdded}
				mode="reclamo"
			/>
		);

		expect(screen.getByText('Registrar nuevo reclamo')).toBeInTheDocument();
	});

	it('does not render dialog when open is false', () => {
		render(
			<ClaimsAddDialog
				open={false}
				onOpenChange={mockOnOpenChange}
				onClaimAdded={mockOnClaimAdded}
				mode="reclamo"
			/>
		);

		expect(screen.queryByText('Registrar nuevo reclamo')).not.toBeInTheDocument();
	});

	it('shows correct title for reclamo mode', () => {
		render(
			<ClaimsAddDialog
				open={true}
				onOpenChange={mockOnOpenChange}
				onClaimAdded={mockOnClaimAdded}
				mode="reclamo"
			/>
		);

		expect(screen.getByText('Registrar nuevo reclamo')).toBeInTheDocument();
		expect(screen.getByText(/complete los datos del reclamo/i)).toBeInTheDocument();
	});

	it('shows correct title for diario mode', () => {
		render(
			<ClaimsAddDialog
				open={true}
				onOpenChange={mockOnOpenChange}
				onClaimAdded={mockOnClaimAdded}
				mode="diario"
			/>
		);

		expect(screen.getByText('Registrar nueva actividad')).toBeInTheDocument();
		expect(screen.getByText(/complete los datos de la actividad diaria/i)).toBeInTheDocument();
	});

	it('shows edit title when claimToEdit is provided', () => {
		const claimToEdit = {
			id: '1',
			client_name: 'Test Client',
			description: 'Test',
			resolved: false,
			daily: false,
			date: '2024-01-01',
			created_at: '2024-01-01',
		};

		render(
			<ClaimsAddDialog
				open={true}
				onOpenChange={mockOnOpenChange}
				onClaimAdded={mockOnClaimAdded}
				claimToEdit={claimToEdit}
				mode="reclamo"
			/>
		);

		expect(screen.getByText('Editar reclamo')).toBeInTheDocument();
		expect(screen.getByText(/actualice los datos del reclamo/i)).toBeInTheDocument();
	});

	it('creates new claim on form submit', async () => {
		(createClaim as jest.Mock).mockResolvedValue({ error: null });

		render(
			<ClaimsAddDialog
				open={true}
				onOpenChange={mockOnOpenChange}
				onClaimAdded={mockOnClaimAdded}
				mode="reclamo"
			/>
		);

		// Fill form
		const clientNameInput = screen.getByLabelText(/apellido y nombre del cliente/i);
		fireEvent.change(clientNameInput, { target: { value: 'Juan Perez' } });

		const descriptionInput = screen.getByLabelText(/descripción/i);
		fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

		// Submit form
		const submitButton = screen.getByRole('button', { name: /guardar/i });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(createClaim).toHaveBeenCalled();
		});

		await waitFor(() => {
			expect(toast).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Reclamo creado',
				})
			);
		});

		expect(mockOnClaimAdded).toHaveBeenCalled();
		expect(mockOnOpenChange).toHaveBeenCalledWith(false);
	});

	it('updates existing claim on form submit', async () => {
		const claimToEdit = {
			id: '1',
			client_name: 'Test Client',
			description: 'Original description',
			resolved: false,
			daily: false,
			date: '2024-01-01',
			created_at: '2024-01-01',
		};

		(updateClaim as jest.Mock).mockResolvedValue({ error: null });

		render(
			<ClaimsAddDialog
				open={true}
				onOpenChange={mockOnOpenChange}
				onClaimAdded={mockOnClaimAdded}
				claimToEdit={claimToEdit}
				mode="reclamo"
			/>
		);

		const descriptionInput = screen.getByLabelText(/descripción/i);
		fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });

		const submitButton = screen.getByRole('button', { name: /actualizar/i });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(updateClaim).toHaveBeenCalledWith(
				'1',
				expect.objectContaining({
					description: 'Updated description',
				})
			);
		});

		await waitFor(() => {
			expect(toast).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Reclamo actualizado',
				})
			);
		});
	});

	it('sets daily flag to true when mode is diario', async () => {
		(createClaim as jest.Mock).mockResolvedValue({ error: null });

		render(
			<ClaimsAddDialog
				open={true}
				onOpenChange={mockOnOpenChange}
				onClaimAdded={mockOnClaimAdded}
				mode="diario"
			/>
		);

		const descriptionInput = screen.getByLabelText(/descripción/i);
		fireEvent.change(descriptionInput, { target: { value: 'Daily activity' } });

		const submitButton = screen.getByRole('button', { name: /guardar/i });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(createClaim).toHaveBeenCalledWith(
				expect.objectContaining({
					daily: true,
				})
			);
		});
	});

	it('shows error toast when creation fails', async () => {
		(createClaim as jest.Mock).mockResolvedValue({ error: 'Database error' });

		render(
			<ClaimsAddDialog
				open={true}
				onOpenChange={mockOnOpenChange}
				onClaimAdded={mockOnClaimAdded}
				mode="reclamo"
			/>
		);

		const submitButton = screen.getByRole('button', { name: /guardar/i });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(toast).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Error',
					variant: 'destructive',
				})
			);
		});
	});

	it('calls onOpenChange(false) when cancel is clicked', () => {
		render(
			<ClaimsAddDialog
				open={true}
				onOpenChange={mockOnOpenChange}
				onClaimAdded={mockOnClaimAdded}
				mode="reclamo"
			/>
		);

		const cancelButton = screen.getByRole('button', { name: /cancelar/i });
		fireEvent.click(cancelButton);

		expect(mockOnOpenChange).toHaveBeenCalledWith(false);
	});

	it('populates form fields when claimToEdit is provided', () => {
		const claimToEdit = {
			id: '1',
			client_name: 'Juan Perez',
			client_phone: '123456789',
			work_zone: 'Centro',
			work_locality: 'Cordoba',
			work_address: 'Calle 123',
			alum_pvc: 'Aluminio',
			description: 'Original description',
			date: '2024-01-15',
			resolved: false,
			daily: false,
			created_at: '2024-01-15',
		};

		render(
			<ClaimsAddDialog
				open={true}
				onOpenChange={mockOnOpenChange}
				onClaimAdded={mockOnClaimAdded}
				claimToEdit={claimToEdit}
				mode="reclamo"
			/>
		);

		expect(screen.getByDisplayValue('Juan Perez')).toBeInTheDocument();
		expect(screen.getByDisplayValue('123456789')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Centro')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Cordoba')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Calle 123')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Original description')).toBeInTheDocument();
		expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument();
	});

	it('resets form when dialog opens without claimToEdit', () => {
		const { rerender } = render(
			<ClaimsAddDialog
				open={false}
				onOpenChange={mockOnOpenChange}
				onClaimAdded={mockOnClaimAdded}
				mode="reclamo"
			/>
		);

		rerender(
			<ClaimsAddDialog
				open={true}
				onOpenChange={mockOnOpenChange}
				onClaimAdded={mockOnClaimAdded}
				mode="reclamo"
			/>
		);

		// Should have empty form fields
		const clientNameInput = screen.getByLabelText(/apellido y nombre del cliente/i);
		expect(clientNameInput).toHaveValue('');
	});
});
