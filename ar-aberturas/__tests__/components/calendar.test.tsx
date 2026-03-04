import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarView } from '@/components/business/calendar-view';

jest.mock('@/hooks/use-load-events', () => ({
  useLoadEvents: () => ({
    events: [
      {
        id: '1',
        title: 'Evento Test',
        type: 'produccionOK',
        date: '2026-03-15',
        client: 'Juan',
        location: 'Rio Cuarto',
        address: 'Calle 123',
        description: '',
        remember: true,
        is_overdue: false,
      },
    ],
    isLoading: false,
    refresh: jest.fn(),
  }),
}));

const mockToast = jest.fn();

jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

jest.mock('@/lib/calendar/events', () => ({
  deleteEvent: jest.fn(() => Promise.resolve({ error: null })),
}));

jest.mock('@/components/provider/auth-provider', () => ({
  useAuth: () => ({
    user: { role: 'Admin' },
  }),
}));

// Mock date for all tests
beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-03-10'));
});

afterAll(() => {
  jest.useRealTimers();
});

describe('CalendarView', () => {

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('shows events from hook', () => {
        render(<CalendarView />);
        expect(screen.getByText('Evento Test')).toBeInTheDocument();
        expect(screen.getByText('Juan')).toBeInTheDocument();
    });

    it('filters events by type when clicking filter button', () => {
        render(<CalendarView />);
        
        // click in filter button 'Colocación'
        fireEvent.click(screen.getByText('Colocación'));
        
        // events of type 'Colocación' should be visible, others hidden, in this case 'Evento Test' should be hidden
        expect(screen.queryByText('Evento Test')).not.toBeInTheDocument();
    });

    it('navigates to next month when clicking next button', () => {
        render(<CalendarView />);
        
        expect(screen.getByText('Marzo 2026')).toBeInTheDocument();
        
        // find button with chevron-right icon and click it
        const nextButton = screen.getAllByRole('button').find(
            btn => btn.querySelector('.lucide-chevron-right')
        );
        fireEvent.click(nextButton!);
        
        expect(screen.getByText('Abril 2026')).toBeInTheDocument();
    });

    it('searches events by client name', () => {
        render(<CalendarView />);
        
        const searchInput = screen.getByPlaceholderText(/Buscar eventos/);
        fireEvent.change(searchInput, { target: { value: 'Juan' } });
        
        expect(screen.getByText('Evento Test')).toBeInTheDocument();
        
        fireEvent.change(searchInput, { target: { value: 'Pedro' } });
        expect(screen.queryByText('Evento Test')).not.toBeInTheDocument();
    });

    it('opens event details modal when clicking on event', () => {
        render(<CalendarView />);
        
        fireEvent.click(screen.getByText('Evento Test'));
        
        // verify that modal with event details is opened (look for close button unique to modal)
        expect(screen.getByText('Cerrar')).toBeInTheDocument();
    });

    it('opens create event modal when clicking "Nuevo evento"', () => {
        render(<CalendarView />);
        
        fireEvent.click(screen.getByText('Nuevo evento'));
        
        // verify that modal with event form is opened
        expect(screen.getByText('Guardar')).toBeInTheDocument();
    });

    it('shows admin features when user is Admin', () => {
        render(<CalendarView />);
        
        expect(screen.getByText('Eliminar eventos del año pasado')).toBeInTheDocument();
    });

    it('clears date filter when clicking "Mostrar todos los eventos"', () => {
        render(<CalendarView />);
        
        // Click on day 15 to select it
        fireEvent.click(screen.getByText('15'));
        
        // Verify clear button appears
        const clearButton = screen.getByText('Mostrar todos los eventos');
        expect(clearButton).toBeInTheDocument();
        
        // Click to clear filter
        fireEvent.click(clearButton);
        
        // Verify button disappears (filter was cleared)
        expect(screen.queryByText('Mostrar todos los eventos')).not.toBeInTheDocument();
    });

    it('deletes event when clicking delete button and confirming', () => {
        // Mock window.confirm
        global.confirm = jest.fn(() => true);
        
        // get mocked deleteEvent function
        const { deleteEvent } = require('@/lib/calendar/events');
        
        render(<CalendarView />);
        
        // Find and click delete button (trash icon)
        const deleteButtons = screen.getAllByLabelText('Eliminar evento');
        fireEvent.click(deleteButtons[0]);
        
        // Verify confirm was called
        expect(global.confirm).toHaveBeenCalledWith('¿Estás seguro de que deseas eliminar este evento?');
        
        // Verify deleteEvent was called
        expect(deleteEvent).toHaveBeenCalledWith('1');

    });
});
