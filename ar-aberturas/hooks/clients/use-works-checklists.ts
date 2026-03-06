import { useEffect, useState } from 'react';
import { getChecklistsByWorkId } from '@/lib/works/checklists';
import { Work } from '@/lib/works/works';

export function useWorkChecklists(works: Work[]) {
    const [workChecklists, setWorkChecklists] = useState<Record<string, boolean>>({});
    const [loadingChecklists, setLoadingChecklists] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!works.length) return;

        const checkWorkChecklists = async () => {
            const newWorkChecklists: Record<string, boolean> = {};
            const newLoadingChecklists: Record<string, boolean> = {};

            works.forEach((work) => {
                newLoadingChecklists[work.id] = true;
            });

            setLoadingChecklists(newLoadingChecklists);

            await Promise.all(
                works.map(async (work) => {
                try {
                    const { data } = await getChecklistsByWorkId(work.id);
                    newWorkChecklists[work.id] = !!(data && data.length > 0);
                } catch {
                    newWorkChecklists[work.id] = false;
                } finally {
                    setLoadingChecklists((prev) => ({
                        ...prev,
                        [work.id]: false,
                    }));
                }
                })
            );

            setWorkChecklists(newWorkChecklists);
        };

        checkWorkChecklists();
    }, [works]);

    return { workChecklists, loadingChecklists };
}
