import { getSupabaseClient } from '@/lib/supabase-client';
import { useEffect, useState } from 'react';

export function useOptions<T>(key: string, fetchFromDb: () => Promise<T[]>) {
	const [options, setOptions] = useState<T[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const supabase = getSupabaseClient();

	useEffect(() => {
		const local = localStorage.getItem(key);

		if (local) {
			setOptions(JSON.parse(local));
			setLoading(false);
			// second plane refresh
			fetchAndCache();
		} else {
			fetchAndCache();
		}
	}, [key]);

	// method to fetch from DB and update local cache
	const fetchAndCache = async () => {
		setLoading(true);
		try {
			const opts = await fetchFromDb();
			setOptions([...opts]); // force re-render
			localStorage.setItem(key, JSON.stringify(opts));
		} catch (err: any) {
			setError(err?.message || 'Error al cargar opciones');
		} finally {
			setLoading(false);
		}
	};

	// listening to Realtime (INSERT / UPDATE / DELETE)
	useEffect(() => {
		if (!key) return;

		console.log('Suscribiendo a realtime para', key);

		const channel = supabase
			.channel(`${key}-realtime`)
			.on('postgres_changes', { event: '*', schema: 'public', table: key }, async (payload) => {
				console.log(`[Realtime] Cambio detectado en ${key}`, payload);
				await fetchAndCache(); // refresh local cache
			})
			.subscribe((status) => {
				console.log(`📡 Estado canal (${key}):`, status);
			});

		return () => {
			console.log(`Desuscribiendo canal de ${key}`);
			supabase.removeChannel(channel);
		};
	}, [key]);

	const updateOptions = (opts: T[]) => {
		setOptions([...opts]); // force render
		localStorage.setItem(key, JSON.stringify(opts));
	};

	return { options, loading, error, updateOptions };
}
