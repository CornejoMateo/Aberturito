import { render, screen } from '@testing-library/react';
import { StockStats } from '@/utils/stock/stock-stats';

describe('StockStats', () => {
	it('shows a message when there is no last item', () => {
		render(
			<StockStats
				categoryState="Perfiles"
				totalItems={0}
				lowStockCount={0}
				lastAddedItem={null}
			/>
		);

		expect(screen.getByText('Último agregado')).toBeInTheDocument();
		expect(screen.getByText('No hay registros')).toBeInTheDocument();
	});

	it('renders profile data correctly', () => {
		render(
			<StockStats
				categoryState="Perfiles"
				totalItems={0}
				lowStockCount={0}
				lastAddedItem={{
					id: 1,
					line: 'L1',
					code: 'C1',
					color: 'Blanco',
					width: 120,
					status: 'Bueno',
					quantity: 10,
					site: 'A',
					material: 'PVC',
					created_at: '2025-01-01',
					last_update: '2025-01-01',
				}}
			/>
		);

		expect(screen.getByText('L1, C1')).toBeInTheDocument();
		expect(screen.getByText(/Blanco/)).toBeInTheDocument();
		expect(screen.getByText(/120mm/)).toBeInTheDocument();
	});

	it('renders accessory data correctly', () => {
		render(
			<StockStats
				categoryState="Accesorios"
				totalItems={0}
				lowStockCount={0}
				lastAddedItem={{
					id: 1,
					accessory_category: 'Ejemplo',
					accessory_line: 'AL1',
					accessory_brand: 'B1',
					accessory_code: 'AC1',
					accessory_description: 'Ejemplo',
					accessory_color: 'Blanco',
					accessory_quantity_for_lump: 10,
					accessory_quantity_lump: 10,
					accessory_quantity: 100,
					accessory_site: 'S1',
					accessory_material: 'PVC',
					accessory_price: 1000,
					created_at: '2025-01-01',
					last_update: '2025-01-01',
				}}
			/>
		);

		expect(screen.getByText('AL1, AC1')).toBeInTheDocument();
		expect(screen.getByText(/Blanco/)).toBeInTheDocument();
	});
});
