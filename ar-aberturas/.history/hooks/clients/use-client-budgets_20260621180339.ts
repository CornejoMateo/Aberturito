import { useCallback, useState } from 'react';
import { getFolderBudgetsByClientId } from '@/lib/budgets/folder_budgets';
import { getBudgetsByFolderBudgetIds } from '@/lib/budgets/budgets';
import { BudgetWithWork } from '@/lib/works/balances';

export function useClientBudgets(clientId?: number) {
	const [budgets, setBudgets] = useState<BudgetWithWork[]>([]);

	const loadBudgets = useCallback(async () => {
		if (!clientId) return;

		try {
			const { data: folderBudgets } = await getFolderBudgetsByClientId(clientId);

			if (!folderBudgets?.length) {
				setBudgets([]);
				return;
			}

			const folderBudgetIds = folderBudgets.map((f) => f.id);
			const { data } = await getBudgetsByFolderBudgetIds(folderBudgetIds);

			setBudgets(data || []);
		} catch (error) {
			console.error(error);
			setBudgets([]);
		}
	}, [clientId]);

	return { budgets, loadBudgets };
}
