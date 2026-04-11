import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UpdatePricesDialog } from '@/components/stock/update-prices-dialog';

// Mock useToast
const mockToast = jest.fn();

jest.mock('@/components/ui/use-toast', () => ({
	useToast: () => ({ toast: mockToast }),
}));

describe('UpdatePricesDialog', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders the button and the modal', () => {
		render(<UpdatePricesDialog />);
		expect(screen.getByText('Actualizar Precios')).toBeInTheDocument();
	});

	it('disables submit when no file is selected', async () => {
		render(<UpdatePricesDialog />);
		fireEvent.click(screen.getByText('Actualizar Precios'));
		await waitFor(() => {
			expect(screen.getByText('Actualizar precios desde archivo')).toBeInTheDocument();
		});
		expect(screen.getByRole('button', { name: 'Actualizar precios' })).toBeDisabled();
		expect(mockToast).not.toHaveBeenCalled();
	});

	it('accepts a file and shows its name', async () => {
		render(<UpdatePricesDialog />);
		fireEvent.click(screen.getByText('Actualizar Precios'));
		const input = screen.getByLabelText('Archivo');
		const file = new File(['COD1\t100\nCOD2\t200'], 'precios.txt', { type: 'text/plain' });
		// Mock file.text()
		file.text = async () => 'COD1\t100\nCOD2\t200';
		fireEvent.change(input, { target: { files: [file] } });
		expect(screen.getByText('precios.txt')).toBeInTheDocument();
	});

	it('submits the file and shows progress', async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ updated: 2, errors: [] }),
		});
		render(<UpdatePricesDialog />);
		fireEvent.click(screen.getByText('Actualizar Precios'));
		const input = screen.getByLabelText('Archivo');
		const file = new File(['COD1\t100\nCOD2\t200'], 'precios.txt', { type: 'text/plain' });
		// Mock file.text()
		file.text = async () => 'COD1\t100\nCOD2\t200';
		fireEvent.change(input, { target: { files: [file] } });
		fireEvent.click(screen.getByText('Actualizar precios'));
		await waitFor(() => {
			expect(screen.getByText(/Procesando archivo/)).toBeInTheDocument();
			// Match the actual progress text, e.g. "0 de 2 líneas", "1 de 2 líneas", "2 de 2 líneas"
			expect(screen.getByText((content) => /\d+ de 2 líneas/.test(content))).toBeInTheDocument();
		});
		await waitFor(() => {
			expect(mockToast).toHaveBeenCalledWith(
				expect.objectContaining({
					title: '¡Actualización completada!',
					description: 'Se procesaron 2 registros',
				})
			);
		});
	});
});
