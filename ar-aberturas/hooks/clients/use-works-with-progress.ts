import { useEffect, useState } from 'react';
import { ChecklistItem } from '@/lib/works/checklists';
import { getChecklistsByWorkIds } from '@/lib/works/checklists';
import { listWorks } from '@/lib/works/works';
import { WorkWithProgress } from '@/lib/works/works';
import { updateWork } from '@/lib/works/works';

export function useWorksWithProgress() {
    const [works, setWorks] = useState<WorkWithProgress[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
        setLoading(true);

        const { data: worksData, error } = await listWorks();
        if (error) throw error;

        if (!worksData?.length) {
            setWorks([]);
            return;
        }

        const workIds = worksData.map(w => w.id);
        const { data: allChecklists } =
            await getChecklistsByWorkIds(workIds);

        const checklistsByWork = new Map<string, ChecklistItem[]>();
        const hasNotesByWork = new Map<string, boolean>();

        for (const cl of allChecklists ?? []) {
            const wid = cl.work_id;
            if (!wid) continue;

            const items = cl.items ?? [];

            checklistsByWork.set(
            wid,
            [...(checklistsByWork.get(wid) ?? []), ...items]
            );

            if (!hasNotesByWork.get(wid)) {
                hasNotesByWork.set(wid, !!cl.notes?.trim());
            }
        }

        const enriched = worksData.map(work => {
            const tasks = checklistsByWork.get(work.id) ?? [];
            const total = tasks.length;
            const done = tasks.filter(t => t.done).length;
            const progress = total ? Math.round((done / total) * 100) : 100;

            const hasNotes = hasNotesByWork.get(work.id) ?? false;

            let newStatus = work.status;
            if (total > 0) {
                if (progress === 100 && work.status !== 'completed' && !hasNotes) {
                    newStatus = 'completed';
                } else if (progress > 0 && progress < 100 && work.status !== 'in_progress') {
                    newStatus = 'in_progress';
                } else if (work.status === 'completed' && hasNotes) {
                    newStatus = 'in_progress';
                }
            }

            return {
                ...work,
                status: newStatus,
                tasks,
                hasNotes: hasNotes,
                progress
            };
        });

        const updatePromises = enriched
            .filter(work => work.status !== worksData.find(w => w.id === work.id)?.status)
            .map(work => updateWork(work.id, { status: work.status }));

        await Promise.all(updatePromises);

        setWorks(enriched);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return { works, loading, reload: load };
}
