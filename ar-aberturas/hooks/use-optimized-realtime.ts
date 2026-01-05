import { getSupabaseClient } from '@/lib/supabase-client';
import { useEffect, useState, useCallback, useRef } from 'react';

interface CacheEntry<T> {
	data: T[];
	timestamp: number;
	version: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const DEBOUNCE_DELAY = 300; // 300ms para agrupar actualizaciones

export function useOptimizedRealtime<T extends { id: string }>(
	table: string, 
	fetchFromDb: () => Promise<T[]>,
	cacheKey?: string
) {
	const [data, setData] = useState<T[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const supabase = getSupabaseClient();
	
	const cacheKeyFinal = cacheKey || `realtime_${table}`;
	const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
	const versionRef = useRef(0);

	// Obtener datos del cache local
	const getCachedData = useCallback((): T[] | null => {
		try {
			const cached = localStorage.getItem(cacheKeyFinal);
			if (!cached) return null;
			
			const entry: CacheEntry<T> = JSON.parse(cached);
			const now = Date.now();
			
			// Verificar si el cache es válido
			if (now - entry.timestamp < CACHE_DURATION) {
				return entry.data;
			}
			
			// Cache expirado, eliminar
			localStorage.removeItem(cacheKeyFinal);
			return null;
		} catch {
			return null;
		}
	}, [cacheKeyFinal]);

	// Guardar datos en cache
	const setCachedData = useCallback((newData: T[]) => {
		try {
			const entry: CacheEntry<T> = {
				data: newData,
				timestamp: Date.now(),
				version: versionRef.current
			};
			localStorage.setItem(cacheKeyFinal, JSON.stringify(entry));
		} catch (error) {
			console.warn('Error al guardar cache:', error);
		}
	}, [cacheKeyFinal]);

	// Fetch de datos con cache
	const fetchData = useCallback(async (forceRefresh = false) => {
		if (!forceRefresh) {
			const cached = getCachedData();
			if (cached) {
				setData(cached);
				setLoading(false);
				return;
			}
		}

		setLoading(true);
		try {
			const res = await fetchFromDb();
			versionRef.current++;
			setData([...res]);
			setCachedData(res);
		} catch (err: any) {
			setError(err.message || 'Error al cargar datos');
		} finally {
			setLoading(false);
		}
	}, [fetchFromDb, getCachedData, setCachedData]);

	// Procesar cambios individuales sin refresh completo
	const processRealtimeEvent = useCallback((payload: any) => {
		const { eventType, new: newRecord, old: oldRecord } = payload;
		
		setData(currentData => {
			let newData = [...currentData];
			
			switch (eventType) {
				case 'INSERT':
					// Agregar nuevo registro al inicio
					if (newRecord) newData.unshift(newRecord);
					break;
					
				case 'UPDATE':
					// Actualizar registro existente
					if (newRecord?.id) {
						const index = newData.findIndex(item => item.id === newRecord.id);
						if (index !== -1) {
							newData[index] = newRecord;
						}
					}
					break;
					
				case 'DELETE':
					// Eliminar registro
					if (oldRecord?.id) {
						newData = newData.filter(item => item.id !== oldRecord.id);
					}
					break;
			}
			
			// Actualizar cache con debounce
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
			
			debounceTimerRef.current = setTimeout(() => {
				setCachedData(newData);
			}, DEBOUNCE_DELAY);
			
			return newData;
		});
	}, [setCachedData]);

	// Inicialización
	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Solo se ejecuta al montar

	// Configuración de realtime
	useEffect(() => {
		if (!table) return;

		console.log(`Suscribiendo realtime optimizado a ${table}`);

		const channel = supabase
			.channel(`${table}-optimized-realtime`)
			.on('postgres_changes', 
				{ 
					event: '*', 
					schema: 'public', 
					table 
				}, 
				(payload) => {
					console.log(`[Realtime Optimizado] Cambio en ${table}:`, payload.eventType);
					processRealtimeEvent(payload);
				}
			)
			.subscribe((status) => {
				console.log(`📡 Estado canal optimizado (${table}):`, status);
			});

		return () => {
			console.log(`Desuscribiendo canal optimizado de ${table}`);
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
			supabase.removeChannel(channel);
		};
	}, [table, processRealtimeEvent]);

	// Limpiar cache expirado periódicamente
	useEffect(() => {
		const interval = setInterval(() => {
			const cached = localStorage.getItem(cacheKeyFinal);
			if (cached) {
				try {
					const entry: CacheEntry<T> = JSON.parse(cached);
					if (Date.now() - entry.timestamp >= CACHE_DURATION) {
						localStorage.removeItem(cacheKeyFinal);
					}
				} catch {
					localStorage.removeItem(cacheKeyFinal);
				}
			}
		}, CACHE_DURATION);

		return () => clearInterval(interval);
	}, [cacheKeyFinal]);

	return { 
		data, 
		loading, 
		error, 
		refresh: () => fetchData(true),
		invalidateCache: () => {
			localStorage.removeItem(cacheKeyFinal);
			fetchData(true);
		}
	};
}
