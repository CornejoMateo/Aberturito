import { getPercentages } from '@/helpers/reports/percentajes';

describe('getPercentages', () => {
	it('returns integer percentages that sum to 100', () => {
		const result = getPercentages(
			[
				{ name: 'A', count: 1 },
				{ name: 'B', count: 1 },
				{ name: 'C', count: 1 },
			],
			3,
		);

		const sum = result.reduce((acc, item) => acc + item.percent, 0);
		const values = result.map((item) => item.percent).sort((a, b) => b - a);

		expect(sum).toBe(100);
		expect(values).toEqual([34, 33, 33]);
	});

	it('assigns the extra percentage points to items with larger decimal remainders', () => {
		const result = getPercentages(
			[
				{ name: 'A', count: 1 },
				{ name: 'B', count: 2 },
				{ name: 'C', count: 3 },
			],
			6,
		);

		const itemA = result.find((item) => item.name === 'A');
		const itemB = result.find((item) => item.name === 'B');
		const itemC = result.find((item) => item.name === 'C');

		expect(itemA?.percent).toBe(17);
		expect(itemB?.percent).toBe(33);
		expect(itemC?.percent).toBe(50);
	});

	it('keeps exact percentages when there is no rounding difference', () => {
		const result = getPercentages(
			[
				{ name: 'A', count: 2 },
				{ name: 'B', count: 3 },
			],
			5,
		);

		const itemA = result.find((item) => item.name === 'A');
		const itemB = result.find((item) => item.name === 'B');
		const sum = result.reduce((acc, item) => acc + item.percent, 0);

		expect(itemA?.percent).toBe(40);
		expect(itemB?.percent).toBe(60);
		expect(sum).toBe(100);
	});

	it('preserves original item properties', () => {
		const result = getPercentages(
			[
				{ name: 'A', count: 1, color: '#10b981' },
				{ name: 'B', count: 1, color: '#3b82f6' },
			],
			2,
		);

		expect(result[0]).toHaveProperty('name');
		expect(result[0]).toHaveProperty('count');
		expect(result[0]).toHaveProperty('color');
		expect(result[0]).toHaveProperty('rawPercent');
		expect(result[0]).toHaveProperty('percent');
	});
});
