import { renderHook, act } from '@testing-library/react';

import { useClientRelevamientos } from '@/hooks/clients/use-client-relevamientos';
import * as folderBudgetsLib from '@/lib/budgets/folder_budgets';
import * as budgetsLib from '@/lib/budgets/budgets';
import * as relevamientosLib from '@/lib/relevamientos/relevamientos';

jest.mock('@/lib/budgets/folder_budgets');
jest.mock('@/lib/budgets/budgets');
jest.mock('@/lib/relevamientos/relevamientos');

const mockClientId = '1';

const mockFolderBudgets = [{ id: '10', client_id: mockClientId }];

const mockSoldBudget = {
	id: '100',
	created_at: '2024-01-01',
	amount_ars: 1000,
	amount_usd: 1,
	sold: true,
	folder_budget: {
		id: '10',
		work_id: '200',
		work: { address: 'Av. Test 123', locality: 'Córdoba' },
	},
};

const mockNotSoldBudget = { ...mockSoldBudget, id: '101', sold: false };

const mockRelevamiento = {
	id: '1',
	created_at: '2024-01-01',
	budget_id: '100',
	client_id: mockClientId,
};

const mockItem = {
	id: '1',
	created_at: '2024-01-01',
	relevamiento_id: '1',
	label: 'A la espera de relevamiento de premarco',
	completed: false,
	order: 0,
};

describe('useClientRelevamientos', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('initializes with empty state', () => {
		const { result } = renderHook(() => useClientRelevamientos());

		expect(result.current.soldBudgets).toEqual([]);
		expect(result.current.relevamientos).toEqual([]);
		expect(result.current.items).toEqual([]);
		expect(result.current.isLoading).toBe(false);
	});

	it('does not load when clientId is undefined', async () => {
		const { result } = renderHook(() => useClientRelevamientos());

		await act(async () => {
			await result.current.load();
		});

		expect(folderBudgetsLib.getFolderBudgetsByClientId).not.toHaveBeenCalled();
	});

	it('loads sold budgets, relevamientos and items correctly', async () => {
		(folderBudgetsLib.getFolderBudgetsByClientId as jest.Mock).mockResolvedValue({
			data: mockFolderBudgets,
		});
		(budgetsLib.getBudgetsByFolderBudgetIds as jest.Mock).mockResolvedValue({
			data: [mockSoldBudget],
		});
		(relevamientosLib.getRelevamientosByClientId as jest.Mock).mockResolvedValue({
			data: [mockRelevamiento],
		});
		(relevamientosLib.getRelevamientoItemsByRelevamientoIds as jest.Mock).mockResolvedValue({
			data: [mockItem],
		});

		const { result } = renderHook(() => useClientRelevamientos(mockClientId));

		await act(async () => {
			await result.current.load();
		});

		expect(result.current.soldBudgets).toEqual([mockSoldBudget]);
		expect(result.current.relevamientos).toEqual([mockRelevamiento]);
		expect(result.current.items).toEqual([mockItem]);
	});

	it('filters out non-sold budgets', async () => {
		(folderBudgetsLib.getFolderBudgetsByClientId as jest.Mock).mockResolvedValue({
			data: mockFolderBudgets,
		});
		(budgetsLib.getBudgetsByFolderBudgetIds as jest.Mock).mockResolvedValue({
			data: [mockNotSoldBudget],
		});

		const { result } = renderHook(() => useClientRelevamientos(mockClientId));

		await act(async () => {
			await result.current.load();
		});

		expect(result.current.soldBudgets).toEqual([]);
		expect(relevamientosLib.getRelevamientosByClientId).not.toHaveBeenCalled();
	});

	it('handles empty folder budgets gracefully', async () => {
		(folderBudgetsLib.getFolderBudgetsByClientId as jest.Mock).mockResolvedValue({ data: [] });

		const { result } = renderHook(() => useClientRelevamientos(mockClientId));

		await act(async () => {
			await result.current.load();
		});

		expect(result.current.soldBudgets).toEqual([]);
		expect(budgetsLib.getBudgetsByFolderBudgetIds).not.toHaveBeenCalled();
	});

	it('handles null folders gracefully', async () => {
		(folderBudgetsLib.getFolderBudgetsByClientId as jest.Mock).mockResolvedValue({ data: null });

		const { result } = renderHook(() => useClientRelevamientos(mockClientId));

		await act(async () => {
			await result.current.load();
		});

		expect(result.current.soldBudgets).toEqual([]);
	});

	it('handles network errors gracefully', async () => {
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
		(folderBudgetsLib.getFolderBudgetsByClientId as jest.Mock).mockRejectedValue(
			new Error('Network error')
		);

		const { result } = renderHook(() => useClientRelevamientos(mockClientId));

		await act(async () => {
			await result.current.load();
		});

		expect(result.current.soldBudgets).toEqual([]);
		expect(consoleErrorSpy).toHaveBeenCalled();
		consoleErrorSpy.mockRestore();
	});

	it('creates a relevamiento with 4 default steps', async () => {
		(relevamientosLib.createRelevamiento as jest.Mock).mockResolvedValue({
			data: mockRelevamiento,
			error: null,
		});
		(relevamientosLib.createRelevamientoItem as jest.Mock).mockResolvedValue({
			data: mockItem,
			error: null,
		});
		// Mocks for the reload triggered inside createRelevamiento
		(folderBudgetsLib.getFolderBudgetsByClientId as jest.Mock).mockResolvedValue({
			data: mockFolderBudgets,
		});
		(budgetsLib.getBudgetsByFolderBudgetIds as jest.Mock).mockResolvedValue({
			data: [mockSoldBudget],
		});
		(relevamientosLib.getRelevamientosByClientId as jest.Mock).mockResolvedValue({
			data: [mockRelevamiento],
		});
		(relevamientosLib.getRelevamientoItemsByRelevamientoIds as jest.Mock).mockResolvedValue({
			data: [mockItem],
		});

		const { result } = renderHook(() => useClientRelevamientos(mockClientId));

		await act(async () => {
			await result.current.createRelevamiento('100');
		});

		expect(relevamientosLib.createRelevamiento).toHaveBeenCalledWith({
			budget_id: '100',
			client_id: mockClientId,
		});
		expect(relevamientosLib.createRelevamientoItem).toHaveBeenCalledTimes(4);
	});

	it('does not create relevamiento when clientId is undefined', async () => {
		const { result } = renderHook(() => useClientRelevamientos());

		await act(async () => {
			await result.current.createRelevamiento('100');
		});

		expect(relevamientosLib.createRelevamiento).not.toHaveBeenCalled();
	});

	it('updates an item and reflects the change in state', async () => {
		(relevamientosLib.updateRelevamientoItem as jest.Mock).mockResolvedValue({
			error: null,
		});

		(folderBudgetsLib.getFolderBudgetsByClientId as jest.Mock).mockResolvedValue({
			data: mockFolderBudgets,
		});
		(budgetsLib.getBudgetsByFolderBudgetIds as jest.Mock).mockResolvedValue({
			data: [mockSoldBudget],
		});
		(relevamientosLib.getRelevamientosByClientId as jest.Mock).mockResolvedValue({
			data: [mockRelevamiento],
		});
		(relevamientosLib.getRelevamientoItemsByRelevamientoIds as jest.Mock).mockResolvedValue({
			data: [mockItem],
		});

		const { result } = renderHook(() => useClientRelevamientos(mockClientId));

		await act(async () => {
			await result.current.load();
		});

		await act(async () => {
			await result.current.updateItem(mockItem.id, { completed: true });
		});

		expect(relevamientosLib.updateRelevamientoItem).toHaveBeenCalledWith(mockItem.id, {
			completed: true,
		});
		expect(result.current.items[0].completed).toBe(true);
	});

	it('removes an item from state after deletion', async () => {
		(relevamientosLib.deleteRelevamientoItem as jest.Mock).mockResolvedValue({
			data: null,
			error: null,
		});

		(folderBudgetsLib.getFolderBudgetsByClientId as jest.Mock).mockResolvedValue({
			data: mockFolderBudgets,
		});
		(budgetsLib.getBudgetsByFolderBudgetIds as jest.Mock).mockResolvedValue({
			data: [mockSoldBudget],
		});
		(relevamientosLib.getRelevamientosByClientId as jest.Mock).mockResolvedValue({
			data: [mockRelevamiento],
		});
		(relevamientosLib.getRelevamientoItemsByRelevamientoIds as jest.Mock).mockResolvedValue({
			data: [mockItem],
		});

		const { result } = renderHook(() => useClientRelevamientos(mockClientId));

		await act(async () => {
			await result.current.load();
		});

		expect(result.current.items).toHaveLength(1);

		await act(async () => {
			await result.current.removeItem(mockItem.id);
		});

		expect(relevamientosLib.deleteRelevamientoItem).toHaveBeenCalledWith(mockItem.id);
		expect(result.current.items).toHaveLength(0);
	});

	it('removes a relevamiento and clears its items from state', async () => {
		(relevamientosLib.deleteRelevamiento as jest.Mock).mockResolvedValue({
			data: null,
			error: null,
		});

		(folderBudgetsLib.getFolderBudgetsByClientId as jest.Mock).mockResolvedValue({
			data: mockFolderBudgets,
		});
		(budgetsLib.getBudgetsByFolderBudgetIds as jest.Mock).mockResolvedValue({
			data: [mockSoldBudget],
		});
		(relevamientosLib.getRelevamientosByClientId as jest.Mock).mockResolvedValue({
			data: [mockRelevamiento],
		});
		(relevamientosLib.getRelevamientoItemsByRelevamientoIds as jest.Mock).mockResolvedValue({
			data: [mockItem],
		});

		const { result } = renderHook(() => useClientRelevamientos(mockClientId));

		await act(async () => {
			await result.current.load();
		});

		expect(result.current.relevamientos).toHaveLength(1);
		expect(result.current.items).toHaveLength(1);

		await act(async () => {
			await result.current.removeRelevamiento(mockRelevamiento.id);
		});

		expect(relevamientosLib.deleteRelevamiento).toHaveBeenCalledWith(mockRelevamiento.id);
		expect(result.current.relevamientos).toHaveLength(0);
		expect(result.current.items).toHaveLength(0);
	});

	it('adds a new item with correct order', async () => {
		const newItem = { ...mockItem, id: '2', label: 'Nuevo paso', order: 1 };
		(relevamientosLib.createRelevamientoItem as jest.Mock).mockResolvedValue({
			data: newItem,
			error: null,
		});

		(folderBudgetsLib.getFolderBudgetsByClientId as jest.Mock).mockResolvedValue({
			data: mockFolderBudgets,
		});
		(budgetsLib.getBudgetsByFolderBudgetIds as jest.Mock).mockResolvedValue({
			data: [mockSoldBudget],
		});
		(relevamientosLib.getRelevamientosByClientId as jest.Mock).mockResolvedValue({
			data: [mockRelevamiento],
		});
		(relevamientosLib.getRelevamientoItemsByRelevamientoIds as jest.Mock).mockResolvedValue({
			data: [mockItem],
		});

		const { result } = renderHook(() => useClientRelevamientos(mockClientId));

		await act(async () => {
			await result.current.load();
		});

		await act(async () => {
			await result.current.addItem(mockRelevamiento.id, 'Nuevo paso');
		});

		expect(relevamientosLib.createRelevamientoItem).toHaveBeenCalledWith({
			relevamiento_id: mockRelevamiento.id,
			label: 'Nuevo paso',
			completed: false,
			order: 1,
		});
		expect(result.current.items).toHaveLength(2);
	});
});
