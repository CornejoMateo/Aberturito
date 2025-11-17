import {
	listIronworksStock,
	getIronworkById,
	createIronworkStock,
	updateIronworkStock,
	deleteIronworkStock,
	type IronworkItemStock,
} from '../../lib/ironwork-stock';
import { getSupabaseClient } from '../../lib/supabase-client';

const mockIronwork: IronworkItemStock = {
	id: '1',
	created_at: '2023-01-01',
	ironwork_category: 'Herrajes',
	ironwork_line: 'Línea 1',
	ironwork_brand: 'Marca A',
	ironwork_code: 'IRN-001',
	ironwork_description: 'Bisagra',
	ironwork_color: 'Negro',
	ironwork_quantity_for_lump: 10,
	ironwork_quantity_lump: 1,
	ironwork_quantity: 10,
	ironwork_site: 'Almacén A',
	ironwork_material: 'Acero',
	ironwork_image_url: null,
	ironwork_price: 100,
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

describe('Ironworks Functions', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('listIronworksStock', () => {
		it('debería devolver una lista de herrajes', async () => {
			const mockData = [mockIronwork];
			mockSupabase.order.mockResolvedValue({ data: mockData, error: null });
			const { data, error } = await listIronworksStock();
			expect(getSupabaseClient).toHaveBeenCalled();
			expect(mockSupabase.from).toHaveBeenCalledWith('ironworks_category');
			expect(mockSupabase.select).toHaveBeenCalledWith('*');
			expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: false });
			expect(data).toEqual(mockData);
			expect(error).toBeNull();
		});

		it('debería devolver una lista vacía si no hay datos', async () => {
			mockSupabase.order.mockResolvedValue({ data: [], error: null });
			const { data, error } = await listIronworksStock();
			expect(data).toEqual([]);
			expect(error).toBeNull();
		});

		it('debería manejar errores correctamente', async () => {
			const mockError = new Error('Error de conexión');
			mockSupabase.order.mockResolvedValue({ data: null, error: mockError });
			const { data, error } = await listIronworksStock();
			expect(data).toBeNull();
			expect(error).toBe(mockError);
		});
	});

	describe('getIronworkById', () => {
		it('debería devolver un herraje por su ID', async () => {
			mockSupabase.single.mockResolvedValue({ data: mockIronwork, error: null });
			const { data, error } = await getIronworkById('1');
			expect(mockSupabase.from).toHaveBeenCalledWith('ironworks_category');
			expect(mockSupabase.select).toHaveBeenCalledWith('*');
			expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
			expect(mockSupabase.single).toHaveBeenCalled();
			expect(data).toEqual(mockIronwork);
			expect(error).toBeNull();
		});

		it('debería manejar el caso cuando el herraje no existe', async () => {
			mockSupabase.single.mockResolvedValue({
				data: null,
				error: { message: 'No se encontró el herraje' },
			});
			const { data, error } = await getIronworkById('999');
			expect(data).toBeNull();
			expect(error).toEqual({ message: 'No se encontró el herraje' });
		});
	});

	describe('createIronworkStock', () => {
		it('debería crear un nuevo herraje con los datos proporcionados', async () => {
			const newIronwork = {
				ironwork_category: 'Herrajes',
				ironwork_line: 'Línea 2',
				ironwork_brand: 'Marca B',
				ironwork_code: 'IRN-002',
				ironwork_color: 'Blanco',
				ironwork_quantity: 5,
				ironwork_material: 'Plástico',
				ironwork_site: 'Almacén B',
			};
			const expectedIronwork = {
				...newIronwork,
				id: '2',
				created_at: '2023-01-02',
				last_update: expect.any(String),
				ironwork_image_url: null,
				ironwork_quantity_for_lump: expect.any(Number),
				ironwork_quantity_lump: expect.any(Number),
				ironwork_price: expect.any(Number),
			};
			mockSupabase.single.mockResolvedValue({ data: expectedIronwork, error: null });
			const { data, error } = await createIronworkStock(newIronwork);
			expect(data).toEqual(expectedIronwork);
			expect(error).toBeNull();
		});

		it('debería manejar errores al crear un herraje', async () => {
			const newIronwork = { ironwork_category: 'Herrajes', ironwork_code: 'IRN-003' };
			const mockError = new Error('Falta el campo obligatorio: ironwork_color');
			mockSupabase.single.mockResolvedValue({ data: null, error: mockError });
			const { data, error } = await createIronworkStock(newIronwork);
			expect(data).toBeNull();
			expect(error.message).toBe(mockError.message);
		});
	});

	describe('updateIronworkStock', () => {
		it('debería actualizar un herraje existente con los nuevos datos', async () => {
			const updates = {
				ironwork_quantity: 15,
				ironwork_site: 'A',
			};
			const updatedIronwork = {
				...mockIronwork,
				...updates,
				last_update: '2023-01-02',
			};
			mockSupabase.single.mockResolvedValue({ data: updatedIronwork, error: null });
			const { data, error } = await updateIronworkStock('1', updates);
			expect(mockSupabase.from).toHaveBeenCalledWith('ironworks_category');
			expect(mockSupabase.update).toHaveBeenCalledWith(
				expect.objectContaining({
					...updates,
					last_update: expect.any(String),
				})
			);
			expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
			expect(mockSupabase.select).toHaveBeenCalled();
			expect(mockSupabase.single).toHaveBeenCalled();
			expect(data).toEqual(updatedIronwork);
			expect(error).toBeNull();
		});

		it('debería manejar errores al actualizar un herraje', async () => {
			const updates = { ironwork_quantity: -5 };
			const mockError = new Error('Cantidad no válida');
			mockSupabase.single.mockResolvedValue({ data: null, error: mockError });
			const { data, error } = await updateIronworkStock('1', updates);
			expect(data).toBeNull();
			expect(error).toBe(mockError);
		});
	});

	describe('deleteIronworkStock', () => {
		it('debería eliminar un herraje existente', async () => {
			mockSupabase.eq.mockResolvedValue({ data: null, error: null });
			const { data, error } = await deleteIronworkStock('1');
			expect(mockSupabase.from).toHaveBeenCalledWith('ironworks_category');
			expect(mockSupabase.delete).toHaveBeenCalled();
			expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
			expect(data).toBeNull();
			expect(error).toBeNull();
		});

		it('debería manejar errores al eliminar un herraje', async () => {
			const mockError = new Error('No se pudo eliminar el herraje');
			mockSupabase.eq.mockResolvedValue({ data: null, error: mockError });
			const { data, error } = await deleteIronworkStock('999');
			expect(data).toBeNull();
			expect(error).toBe(mockError);
		});
	});
});
