import { useState } from 'react';
import { createWork, deleteWork, getWorksByClientId, updateWork } from '@/lib/works/works';
import { Work } from '@/lib/works/works';

export function useClientWorks(clientId?: string) {
	const [works, setWorks] = useState<Work[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const loadWorks = async () => {
		if (!clientId) return;

		setIsLoading(true);
		try {
			const { data, error } = await getWorksByClientId(clientId);
			if (error) throw error;
			setWorks(data || []);
		} catch (error) {
			console.error(error);
			setWorks([]);
		} finally {
			setIsLoading(false);
		}
	};

	const create = async (workData: Omit<Work, 'id' | 'created_at' | 'client_id'>) => {
		if (!clientId) return;

		const { error } = await createWork({
			...workData,
			client_id: clientId,
		});

		if (error) throw error;

		await loadWorks();
	};

	const remove = async (workId: string) => {
		const { error } = await deleteWork(workId);
		if (error) throw error;

		await loadWorks();
	};

	const update = async (workId: string, updates: Partial<Work>) => {
		const { data, error } = await updateWork(workId, updates);
		if (error) throw error;

		setWorks((prev) =>
			prev.map((work) => (work.id === workId ? ({ ...work, ...data, ...updates } as Work) : work))
		);

		return data;
	};

	return { works, isLoading, loadWorks, create, remove, update };
}
