import { getSupabaseClient } from '@/lib/supabase-client';
import { useEffect, useState, useRef } from 'react';

// Singleton pattern to share channels across components
const channelRegistry = new Map<string, any>();
const subscriberCount = new Map<string, number>();

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

		const channelName = `${key}-realtime`;

		// Increment subscriber count
		subscriberCount.set(channelName, (subscriberCount.get(channelName) || 0) + 1);

		// Create channel if it doesn't exist
		if (!channelRegistry.has(channelName)) {
			console.log('Creando nuevo canal para', key);
			const channel = supabase
				.channel(channelName)
				.on('postgres_changes', { event: '*', schema: 'public', table: key }, async (payload) => {
					console.log(`[Realtime] Cambio detectado en ${key}`, payload);
					await fetchAndCache(); // refresh local cache
				})
				.subscribe();
			channelRegistry.set(channelName, channel);
		} else {
			console.log('Reutilizando canal existente para', key);
		}

		return () => {
			// Decrement subscriber count
			const count = (subscriberCount.get(channelName) || 0) - 1;
			subscriberCount.set(channelName, count);

			// Remove channel if no more subscribers
			if (count <= 0) {
				console.log(`Desuscribiendo canal de ${key} (no más suscriptores)`);
				const channel = channelRegistry.get(channelName);
				if (channel) {
					supabase.removeChannel(channel);
					channelRegistry.delete(channelName);
				}
				subscriberCount.delete(channelName);
			}
		};
	}, [key]);

	const updateOptions = (opts: T[]) => {
		setOptions([...opts]); // force render
		localStorage.setItem(key, JSON.stringify(opts));
	};

	return { options, loading, error, updateOptions };
}
