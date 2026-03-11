import { calculateProgress } from '@/helpers/checklists/progress';

describe('calculateProgress', () => {
	it('should return 100 when items array is empty', () => {
		expect(calculateProgress([])).toBe(100);
	});

	it('should return 0 when no items are completed', () => {
		const items = [
			{ name: 'Item 1', done: false },
			{ name: 'Item 2', done: false },
			{ name: 'Item 3', done: false },
		];

		expect(calculateProgress(items)).toBe(0);
	});

	it('should return 100 when all items are completed', () => {
		const items = [
			{ name: 'Item 1', done: true },
			{ name: 'Item 2', done: true },
			{ name: 'Item 3', done: true },
		];

		expect(calculateProgress(items)).toBe(100);
	});

	it('should return 50 when half of items are completed', () => {
		const items = [
			{ name: 'Item 1', done: true },
			{ name: 'Item 2', done: false },
		];

		expect(calculateProgress(items)).toBe(50);
	});

	it('should return 67 when 2 out of 3 items are completed', () => {
		const items = [
			{ name: 'Item 1', done: true },
			{ name: 'Item 2', done: true },
			{ name: 'Item 3', done: false },
		];

		expect(calculateProgress(items)).toBe(67);
	});

	it('should return 33 when 1 out of 3 items is completed', () => {
		const items = [
			{ name: 'Item 1', done: true },
			{ name: 'Item 2', done: false },
			{ name: 'Item 3', done: false },
		];

		expect(calculateProgress(items)).toBe(33);
	});

	it('should handle undefined items array', () => {
		expect(calculateProgress(undefined as any)).toBe(100);
	});

	it('should handle items with mixed done/undefined values', () => {
		const items = [
			{ name: 'Item 1', done: true },
			{ name: 'Item 2' }, // no done property
			{ name: 'Item 3', done: false },
		];

		expect(calculateProgress(items)).toBe(33);
	});
});
