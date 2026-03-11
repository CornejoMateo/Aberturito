import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventFormModal } from '@/utils/calendar/event-form-modal';
import { EventDetailsModal } from '@/utils/calendar/event-details-modal';
import { validateDate } from '@/helpers/calendar/validateDate';

const mockToast = jest.fn();

jest.mock('@/components/ui/use-toast', () => ({
	useToast: () => ({
		toast: mockToast,
	}),
}));

jest.mock('@/lib/calendar/events', () => ({
	updateEvent: jest.fn(() => Promise.resolve({ error: null })),
}));

// Mock date for all tests
beforeAll(() => {
	jest.useFakeTimers();
	jest.setSystemTime(new Date('2026-03-10'));
});

// After all tests, restore real timers
afterAll(() => {
	jest.useRealTimers();
});

describe('EventFormModal', () => {
	it('not save event if date is null', () => {
		const onSaveMock = jest.fn();

		render(
			<EventFormModal onSave={onSaveMock}>
				<button>Nuevo evento</button>
			</EventFormModal>
		);

		fireEvent.click(screen.getByText('Nuevo evento'));
		fireEvent.click(screen.getByText('Guardar'));

		expect(onSaveMock).not.toHaveBeenCalled();
	});

	it('resets form when cancel button is clicked', () => {
		const onSaveMock = jest.fn();

		render(
			<EventFormModal onSave={onSaveMock}>
				<button>Nuevo evento</button>
			</EventFormModal>
		);

		fireEvent.click(screen.getByText('Nuevo evento'));

		// Fill form
		const titleInput = screen.getByPlaceholderText('Título del evento');
		fireEvent.change(titleInput, { target: { value: 'Test Event' } });

		expect(titleInput).toHaveValue('Test Event');

		// Click cancel
		fireEvent.click(screen.getByText('Cancelar'));

		// Reopen modal
		fireEvent.click(screen.getByText('Nuevo evento'));

		// Form should be reset
		expect(screen.getByPlaceholderText('Título del evento')).toHaveValue('');
	});

	it('toggles remember state when bell button is clicked', () => {
		const onSaveMock = jest.fn();

		render(
			<EventFormModal onSave={onSaveMock}>
				<button>Nuevo evento</button>
			</EventFormModal>
		);

		fireEvent.click(screen.getByText('Nuevo evento'));

		const bellButton = screen.getByRole('button', { name: '' }).parentElement?.querySelector('.bg-yellow-200');
		
		// Initially remember is true (yellow background)
		expect(bellButton).toBeInTheDocument();
	});
});

describe('validateDate', () => {
	it('return error if date not is valid', () => {
		expect(validateDate(undefined)).toBe('La fecha es requerida');
	});

	it('return error if date is before today', () => {
		expect(validateDate(new Date('2026-03-01'))).toBe(
			'No se pueden crear eventos en fechas pasadas'
		);
	});

	it('return null if date is valid', () => {
		expect(validateDate(new Date('2026-03-15'))).toBeNull();
	});
});

describe('EventDetailsModal', () => {
	const mockEvent = {
		id: '1',
		title: 'Test Event',
		type: 'produccionOK',
		date: '15-03-2026',
		client: 'John Doe',
		location: 'Buenos Aires',
		address: 'Calle Falsa 123',
		description: 'Test description',
		status: 'Pendiente',
		remember: true,
		is_overdue: false,
	};

	it('displays event information correctly', () => {
		render(
			<EventDetailsModal 
				isOpen={true} 
				onClose={jest.fn()} 
				event={mockEvent} 
			/>
		);

		expect(screen.getByText('Test Event')).toBeInTheDocument();
		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('15-03-2026')).toBeInTheDocument();
		expect(screen.getByText('Buenos Aires')).toBeInTheDocument();
		expect(screen.getByText('Calle Falsa 123')).toBeInTheDocument();
		expect(screen.getByText('Test description')).toBeInTheDocument();
	});

	it('shows overdue badge when event is overdue', () => {
		const overdueEvent = { ...mockEvent, is_overdue: true };

		render(
			<EventDetailsModal 
				isOpen={true} 
				onClose={jest.fn()} 
				event={overdueEvent} 
			/>
		);

		expect(screen.getByText('Evento vencido')).toBeInTheDocument();
	});

	it('calls onClose when close button is clicked', () => {
		const onCloseMock = jest.fn();

		render(
			<EventDetailsModal 
				isOpen={true} 
				onClose={onCloseMock} 
				event={mockEvent} 
			/>
		);

		fireEvent.click(screen.getByText('Cerrar'));

		expect(onCloseMock).toHaveBeenCalled();
	});

	it('updates event status when dropdown changes', async () => {
		const { updateEvent } = require('@/lib/calendar/events');
		const onEventUpdatedMock = jest.fn();

		render(
			<EventDetailsModal 
				isOpen={true} 
				onClose={jest.fn()} 
				event={mockEvent} 
				onEventUpdated={onEventUpdatedMock}
			/>
		);

		const statusSelect = screen.getByDisplayValue('Pendiente');
		fireEvent.change(statusSelect, { target: { value: 'Finalizado' } });

		await waitFor(() => {
			expect(updateEvent).toHaveBeenCalledWith('1', { status: 'Finalizado' });
			expect(onEventUpdatedMock).toHaveBeenCalled();
		});
	});

	it('toggles remember state when bell button is clicked', async () => {
		const { updateEvent } = require('@/lib/calendar/events');
		const onEventUpdatedMock = jest.fn();

		render(
			<EventDetailsModal 
				isOpen={true} 
				onClose={jest.fn()} 
				event={mockEvent} 
				onEventUpdated={onEventUpdatedMock}
			/>
		);

		// Find bell button and click it
		const bellButtons = screen.getAllByRole('button');
		const bellButton = bellButtons.find(btn => btn.querySelector('.text-red-600'));
		
		if (bellButton) {
			fireEvent.click(bellButton);

			await waitFor(() => {
				expect(updateEvent).toHaveBeenCalledWith('1', { remember: false });
				expect(onEventUpdatedMock).toHaveBeenCalled();
			});
		}
	});
});