import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClaimsAddDialog } from '@/utils/claims/claims-add-dialog';
import { createClaim, updateClaim } from '@/lib/claims/claims';
import { listClients } from '@/lib/clients/clients';
import { getWorksByClientId } from '@/lib/works/works';
import { toast } from '@/components/ui/use-toast';

class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}

(global as any).ResizeObserver = ResizeObserverMock;

jest.mock('@/lib/claims/claims', () => ({
	createClaim: jest.fn(),
	updateClaim: jest.fn(),
}));

jest.mock('@/lib/clients/clients', () => ({
	listClients: jest.fn(),
}));

jest.mock('@/lib/works/works', () => ({
	getWorksByClientId: jest.fn(),
}));

jest.mock('@/components/ui/use-toast', () => ({
	toast: jest.fn(),
}));

describe('ClaimsAddDialog', () => {
	const mockOnOpenChange = jest.fn();
	const mockOnClaimAdded = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(listClients as jest.Mock).mockResolvedValue({
			data: [{ id: 'c1', name: 'Juan', last_name: 'Perez', phone_number: '123' }],
			error: null,
		});
		(getWorksByClientId as jest.Mock).mockResolvedValue({ data: [], error: null });
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

	it('renders dialog title by mode', () => {
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

	it('renders diario mode title', () => {
		render(
			<ClaimsAddDialog
				open={true}
				onOpenChange={mockOnOpenChange}
				onClaimAdded={mockOnClaimAdded}
				mode="diario"
			/>
		);

		expect(screen.getByText('Registrar nueva actividad')).toBeInTheDocument();
	});

	it('validates client selection before creating', async () => {
		(createClaim as jest.Mock).mockResolvedValue({ error: null });

		render(
			<ClaimsAddDialog
				open={true}
				onOpenChange={mockOnOpenChange}
				onClaimAdded={mockOnClaimAdded}
				mode="reclamo"
			/>
		);

		fireEvent.change(screen.getByLabelText(/descrip/i), {
			target: { value: 'Test description' },
		});
		fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

		await waitFor(() => {
			expect(createClaim).not.toHaveBeenCalled();
			expect(toast).toHaveBeenCalledWith(
				expect.objectContaining({
					title: expect.stringMatching(/seleccion/i),
					variant: 'destructive',
				})
			);
		});
	});

	it('creates claim when a client is selected', async () => {
		(createClaim as jest.Mock).mockResolvedValue({ error: null });

		render(
			<ClaimsAddDialog
				open={true}
				onOpenChange={mockOnOpenChange}
				onClaimAdded={mockOnClaimAdded}
				mode="reclamo"
			/>
		);

		fireEvent.click(screen.getByRole('button', { name: /seleccionar cliente/i }));
		const option = await screen.findByText('Juan Perez');
		fireEvent.click(option);

		fireEvent.change(screen.getByLabelText(/descrip/i), {
			target: { value: 'Test description' },
		});
		fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

		await waitFor(() => {
			expect(createClaim).toHaveBeenCalledWith(
				expect.objectContaining({
					client_id: 'c1',
					description: 'Test description',
					daily: false,
				})
			);
		});
	});

	it('updates existing claim', async () => {
		(updateClaim as jest.Mock).mockResolvedValue({ error: null });
		const claimToEdit = {
			id: '1',
			client_id: 'c1',
			description: 'Original description',
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

		fireEvent.change(screen.getByLabelText(/descrip/i), {
			target: { value: 'Updated description' },
		});
		fireEvent.click(screen.getByRole('button', { name: /actualizar/i }));

		await waitFor(() => {
			expect(updateClaim).toHaveBeenCalledWith(
				'1',
				expect.objectContaining({ description: 'Updated description', client_id: 'c1' })
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

		fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
		expect(mockOnOpenChange).toHaveBeenCalledWith(false);
	});
});
