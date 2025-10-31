import {
  listOptions,
  createOption,
  deleteOption,
  type LineOption,
  type ColorOption,
  type CodeOption,
  type SiteOption,
} from '@/lib/stock_options';
import { getSupabaseClient } from '@/lib/supabase-client';

// Mock de Supabase
jest.mock('@/lib/supabase-client', () => ({
  getSupabaseClient: jest.fn(),
}));

const mockLine: LineOption = {
  id: 1,
  name_line: 'Línea 1',
  opening: '2.5',
  created_at: '2023-01-01',
};

const mockColor: ColorOption = {
  id: 1,
  name_color: 'Blanco',
  line_name: 'Línea 1',
  created_at: '2023-01-01',
};

describe('stock_options', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listOptions', () => {
    it('debería listar opciones de una tabla', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [mockLine], error: null }),
      };
      
      (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      const { data, error } = await listOptions<LineOption>('lines');

      expect(mockSupabase.from).toHaveBeenCalledWith('lines');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(data).toEqual([mockLine]);
      expect(error).toBeNull();
    });
  });

  describe('createOption', () => {
    it('debería crear una nueva opción', async () => {
      const newLine = {
        name_line: 'Nueva Línea',
        opening: '3.0',
      };

      const createdLine = {
        ...newLine,
        id: 2,
        created_at: '2023-01-02',
      };

      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: createdLine, error: null }),
      };
      
      (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      const { data, error } = await createOption<LineOption>('lines', newLine);

      expect(mockSupabase.from).toHaveBeenCalledWith('lines');
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          ...newLine,
          created_at: expect.any(String),
        })
      );
      expect(data).toEqual(createdLine);
      expect(error).toBeNull();
    });
  });

  describe('deleteOption', () => {
    it('debería eliminar una opción', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      };
      
      (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);

      const { data, error } = await deleteOption('lines', 1);

      expect(mockSupabase.from).toHaveBeenCalledWith('lines');
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 1);
      expect(data).toBeNull();
      expect(error).toBeNull();
    });
  });
});
