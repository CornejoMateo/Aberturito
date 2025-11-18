import {
	listStock,
	getProfileById,
	createProfileStock,
	updateProfileStock,
	deleteProfileStock,
	type ProfileItemStock,
} from '../../lib/profile-stock';
import { getSupabaseClient } from '../../lib/supabase-client';

// Mock de los datos de prueba
const mockProfile: ProfileItemStock = {
	id: '1',
	category: 'Perfiles',
	code: 'PER-001',
	line: 'Línea 1',
	color: 'Blanco',
	status: 'Bueno',
	quantity: 10,
	site: 'Almacén A',
	width: 100,
	material: 'Aluminio',
	created_at: '2023-01-01',
	image_url: null,
	last_update: '2023-01-01',
};

// Mock global de Supabase para todos los tests
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

describe('Stock Functions', () => {
	// Limpiar los mocks antes de cada prueba
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('listStock', () => {
		it('debería devolver una lista de perfiles', async () => {
			const mockData = [mockProfile];
			mockSupabase.order.mockResolvedValue({ data: mockData, error: null });
			const { data, error } = await listStock();
			expect(getSupabaseClient).toHaveBeenCalled();
			expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
			expect(mockSupabase.select).toHaveBeenCalledWith('*');
			expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: false });
			expect(data).toEqual(mockData);
			expect(error).toBeNull();
		});

		it('debería devolver una lista vacía si no hay datos', async () => {
			mockSupabase.order.mockResolvedValue({ data: [], error: null });
			const { data, error } = await listStock();
			expect(data).toEqual([]);
			expect(error).toBeNull();
		});

		it('debería manejar errores correctamente', async () => {
			const mockError = new Error('Error de conexión');
			mockSupabase.order.mockResolvedValue({ data: null, error: mockError });
			const { data, error } = await listStock();
			expect(data).toBeNull();
			expect(error).toBe(mockError);
		});
	});

	describe('getProfileById', () => {
		it('debería devolver un perfil por su ID', async () => {
			mockSupabase.single.mockResolvedValue({ data: mockProfile, error: null });
			const { data, error } = await getProfileById('1');
			expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
			expect(mockSupabase.select).toHaveBeenCalledWith('*');
			expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
			expect(mockSupabase.single).toHaveBeenCalled();
			expect(data).toEqual(mockProfile);
			expect(error).toBeNull();
		});

		it('debería manejar el caso cuando el perfil no existe', async () => {
			mockSupabase.single.mockResolvedValue({
				data: null,
				error: { message: 'No se encontró el perfil' },
			});
			const { data, error } = await getProfileById('999');
			expect(data).toBeNull();
			expect(error).toEqual({ message: 'No se encontró el perfil' });
		});
	});

	describe('createProfileStock', () => {
		it('debería crear un nuevo perfil con los datos proporcionados', async () => {
			const newProfile = {
				category: 'Perfiles',
				code: 'PER-002',
				line: 'Línea 2',
				color: 'Negro',
				quantity: 5,
				material: 'PVC',
				status: 'Bueno',
				site: 'Almacén B',
				width: 50,
			};
			const expectedProfile = {
				...newProfile,
				id: '2',
				created_at: '2023-01-02',
				last_update: expect.any(String),
			};
			mockSupabase.single.mockResolvedValue({ data: expectedProfile, error: null });
			const { data, error } = await createProfileStock(newProfile);
			expect(data).toEqual(expectedProfile);
			expect(error).toBeNull();
		});

		it('debería manejar errores al crear un perfil', async () => {
			const newProfile = { category: 'Perfiles', code: 'PER-003' };
			const { data, error } = await createProfileStock(newProfile);
			expect(data).toBeNull();
			expect(error).toBeInstanceOf(Error);
			expect(error.message).toMatch(/Falta el campo obligatorio/);
		});
	});

	describe('updateProfileStock', () => {
		it('debería actualizar un perfil existente con los nuevos datos', async () => {
			const updates = {
				quantity: 15,
				status: 'Reponer',
				site: 'Almacén B',
			};
			const updatedProfile = {
				...mockProfile,
				...updates,
				last_update: '2023-01-02',
			};
			mockSupabase.single.mockResolvedValue({ data: updatedProfile, error: null });
			const { data, error } = await updateProfileStock('1', updates);
			expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
			expect(mockSupabase.update).toHaveBeenCalledWith(
				expect.objectContaining({
					...updates,
					last_update: expect.any(String),
				})
			);
			expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
			expect(mockSupabase.select).toHaveBeenCalled();
			expect(mockSupabase.single).toHaveBeenCalled();
			expect(data).toEqual(updatedProfile);
			expect(error).toBeNull();
		});

		it('debería manejar errores al actualizar un perfil', async () => {
			const updates = { quantity: -5 }; // Cantidad inválida
			const mockError = new Error('Cantidad no válida');
			mockSupabase.single.mockResolvedValue({ data: null, error: mockError });
			const { data, error } = await updateProfileStock('1', updates);
			expect(data).toBeNull();
			expect(error).toBe(mockError);
		});
	});

	describe('deleteProfileStock', () => {
		it('debería eliminar un perfil existente', async () => {
			mockSupabase.eq.mockResolvedValue({ data: null, error: null });
			const { data, error } = await deleteProfileStock('1');
			expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
			expect(mockSupabase.delete).toHaveBeenCalled();
			expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
			expect(data).toBeNull();
			expect(error).toBeNull();
		});

		it('debería manejar errores al eliminar un perfil', async () => {
			const mockError = new Error('No se pudo eliminar el perfil');
			mockSupabase.eq.mockResolvedValue({ data: null, error: mockError });
			const { data, error } = await deleteProfileStock('999');
			expect(data).toBeNull();
			expect(error).toBe(mockError);
		});
	});
});
