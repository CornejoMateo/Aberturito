import { render, screen, fireEvent } from '@testing-library/react';
import { AccessoryFormDialog } from '@/utils/stock/accessory-add-dialog';
import { toast } from '@/components/ui/use-toast';

jest.mock('@/components/provider/auth-provider', () => ({
	useAuth: () => ({ user: { role: 'Admin' } }),
}));

jest.mock('@/components/ui/use-toast', () => ({
	toast: jest.fn(),
}));

describe('AccessoryFormDialog', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('shows validation when required fields are missing', () => {
		render(
			<AccessoryFormDialog
				open={true}
				onOpenChange={jest.fn()}
				onSave={jest.fn()}
				category="Accesorios"
				triggerButton={false}
			/>
		);

		fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

		expect(toast).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Error de validación',
				variant: 'destructive',
			})
		);
	});

	it('shows a validation error when quantity (or width) < 0', () => {

		const onSave = jest.fn();
		const onOpenChange = jest.fn();

		render(
			<AccessoryFormDialog
				open={true}
				onOpenChange={onOpenChange}
				onSave={onSave}
				category="Accesorios"
				triggerButton={false}
			/>
		);

		fireEvent.change(screen.getByLabelText(/categoría/i), { target: { value: 'A' } });
		fireEvent.change(screen.getByLabelText(/código/i), { target: { value: 'ACC-001' } });
		fireEvent.change(screen.getByLabelText(/color/i), { target: { value: 'Blanco' } });
		fireEvent.change(screen.getByLabelText(/cantidad x bulto/i), { target: { value: '2' } });
		fireEvent.change(screen.getByLabelText(/cantidad de bultos/i), { target: { value: '5' } });
		fireEvent.change(screen.getByLabelText(/cantidad total/i), { target: { value: '-10' } });
		fireEvent.change(screen.getByLabelText(/ubicación/i), { target: { value: 'Depósito' } });

		fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

		expect(toast).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Error de validación',
				variant: 'destructive',
			})
		);
	});

	it('submits a valid payload when required fields are completed', () => {
		const onSave = jest.fn();
		const onOpenChange = jest.fn();

		render(
			<AccessoryFormDialog
				open={true}
				onOpenChange={onOpenChange}
				onSave={onSave}
				category="Accesorios"
				triggerButton={false}
			/>
		);

		fireEvent.change(screen.getByLabelText(/categoría/i), { target: { value: 'A' } });
		fireEvent.change(screen.getByLabelText(/código/i), { target: { value: 'ACC-001' } });
		fireEvent.change(screen.getByLabelText(/color/i), { target: { value: 'Blanco' } });
		fireEvent.change(screen.getByLabelText(/cantidad x bulto/i), { target: { value: '2' } });
		fireEvent.change(screen.getByLabelText(/cantidad de bultos/i), { target: { value: '5' } });
		fireEvent.change(screen.getByLabelText(/cantidad total/i), { target: { value: '10' } });
		fireEvent.change(screen.getByLabelText(/ubicación/i), { target: { value: 'Depósito' } });

		fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

		expect(onSave).toHaveBeenCalledWith(
			expect.objectContaining({
				accessory_category: 'A',
				accessory_code: 'ACC-001',
				accessory_color: 'Blanco',
				accessory_quantity_for_lump: 2,
				accessory_quantity_lump: 5,
				accessory_quantity: 10,
				accessory_site: 'Depósito',
			})
		);
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});
});
