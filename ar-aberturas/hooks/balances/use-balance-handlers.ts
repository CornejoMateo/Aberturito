'use client';

import { useState } from 'react';
import { deleteBalance } from '@/lib/works/balances';
import { BalanceWithTotals } from '@/utils/balances/client-balances';

interface UseBalanceHandlersProps {
	onBalanceDeleted?: () => void;
	onRefresh: () => void;
}

export function useBalanceHandlers({ onBalanceDeleted, onRefresh }: UseBalanceHandlersProps) {
	const [selectedBalance, setSelectedBalance] = useState<BalanceWithTotals | null>(null);
	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
	const [balanceToDelete, setBalanceToDelete] = useState<BalanceWithTotals | null>(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isDollarUpdateModalOpen, setIsDollarUpdateModalOpen] = useState(false);
	const [balanceToUpdate, setBalanceToUpdate] = useState<BalanceWithTotals | null>(null);

	const handleBalanceUpdate = () => {
		onRefresh();
	};

	const handleDeleteBalance = async () => {
		if (!balanceToDelete) return;

		try {
			const { error } = await deleteBalance(balanceToDelete.id);

			if (error) {
				console.error('Error al eliminar saldo:', error);
				return;
			}

			// Refresh the list
			handleBalanceUpdate();

			// Notify parent to reload budgets
			if (onBalanceDeleted) {
				onBalanceDeleted();
			}
		} catch (error) {
			console.error('Error inesperado al eliminar saldo:', error);
		} finally {
			setIsDeleteDialogOpen(false);
			setBalanceToDelete(null);
		}
	};

	const handleDollarUpdate = async (newUsdRate: number) => {
		if (!balanceToUpdate) return;

		try {
			const response = await fetch('/api/dollar-rate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					balanceId: balanceToUpdate.id,
					newUsdRate,
				}),
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.error || 'Error al actualizar el tipo de cambio');
			}

			// Refresh the list
			handleBalanceUpdate();
		} catch (error) {
			console.error('Error al actualizar tipo de dólar:', error);
			throw error;
		}
	};

	const openDollarUpdateModal = (balance: BalanceWithTotals) => {
		setBalanceToUpdate(balance);
		setIsDollarUpdateModalOpen(true);
	};

	const openDetailsModal = (balance: BalanceWithTotals) => {
		setSelectedBalance(balance);
		setIsDetailsModalOpen(true);
	};

	const openDeleteDialog = (balance: BalanceWithTotals) => {
		setBalanceToDelete(balance);
		setIsDeleteDialogOpen(true);
	};

	return {
		// State
		selectedBalance,
		isDetailsModalOpen,
		setIsDetailsModalOpen,
		balanceToDelete,
		isDeleteDialogOpen,
		setIsDeleteDialogOpen,
		isDollarUpdateModalOpen,
		setIsDollarUpdateModalOpen,
		balanceToUpdate,

		// Handlers
		openDetailsModal,
		openDeleteDialog,
		openDollarUpdateModal,
		handleDeleteBalance,
		handleDollarUpdate,
		handleBalanceUpdate,
	};
}
