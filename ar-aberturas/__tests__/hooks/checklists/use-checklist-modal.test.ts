import { renderHook, act } from '@testing-library/react';
import { useChecklistModal } from '@/hooks/clients/use-checklist-modal';
import { Checklist } from '@/lib/works/checklists';

describe('useChecklistModal', () => {
	it('should initialize with default values', () => {
		const { result } = renderHook(() => useChecklistModal());

		expect(result.current.isOpen).toBe(false);
		expect(result.current.selectedWork).toBeNull();
		expect(result.current.checklist).toEqual({
			name: null,
			description: null,
			width: null,
			height: null,
			type_opening: null,
			items: [],
		});
	});

	it('should open modal with selected work', () => {
		const { result } = renderHook(() => useChecklistModal());
		const mockWork = { id: '1', client_id: '123', status: 'in_progress' } as any;

		act(() => {
			result.current.openChecklist(mockWork);
		});

		expect(result.current.isOpen).toBe(true);
		expect(result.current.selectedWork).toEqual(mockWork);
	});

	it('should close modal and reset selected work', () => {
		const { result } = renderHook(() => useChecklistModal());
		const mockWork = { id: '1', client_id: '123', status: 'in_progress' } as any;

		act(() => {
			result.current.openChecklist(mockWork);
		});

		expect(result.current.isOpen).toBe(true);

		act(() => {
			result.current.closeChecklist();
		});

		expect(result.current.isOpen).toBe(false);
		expect(result.current.selectedWork).toBeNull();
	});

	it('should update a field value', () => {
		const { result } = renderHook(() => useChecklistModal());

		act(() => {
			result.current.updateField('name', 'Test Checklist');
		});

		expect(result.current.checklist.name).toBe('Test Checklist');
	});

	it('should convert empty string to null when updating field', () => {
		const { result } = renderHook(() => useChecklistModal());

		act(() => {
			result.current.updateField('name', '');
		});

		expect(result.current.checklist.name).toBeNull();
	});

	it('should update type_opening and set default items', () => {
		const { result } = renderHook(() => useChecklistModal());

		act(() => {
			result.current.updateField('type_opening', 'PVC');
		});

		expect(result.current.checklist.type_opening).toBe('PVC');
		expect(result.current.checklist.items.length).toBeGreaterThan(0);
		expect(result.current.checklist.items[0]).toHaveProperty('name');
		expect(result.current.checklist.items[0]).toHaveProperty('completed');
		expect(result.current.checklist.items[0].completed).toBe(false);
	});

	it('should add a new item', () => {
		const { result } = renderHook(() => useChecklistModal());

		act(() => {
			result.current.addItem('New Item');
		});

		expect(result.current.checklist.items).toHaveLength(1);
		expect(result.current.checklist.items[0]).toEqual({
			name: 'New Item',
			completed: false,
		});
	});

	it('should trim whitespace when adding item', () => {
		const { result } = renderHook(() => useChecklistModal());

		act(() => {
			result.current.addItem('  Item with spaces  ');
		});

		expect(result.current.checklist.items[0].name).toBe('Item with spaces');
	});

	it('should not add item if name is empty or only whitespace', () => {
		const { result } = renderHook(() => useChecklistModal());

		act(() => {
			result.current.addItem('');
		});

		expect(result.current.checklist.items).toHaveLength(0);

		act(() => {
			result.current.addItem('   ');
		});

		expect(result.current.checklist.items).toHaveLength(0);
	});

	it('should remove item by index', () => {
		const { result } = renderHook(() => useChecklistModal());

		act(() => {
			result.current.addItem('Item 1');
			result.current.addItem('Item 2');
			result.current.addItem('Item 3');
		});

		expect(result.current.checklist.items).toHaveLength(3);

		act(() => {
			result.current.removeItem(1); // Remove 'Item 2'
		});

		expect(result.current.checklist.items).toHaveLength(2);
		expect(result.current.checklist.items[0].name).toBe('Item 1');
		expect(result.current.checklist.items[1].name).toBe('Item 3');
	});

	it('should reset form to default values', () => {
		const { result } = renderHook(() => useChecklistModal());

		act(() => {
			result.current.updateField('name', 'Test');
			result.current.updateField('description', 'Description');
			result.current.updateField('width', 100);
			result.current.addItem('Item 1');
		});

		expect(result.current.checklist.name).toBe('Test');
		expect(result.current.checklist.items).toHaveLength(1);

		act(() => {
			result.current.resetForm();
		});

		expect(result.current.checklist).toEqual({
			name: null,
			description: null,
			width: null,
			height: null,
			type_opening: null,
			items: [],
		});
	});

	it('should initialize checklist from existing data', () => {
		const { result } = renderHook(() => useChecklistModal());

		const existingChecklist: Checklist = {
			id: '1',
			work_id: 'work-1',
			name: 'Existing Checklist',
			description: 'Test description',
			width: 150,
			height: 200,
			type_opening: 'Aluminio',
			items: [
                { name: 'Item 1', done: true, key: 0 },
                { name: 'Item 2', done: false, key: 1 },
            ],
			notes: null,
			created_at: new Date().toISOString(),
		};

		act(() => {
			result.current.initializeChecklist(existingChecklist);
		});

		expect(result.current.checklist.name).toBe('Existing Checklist');
		expect(result.current.checklist.description).toBe('Test description');
		expect(result.current.checklist.width).toBe(150);
		expect(result.current.checklist.height).toBe(200);
		expect(result.current.checklist.type_opening).toBe('Aluminio');
		expect(result.current.checklist.items).toHaveLength(2);
		expect(result.current.checklist.items[0]).toEqual({
			name: 'Item 1',
			completed: true,
		});
		expect(result.current.checklist.items[1]).toEqual({
			name: 'Item 2',
			completed: false,
		});
	});

	it('should handle null or undefined items when initializing', () => {
		const { result } = renderHook(() => useChecklistModal());

		const checklistWithoutItems: Checklist = {
			id: '1',
			work_id: 'work-1',
			name: 'Checklist',
			description: null,
			width: null,
			height: null,
			type_opening: 'PVC',
			items: null as any,
			notes: null,
			created_at: new Date().toISOString(),
		};

		act(() => {
			result.current.initializeChecklist(checklistWithoutItems);
		});

		expect(result.current.checklist.items).toEqual([]);
	});

	it('should handle multiple field updates', () => {
		const { result } = renderHook(() => useChecklistModal());

		act(() => {
			result.current.updateField('name', 'Multi Update Test');
			result.current.updateField('width', 120);
			result.current.updateField('height', 180);
			result.current.updateField('description', 'Multiple updates');
		});

		expect(result.current.checklist.name).toBe('Multi Update Test');
		expect(result.current.checklist.width).toBe(120);
		expect(result.current.checklist.height).toBe(180);
		expect(result.current.checklist.description).toBe('Multiple updates');
	});
});
