import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChecklistModal } from '@/utils/checklists/checklist-modal';
import { Checklist } from '@/lib/works/checklists';

const mockToast = jest.fn();

jest.mock('@/components/ui/use-toast', () => ({
	toast: jest.fn(),
}));

const mockOnSave = jest.fn();
const mockOnUpdate = jest.fn();	
const mockOnOpenChange = jest.fn();

const defaultProps = {
	workId: '1',
	open: true,
	onOpenChange: mockOnOpenChange,
	onSave: mockOnSave,
};

describe('ChecklistModal', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockToast.mockClear();
		mockOnSave.mockResolvedValue(undefined);
	});

	it('should render modal in create mode', () => {
		render(<ChecklistModal {...defaultProps} />);
		expect(screen.getByText('Crear Checklist')).toBeInTheDocument();
	});

	it('should render modal in edit mode when checklistToEdit is provided', () => {
		const checklist: Checklist = {
			id: '1',
			work_id: '1',
			name: 'Test Checklist',
			description: null,
			width: null,
			height: null,
			type_opening: 'PVC',
			items: [],
			notes: null,
			created_at: new Date().toISOString(),
		};

		render(
			<ChecklistModal
				{...defaultProps}
				checklistToEdit={checklist}
				onUpdate={mockOnUpdate}
			/>
		);

		expect(screen.getByText('Editar Checklist')).toBeInTheDocument();
	});

	it('should allow entering checklist name', () => {
		render(<ChecklistModal {...defaultProps} />);
		
		const nameInput = screen.getByPlaceholderText('Identificador');
		fireEvent.change(nameInput, { target: { value: 'My Checklist' } });
		
		expect(nameInput).toHaveValue('My Checklist');
	});

	it('should allow entering description', () => {
		render(<ChecklistModal {...defaultProps} />);
		
		const descInput = screen.getByPlaceholderText('Descripción (opcional)');
		fireEvent.change(descInput, { target: { value: 'Test description' } });
		
		expect(descInput).toHaveValue('Test description');
	});

	it('should allow entering width and height', () => {
		render(<ChecklistModal {...defaultProps} />);
		
		const widthInput = screen.getByPlaceholderText('Ancho');
		const heightInput = screen.getByPlaceholderText('Alto');
		
		fireEvent.change(widthInput, { target: { value: '120' } });
		fireEvent.change(heightInput, { target: { value: '180' } });
		
		expect(widthInput).toHaveValue(120);
		expect(heightInput).toHaveValue(180);
	});

	it('should show "Finalizar" and save buttons in create mode', () => {
		render(<ChecklistModal {...defaultProps} />);
		
		expect(screen.getByText('Finalizar')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Crear y siguiente/i })).toBeInTheDocument();
	});

	it('should show "Cancelar" and update buttons in edit mode', () => {
		const checklist: Checklist = {
			id: '1',
			work_id: '1',
			name: 'Test',
			description: null,
			width: null,
			height: null,
			type_opening: 'PVC',
			items: [],
			notes: null,
			created_at: new Date().toISOString(),
		};

		render(
			<ChecklistModal
				{...defaultProps}
				checklistToEdit={checklist}
				onUpdate={mockOnUpdate}
			/>
		);
		
		expect(screen.getByText('Cancelar')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Guardar Cambios/i })).toBeInTheDocument();
	});

	it('should call onSave when saving in create mode', async () => {
		render(<ChecklistModal {...defaultProps} />);
		
		const saveButton = screen.getByRole('button', { name: /Crear y siguiente/i });
		fireEvent.click(saveButton);
		
		await waitFor(() => {
			expect(mockOnSave).toHaveBeenCalled();
		});
	});

	it('should call onUpdate when saving in edit mode', async () => {
		const checklist: Checklist = {
			id: '1',
			work_id: '1',
			name: 'Test',
			description: null,
			width: null,
			height: null,
			type_opening: 'PVC',
			items: [{ name: 'Item 1', done: false, key: 0 }],
			notes: null,
			created_at: new Date().toISOString(),
		};

		render(
			<ChecklistModal
				{...defaultProps}
				checklistToEdit={checklist}
				onUpdate={mockOnUpdate}
			/>
		);
		
		const saveButton = screen.getByRole('button', { name: /Guardar Cambios/i });
		fireEvent.click(saveButton);
		
		await waitFor(() => {
			expect(mockOnUpdate).toHaveBeenCalledWith(
				'1',
				expect.objectContaining({
					name: 'Test',
				})
			);
		});
	});

	it('should close modal when clicking "Finalizar"', () => {
		render(<ChecklistModal {...defaultProps} />);
		
		const finalizarButton = screen.getByText('Finalizar');
		fireEvent.click(finalizarButton);
		
		expect(mockOnOpenChange).toHaveBeenCalledWith(false);
	});

	it('should close modal when clicking "Cancelar" in edit mode', () => {
		const checklist: Checklist = {
			id: '1',
			work_id: '1',
			name: 'Test',
			description: null,
			width: null,
			height: null,
			type_opening: 'PVC',
			items: [],
			notes: null,
			created_at: new Date().toISOString(),
		};

		render(
			<ChecklistModal
				{...defaultProps}
				checklistToEdit={checklist}
				onUpdate={mockOnUpdate}
			/>
		);
		
		const cancelButton = screen.getByText('Cancelar');
		fireEvent.click(cancelButton);
		
		expect(mockOnOpenChange).toHaveBeenCalledWith(false);
	});

	it('should allow adding new items', () => {
		render(<ChecklistModal {...defaultProps} />);
		
		const itemInput = screen.getByPlaceholderText('Agregar nuevo item...');
		fireEvent.change(itemInput, { target: { value: 'New Item' } });
		fireEvent.keyDown(itemInput, { key: 'Enter', code: 'Enter' });
		
		expect(screen.getByText('New Item')).toBeInTheDocument();
	});

	it('should display created count badge after creating checklists', async () => {
		render(<ChecklistModal {...defaultProps} />);
		
		const saveButton = screen.getByRole('button', { name: /Crear y siguiente/i });
		fireEvent.click(saveButton);
		
		await waitFor(() => {
			expect(screen.getByText(/1 creada/i)).toBeInTheDocument();
		});
	});

	it('should disable save button while creating', async () => {
		mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
		
		render(<ChecklistModal {...defaultProps} />);
		
		const saveButton = screen.getByRole('button', { name: /Crear y siguiente/i });
		fireEvent.click(saveButton);
		
		expect(saveButton).toBeDisabled();
		
		await waitFor(() => {
			expect(saveButton).not.toBeDisabled();
		}, { timeout: 200 });
	});
});
