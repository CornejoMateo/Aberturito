import { render, screen } from '@testing-library/react';
import { ClientManagement } from '@/components/business/client-management';
import { useAuth } from '@/components/provider/auth-provider';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';

jest.mock('@/hooks/clients/use-client-budgets-info', () => ({
  useClientBudgetsInfo: () => ({
    info: {},
    loading: false,
  }),
}));

const mockClients = [
  {
    id: 1,
    name: 'Juan',
    last_name: 'Perez',
    email: 'juan@test.com',
    phone_number: '123456',
    locality: 'Cordoba',
  },
];

jest.mock('@/hooks/use-optimized-realtime', () => ({
  useOptimizedRealtime: () => ({
    data: mockClients,
    isLoading: false,
    refresh: jest.fn(),
  }),
}));

jest.mock('@/components/provider/auth-provider', () => ({
  useAuth: jest.fn(),
}));

describe('ClientManagement', () => {
    beforeEach(() => {
        (useAuth as jest.Mock).mockReturnValue({
            user: { role: 'Admin' },
        });
    });

    it('shows "Nuevo cliente" button for Admin', () => {

        render(<ClientManagement />);

        expect(screen.getByText(/nuevo cliente/i)).toBeInTheDocument();
    });

    
    it('shows "Nuevo cliente" button for Ventas', () => {

        (useAuth as jest.Mock).mockReturnValue({
            user: { role: 'Ventas' },
        });


        render(<ClientManagement />);

        expect(screen.getByText(/nuevo cliente/i)).toBeInTheDocument();
    });


    it('does NOT show "Nuevo cliente" button for Colocador', () => {
            
        (useAuth as jest.Mock).mockReturnValue({
            user: { role: 'Colocador' },
        });

        render(<ClientManagement />);

        expect(
            screen.queryByText(/nuevo cliente/i)
        ).not.toBeInTheDocument();
    });

    it('shows Edit button for Admin', () => {

        render(<ClientManagement />);

        expect(screen.getByText(/editar/i)).toBeInTheDocument();
    });

    it('shows Edit button for Ventas', () => {

        (useAuth as jest.Mock).mockReturnValue({
            user: { role: 'Ventas' },
        });

        render(<ClientManagement />);

        expect(screen.getByText(/editar/i)).toBeInTheDocument();
    });

    it('does not show Edit button for Colocador', () => {

        (useAuth as jest.Mock).mockReturnValue({
            user: { role: 'Colocador' },
        });

        render(<ClientManagement />);

        expect(
            screen.queryByText(/editar/i)
        ).not.toBeInTheDocument();
        
    });

    it('shows sensitive client info for Admin', () => {

        render(<ClientManagement />);

        expect(screen.getByText('juan@test.com')).toBeInTheDocument();
        expect(screen.getByText('123456')).toBeInTheDocument();
        expect(screen.getByText('Cordoba')).toBeInTheDocument();
    });

    
    it('shows sensitive client info for Ventas', () => {

        (useAuth as jest.Mock).mockReturnValue({
            user: { role: 'Ventas' },
        });

        render(<ClientManagement />);

        expect(screen.getByText('juan@test.com')).toBeInTheDocument();
        expect(screen.getByText('123456')).toBeInTheDocument();
        expect(screen.getByText('Cordoba')).toBeInTheDocument();
    });

        
    it('does not show sensitive client info for Colocador', () => {

        (useAuth as jest.Mock).mockReturnValue({
            user: { role: 'Colocador' },
        });

        render(<ClientManagement />);

        expect(screen.queryByText('juan@test.com')).not.toBeInTheDocument();
        expect(screen.queryByText('123456')).not.toBeInTheDocument();
        expect(screen.queryByText('Cordoba')).not.toBeInTheDocument();
    });

});