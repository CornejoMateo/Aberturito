import {
  listStock,
  getProfileById,
  createProfileStock,
  updateProfileStock,
  deleteProfileStock,
  type ProfileItemStock,
} from '../../lib/stock';
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
  last_update: '2023-01-01',
};

// Mock de la función getSupabaseClient
jest.mock('../../lib/supabase-client', () => ({
  getSupabaseClient: jest.fn(),
}));

describe('Stock Functions', () => {
  // Limpiar los mocks antes de cada prueba
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listStock', () => {
    it('debería devolver una lista de perfiles', async () => {
      const mockData = [mockProfile];
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      };
      
      (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      const { data, error } = await listStock();

      expect(getSupabaseClient).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(data).toEqual(mockData);
      expect(error).toBeNull();
    });

    it('debería devolver una lista vacía si no hay datos', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
      
      (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      const { data, error } = await listStock();

      expect(data).toEqual([]);
      expect(error).toBeNull();
    });

    it('debería manejar errores correctamente', async () => {
      const mockError = new Error('Error de conexión');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      
      (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      const { data, error } = await listStock();

      expect(data).toBeNull();
      expect(error).toBe(mockError);
    });
  });

  describe('getProfileById', () => {
    it('debería devolver un perfil por su ID', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      };
      
      (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      const { data, error } = await getProfileById('1');

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(data).toEqual(mockProfile);
      expect(error).toBeNull();
    });

    it('debería manejar el caso cuando el perfil no existe', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'No se encontró el perfil' } }),
      };
      
      (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      const { data, error } = await getProfileById('999');

      expect(data).toBeNull();
      expect(error).toEqual({ message: 'No se encontró el perfil' });
    });
  });

  describe('createProfileStock', () => {
    it('debería crear un nuevo perfil con los datos proporcionados', async () => {
      const newProfile = { 
        category: 'Perfiles',
        codigo: 'PER-002',
        line: 'Línea 2',
        color: 'Negro',
        quantity: 5,
        material: 'PVC'
      };
      
      const expectedProfile = {
        ...newProfile,
        id: '2',
        created_at: '2023-01-02',
        last_update: expect.any(String),
      };

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: expectedProfile, error: null }),
      };
      
      (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      const { data, error } = await createProfileStock(newProfile);

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        ...newProfile,
        last_update: expect.any(String),
      }));
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(data).toEqual(expectedProfile);
      expect(error).toBeNull();
    });

    it('debería manejar errores al crear un perfil', async () => {
      const newProfile = { category: 'Perfiles', codigo: 'PER-003' };
      const mockError = new Error('Error al crear el perfil');
      
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      
      (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      const { data, error } = await createProfileStock(newProfile);

      expect(data).toBeNull();
      expect(error).toBe(mockError);
    });
  });

  describe('updateProfileStock', () => {
    it('debería actualizar un perfil existente con los nuevos datos', async () => {
      const updates = { 
        quantity: 15,
        status: 'Reponer',
        site: 'Almacén B' 
      };
      
      const updatedProfile = {
        ...mockProfile,
        ...updates,
        last_update: '2023-01-02',
      };

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: updatedProfile, 
          error: null 
        }),
      };
      
      (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      const { data, error } = await updateProfileStock('1', updates);

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabase.update).toHaveBeenCalledWith(expect.objectContaining({
        ...updates,
        last_update: expect.any(String),
      }));
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(data).toEqual(updatedProfile);
      expect(error).toBeNull();
    });

    it('debería manejar errores al actualizar un perfil', async () => {
      const updates = { quantity: -5 }; // Cantidad inválida
      const mockError = new Error('Cantidad no válida');
      
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: mockError 
        }),
      };
      
      (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      const { data, error } = await updateProfileStock('1', updates);

      expect(data).toBeNull();
      expect(error).toBe(mockError);
    });
  });

  describe('deleteProfileStock', () => {
    it('debería eliminar un perfil existente', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      };
      
      (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      const { data, error } = await deleteProfileStock('1');

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
      expect(data).toBeNull();
      expect(error).toBeNull();
    });

    it('debería manejar errores al eliminar un perfil', async () => {
      const mockError = new Error('No se pudo eliminar el perfil');
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      
      (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      const { data, error } = await deleteProfileStock('999');

      expect(data).toBeNull();
      expect(error).toBe(mockError);
    });
  });
});
