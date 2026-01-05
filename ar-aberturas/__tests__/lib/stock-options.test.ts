import {
	listOptions,
	createOption,
	deleteOption,
	type LineOption,
	type ColorOption,
	type CodeOption,
	type SiteOption,
} from '../../lib/stock/stock-options';
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
		it('debería crear una nueva opción con los datos proporcionados', async () => {
			const newLine = {
				name_line: 'Línea 1',
				opening: '2.5',
			};
			const expectedLine = {
				...newLine,
				id: 1,
				created_at: '2023-01-01',
			};

			const mockSupabase = {
				from: jest.fn().mockReturnThis(),
				insert: jest.fn().mockReturnThis(),
				select: jest.fn().mockReturnThis(),
				single: jest.fn().mockResolvedValue({ data: expectedLine, error: null }),
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
			expect(data).toEqual(expectedLine);
			expect(error).toBeNull();
		});

		it('debería arrojar error si falta un campo obligatorio', async () => {
			const newLine = { name_line: 'Línea 1' }; // Falta opening
			const { data, error } = await createOption<LineOption>('lines', newLine);
			expect(data).toBeNull();
			expect(error).toBeInstanceOf(Error);
			expect(error.message).toMatch(/Falta el campo obligatorio/);
		});
	});

	describe('deleteOption', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		it('debería eliminar una opción', async () => {
			// Mock de fetch
			global.fetch = jest.fn().mockResolvedValue({
				json: jest.fn().mockResolvedValue({
					success: true,
					error: null,
					data: null,
				}),
			});

			const { data, error, success } = await deleteOption('lines', 1);

			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/options/delete?table=lines&id=1'),
				expect.objectContaining({ method: 'DELETE' })
			);
			expect(success).toBe(true);
			expect(data).toBeNull();
			expect(error).toBeNull();
		});
	});
});
