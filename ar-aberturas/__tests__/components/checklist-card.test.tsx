import { render, screen, fireEvent } from '@testing-library/react';
import { ChecklistCard } from '@/utils/checklists/checklist-card';
import { Checklist } from '@/lib/works/checklists';

// Mock the useFileUpload hook
jest.mock('@/hooks/use-file-upload', () => ({
	useFileUpload: jest.fn(() => ({
		isUploadDialogOpen: false,
		selectedFile: null,
		displayName: '',
		description: '',
		isUploading: false,
		fileInputRef: { current: null },
		setDisplayName: jest.fn(),
		setDescription: jest.fn(),
		handleFileSelect: jest.fn(),
		handleUploadSubmit: jest.fn(),
		handleCloseUploadDialog: jest.fn(),
		triggerFileUpload: jest.fn(),
	})),
}));

const mockChecklist: Checklist = {
	id: '1',
	work_id: '1',
	name: 'Test Checklist',
	description: 'Test description',
	width: 100,
	height: 200,
	type_opening: 'PVC',
	items: [
		{ name: 'Item 1', done: false, key: 0 },
		{ name: 'Item 2', done: true, key: 1 },
	],
	notes: 'Test notes',
	created_at: new Date().toISOString(),
};

const defaultProps = {
	checklist: mockChecklist,
	index: 0,
	user: { role: 'Admin' },
	saving: false,
	loading: false,
	addingClaim: {},
	savingNotes: {},
	onUpdateNotes: jest.fn(),
	onToggleItem: jest.fn(),
	onSetAllItems: jest.fn(),
	onEdit: jest.fn(),
	onDelete: jest.fn(),
	onAddEntry: jest.fn(),
	clientId: 'client-123',
};

describe('ChecklistCard', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should render checklist name', () => {
		render(<ChecklistCard {...defaultProps} />);
		expect(screen.getByText('Test Checklist')).toBeInTheDocument();
	});

	it('should render description when provided', () => {
		render(<ChecklistCard {...defaultProps} />);
		expect(screen.getByText('Test description')).toBeInTheDocument();
	});

	it('should display dimensions', () => {
		render(<ChecklistCard {...defaultProps} />);
		expect(screen.getByText('100 cm')).toBeInTheDocument();
		expect(screen.getByText('200 cm')).toBeInTheDocument();
	});

	it('should display type opening', () => {
		render(<ChecklistCard {...defaultProps} />);
		expect(screen.getByText('PVC')).toBeInTheDocument();
	});

	it('should render all checklist items', () => {
		render(<ChecklistCard {...defaultProps} />);
		expect(screen.getByText('Item 1')).toBeInTheDocument();
		expect(screen.getByText('Item 2')).toBeInTheDocument();
	});

	it('should call onToggleItem when checkbox is clicked', () => {
		render(<ChecklistCard {...defaultProps} />);
		const checkboxes = screen.getAllByRole('checkbox');
		
		fireEvent.click(checkboxes[0]);
		
		expect(defaultProps.onToggleItem).toHaveBeenCalledWith(
			'1',
			0,
			mockChecklist.items
		);
	});

	it('should call onSetAllItems when "Marcar todo" is clicked', () => {
		render(<ChecklistCard {...defaultProps} />);
		
		const marcarTodoButton = screen.getByText('Marcar todo');
		fireEvent.click(marcarTodoButton);
		
		expect(defaultProps.onSetAllItems).toHaveBeenCalledWith('1', true);
	});

	it('should call onSetAllItems when "Desmarcar todo" is clicked', () => {
		render(<ChecklistCard {...defaultProps} />);
		
		const desmarcarTodoButton = screen.getByText('Desmarcar todo');
		fireEvent.click(desmarcarTodoButton);
		
		expect(defaultProps.onSetAllItems).toHaveBeenCalledWith('1', false);
	});

	it('should call onUpdateNotes when textarea changes', () => {
		render(<ChecklistCard {...defaultProps} />);
		
		const textarea = screen.getByPlaceholderText(/Escribí una nota/i);
		fireEvent.change(textarea, { target: { value: 'New note' } });
		
		expect(defaultProps.onUpdateNotes).toHaveBeenCalledWith('1', 'New note');
	});

	it('should show edit and delete buttons for admin users', () => {
		render(<ChecklistCard {...defaultProps} />);
		
		const editButton = screen.getByTitle('Editar checklist');
		const deleteButton = screen.getByTitle('Eliminar checklist');
		
		expect(editButton).toBeInTheDocument();
		expect(deleteButton).toBeInTheDocument();
	});

	it('should not show edit and delete buttons for non-admin users', () => {
		const props = { ...defaultProps, user: { role: 'User' } };
		render(<ChecklistCard {...props} />);
		
		expect(screen.queryByTitle('Editar checklist')).not.toBeInTheDocument();
		expect(screen.queryByTitle('Eliminar checklist')).not.toBeInTheDocument();
	});

	it('should call onEdit when edit button is clicked', () => {
		render(<ChecklistCard {...defaultProps} />);
		
		const editButton = screen.getByTitle('Editar checklist');
		fireEvent.click(editButton);
		
		expect(defaultProps.onEdit).toHaveBeenCalledWith(mockChecklist);
	});

	it('should call onDelete when delete button is clicked', () => {
		render(<ChecklistCard {...defaultProps} />);
		
		const deleteButton = screen.getByTitle('Eliminar checklist');
		fireEvent.click(deleteButton);
		
		expect(defaultProps.onDelete).toHaveBeenCalledWith(mockChecklist);
	});

	it('should disable buttons when saving', () => {
		const props = { ...defaultProps, saving: true };
		render(<ChecklistCard {...props} />);
		
		const marcarTodoButton = screen.getByText('Marcar todo');
		expect(marcarTodoButton).toBeDisabled();
	});

	it('should show "Guardando..." when saving notes', () => {
		const props = {
			...defaultProps,
			savingNotes: { '1': true },
		};
		render(<ChecklistCard {...props} />);
		
		expect(screen.getByText('Guardando...')).toBeInTheDocument();
	});

	it('should disable "Agregar como reclamo" button when notes are empty', () => {
		const checklistWithoutNotes = { ...mockChecklist, notes: '' };
		const props = { ...defaultProps, checklist: checklistWithoutNotes };
		render(<ChecklistCard {...props} />);
		
		const addClaimButton = screen.getByText('Agregar como reclamo');
		expect(addClaimButton).toBeDisabled();
	});

	it('should call onAddEntry with claim type when clicking "Agregar como reclamo"', () => {
		render(<ChecklistCard {...defaultProps} />);
		
		const addClaimButton = screen.getByText('Agregar como reclamo');
		fireEvent.click(addClaimButton);
		
		expect(defaultProps.onAddEntry).toHaveBeenCalledWith(mockChecklist, 'claim');
	});

	it('should call onAddEntry with daily type when clicking "Agregar a actividades diarias"', () => {
		render(<ChecklistCard {...defaultProps} />);
		
		const addDailyButton = screen.getByText('Agregar a actividades diarias');
		fireEvent.click(addDailyButton);
		
		expect(defaultProps.onAddEntry).toHaveBeenCalledWith(mockChecklist, 'daily');
	});

	it('should disable daily activities button when no items are completed', () => {
		const checklistWithNoCompleted = {
			...mockChecklist,
			items: [
				{ name: 'Item 1', done: false, key: 0 },
				{ name: 'Item 2', done: false, key: 1 },
			],
		};
		const props = { ...defaultProps, checklist: checklistWithNoCompleted };
		render(<ChecklistCard {...props} />);
		
		const addDailyButton = screen.getByText('Agregar a actividades diarias');
		expect(addDailyButton).toBeDisabled();
	});

	it('should calculate and display correct progress', () => {
		render(<ChecklistCard {...defaultProps} />);
		// 1 out of 2 items done = 50%
		expect(screen.getByText('50%')).toBeInTheDocument();
	});

	it('should use default name when checklist name is not provided', () => {
		const checklistWithoutName = { ...mockChecklist, name: null };
		const props = { ...defaultProps, checklist: checklistWithoutName, index: 2 };
		render(<ChecklistCard {...props} />);
		
		expect(screen.getByText('Abertura 3')).toBeInTheDocument();
	});

	it('should show "Agregar archivo" button', () => {
		const props = { ...defaultProps, user: { role: 'User' } };
		render(<ChecklistCard {...props} />);
		
		expect(screen.getByText('Agregar archivo')).toBeInTheDocument();
	});

	it('should disable "Agregar archivo" button when clientId is not provided', () => {
		const props = { ...defaultProps, clientId: null };
		render(<ChecklistCard {...props} />);
		
		const uploadButton = screen.getByText('Agregar archivo');
		expect(uploadButton).toBeDisabled();
	});

	it('should disable "Agregar archivo" button when loading', () => {
		const props = { ...defaultProps, loading: true };
		render(<ChecklistCard {...props} />);
		
		const uploadButton = screen.getByText('Agregar archivo');
		expect(uploadButton).toBeDisabled();
	});

	it('should enable "Agregar archivo" button when clientId is provided and not loading', () => {
		render(<ChecklistCard {...defaultProps} />);
		
		const uploadButton = screen.getByText('Agregar archivo');
		expect(uploadButton).not.toBeDisabled();
	});
});
