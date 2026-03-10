import { renderHook, act, waitFor } from '@testing-library/react';
import * as worksLib from '@/lib/works/works';
import { useClientWorks } from '@/hooks/clients/use-client-works';

jest.mock('@/lib/works/works');

const mockClientId = 'client-123';
const mockWorks = [
    {
        id: 'work-1',
        client_id: mockClientId,
        address: 'Calle 1',
        status: 'pending',
        created_at: '2024-01-01',
    },
    {
        id: 'work-2',
        client_id: mockClientId,
        address: 'Calle 2',
        status: 'in_progress',
        created_at: '2024-01-02',
    },
];

describe('useClientWorks', () => {

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('must be initialized with an empty state', () => {
		const { result } = renderHook(() => useClientWorks());

		expect(result.current.works).toEqual([]);
		expect(result.current.isLoading).toBe(false);
	});

	it('must be load client works', async () => {
		(worksLib.getWorksByClientId as jest.Mock).mockResolvedValue({
			data: mockWorks,
			error: null,
		});

		const { result } = renderHook(() => useClientWorks(mockClientId));

		await act(async () => {
			await result.current.loadWorks();
		});

		expect(worksLib.getWorksByClientId).toHaveBeenCalledWith(mockClientId);
		expect(result.current.works).toEqual(mockWorks);
		expect(result.current.isLoading).toBe(false);
	});

	it('must be handle errors when load works', async () => {
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(); // dont show error logs in test outputs
		(worksLib.getWorksByClientId as jest.Mock).mockResolvedValue({
			data: null,
			error: new Error('Error de red'),
		});

		const { result } = renderHook(() => useClientWorks(mockClientId));

		await act(async () => {
			await result.current.loadWorks();
		});

		expect(result.current.works).toEqual([]);
		expect(consoleErrorSpy).toHaveBeenCalled();
		consoleErrorSpy.mockRestore();
	});

	it('must be create work correctly', async () => {
		(worksLib.createWork as jest.Mock).mockResolvedValue({ error: null });
		(worksLib.getWorksByClientId as jest.Mock).mockResolvedValue({
			data: [...mockWorks, { id: 'work-3', address: 'Calle 3' }],
			error: null,
		});

		const { result } = renderHook(() => useClientWorks(mockClientId));

		const newWorkData = { address: 'Calle 3', status: 'pending' };

		await act(async () => {
			await result.current.create(newWorkData);
		});

		expect(worksLib.createWork).toHaveBeenCalledWith({
			...newWorkData,
			client_id: mockClientId,
		});
	});

	it('must be delete work correctly', async () => {
		(worksLib.deleteWork as jest.Mock).mockResolvedValue({ error: null });
		(worksLib.getWorksByClientId as jest.Mock).mockResolvedValue({
			data: mockWorks.filter((w) => w.id !== 'work-1'),
			error: null,
		});

		const { result } = renderHook(() => useClientWorks(mockClientId));

		await act(async () => {
			await result.current.remove('work-1');
		});

		expect(worksLib.deleteWork).toHaveBeenCalledWith('work-1');
	});

	it('must be update work correctly', async () => {
		const updatedData = { status: 'completed' };
		(worksLib.updateWork as jest.Mock).mockResolvedValue({
			data: updatedData,
			error: null,
		});
		(worksLib.getWorksByClientId as jest.Mock).mockResolvedValue({
			data: mockWorks,
			error: null,
		});

		const { result } = renderHook(() => useClientWorks(mockClientId));

		await act(async () => {
			await result.current.loadWorks();
		});

		await act(async () => {
			await result.current.update('work-1', updatedData);
		});

		expect(worksLib.updateWork).toHaveBeenCalledWith('work-1', updatedData);
		expect(result.current.works[0]).toMatchObject({
			...mockWorks[0],
			...updatedData,
		});
	});

	it('must be handle errors when work updated', async () => {
		(worksLib.updateWork as jest.Mock).mockResolvedValue({
			data: null,
			error: new Error('Error de actualización'),
		});

		const { result } = renderHook(() => useClientWorks(mockClientId));

		await expect(
			act(async () => {
				await result.current.update('work-1', { status: 'completed' });
			})
		).rejects.toThrow();
	});

	it('you should not attempt to create a work without a clientId.', async () => {
		const { result } = renderHook(() => useClientWorks());

		await act(async () => {
			await result.current.create({ address: 'Calle 3', status: 'pending' });
		});

		expect(worksLib.createWork).not.toHaveBeenCalled();
	});
});
