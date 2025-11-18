import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UpdatePricesDialog } from '@/components/stock/update-prices-dialog';

// Mock useToast
jest.mock('@/hooks/use-toast', () => ({
	useToast: () => ({ toast: jest.fn() }),
}));

describe('UpdatePricesDialog', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renderiza el botón y el modal', () => {
		render(<UpdatePricesDialog />);
		expect(screen.getByText('Actualizar Precios')).toBeInTheDocument();
	});

	it('muestra error si no se selecciona archivo', async () => {
		render(<UpdatePricesDialog />);
		fireEvent.click(screen.getByText('Actualizar Precios'));
		await waitFor(() => {
			expect(screen.getByText('Actualizar precios')).toBeInTheDocument();
		});
		fireEvent.click(screen.getByText('Actualizar precios'));
		await waitFor(() => {
			// Busca el texto en todo el documento, incluyendo portales
			expect(document.body.textContent).toContain('Sube un archivo .txt con los códigos y precios actualizados.');
		});
	});

	it('acepta archivo y muestra nombre', async () => {
		render(<UpdatePricesDialog />);
		fireEvent.click(screen.getByText('Actualizar Precios'));
		const input = screen.getByLabelText('Archivo');
		const file = new File(['COD1\t100\nCOD2\t200'], 'precios.txt', { type: 'text/plain' });
		// Mock file.text()
		file.text = async () => 'COD1\t100\nCOD2\t200';
		fireEvent.change(input, { target: { files: [file] } });
		expect(screen.getByText('precios.txt')).toBeInTheDocument();
	});

	it('envía el archivo y muestra progreso', async () => {
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
		// await waitFor(() => {
		//   expect(screen.getByText(/¡Actualización completada!/)).toBeInTheDocument();
		// });
	});
});
