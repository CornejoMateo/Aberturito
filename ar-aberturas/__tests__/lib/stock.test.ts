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
  type: 'Tipo 1',
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
  });

  describe('createProfileStock', () => {
    it('debería crear un nuevo perfil', async () => {
      const newProfile = { ...mockProfile, id: undefined };
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
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
      expect(data).toEqual(mockProfile);
      expect(error).toBeNull();
    });
  });

  describe('updateProfileStock', () => {
    it('debería actualizar un perfil existente', async () => {
      const updates = { quantity: 15 };
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: { ...mockProfile, ...updates }, 
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
      expect(data).toEqual(expect.objectContaining(updates));
      expect(error).toBeNull();
    });
  });

  describe('deleteProfileStock', () => {
    it('debería eliminar un perfil', async () => {
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
  });
});
