import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClientDetailsDialog } from '@/utils/clients/client-details-dialog';
import { useAuth } from '@/components/provider/auth-provider';

const mockClient = {
  id: 1,
  name: 'Juan',
  last_name: 'Perez',
  email: 'juan@test.com',
  phone_number: '123456',
  locality: 'Cordoba',
  cover: '',
};

jest.mock('@/components/provider/auth-provider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/works/works', () => ({
  createWork: jest.fn(),
  getWorksByClientId: jest.fn(),
  deleteWork: jest.fn(),
}));

jest.mock('@/lib/budgets/folder_budgets', () => ({
  getFolderBudgetsByClientId: jest.fn(),
}));

jest.mock('@/lib/budgets/budgets', () => ({
  getBudgetsByFolderBudgetIds: jest.fn(),
}));

describe('ClientDetailsDialog', () => {
    
    it('renders dialog when isOpen is true', () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: { role: 'Admin' },
        });

        render(
            <ClientDetailsDialog
                client={mockClient as any}
                isOpen={true}
                onClose={jest.fn()}
                onEdit={jest.fn()}
            />
        );

        expect(screen.getByText(/detalles del cliente/i)).toBeInTheDocument();
        expect(screen.getByText('Perez Juan')).toBeInTheDocument();
    });
});