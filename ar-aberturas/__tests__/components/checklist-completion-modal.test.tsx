import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChecklistCompletionModal } from '@/utils/checklists/checklist-completion-modal';
import { useWorkChecklistData } from '@/hooks/clients/use-works-checklists-data';
import { editChecklist, deleteChecklist } from '@/lib/works/checklists';
import { createClaim } from '@/lib/claims/claims';

jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    addImage: jest.fn(),
    save: jest.fn(),
  }));
});

jest.mock('html2canvas', () => jest.fn());


jest.mock('@/hooks/clients/use-works-checklists-data');
jest.mock('@/lib/works/checklists');
jest.mock('@/lib/claims/claims');
jest.mock('@/components/provider/auth-provider', () => ({
	useAuth: () => ({ user: { role: 'Admin' } }),
}));
jest.mock('@/components/ui/use-toast', () => ({
	toast: jest.fn(),
}));

const mockUseWorkChecklistData = useWorkChecklistData as jest.MockedFunction<
	typeof useWorkChecklistData
>;
const mockEditChecklist = editChecklist as jest.MockedFunction<typeof editChecklist>;
const mockDeleteChecklist = deleteChecklist as jest.MockedFunction<typeof deleteChecklist>;
const mockCreateClaim = createClaim as jest.MockedFunction<typeof createClaim>;

const mockChecklists = [
	{
		id: '1',
		work_id: '1',
		name: 'Checklist 1',
		description: null,
		width: 100,
		height: 200,
		type_opening: 'PVC',
		items: [
			{ name: 'Item 1', done: false },
			{ name: 'Item 2', done: true },
		],
		notes: 'Test note',
		created_at: new Date().toISOString(),
	},
];

const defaultMockData = {
	clientData: { name: 'John Doe', phone_number: '1234567890' },
	workData: { id: '1', locality: 'Buenos Aires', address: 'Street 123' },
	checklists: mockChecklists,
	loading: false,
	reload: jest.fn(),
};

describe('ChecklistCompletionModal', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockUseWorkChecklistData.mockReturnValue(defaultMockData as any);
		mockEditChecklist.mockResolvedValue({ error: null } as any);
		mockDeleteChecklist.mockResolvedValue({ error: null } as any);
		mockCreateClaim.mockResolvedValue({ error: null } as any);
	});

	it('should render modal trigger button', () => {
		render(<ChecklistCompletionModal workId="1" />);
		expect(screen.getByText('Completar Checklists')).toBeInTheDocument();
	});

	it('should show loading state initially', () => {
		mockUseWorkChecklistData.mockReturnValue({
			...defaultMockData,
			loading: true,
		} as any);

		render(<ChecklistCompletionModal workId="1" />);
		
		const button = screen.getByText('Completar Checklists');
		fireEvent.click(button);
		
		expect(screen.getByText('Cargando checklists...')).toBeInTheDocument();
	});

	it('should display checklists when loaded', async () => {
		render(<ChecklistCompletionModal workId="1" />);
		
		const button = screen.getByText('Completar Checklists');
		fireEvent.click(button);
		
		await waitFor(() => {
			expect(screen.getByText('Checklist 1')).toBeInTheDocument();
		});
	});

	it('should display total progress', async () => {
		render(<ChecklistCompletionModal workId="1" />);
		
		const button = screen.getByText('Completar Checklists');
		fireEvent.click(button);
		
		await waitFor(() => {
			// 1 of 2 items done = 50%
			expect(screen.getByText(/Progreso total: 50%/i)).toBeInTheDocument();
		});
	});

	it('should show message when no checklists available', async () => {
		mockUseWorkChecklistData.mockReturnValue({
			...defaultMockData,
			checklists: [],
		} as any);

		render(<ChecklistCompletionModal workId="1" />);
		
		const button = screen.getByText('Completar Checklists');
		fireEvent.click(button);
		
		await waitFor(() => {
			expect(screen.getByText('No hay checklists disponibles')).toBeInTheDocument();
		});
	});

	it('should update checklist item when toggled', async () => {
		render(<ChecklistCompletionModal workId="1" />);
		
		const button = screen.getByText('Completar Checklists');
		fireEvent.click(button);
		
		await waitFor(() => {
			expect(screen.getByText('Item 1')).toBeInTheDocument();
		});

		const checkboxes = screen.getAllByRole('checkbox');
		fireEvent.click(checkboxes[0]);
		
		await waitFor(() => {
			expect(mockEditChecklist).toHaveBeenCalledWith(
				'1',
				expect.objectContaining({
					items: expect.arrayContaining([
						expect.objectContaining({ name: 'Item 1', done: true }),
					]),
				})
			);
		});
	});

	it('should update notes with debounce', async () => {
		jest.useFakeTimers();
		
		render(<ChecklistCompletionModal workId="1" />);
		
		const button = screen.getByText('Completar Checklists');
		fireEvent.click(button);
		
		await waitFor(() => {
			expect(screen.getByPlaceholderText(/Escribí una nota/i)).toBeInTheDocument();
		});

		const textarea = screen.getByPlaceholderText(/Escribí una nota/i);
		fireEvent.change(textarea, { target: { value: 'Updated note' } });
		
		// Fast-forward debounce timer
		jest.advanceTimersByTime(600);
		
		await waitFor(() => {
			expect(mockEditChecklist).toHaveBeenCalledWith(
				'1',
				expect.objectContaining({ notes: 'Updated note' })
			);
		});
		
		jest.useRealTimers();
	});

	it('should create claim when "Agregar como reclamo" is clicked', async () => {
		render(<ChecklistCompletionModal workId="1" />);
		
		const button = screen.getByText('Completar Checklists');
		fireEvent.click(button);
		
		await waitFor(() => {
			expect(screen.getByText('Agregar como reclamo')).toBeInTheDocument();
		});

		const addClaimButton = screen.getByText('Agregar como reclamo');
		fireEvent.click(addClaimButton);
		
		await waitFor(() => {
			expect(mockCreateClaim).toHaveBeenCalledWith(
				expect.objectContaining({
					daily: false,
					description: 'Test note',
					client_name: 'John Doe',
					client_phone: '1234567890',
					work_locality: 'Buenos Aires',
					work_address: 'Street 123',
				})
			);
		});
	});

	it('should mark all items when "Marcar todo" is clicked', async () => {
		render(<ChecklistCompletionModal workId="1" />);
		
		const button = screen.getByText('Completar Checklists');
		fireEvent.click(button);
		
		await waitFor(() => {
			expect(screen.getByText('Marcar todo')).toBeInTheDocument();
		});

		const marcarTodoButton = screen.getByText('Marcar todo');
		fireEvent.click(marcarTodoButton);
		
		await waitFor(() => {
			expect(mockEditChecklist).toHaveBeenCalledWith(
				'1',
				expect.objectContaining({
					items: expect.arrayContaining([
						expect.objectContaining({ done: true }),
						expect.objectContaining({ done: true }),
					]),
				})
			);
		});
	});

	it('should show delete confirmation dialog', async () => {
		render(<ChecklistCompletionModal workId="1" />);
		
		const button = screen.getByText('Completar Checklists');
		fireEvent.click(button);
		
		await waitFor(() => {
			expect(screen.getByTitle('Eliminar checklist')).toBeInTheDocument();
		});

		const deleteButton = screen.getByTitle('Eliminar checklist');
		fireEvent.click(deleteButton);
		
		await waitFor(() => {
			expect(screen.getByText('¿Eliminar checklist?')).toBeInTheDocument();
		});
	});

	it('should delete checklist when confirmed', async () => {
		render(<ChecklistCompletionModal workId="work-1" />);
		
		const button = screen.getByText('Completar Checklists');
		fireEvent.click(button);
		
		await waitFor(() => {
			expect(screen.getByTitle('Eliminar checklist')).toBeInTheDocument();
		});

		const deleteButton = screen.getByTitle('Eliminar checklist');
		fireEvent.click(deleteButton);
		
		await waitFor(() => {
			expect(screen.getByText('Eliminar')).toBeInTheDocument();
		});

		const confirmButton = screen.getByRole('button', { name: 'Eliminar' });
		fireEvent.click(confirmButton);
		
		await waitFor(() => {
			expect(mockDeleteChecklist).toHaveBeenCalledWith('1');
		});
	});

	it('should reload data when modal opens', async () => {
		const reload = jest.fn();
		mockUseWorkChecklistData.mockReturnValue({
			...defaultMockData,
			reload,
		} as any);

		render(<ChecklistCompletionModal workId="1" />);
		
		const button = screen.getByText('Completar Checklists');
		fireEvent.click(button);
		
		await waitFor(() => {
			expect(reload).toHaveBeenCalled();
		});
	});

	it('should render PDF button with client name', async () => {
		render(<ChecklistCompletionModal workId="1" />);
		
		const button = screen.getByText('Completar Checklists');
		fireEvent.click(button);
		
		await waitFor(() => {
			expect(screen.getByText(/PDF/i)).toBeInTheDocument();
		});
	});

	it('should close modal when "Cerrar" button is clicked', async () => {
		render(<ChecklistCompletionModal workId="1" />);
		
		const openButton = screen.getByText('Completar Checklists');
		fireEvent.click(openButton);
		
		await waitFor(() => {
			expect(screen.getByText('Cerrar')).toBeInTheDocument();
		});

		const closeButton = screen.getByText('Cerrar');
		fireEvent.click(closeButton);
		
		await waitFor(() => {
			expect(screen.queryByText('Listado de checklists:')).not.toBeInTheDocument();
		});
	});
});
