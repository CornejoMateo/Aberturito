import {
	listAccesoriesStock,
	getAccesoryById,
	createAccessoryStock,
	updateAccessoryStock,
	deleteAccesoryStock,
	type AccessoryItemStock,
} from '../../lib/stock/accesorie-stock';
import { getSupabaseClient } from '../../lib/supabase-client';

const mockAccessory: AccessoryItemStock = {
	id: '1',
	created_at: '2023-01-01',
	accessory_category: 'Accesorios',
	accessory_line: 'Línea 1',
	accessory_brand: 'Marca A',
	accessory_code: 'ACC-001',
	accessory_description: 'Tornillo',
	accessory_color: 'Negro',
	accessory_quantity_for_lump: 10,
	accessory_quantity_lump: 1,
	accessory_quantity: 10,
	accessory_site: 'Almacén A',
	accessory_material: 'Acero',
	accessory_image_url: null,
	accessory_price: 100,
	last_update: '2023-01-01',
};

const mockSupabase = {
	from: jest.fn().mockReturnThis(),
	select: jest.fn().mockReturnThis(),
	insert: jest.fn().mockReturnThis(),
	update: jest.fn().mockReturnThis(),
	delete: jest.fn().mockReturnThis(),
	eq: jest.fn().mockReturnThis(),
	ilike: jest.fn().mockReturnThis(),
	order: jest.fn().mockReturnThis(),
	single: jest.fn().mockReturnThis(),
	maybeSingle: jest.fn().mockReturnThis(),
};

jest.mock('../../lib/supabase-client', () => ({
	getSupabaseClient: jest.fn(() => mockSupabase),
}));

describe('Accesories Functions', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('listAccesoriesStock', () => {
		it('debería devolver una lista de accesorios', async () => {
			const mockData = [mockAccessory];
			mockSupabase.order.mockResolvedValue({ data: mockData, error: null });
			const { data, error } = await listAccesoriesStock();
			expect(getSupabaseClient).toHaveBeenCalled();
			expect(mockSupabase.from).toHaveBeenCalledWith('accesories_category');
			expect(mockSupabase.select).toHaveBeenCalledWith('*');
			expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: false });
			expect(data).toEqual(mockData);
			expect(error).toBeNull();
		});

		it('debería devolver una lista vacía si no hay datos', async () => {
			mockSupabase.order.mockResolvedValue({ data: [], error: null });
			const { data, error } = await listAccesoriesStock();
			expect(data).toEqual([]);
			expect(error).toBeNull();
		});

		it('debería manejar errores correctamente', async () => {
			const mockError = new Error('Error de conexión');
			mockSupabase.order.mockResolvedValue({ data: null, error: mockError });
			const { data, error } = await listAccesoriesStock();
			expect(data).toBeNull();
			expect(error).toBe(mockError);
		});
	});

	describe('getAccesoryById', () => {
		it('debería devolver un accesorio por su ID', async () => {
			mockSupabase.single.mockResolvedValue({ data: mockAccessory, error: null });
			const { data, error } = await getAccesoryById('1');
			expect(mockSupabase.from).toHaveBeenCalledWith('accesories_category');
			expect(mockSupabase.select).toHaveBeenCalledWith('*');
			expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
			expect(mockSupabase.single).toHaveBeenCalled();
			expect(data).toEqual(mockAccessory);
			expect(error).toBeNull();
		});

		it('debería manejar el caso cuando el accesorio no existe', async () => {
			mockSupabase.single.mockResolvedValue({
				data: null,
				error: { message: 'No se encontró el accesorio' },
			});
			const { data, error } = await getAccesoryById('999');
			expect(data).toBeNull();
			expect(error).toEqual({ message: 'No se encontró el accesorio' });
		});
	});

	describe('createAccessoryStock', () => {
		it('debería crear un nuevo accesorio con los datos proporcionados', async () => {
			const newAccessory = {
				accessory_category: 'Accesorios',
				accessory_line: 'Línea 2',
				accessory_brand: 'Marca B',
				accessory_code: 'ACC-002',
				accessory_color: 'Blanco',
				accessory_quantity: 5,
				accessory_material: 'Plástico',
				accessory_site: 'Almacén B',
			};
			const expectedAccessory = {
				...newAccessory,
				id: '2',
				created_at: '2023-01-02',
				last_update: expect.any(String),
				accessory_image_url: null,
				accessory_quantity_for_lump: expect.any(Number),
				accessory_quantity_lump: expect.any(Number),
				accessory_price: expect.any(Number),
			};
			mockSupabase.single.mockResolvedValue({ data: expectedAccessory, error: null });
			const { data, error } = await createAccessoryStock(newAccessory);
			expect(data).toEqual(expectedAccessory);
			expect(error).toBeNull();
		});

		it('debería manejar errores al crear un accesorio', async () => {
			const newAccessory = { accessory_category: 'Accesorios', accessory_code: 'ACC-003' };
			const mockError = new Error('Falta el campo obligatorio: accessory_color');
			mockSupabase.single.mockResolvedValue({ data: null, error: mockError });
			const { data, error } = await createAccessoryStock(newAccessory);
			expect(data).toBeNull();
			expect(error.message).toBe(mockError.message);
		});
	});

	describe('updateAccessoryStock', () => {
		it('debería actualizar un accesorio existente con los nuevos datos', async () => {
			const updates = {
				accessory_quantity: 15,
				accessory_site: 'Almacén B',
			};
			const updatedAccessory = {
				...mockAccessory,
				...updates,
				last_update: '2023-01-02',
			};
			mockSupabase.single.mockResolvedValue({ data: updatedAccessory, error: null });
			const { data, error } = await updateAccessoryStock('1', updates);
			expect(mockSupabase.from).toHaveBeenCalledWith('accesories_category');
			expect(mockSupabase.update).toHaveBeenCalledWith(
				expect.objectContaining({
					...updates,
					last_update: expect.any(String),
				})
			);
			expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
			expect(mockSupabase.select).toHaveBeenCalled();
			expect(mockSupabase.single).toHaveBeenCalled();
			expect(data).toEqual(updatedAccessory);
			expect(error).toBeNull();
		});

		it('debería manejar errores al actualizar un accesorio', async () => {
			const updates = { accessory_quantity: -5 };
			const mockError = new Error('Cantidad no válida');
			mockSupabase.single.mockResolvedValue({ data: null, error: mockError });
			const { data, error } = await updateAccessoryStock('1', updates);
			expect(data).toBeNull();
			expect(error).toBe(mockError);
		});
	});

	describe('deleteAccesoryStock', () => {
		it('debería eliminar un accesorio existente', async () => {
			mockSupabase.eq.mockResolvedValue({ data: null, error: null });
			const { data, error } = await deleteAccesoryStock('1');
			expect(mockSupabase.from).toHaveBeenCalledWith('accesories_category');
			expect(mockSupabase.delete).toHaveBeenCalled();
			expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
			expect(data).toBeNull();
			expect(error).toBeNull();
		});

		it('debería manejar errores al eliminar un accesorio', async () => {
			const mockError = new Error('No se pudo eliminar el accesorio');
			mockSupabase.eq.mockResolvedValue({ data: null, error: mockError });
			const { data, error } = await deleteAccesoryStock('999');
			expect(data).toBeNull();
			expect(error).toBe(mockError);
		});
	});
});
