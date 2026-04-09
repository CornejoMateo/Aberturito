import { filterStockItems } from '@/utils/stock/stock-filters-logic';

describe('filterStockItems', () => {
	it('filters by search term in accessories dynamic fields', () => {
		const stock = [
			{ accessory_code: 'ACC-001', accessory_material: 'PVC' },
			{ accessory_code: 'ACC-XYZ', accessory_material: 'Aluminio' },
		];

		const result = filterStockItems(stock, 'acc-001', 'Accesorios', 'PVC', 'Accesorios');
		expect(result).toHaveLength(1);
		expect(result[0].accessory_code).toBe('ACC-001');
	});

	it('filters by material when materialType is specified', () => {
		const stock = [
			{ accessory_code: 'ACC-001', accessory_material: 'PVC' },
			{ accessory_code: 'ACC-002', accessory_material: 'Aluminio' },
		];

		const result = filterStockItems(stock, 'acc', 'Accesorios', 'Aluminio', 'Accesorios');
		expect(result).toHaveLength(1);
		expect(result[0].accessory_code).toBe('ACC-002');
	});

	it('returns empty array when stock is null/undefined', () => {
		const result = filterStockItems(undefined as any, '', 'Perfiles', 'PVC', 'Perfiles');
		expect(result).toEqual([]);
	});
});
