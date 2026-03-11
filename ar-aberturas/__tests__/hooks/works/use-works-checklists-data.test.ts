import { renderHook, waitFor } from '@testing-library/react';
import { useWorkChecklistData } from '@/hooks/clients/use-works-checklists-data';
import { getChecklistsByWorkId } from '@/lib/works/checklists';
import { getWorkById } from '@/lib/works/works';
import { getClientById } from '@/lib/clients/clients';

jest.mock('@/lib/works/checklists');
jest.mock('@/lib/works/works');
jest.mock('@/lib/clients/clients');

const mockGetChecklistsByWorkId = getChecklistsByWorkId as jest.MockedFunction<
	typeof getChecklistsByWorkId
>;
const mockGetWorkById = getWorkById as jest.MockedFunction<typeof getWorkById>;
const mockGetClientById = getClientById as jest.MockedFunction<typeof getClientById>;

describe('useWorkChecklistData', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should initialize with loading true', () => {
		mockGetWorkById.mockResolvedValue({ data: null, error: null });
		mockGetChecklistsByWorkId.mockResolvedValue({ data: null, error: null });

		const { result } = renderHook(() => useWorkChecklistData('work-1'));

		expect(result.current.loading).toBe(true);
	});

	it('should load work, client, and checklists data', async () => {
		const mockWork = {
			id: 'work-1',
			locality: 'Buenos Aires',
			address: 'Calle Falsa 123',
			client_id: 'client-1',
			status: 'in_progress',
		};

		const mockClient = {
			id: 'client-1',
			name: 'Juan',
			last_name: 'Pérez',
			phone_number: '1234567890',
		};

		const mockChecklists = [
			{
				id: 'checklist-1',
				work_id: 'work-1',
				name: 'Checklist 1',
				items: [{ name: 'Item 1', done: false }],
			},
			{
				id: 'checklist-2',
				work_id: 'work-1',
				name: 'Checklist 2',
				items: [{ name: 'Item 2', done: true }],
			},
		];

		mockGetWorkById.mockResolvedValue({ data: mockWork as any, error: null });
		mockGetClientById.mockResolvedValue({ data: mockClient as any, error: null });
		mockGetChecklistsByWorkId.mockResolvedValue({ data: mockChecklists as any, error: null });

		const { result } = renderHook(() => useWorkChecklistData('work-1'));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.workData).toEqual({
			id: 'work-1',
			locality: 'Buenos Aires',
			address: 'Calle Falsa 123',
		});

		expect(result.current.clientData).toEqual({
			name: 'Juan Pérez',
			phone_number: '1234567890',
		});

		expect(result.current.checklists).toHaveLength(2);
		expect(result.current.checklists[0].id).toBe('checklist-1');
	});

	it('should handle work without client_id', async () => {
		const mockWork = {
			id: 'work-1',
			locality: 'Córdoba',
			address: 'Av. Principal 456',
			client_id: null,
			status: 'pending',
		};

		const mockChecklists = [
			{
				id: 'checklist-1',
				work_id: 'work-1',
				name: 'Checklist',
				items: [],
			},
		];

		mockGetWorkById.mockResolvedValue({ data: mockWork as any, error: null });
		mockGetChecklistsByWorkId.mockResolvedValue({ data: mockChecklists as any, error: null });

		const { result } = renderHook(() => useWorkChecklistData('work-1'));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.workData).toEqual({
			id: 'work-1',
			locality: 'Córdoba',
			address: 'Av. Principal 456',
		});

		expect(result.current.clientData).toBeNull();
		expect(mockGetClientById).not.toHaveBeenCalled();
	});

	it('should handle client with only name (no last_name)', async () => {
		const mockWork = {
			id: 'work-1',
			locality: 'Rosario',
			address: 'Calle 1',
			client_id: 'client-1',
			status: 'in_progress',
		};

		const mockClient = {
			id: 'client-1',
			name: 'María',
			last_name: null,
			phone_number: '9876543210',
		};

		mockGetWorkById.mockResolvedValue({ data: mockWork as any, error: null });
		mockGetClientById.mockResolvedValue({ data: mockClient as any, error: null });
		mockGetChecklistsByWorkId.mockResolvedValue({ data: [], error: null });

		const { result } = renderHook(() => useWorkChecklistData('work-1'));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.clientData).toEqual({
			name: 'María',
			phone_number: '9876543210',
		});
	});

	it('should handle client with only last_name (no name)', async () => {
		const mockWork = {
			id: 'work-1',
			locality: 'Mendoza',
			address: 'Calle 2',
			client_id: 'client-1',
			status: 'completed',
		};

		const mockClient = {
			id: 'client-1',
			name: null,
			last_name: 'González',
			phone_number: '1122334455',
		};

		mockGetWorkById.mockResolvedValue({ data: mockWork as any, error: null });
		mockGetClientById.mockResolvedValue({ data: mockClient as any, error: null });
		mockGetChecklistsByWorkId.mockResolvedValue({ data: [], error: null });

		const { result } = renderHook(() => useWorkChecklistData('work-1'));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.clientData).toEqual({
			name: 'González',
			phone_number: '1122334455',
		});
	});

	it('should handle empty checklists', async () => {
		const mockWork = {
			id: 'work-1',
			locality: 'La Plata',
			address: 'Diagonal 1',
			client_id: 'client-1',
			status: 'pending',
		};

		const mockClient = {
			id: 'client-1',
			name: 'Carlos',
			last_name: 'López',
			phone_number: '5544332211',
		};

		mockGetWorkById.mockResolvedValue({ data: mockWork as any, error: null });
		mockGetClientById.mockResolvedValue({ data: mockClient as any, error: null });
		mockGetChecklistsByWorkId.mockResolvedValue({ data: [], error: null });

		const { result } = renderHook(() => useWorkChecklistData('work-1'));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.checklists).toEqual([]);
	});

	it('should handle null work data', async () => {
		mockGetWorkById.mockResolvedValue({ data: null, error: null });
		mockGetChecklistsByWorkId.mockResolvedValue({ data: [], error: null });

		const { result } = renderHook(() => useWorkChecklistData('work-1'));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.workData).toBeNull();
		expect(result.current.clientData).toBeNull();
	});

	it('should handle null client data when client_id exists', async () => {
		const mockWork = {
			id: 'work-1',
			locality: 'Tucumán',
			address: 'Calle 3',
			client_id: 'client-1',
			status: 'in_progress',
		};

		mockGetWorkById.mockResolvedValue({ data: mockWork as any, error: null });
		mockGetClientById.mockResolvedValue({ data: null, error: null });
		mockGetChecklistsByWorkId.mockResolvedValue({ data: [], error: null });

		const { result } = renderHook(() => useWorkChecklistData('work-1'));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.workData).toEqual({
			id: 'work-1',
			locality: 'Tucumán',
			address: 'Calle 3',
		});
		expect(result.current.clientData).toBeNull();
	});

	it('should reload data when reload is called', async () => {
		const mockWork = {
			id: 'work-1',
			locality: 'Salta',
			address: 'Calle 4',
			client_id: null,
			status: 'pending',
		};

		mockGetWorkById.mockResolvedValue({ data: mockWork as any, error: null });
		mockGetChecklistsByWorkId.mockResolvedValue({ data: [], error: null });

		const { result } = renderHook(() => useWorkChecklistData('work-1'));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(mockGetWorkById).toHaveBeenCalledTimes(1);

		// Call reload
		await result.current.reload();

		await waitFor(() => {
			expect(mockGetWorkById).toHaveBeenCalledTimes(2);
			expect(result.current.loading).toBe(false);
		});
	});

	it('should handle missing locality and address gracefully', async () => {
		const mockWork = {
			id: 'work-1',
			locality: null,
			address: null,
			client_id: null,
			status: 'pending',
		};

		mockGetWorkById.mockResolvedValue({ data: mockWork as any, error: null });
		mockGetChecklistsByWorkId.mockResolvedValue({ data: [], error: null });

		const { result } = renderHook(() => useWorkChecklistData('work-1'));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.workData).toEqual({
			id: 'work-1',
			locality: '',
			address: '',
		});
	});

	it('should handle missing phone_number in client', async () => {
		const mockWork = {
			id: 'work-1',
			locality: 'Jujuy',
			address: 'Calle 5',
			client_id: 'client-1',
			status: 'in_progress',
		};

		const mockClient = {
			id: 'client-1',
			name: 'Ana',
			last_name: 'Martínez',
			phone_number: null,
		};

		mockGetWorkById.mockResolvedValue({ data: mockWork as any, error: null });
		mockGetClientById.mockResolvedValue({ data: mockClient as any, error: null });
		mockGetChecklistsByWorkId.mockResolvedValue({ data: [], error: null });

		const { result } = renderHook(() => useWorkChecklistData('work-1'));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.clientData).toEqual({
			name: 'Ana Martínez',
			phone_number: '',
		});
	});

	it('should set loading to false even if requests fail', async () => {
		// Mock console.error to suppress error output in tests
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

		mockGetWorkById.mockResolvedValue({ data: null, error: { message: 'Network error' } as any });
		mockGetChecklistsByWorkId.mockResolvedValue({ data: [], error: null });

		const { result } = renderHook(() => useWorkChecklistData('work-1'));

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.workData).toBeNull();

		consoleErrorSpy.mockRestore();
	});
});
