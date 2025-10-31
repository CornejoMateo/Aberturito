import { renderHook, act } from '@testing-library/react';
import { useOptions } from '@/hooks/useOptions';


describe('useOptions', () => {
  const mockFetchSuccess = (data: any[]) => 
    jest.fn().mockResolvedValue(data);
    
  const mockFetchError = (error: Error) => 
    jest.fn().mockRejectedValue(error);

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('debería cargar opciones desde localStorage si están disponibles', async () => {
    const localData = [{ id: 1, name: 'Opción 1' }, { id: 2, name: 'Opción 2' }];
    
    await act(async () => {
      localStorage.setItem('testKey', JSON.stringify(localData));
    });
    
    const { result } = renderHook(() => 
      useOptions('testKey', mockFetchSuccess([]))
    );

    // Estado inicial
    expect(result.current.loading).toBe(false);
    expect(result.current.options).toEqual(localData);
    expect(result.current.error).toBeNull();
  });

  it('debería cargar opciones desde la función fetch si no hay datos en localStorage', async () => {
    const apiData = [{ id: 3, name: 'Opción 3' }, { id: 4, name: 'Opción 4' }];
    const fetchFn = mockFetchSuccess(apiData);
    
    const { result } = renderHook(() => 
      useOptions('testKey', fetchFn)
    );

    // Esperar a que se complete la carga
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
    
    const { result } = renderHook(() => 
      useOptions('testKey', fetchFn)
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(fetchFn).toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Error de red');
    expect(result.current.options).toEqual([]);
  });

  it('debería actualizar las opciones correctamente', async () => {
    // Primero cargamos datos iniciales
    const initialData = [{ id: 1, name: 'Opción 1' }];
    const updatedData = [{ id: 1, name: 'Opción actualizada' }];
    
    // Configuramos el mock para devolver los datos iniciales
    const fetchFn = mockFetchSuccess(initialData);
    
    const { result } = renderHook(() => 
      useOptions('testKey', fetchFn)
    );
    
    // Esperamos a que se carguen los datos iniciales
    await act(async () => {
      await Promise.resolve();
    });
    
    // Verificamos que los datos iniciales se cargaron correctamente
    expect(result.current.options).toEqual(initialData);
    
    // Actualizamos las opciones
    await act(async () => {
      result.current.updateOptions(updatedData);
      await Promise.resolve();
    });
    
    // Verificamos que las opciones se actualizaron correctamente
    expect(result.current.options).toEqual(updatedData);
    expect(localStorage.getItem('testKey')).toBe(JSON.stringify(updatedData));
  });
});
