// Configuración global para las pruebas
import '@testing-library/jest-dom';

// Mock de Supabase
jest.mock('../lib/supabase-client', () => ({
	getSupabaseClient: jest.fn(() => ({
		from: jest.fn().mockReturnThis(),
		select: jest.fn().mockReturnThis(),
		insert: jest.fn().mockReturnThis(),
		update: jest.fn().mockReturnThis(),
		delete: jest.fn().mockReturnThis(),
		eq: jest.fn().mockReturnThis(),
		order: jest.fn().mockReturnThis(),
		single: jest.fn().mockResolvedValue({ data: null, error: null }),
	})),
}));
