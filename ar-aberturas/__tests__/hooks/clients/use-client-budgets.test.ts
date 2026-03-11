import { renderHook, act } from '@testing-library/react';
import { useClientBudgets } from '@/hooks/clients/use-client-budgets';
import * as folderBudgetsLib from '@/lib/budgets/folder_budgets';
import * as budgetsLib from '@/lib/budgets/budgets';

jest.mock('@/lib/budgets/folder_budgets');
jest.mock('@/lib/budgets/budgets');

const mockClientId = '1';
const mockFolderBudgets = [
	{ id: '1', client_id: mockClientId },
	{ id: '2', client_id: mockClientId },
];
const mockBudgets = [
	{ id: '1', folder_budget: { id: '1' } },
	{ id: '2', folder_budget: { id: '1' } },
	{ id: '3', folder_budget: { id: '2' } },
];

describe('useClientBudgets', () => {

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('must be initialized with empty budgets', () => {
		const { result } = renderHook(() => useClientBudgets());

		expect(result.current.budgets).toEqual([]);
	});

	it('must be load budgets correctly', async () => {
		(folderBudgetsLib.getFolderBudgetsByClientId as jest.Mock).mockResolvedValue({
			data: mockFolderBudgets,
		});
		(budgetsLib.getBudgetsByFolderBudgetIds as jest.Mock).mockResolvedValue({
			data: mockBudgets,
		});

		const { result } = renderHook(() => useClientBudgets(mockClientId));

		await act(async () => {
			await result.current.loadBudgets();
		});

		expect(folderBudgetsLib.getFolderBudgetsByClientId).toHaveBeenCalledWith(mockClientId);
		expect(budgetsLib.getBudgetsByFolderBudgetIds).toHaveBeenCalledWith(['folder-1', 'folder-2']);
		expect(result.current.budgets).toEqual(mockBudgets);
	});

	it('must be handle empty folder budgets', async () => {
		(folderBudgetsLib.getFolderBudgetsByClientId as jest.Mock).mockResolvedValue({
			data: [],
		});

		const { result } = renderHook(() => useClientBudgets(mockClientId));

		await act(async () => {
			await result.current.loadBudgets();
		});

		expect(result.current.budgets).toEqual([]);
		expect(budgetsLib.getBudgetsByFolderBudgetIds).not.toHaveBeenCalled();
	});

	it('must be handle null folder budgets', async () => {
		(folderBudgetsLib.getFolderBudgetsByClientId as jest.Mock).mockResolvedValue({
			data: null,
		});

		const { result } = renderHook(() => useClientBudgets(mockClientId));

		await act(async () => {
			await result.current.loadBudgets();
		});

		expect(result.current.budgets).toEqual([]);
	});

	it('must be handle errors gracefully', async () => {
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
		(folderBudgetsLib.getFolderBudgetsByClientId as jest.Mock).mockRejectedValue(
			new Error('Network error')
		);

		const { result } = renderHook(() => useClientBudgets(mockClientId));

		await act(async () => {
			await result.current.loadBudgets();
		});

		expect(result.current.budgets).toEqual([]);
		expect(consoleErrorSpy).toHaveBeenCalled();
		consoleErrorSpy.mockRestore();
	});

	it('must be not load budgets without clientId', async () => {
		const { result } = renderHook(() => useClientBudgets());

		await act(async () => {
			await result.current.loadBudgets();
		});

		expect(folderBudgetsLib.getFolderBudgetsByClientId).not.toHaveBeenCalled();
	});

	it('must be handle null budgets data', async () => {
		(folderBudgetsLib.getFolderBudgetsByClientId as jest.Mock).mockResolvedValue({
			data: mockFolderBudgets,
		});
		(budgetsLib.getBudgetsByFolderBudgetIds as jest.Mock).mockResolvedValue({
			data: null,
		});

		const { result } = renderHook(() => useClientBudgets(mockClientId));

		await act(async () => {
			await result.current.loadBudgets();
		});

		expect(result.current.budgets).toEqual([]);
	});
});
