import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmUpdateDialog } from '@/utils/stock/confirm-update-dialog';

describe('ConfirmUpdateDialog', () => {
	it('renders the content and calculates the new quantity for an increment', () => {
		render(
			<ConfirmUpdateDialog
				open={true}
				onOpenChange={jest.fn()}
				onConfirm={jest.fn()}
				itemName="Perfil A"
				action="increment"
				quantity={10}
				isLoading={false}
			/>
		);

		expect(screen.getByText('Confirmar actualización')).toBeInTheDocument();
		expect(screen.getByText('Sí, incrementar')).toBeInTheDocument();
		expect(screen.getByText(/10/)).toBeInTheDocument();
		expect(screen.getByText(/11/)).toBeInTheDocument();
	});

	it('renders the content and calculates the new quantity for an decrement', () => {
		render(
			<ConfirmUpdateDialog
				open={true}
				onOpenChange={jest.fn()}
				onConfirm={jest.fn()}
				itemName="Perfil A"
				action="decrement"
				quantity={10}
				isLoading={false}
			/>
		);

		expect(screen.getByText('Confirmar actualización')).toBeInTheDocument();
		expect(screen.getByText('Sí, disminuir')).toBeInTheDocument();
		expect(screen.getByText(/10/)).toBeInTheDocument();
		expect(screen.getByText(/9/)).toBeInTheDocument();
	});

	it('triggers the cancel and confirm callbacks', () => {
		const onOpenChange = jest.fn();
		const onConfirm = jest.fn();

		render(
			<ConfirmUpdateDialog
				open={true}
				onOpenChange={onOpenChange}
				onConfirm={onConfirm}
				itemName="Perfil A"
				action="decrement"
				quantity={10}
				isLoading={false}
			/>
		);

		fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
		expect(onOpenChange).toHaveBeenCalledWith(false);

		fireEvent.click(screen.getByRole('button', { name: /disminuir/i }));
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});
});
