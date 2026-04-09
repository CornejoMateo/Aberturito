import { render, screen, fireEvent } from '@testing-library/react';
import { StockFormDialog } from '@/utils/stock/stock-add-dialog';

const mockToast = jest.fn();

jest.mock('@/components/ui/use-toast', () => ({
	toast: (...args: any[]) => mockToast(...args),
}));

jest.mock('@/components/stock/line-select', () => ({
	LineSelect: ({ value, onValueChange }: any) => (
		<input data-testid="line-select" value={value} onChange={(e) => onValueChange(e.target.value)} />
	),
}));

jest.mock('@/components/stock/code-select', () => ({
	CodeSelect: ({ value, onValueChange }: any) => (
		<input data-testid="code-select" value={value} onChange={(e) => onValueChange(e.target.value)} />
	),
}));

jest.mock('@/components/stock/color-select', () => ({
	ColorSelect: ({ value, onValueChange }: any) => (
		<input data-testid="color-select" value={value} onChange={(e) => onValueChange(e.target.value)} />
	),
}));

jest.mock('@/components/stock/site-select', () => ({
	SiteSelect: ({ value, onValueChange }: any) => (
		<input data-testid="site-select" value={value} onChange={(e) => onValueChange(e.target.value)} />
	),
}));

describe('StockFormDialog', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('shows a validation error when fields are missing', () => {
		render(
			<StockFormDialog
				open={true}
				onOpenChange={jest.fn()}
				onSave={jest.fn()}
				triggerButton={false}
			/>
		);

		fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

		expect(mockToast).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Error de validación',
				variant: 'destructive',
			})
		);
	});

	it('shows a validation error when quantity (or width) < 0', () => {
		render(
			<StockFormDialog
				open={true}
				onOpenChange={jest.fn()}
				onSave={jest.fn()}
				triggerButton={false}
			/>
		);

		fireEvent.change(screen.getByTestId('line-select'), { target: { value: 'Linea 1' } });
		fireEvent.change(screen.getByTestId('code-select'), { target: { value: 'COD-1' } });
		fireEvent.change(screen.getByTestId('color-select'), { target: { value: 'Blanco' } });
		fireEvent.change(screen.getByTestId('site-select'), { target: { value: 'Depósito' } });
		fireEvent.change(screen.getByLabelText(/cantidad/i), { target: { value: '-10' } });
		fireEvent.change(screen.getByLabelText(/largo/i), { target: { value: '100' } });

		fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

		expect(mockToast).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Error de validación',
				variant: 'destructive',
			})
		);
	});

	it('saves successfully when the form is valid', () => {
		const onSave = jest.fn();
		const onOpenChange = jest.fn();

		render(
			<StockFormDialog
				open={true}
				onOpenChange={onOpenChange}
				onSave={onSave}
				triggerButton={false}
			/>
		);

		fireEvent.change(screen.getByTestId('line-select'), { target: { value: 'Linea 1' } });
		fireEvent.change(screen.getByTestId('code-select'), { target: { value: 'COD-1' } });
		fireEvent.change(screen.getByTestId('color-select'), { target: { value: 'Blanco' } });
		fireEvent.change(screen.getByTestId('site-select'), { target: { value: 'Depósito' } });
		fireEvent.change(screen.getByLabelText(/cantidad/i), { target: { value: '10' } });
		fireEvent.change(screen.getByLabelText(/largo/i), { target: { value: '100' } });

		fireEvent.click(screen.getByRole('button', { name: /^guardar$/i }));

		expect(onSave).toHaveBeenCalledWith(
			expect.objectContaining({
				code: 'COD-1',
				line: 'Linea 1',
				color: 'Blanco',
				quantity: 10,
				site: 'Depósito',
				width: 100,
			})
		);
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});
});
