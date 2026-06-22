import { useState, useCallback } from 'react';

import { getFolderBudgetsByClientId } from '@/lib/budgets/folder_budgets';
import { getBudgetsByFolderBudgetIds } from '@/lib/budgets/budgets';
import { BudgetWithWork } from '@/lib/works/balances';
import {
	Survey,
	SurveyItem,
	getSurveysByClientId,
	getSurveyItemsBySurveyIds,
	createSurvey as createSurveyLib,
	deleteSurvey as deleteSurveyLib,
	createSurveyItem as createSurveyItemLib,
	updateSurveyItem as updateSurveyItemLib,
	deleteSurveyItem as deleteSurveyItemLib,
} from '@/lib/survey/survey';

import { DEFAULT_SURVEY_STEPS } from '@/constants/survey';

export function useClientSurveys(clientId?: number) {
	const [soldBudgets, setSoldBudgets] = useState<BudgetWithWork[]>([]);
	const [Surveys, setSurveys] = useState<Survey[]>([]);
	const [items, setItems] = useState<SurveyItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const load = useCallback(async () => {
		if (!clientId) return;
		setIsLoading(true);
		try {
			const { data: folders, error: foldersError } = await getFolderBudgetsByClientId(clientId);
			if (foldersError) throw foldersError;
			if (!folders?.length) {
				setSoldBudgets([]);
				setSurveys([]);
				setItems([]);
				return;
			}

			const folderIds = folders.map((f) => f.id);
			const { data: allBudgets, error: budgetsError } = await getBudgetsByFolderBudgetIds(folderIds);
			if (budgetsError) throw budgetsError;
			const sold = (allBudgets ?? []).filter((b) => b.sold === true);
			setSoldBudgets(sold);

			if (!sold.length) {
				setSurveys([]);
				setItems([]);
				return;
			}

			const { data: loadedSurveys, error: SurveysError } = await getSurveysByClientId(clientId);
			if (SurveysError) throw SurveysError;
			const rel = loadedSurveys ?? [];
			setSurveys(rel);

			if (!rel.length) {
				setItems([]);
				return;
			}

			const relIds = rel.map((r) => r.id);
			const { data: loadedItems, error: itemsError } = await getSurveyItemsBySurveyIds(relIds);
			if (itemsError) throw itemsError;
			setItems(loadedItems ?? []);
		} catch (err) {
			console.error('Error loading Surveys:', (err as any)?.message ?? JSON.stringify(err));
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, [clientId]);

	const createSurvey = useCallback(
		async (budgetId: number) => {
			if (!clientId) return;
			setIsLoading(true);
			try {
				const { data: newRel, error } = await createSurveyLib({
					budget_id: budgetId,
					client_id: clientId,
				});
				if (error || !newRel) throw error ?? new Error('Failed to create Survey');

				const defaultItems = DEFAULT_SURVEY_STEPS.map((label, index) => ({
					survey_id: newRel.id,
					label,
					completed: false,
					order: index,
				}));

				const created = await Promise.all(defaultItems.map((item) => createSurveyItemLib(item)));
				const itemError = created.find((r) => r.error)?.error;
				if (itemError) throw itemError;

				await load();
			} catch (err) {
				console.error('Error creating Survey:', (err as any)?.message ?? JSON.stringify(err));
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[clientId, load]
	);

	const removeSurvey = useCallback(async (SurveyId: number) => {
		setIsLoading(true);
		try {
			const { error } = await deleteSurveyLib(SurveyId);
			if (error) throw error;
			setSurveys((prev) => prev.filter((r) => r.id !== SurveyId));
			setItems((prev) => prev.filter((i) => i.survey_id !== SurveyId));
		} catch (err) {
			console.error('Error deleting Survey:', (err as any)?.message ?? JSON.stringify(err));
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, []);

	const addItem = useCallback(
		async (SurveyId: number, label: string) => {
			setIsLoading(true);
			try {
				const currentItems = items.filter((i) => i.survey_id === SurveyId);
				const maxOrder = currentItems.reduce((max, i) => Math.max(max, i.order), -1);
				const { data: newItem, error } = await createSurveyItemLib({
					survey_id: SurveyId,
					label,
					completed: false,
					order: maxOrder + 1,
				});
				if (error || !newItem) throw error ?? new Error('Failed to create item');
				setItems((prev) => [...prev, newItem]);
			} catch (err) {
				const errorMessage = (err as any)?.message ?? JSON.stringify(err);
				console.error('Error adding Survey item:', errorMessage);
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[items]
	);

	const updateItem = useCallback(
		async (
			itemId: number,
			changes: Partial<Pick<SurveyItem, 'label' | 'completed' | 'order'>>
		) => {
			try {
				const { error } = await updateSurveyItemLib(itemId, changes);
				if (error) throw error;
				setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...changes } : i)));
			} catch (err) {
				const errorMessage = (err as any)?.message ?? JSON.stringify(err);
				console.error('Error updating Survey item:', errorMessage);
				throw err;
			}
		},
		[]
	);

	const removeItem = useCallback(async (itemId: number) => {
		try {
			const { error } = await deleteSurveyItemLib(itemId);
			if (error) throw error;
			setItems((prev) => prev.filter((i) => i.id !== itemId));
		} catch (err) {
			console.error('Error deleting Survey item:', (err as any)?.message ?? JSON.stringify(err));
			throw err;
		}
	}, []);

	return {
		soldBudgets,
		Surveys,
		items,
		isLoading,
		load,
		createSurvey,
		removeSurvey,
		addItem,
		updateItem,
		removeItem,
	};
}
