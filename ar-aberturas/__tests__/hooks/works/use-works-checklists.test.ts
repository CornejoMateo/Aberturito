import { renderHook, waitFor } from '@testing-library/react';
import { useWorkChecklists } from '@/hooks/clients/use-works-checklists';
import * as checklistsLib from '@/lib/works/checklists';

jest.mock('@/lib/works/checklists');

const mockWorks = [
	{
		id: '1',
		client_id: '1',
		address: 'Calle 1',
		status: 'pending' as const,
		created_at: '2024-01-01',
	},
	{
		id: '2',
		client_id: '2',
		address: 'Calle 2',
		status: 'in_progress' as const,
		created_at: '2024-01-02',
	},
	{
		id: '3',
		client_id: '3',
		address: 'Calle 3',
		status: 'completed' as const,
		created_at: '2024-01-03',
	},
];

describe('useWorkChecklists', () => {

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('must be initialized with empty state', () => {
		const { result } = renderHook(() => useWorkChecklists([]));

		expect(result.current.workChecklists).toEqual({});
		expect(result.current.loadingChecklists).toEqual({});
	});

	it('must be detect works with checklists', async () => {
		(checklistsLib.getChecklistsByWorkId as jest.Mock)
			.mockResolvedValueOnce({ data: [{ id: '1' }] }) // work with id 1 has checklists
			.mockResolvedValueOnce({ data: [] }) // work with id 2 has no checklists
			.mockResolvedValueOnce({ data: [{ id: '2' }, { id: '3' }] }); // work with id 3 has checklists

		const { result } = renderHook(() => useWorkChecklists(mockWorks));

		await waitFor(() => {
			expect(result.current.workChecklists['1']).toBe(true);
			expect(result.current.workChecklists['2']).toBe(false);
			expect(result.current.workChecklists['3']).toBe(true);
		});

		expect(checklistsLib.getChecklistsByWorkId).toHaveBeenCalledTimes(3);
	});

	it('must be set loading states correctly', async () => {
		(checklistsLib.getChecklistsByWorkId as jest.Mock).mockImplementation(
			() => new Promise((resolve) => setTimeout(() => resolve({ data: [] }), 100))
		);

		const { result } = renderHook(() => useWorkChecklists(mockWorks));

		// Initially all should be loading
		await waitFor(() => {
			expect(result.current.loadingChecklists['1']).toBe(true);
			expect(result.current.loadingChecklists['2']).toBe(true);
			expect(result.current.loadingChecklists['3']).toBe(true);
		});

		// After completion, all should be false
		await waitFor(() => {
			expect(result.current.loadingChecklists['1']).toBe(false);
			expect(result.current.loadingChecklists['2']).toBe(false);
			expect(result.current.loadingChecklists['3']).toBe(false);
		});
	});

	it('must be handle errors gracefully', async () => {
		(checklistsLib.getChecklistsByWorkId as jest.Mock)
			.mockResolvedValueOnce({ data: [{ id: '1' }] })
			.mockRejectedValueOnce(new Error('Network error'))
			.mockResolvedValueOnce({ data: [] });

		const { result } = renderHook(() => useWorkChecklists(mockWorks));

		await waitFor(() => {
			expect(result.current.workChecklists['1']).toBe(true);
			expect(result.current.workChecklists['2']).toBe(false); // Error handled
			expect(result.current.workChecklists['3']).toBe(false);
		});
	});

	it('must be handle null data response', async () => {
		(checklistsLib.getChecklistsByWorkId as jest.Mock).mockResolvedValue({
			data: null,
		});

		const { result } = renderHook(() => useWorkChecklists(mockWorks));

		await waitFor(() => {
			expect(result.current.workChecklists['1']).toBe(false);
			expect(result.current.workChecklists['2']).toBe(false);
			expect(result.current.workChecklists['3']).toBe(false);
		});
	});

	it('must be not run when works array is empty', () => {
		const { result } = renderHook(() => useWorkChecklists([]));

		expect(checklistsLib.getChecklistsByWorkId).not.toHaveBeenCalled();
		expect(result.current.workChecklists).toEqual({});
	});

	it('must be rerun when works array changes', async () => {
		(checklistsLib.getChecklistsByWorkId as jest.Mock).mockResolvedValue({
			data: [],
		});

		const { rerender } = renderHook(
			({ works }) => useWorkChecklists(works),
			{
				initialProps: { works: [mockWorks[0]] },
			}
		);

		await waitFor(() => {
			expect(checklistsLib.getChecklistsByWorkId).toHaveBeenCalledTimes(1);
		});

		// Change works
		rerender({ works: mockWorks });

		await waitFor(() => {
			expect(checklistsLib.getChecklistsByWorkId).toHaveBeenCalledTimes(4); // 1 + 3
		});
	});
});
