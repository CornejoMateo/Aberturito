import { useEffect, useState } from 'react';
import { Client } from '@/lib/clients/clients';
import { getFolderBudgetsByClientIds } from '@/lib/budgets/folder_budgets';
import { getBudgetsByFolderBudgetIds } from '@/lib/budgets/budgets';

type ClientBudgetInfo = {
  total: number;
  chosen: number;
};

export function useClientBudgetsInfo(clients: Client[]) {
  const [info, setInfo] = useState<Record<string, ClientBudgetInfo>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!clients || clients.length === 0) {
        setInfo({});
        return;
      }

      setLoading(true);

      const clientIds = clients.map((c) => c.id);

      const emptyResult: Record<string, ClientBudgetInfo> = {};
      clients.forEach((c) => {
        emptyResult[c.id] = { total: 0, chosen: 0 };
      });

      try {
        const { data: folders, error: foldersError } =
          await getFolderBudgetsByClientIds(clientIds);

        if (foldersError || !folders?.length) {
          if (isMounted) setInfo(emptyResult);
          return;
        }

        const folderIds = folders.map((f) => f.id);

        const { data: budgets, error: budgetsError } =
          await getBudgetsByFolderBudgetIds(folderIds);

        if (budgetsError || !budgets?.length) {
          if (isMounted) setInfo(emptyResult);
          return;
        }

        // Map folders by client
        const foldersByClientId = new Map<string, string[]>();

        folders.forEach((f) => {
          if (!f.client_id) return;
          const list = foldersByClientId.get(f.client_id) ?? [];
          list.push(f.id);
          foldersByClientId.set(f.client_id, list);
        });

        // Aggregate budgets per folder
        const budgetsByFolder = new Map<string, ClientBudgetInfo>();

        budgets.forEach((b) => {
          const folderId = b.folder_budget?.id;
          if (!folderId) return;

          const current = budgetsByFolder.get(folderId) ?? {
            total: 0,
            chosen: 0,
          };

          current.total += 1;
          if (b.accepted) current.chosen += 1;

          budgetsByFolder.set(folderId, current);
        });

        // Final aggregation per client
        const result: Record<string, ClientBudgetInfo> = {};

        clients.forEach((client) => {
          const folderIds = foldersByClientId.get(client.id) ?? [];

          let total = 0;
          let chosen = 0;

          folderIds.forEach((fid) => {
            const agg = budgetsByFolder.get(fid);
            if (!agg) return;
            total += agg.total;
            chosen += agg.chosen;
          });

          result[client.id] = { total, chosen };
        });

        if (isMounted) {
          setInfo(result);
        }
      } catch (err) {
        console.error('Error loading client budgets info:', err);
        if (isMounted) setInfo(emptyResult);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [clients]);

  return { info, loading };
}
