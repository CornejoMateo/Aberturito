import { useEffect, useState } from 'react';

export function useOptions<T>(key: string, fetchFromDb: () => Promise<T[]>) {
	const [options, setOptions] = useState<T[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// basically fetch options from localStorage (if available) or from DB
	useEffect(() => {
		const local = localStorage.getItem(key);
		if (local) {
			setOptions(JSON.parse(local));
			setLoading(false);
		} else {
			fetchFromDb()
				.then((opts) => {
					setOptions(opts);
					localStorage.setItem(key, JSON.stringify(opts));
				})
				.catch((err) => {
					setError(err?.message || 'Error al cargar opciones');
				})
				.finally(() => setLoading(false));
		}
	}, [key]);

	const updateOptions = (opts: T[]) => {
		setOptions(opts);
		localStorage.setItem(key, JSON.stringify(opts));
	};

	return { options, loading, error, updateOptions };
}
