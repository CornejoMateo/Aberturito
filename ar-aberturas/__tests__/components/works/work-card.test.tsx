import { render, screen, fireEvent } from '@testing-library/react';
import { WorkCard } from '@/utils/works/work-card';
import { WorkWithProgress } from '@/lib/works/works';

// Mock the ChecklistCompletionModal component
jest.mock('@/utils/checklists/checklist-completion-modal', () => ({
	ChecklistCompletionModal: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="checklist-modal">{children}</div>
	),
}));

const mockWork: WorkWithProgress = {
	id: 'work-1',
	client_id: '1',
	client_name: 'Juan',
	client_last_name: 'Pérez',
	address: 'Test 629',
	locality: 'Córdoba',
	status: 'in_progress',
	created_at: '2024-01-15T10:00:00Z',
	tasks: [
		{ name: 'Tarea 1', done: true, key: 0 },
		{ name: 'Tarea 2', done: false, key: 1 },
	],
	hasNotes: true,
	progress: 50,
};

const mockUser = { role: 'Admin' };

const mockOnOpenEmail = jest.fn();
const mockOnOpenWhatsApp = jest.fn();
const mockOnOpenChecklist = jest.fn();

describe('WorkCard', () => {

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('must be render work information', () => {
		render(
			<WorkCard
				work={mockWork}
				user={mockUser}
				onOpenEmail={mockOnOpenEmail}
				onOpenWhatsApp={mockOnOpenWhatsApp}
				onOpenChecklist={mockOnOpenChecklist}
			/>
		);

		expect(screen.getByText('Pérez Juan')).toBeInTheDocument();
		expect(screen.getByText(/Test 629/)).toBeInTheDocument();
		expect(screen.getByText(/Córdoba/)).toBeInTheDocument();
		expect(screen.getByText(/15-01-2024/)).toBeInTheDocument();
	});

	it('must be display progress correctly', () => {
		render(
			<WorkCard
				work={mockWork}
				user={mockUser}
				onOpenEmail={mockOnOpenEmail}
				onOpenWhatsApp={mockOnOpenWhatsApp}
				onOpenChecklist={mockOnOpenChecklist}
			/>
		);

		expect(screen.getByText('Progreso: 50%')).toBeInTheDocument();
	});

	it('must be show status badge', () => {
		render(
			<WorkCard
				work={mockWork}
				user={mockUser}
				onOpenEmail={mockOnOpenEmail}
				onOpenWhatsApp={mockOnOpenWhatsApp}
				onOpenChecklist={mockOnOpenChecklist}
			/>
		);

		expect(screen.getByText('En progreso')).toBeInTheDocument();
		expect(screen.getByText('Pérez Juan')).toBeInTheDocument();
	});

	it('must be show notes badge when hasNotes is true', () => {
		render(
			<WorkCard
				work={mockWork}
				user={mockUser}
				onOpenEmail={mockOnOpenEmail}
				onOpenWhatsApp={mockOnOpenWhatsApp}
				onOpenChecklist={mockOnOpenChecklist}
			/>
		);

		expect(screen.getByText('Notas')).toBeInTheDocument();
	});

	it('must be not show notes badge when hasNotes is false', () => {
		const workWithoutNotes = { ...mockWork, hasNotes: false };

		render(
			<WorkCard
				work={workWithoutNotes}
				user={mockUser}
				onOpenEmail={mockOnOpenEmail}
				onOpenWhatsApp={mockOnOpenWhatsApp}
				onOpenChecklist={mockOnOpenChecklist}
			/>
		);

		expect(screen.queryByText('Notas')).not.toBeInTheDocument();
	});

	it('must be show admin buttons when user is Admin', () => {
		render(
			<WorkCard
				work={mockWork}
				user={mockUser}
				onOpenEmail={mockOnOpenEmail}
				onOpenWhatsApp={mockOnOpenWhatsApp}
				onOpenChecklist={mockOnOpenChecklist}
			/>
		);

		expect(screen.getByText('Agregar checklists')).toBeInTheDocument();
		expect(screen.getByText('Email')).toBeInTheDocument();
		expect(screen.getByText('WhatsApp')).toBeInTheDocument();
	});

	it('must be not show admin buttons when user is not Admin', () => {
		const regularUser = { role: 'Colocador' };

		render(
			<WorkCard
				work={mockWork}
				user={regularUser}
				onOpenEmail={mockOnOpenEmail}
				onOpenWhatsApp={mockOnOpenWhatsApp}
				onOpenChecklist={mockOnOpenChecklist}
			/>
		);

		expect(screen.queryByText('Agregar checklists')).not.toBeInTheDocument();
		expect(screen.queryByText('Email')).not.toBeInTheDocument();
		expect(screen.queryByText('WhatsApp')).not.toBeInTheDocument();
	});

	it('must be show notification buttons for Ventas role', () => {
		const ventasUser = { role: 'Ventas' };

		render(
			<WorkCard
				work={mockWork}
				user={ventasUser}
				onOpenEmail={mockOnOpenEmail}
				onOpenWhatsApp={mockOnOpenWhatsApp}
				onOpenChecklist={mockOnOpenChecklist}
			/>
		);

		expect(screen.getByText('Agregar checklists')).toBeInTheDocument();
		expect(screen.getByText('Email')).toBeInTheDocument();
		expect(screen.getByText('WhatsApp')).toBeInTheDocument();
	});

	it('must be call onOpenEmail when email button is clicked', () => {
		render(
			<WorkCard
				work={mockWork}
				user={mockUser}
				onOpenEmail={mockOnOpenEmail}
				onOpenWhatsApp={mockOnOpenWhatsApp}
				onOpenChecklist={mockOnOpenChecklist}
			/>
		);

		const emailButton = screen.getByText('Email').closest('button');
		fireEvent.click(emailButton!);

		expect(mockOnOpenEmail).toHaveBeenCalledWith(mockWork);
	});

	it('must be call onOpenWhatsApp when WhatsApp button is clicked', () => {
		render(
			<WorkCard
				work={mockWork}
				user={mockUser}
				onOpenEmail={mockOnOpenEmail}
				onOpenWhatsApp={mockOnOpenWhatsApp}
				onOpenChecklist={mockOnOpenChecklist}
			/>
		);

		const whatsappButton = screen.getByText('WhatsApp').closest('button');
		fireEvent.click(whatsappButton!);

		expect(mockOnOpenWhatsApp).toHaveBeenCalledWith(mockWork);
	});

	it('must be call onOpenChecklist when add checklist button is clicked', () => {
		render(
			<WorkCard
				work={mockWork}
				user={mockUser}
				onOpenEmail={mockOnOpenEmail}
				onOpenWhatsApp={mockOnOpenWhatsApp}
				onOpenChecklist={mockOnOpenChecklist}
			/>
		);

		const addChecklistButton = screen.getByText('Agregar checklists').closest('button');
		fireEvent.click(addChecklistButton!);

		expect(mockOnOpenChecklist).toHaveBeenCalledWith(mockWork);
	});

	it('must be handle missing client name gracefully', () => {
		const workWithoutClient = {
			...mockWork,
			client_name: null,
			client_last_name: null,
		};

		render(
			<WorkCard
				work={workWithoutClient as any}
				user={mockUser}
				onOpenEmail={mockOnOpenEmail}
				onOpenWhatsApp={mockOnOpenWhatsApp}
				onOpenChecklist={mockOnOpenChecklist}
			/>
		);

		expect(screen.getByText('Cliente no especificado')).toBeInTheDocument();
	});

	it('must be handle missing address gracefully', () => {
		const workWithoutAddress = {
			...mockWork,
			address: null,
		};

		render(
			<WorkCard
				work={workWithoutAddress as any}
				user={mockUser}
				onOpenEmail={mockOnOpenEmail}
				onOpenWhatsApp={mockOnOpenWhatsApp}
				onOpenChecklist={mockOnOpenChecklist}
			/>
		);

		expect(screen.getByText('Dirección no especificada')).toBeInTheDocument();
	});

	it('must be render Ver checklists button', () => {
		render(
			<WorkCard
				work={mockWork}
				user={mockUser}
				onOpenEmail={mockOnOpenEmail}
				onOpenWhatsApp={mockOnOpenWhatsApp}
				onOpenChecklist={mockOnOpenChecklist}
			/>
		);

		expect(screen.getByText('Ver checklists')).toBeInTheDocument();
	});
});
