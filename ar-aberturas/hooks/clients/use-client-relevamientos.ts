import { useState, useCallback } from 'react';

import { getFolderBudgetsByClientId } from '@/lib/budgets/folder_budgets';
import { getBudgetsByFolderBudgetIds } from '@/lib/budgets/budgets';
import { BudgetWithWork } from '@/lib/works/balances';
import {
	Relevamiento,
	RelevamientoItem,
	getRelevamientosByClientId,
	getRelevamientoItemsByRelevamientoIds,
	createRelevamiento as createRelevamientoLib,
	deleteRelevamiento as deleteRelevamientoLib,
	createRelevamientoItem as createRelevamientoItemLib,
	updateRelevamientoItem as updateRelevamientoItemLib,
	deleteRelevamientoItem as deleteRelevamientoItemLib,
} from '@/lib/relevamientos/relevamientos';
import { DEFAULT_RELEVAMIENTO_STEPS } from '@/constants/relevamientos';

export function useClientRelevamientos(clientId?: string) {
	const [soldBudgets, setSoldBudgets] = useState<BudgetWithWork[]>([]);
	const [relevamientos, setRelevamientos] = useState<Relevamiento[]>([]);
	const [items, setItems] = useState<RelevamientoItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const load = useCallback(async () => {
		if (!clientId) return;
		setIsLoading(true);
		try {
			const { data: folders } = await getFolderBudgetsByClientId(clientId);
			if (!folders?.length) {
				setSoldBudgets([]);
				setRelevamientos([]);
				setItems([]);
				return;
			}

			const folderIds = folders.map((f) => f.id);
			const { data: allBudgets } = await getBudgetsByFolderBudgetIds(folderIds);
			const sold = (allBudgets ?? []).filter((b) => b.sold === true);
			setSoldBudgets(sold);

			if (!sold.length) {
				setRelevamientos([]);
				setItems([]);
				return;
			}

			const { data: loadedRelevamientos } = await getRelevamientosByClientId(clientId);
			const rel = loadedRelevamientos ?? [];
			setRelevamientos(rel);

			if (!rel.length) {
				setItems([]);
				return;
			}

			const relIds = rel.map((r) => r.id);
			const { data: loadedItems } = await getRelevamientoItemsByRelevamientoIds(relIds);
			setItems(loadedItems ?? []);
		} catch (err) {
			console.error('Error loading relevamientos:', (err as any)?.message ?? JSON.stringify(err));
		} finally {
			setIsLoading(false);
		}
	}, [clientId]);

	const createRelevamiento = useCallback(
		async (budgetId: string) => {
			if (!clientId) return;
			setIsLoading(true);
			try {
				const { data: newRel, error } = await createRelevamientoLib({
					budget_id: budgetId,
					client_id: clientId,
				});
				if (error || !newRel) throw error ?? new Error('Failed to create relevamiento');

				const defaultItems = DEFAULT_RELEVAMIENTO_STEPS.map((label, index) => ({
					relevamiento_id: newRel.id,
					label,
					completed: false,
					order: index,
				}));

				const created = await Promise.all(defaultItems.map((item) => createRelevamientoItemLib(item)));
				const itemError = created.find((r) => r.error)?.error;
				if (itemError) throw itemError;

				await load();
			} catch (err) {
				console.error('Error creating relevamiento:', (err as any)?.message ?? JSON.stringify(err));
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[clientId, load]
	);

	const removeRelevamiento = useCallback(async (relevamientoId: string) => {
		setIsLoading(true);
		try {
			const { error } = await deleteRelevamientoLib(relevamientoId);
			if (error) throw error;
			setRelevamientos((prev) => prev.filter((r) => r.id !== relevamientoId));
			setItems((prev) => prev.filter((i) => i.relevamiento_id !== relevamientoId));
		} catch (err) {
			console.error('Error deleting relevamiento:', (err as any)?.message ?? JSON.stringify(err));
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, []);

	const addItem = useCallback(
		async (relevamientoId: string, label: string) => {
			setIsLoading(true);
			try {
				const currentItems = items.filter((i) => i.relevamiento_id === relevamientoId);
				const maxOrder = currentItems.reduce((max, i) => Math.max(max, i.order), -1);
				const { data: newItem, error } = await createRelevamientoItemLib({
					relevamiento_id: relevamientoId,
					label,
					completed: false,
					order: maxOrder + 1,
				});
				if (error || !newItem) throw error ?? new Error('Failed to create item');
				setItems((prev) => [...prev, newItem]);
			} catch (err) {
				const errorMessage = (err as any)?.message ?? JSON.stringify(err);
				console.error('Error adding relevamiento item:', errorMessage);
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[items]
	);

	const updateItem = useCallback(
		async (
			itemId: string,
			changes: Partial<Pick<RelevamientoItem, 'label' | 'completed' | 'order'>>
		) => {
			try {
				const { error } = await updateRelevamientoItemLib(itemId, changes);
				if (error) throw error;
				setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...changes } : i)));
			} catch (err) {
				const errorMessage = (err as any)?.message ?? JSON.stringify(err);
				console.error('Error updating relevamiento item:', errorMessage);
				throw err;
			}
		},
		[]
	);

	const removeItem = useCallback(async (itemId: string) => {
		try {
			const { error } = await deleteRelevamientoItemLib(itemId);
			if (error) throw error;
			setItems((prev) => prev.filter((i) => i.id !== itemId));
		} catch (err) {
			console.error('Error deleting relevamiento item:', (err as any)?.message ?? JSON.stringify(err));
			throw err;
		}
	}, []);

	return {
		soldBudgets,
		relevamientos,
		items,
		isLoading,
		load,
		createRelevamiento,
		removeRelevamiento,
		addItem,
		updateItem,
		removeItem,
	};
}
