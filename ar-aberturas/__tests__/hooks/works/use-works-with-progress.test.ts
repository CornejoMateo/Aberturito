import { renderHook, waitFor } from '@testing-library/react';
import { useWorksWithProgress } from '@/hooks/clients/use-works-with-progress';
import * as worksLib from '@/lib/works/works';
import * as checklistsLib from '@/lib/works/checklists';

jest.mock('@/lib/works/works');
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
];

const mockChecklists = [
	{
		id: '1',
		work_id: '1',
		name: 'Checklist 1',
		notes: 'Nota importante',
		items: [
			{ name: 'Tarea 1', done: true, key: 0 },
			{ name: 'Tarea 2', done: false, key: 1 },
			{ name: 'Tarea 3', done: true, key: 2 },
		],
	},
	{
		id: '2',
		work_id: '1',
		name: 'Checklist 2',
		notes: '',
		items: [
			{ name: 'Tarea 4', done: false, key: 0 },
			{ name: 'Tarea 5', done: false, key: 1 },
		],
	},
	{
		id: '3',
		work_id: '2',
		name: 'Checklist 3',
		notes: null,
		items: [
			{ name: 'Tarea 6', done: true, key: 0 },
			{ name: 'Tarea 7', done: true, key: 1 },
			{ name: 'Tarea 8', done: true, key: 2 },
		],
	},
];


describe('useWorksWithProgress', () => {

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should load works with correctly calculated progress', async () => {
		(worksLib.listWorks as jest.Mock).mockResolvedValue({
			data: mockWorks,
			error: null,
		});

		(checklistsLib.getChecklistsByWorkIds as jest.Mock).mockResolvedValue({
			data: mockChecklists,
			error: null,
		});

		const { result } = renderHook(() => useWorksWithProgress());

		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.works).toHaveLength(2);


		const work1 = result.current.works.find((w) => w.id === '1');
		expect(work1?.progress).toBe(40);
		expect(work1?.tasks).toHaveLength(5);
		expect(work1?.hasNotes).toBe(true);

		const work2 = result.current.works.find((w) => w.id === '2');
		expect(work2?.progress).toBe(100);
		expect(work2?.tasks).toHaveLength(3);
		expect(work2?.hasNotes).toBe(false);
	});

	it('must be works without checklists (progress 100%)', async () => {
		(worksLib.listWorks as jest.Mock).mockResolvedValue({
			data: mockWorks,
			error: null,
		});

		(checklistsLib.getChecklistsByWorkIds as jest.Mock).mockResolvedValue({
			data: [],
			error: null,
		});

		const { result } = renderHook(() => useWorksWithProgress());

		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.works).toHaveLength(2);
		expect(result.current.works[0].progress).toBe(100);
		expect(result.current.works[1].progress).toBe(100);
		expect(result.current.works[0].tasks).toEqual([]);
		expect(result.current.works[1].tasks).toEqual([]);
	});

	it('should initialize with charge status', () => {
		(worksLib.listWorks as jest.Mock).mockImplementation(
			() => new Promise(() => {})
		);

		const { result } = renderHook(() => useWorksWithProgress());

		expect(result.current.loading).toBe(true);
		expect(result.current.works).toEqual([]);
	});

	it('should handle when there are no works', async () => {
		(worksLib.listWorks as jest.Mock).mockResolvedValue({
			data: [],
			error: null,
		});

		const { result } = renderHook(() => useWorksWithProgress());

		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.works).toEqual([]);
		expect(checklistsLib.getChecklistsByWorkIds).not.toHaveBeenCalled();
	});

	it('should calculate progress correctly with different task statuses', async () => {
		const worksWithDifferentProgress = [
			{ id: 'work-a', client_id: 'client-a', address: 'A', status: 'pending' as const, created_at: '2024-01-01' },
			{ id: 'work-b', client_id: 'client-b', address: 'B', status: 'pending' as const, created_at: '2024-01-02' },
			{ id: 'work-c', client_id: 'client-c', address: 'C', status: 'pending' as const, created_at: '2024-01-03' },
		];

		const checklistsWithDifferentProgress = [
			{
				id: 'cl-a',
				work_id: 'work-a',
				name: 'CL A',
				notes: '',
				items: [
					{ name: 'T1', done: true, key: 0 },
					{ name: 'T2', done: true, key: 1 },
					{ name: 'T3', done: true, key: 2 },
					{ name: 'T4', done: true, key: 3 },
				],
			},
			{
				id: 'cl-b',
				work_id: 'work-b',
				name: 'CL B',
				notes: '',
				items: [
					{ name: 'T1', done: false, key: 0 },
					{ name: 'T2', done: false, key: 1 },
				],
			}, 
			{
				id: 'cl-c',
				work_id: 'work-c',
				name: 'CL C',
				notes: '',
				items: [
					{ name: 'T1', done: true, key: 0 },
					{ name: 'T2', done: false, key: 1 },
					{ name: 'T3', done: false, key: 2 },
				],
			},
		];

		(worksLib.listWorks as jest.Mock).mockResolvedValue({
			data: worksWithDifferentProgress,
			error: null,
		});

		(checklistsLib.getChecklistsByWorkIds as jest.Mock).mockResolvedValue({
			data: checklistsWithDifferentProgress,
			error: null,
		});

		const { result } = renderHook(() => useWorksWithProgress());

		await waitFor(() => expect(result.current.loading).toBe(false));

		const workA = result.current.works.find((w) => w.id === 'work-a');
		const workB = result.current.works.find((w) => w.id === 'work-b');
		const workC = result.current.works.find((w) => w.id === 'work-c');

		expect(workA?.progress).toBe(100);
		expect(workB?.progress).toBe(0);
		expect(workC?.progress).toBe(33);
	});

	it('It should correctly detect if there are notes.', async () => {
		const worksWithNotes = [
			{ id: 'work-1', client_id: 'c1', address: 'A', status: 'pending' as const, created_at: '2024-01-01' },
			{ id: 'work-2', client_id: 'c2', address: 'B', status: 'pending' as const, created_at: '2024-01-02' },
		];

		const checklistsWithNotes = [
			{
				id: 'cl-1',
				work_id: 'work-1',
				name: 'CL 1',
				notes: '   ',
				items: [],
			},
			{
				id: 'cl-2',
				work_id: 'work-2',
				name: 'CL 2',
				notes: 'Nota real',
				items: [],
			},
		];

		(worksLib.listWorks as jest.Mock).mockResolvedValue({
			data: worksWithNotes,
			error: null,
		});

		(checklistsLib.getChecklistsByWorkIds as jest.Mock).mockResolvedValue({
			data: checklistsWithNotes,
			error: null,
		});

		const { result } = renderHook(() => useWorksWithProgress());

		await waitFor(() => expect(result.current.loading).toBe(false));

		const work1 = result.current.works.find((w) => w.id === 'work-1');
		const work2 = result.current.works.find((w) => w.id === 'work-2');

		expect(work1?.hasNotes).toBe(false); 
		expect(work2?.hasNotes).toBe(true);
	});
});
