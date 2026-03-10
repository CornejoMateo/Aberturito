import { useState, useEffect } from 'react';
import { getChecklistsByWorkId, Checklist } from '@/lib/works/checklists';
import { getWorkById } from '@/lib/works/works';
import { getClientById } from '@/lib/clients/clients';

export function useWorkChecklistData(workId: string) {
	const [clientData, setClientData] = useState<{ name: string; phone_number: string } | null>(null);
	const [workData, setWorkData] = useState<{
		id: string;
		locality: string;
		address: string;
	} | null>(null);
	const [checklists, setChecklists] = useState<Checklist[]>([]);
	const [loading, setLoading] = useState(false);

	const loadChecklists = async () => {
		setLoading(true);

		try {
			const { data: work } = await getWorkById(workId);

			if (work) {
				setWorkData({
					id: work.id,
					locality: work.locality || '',
					address: work.address || '',
				});

				if (work.client_id) {
					const { data: client } = await getClientById(work.client_id);
					if (client) {
						const clientName = [client.name, client.last_name].filter(Boolean).join(' ');
						setClientData({ name: clientName || '', phone_number: client.phone_number || '' });
					}
				}
			}

			const { data } = await getChecklistsByWorkId(workId);

			if (data) {
				setChecklists(data);
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadChecklists();
	}, [workId]);

	return {
		clientData,
		workData,
		checklists,
		loading,
		reload: loadChecklists,
	};
}
