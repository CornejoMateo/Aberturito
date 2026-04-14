import { render, screen, fireEvent } from '@testing-library/react';
import { StockFilters } from '@/utils/stock/stock-filters';

jest.mock('@/components/stock/update-prices-dialog', () => ({
	UpdatePricesDialog: () => <div>UpdatePricesDialogMock</div>,
}));

describe('StockFilters', () => {
	it('updates search term and out of stock toggle', () => {
		const setSearchTerm = jest.fn();
		const setShowOutOfStock = jest.fn();

		render(
			<StockFilters
				searchTerm=""
				setSearchTerm={setSearchTerm}
				selectedCategory="Perfiles"
				showOutOfStock={false}
				setShowOutOfStock={setShowOutOfStock}
				setSelectedCategory={jest.fn()}
			/>
		);

		fireEvent.change(screen.getByPlaceholderText(/buscar por ubicaci/i), {
			target: { value: 'linea 25' },
		});
		expect(setSearchTerm).toHaveBeenCalledWith('linea 25');

		fireEvent.click(screen.getByRole('button', { name: /mostrar solo sin stock/i }));
		expect(setShowOutOfStock).toHaveBeenCalledWith(true);
	});

	it('shows UpdatePricesDialog in allowed categories', () => {
		const { rerender } = render(
			<StockFilters
				searchTerm=""
				setSearchTerm={jest.fn()}
				selectedCategory="Perfiles"
				showOutOfStock={false}
				setShowOutOfStock={jest.fn()}
				setSelectedCategory={jest.fn()}
			/>
		);

		expect(screen.queryByText('UpdatePricesDialogMock')).not.toBeInTheDocument();

		rerender(
			<StockFilters
				searchTerm=""
				setSearchTerm={jest.fn()}
				selectedCategory="Accesorios"
				showOutOfStock={false}
				setShowOutOfStock={jest.fn()}
				setSelectedCategory={jest.fn()}
			/>
		);

		expect(screen.getByText('UpdatePricesDialogMock')).toBeInTheDocument();
	});
});
