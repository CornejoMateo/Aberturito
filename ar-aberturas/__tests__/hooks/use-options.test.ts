import { renderHook, act, waitFor } from '@testing-library/react';
import { useOptions } from '@/hooks/use-options';

jest.mock('@/lib/supabase-client', () => ({
	getSupabaseClient: () => ({
		channel: () => ({
			on: () => ({
				subscribe: () => ({}),
			}),
			subscribe: () => ({}),
		}),
		removeChannel: () => {},
	}),
}));

describe('useOptions', () => {
	const mockFetchSuccess = (data: any[]) => jest.fn().mockResolvedValue(data);

	const mockFetchError = (error: Error) => jest.fn().mockRejectedValue(error);

	beforeEach(() => {
		localStorage.clear();
		jest.clearAllMocks();
	});

	it('debería cargar opciones desde localStorage si están disponibles', async () => {
		const localData = [
			{ id: 1, name: 'Opción 1' },
			{ id: 2, name: 'Opción 2' },
		];
		localStorage.setItem('testKey', JSON.stringify(localData));

		const { result } = renderHook(() => useOptions('testKey', mockFetchSuccess(localData)));

		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.options).toEqual(localData);
		expect(result.current.error).toBeNull();
	});

	it('debería cargar opciones desde la función fetch si no hay datos en localStorage', async () => {
		const apiData = [
			{ id: 3, name: 'Opción 3' },
			{ id: 4, name: 'Opción 4' },
		];
		const fetchFn = mockFetchSuccess(apiData);

		const { result } = renderHook(() => useOptions('testKey', fetchFn));

		await act(async () => {
			await Promise.resolve();
		});

		expect(fetchFn).toHaveBeenCalled();
		expect(result.current.loading).toBe(false);
		expect(result.current.options).toEqual(apiData);
		expect(localStorage.getItem('testKey')).toBe(JSON.stringify(apiData));
	});

	it('debería manejar errores al cargar opciones', async () => {
		const error = new Error('Error de red');
		const fetchFn = mockFetchError(error);

		const { result } = renderHook(() => useOptions('testKey', fetchFn));

		await act(async () => {
			await Promise.resolve();
		});

		expect(fetchFn).toHaveBeenCalled();
		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBe('Error de red');
		expect(result.current.options).toEqual([]);
	});

	it('debería actualizar las opciones correctamente', async () => {
		const initialData = [{ id: 1, name: 'Opción 1' }];
		const updatedData = [{ id: 1, name: 'Opción actualizada' }];

		const fetchFn = mockFetchSuccess(initialData);

		const { result } = renderHook(() => useOptions('testKey', fetchFn));

		await act(async () => {
			await Promise.resolve();
		});

		expect(result.current.options).toEqual(initialData);

		await act(async () => {
			result.current.updateOptions(updatedData);
			await Promise.resolve();
		});

		expect(result.current.options).toEqual(updatedData);
		expect(localStorage.getItem('testKey')).toBe(JSON.stringify(updatedData));
	});

	it('debería arrojar error si falta un campo obligatorio al crear una opción', async () => {
		const { createOption } = require('../../lib/stock-options');
		const newOption = { name_line: 'Línea 1' };
		const { data, error } = await createOption('lines', newOption);
		expect(data).toBeNull();
		expect(error).toBeInstanceOf(Error);
		expect(error.message).toMatch(/Falta el campo obligatorio/);
	});
});
