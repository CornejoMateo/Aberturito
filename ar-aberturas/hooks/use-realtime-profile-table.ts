import { getSupabaseClient } from '@/lib/supabase-client';
import { useEffect, useState } from 'react';

export function useRealtimeProfileTable<T>(table: string, fetchFromDb: () => Promise<T[]>) {
	const [data, setData] = useState<T[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const supabase = getSupabaseClient();

	const fetchData = async () => {
		setLoading(true);
		try {
			const res = await fetchFromDb();
			setData([...res]);
		} catch (err: any) {
			setError(err.message || 'Error al cargar datos');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [table]);

	useEffect(() => {
		if (!table) return;

		console.log(`Suscribiendo realtime a ${table}`);

		const channel = supabase
			.channel(`${table}-realtime`)
			.on('postgres_changes', { event: '*', schema: 'public', table }, async (payload) => {
				console.log(`[Realtime] Cambio detectado en ${table}`, payload);
				await fetchData(); // refresh data
			})
			.subscribe((status) => console.log(`📡 Estado canal (${table}):`, status));

		return () => {
			console.log(`Desuscribiendo canal de ${table}`);
			supabase.removeChannel(channel);
		};
	}, [table]);

	return { data, loading, error, refresh: fetchData };
}
