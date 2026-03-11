import { paginateAndFilter } from '../../helpers/clients/pagination';

interface Client {
	id: number;
	name: string;
}

const mockData: Client[] = [
	{ id: 1, name: 'Juan' },
	{ id: 2, name: 'Maria' },
	{ id: 3, name: 'Pedro' },
	{ id: 4, name: 'Juana' },
	{ id: 5, name: 'Carlos' },
	{ id: 6, name: 'Lucia' },
];

const filterFn = (item: Client, search: string) => item.name.toLowerCase().includes(search);

describe('paginateAndFilter', () => {
	it('returns all data when searchTerm is empty', () => {
		const result = paginateAndFilter(mockData, '', 1, 10, filterFn);

		expect(result.filteredData).toHaveLength(6);
		expect(result.paginatedData).toHaveLength(6);
		expect(result.totalItems).toBe(6);
		expect(result.totalPages).toBe(1);
	});

	it('filters data correctly based on searchTerm', () => {
		const result = paginateAndFilter(mockData, 'juan', 1, 10, filterFn);

		expect(result.filteredData).toHaveLength(2); // Juan y Juana
		expect(result.totalItems).toBe(2);
	});

	it('paginates correctly', () => {
		const result = paginateAndFilter(mockData, '', 2, 2, filterFn);

		expect(result.paginatedData).toEqual([
			{ id: 3, name: 'Pedro' },
			{ id: 4, name: 'Juana' },
		]);

		expect(result.totalPages).toBe(3);
	});

	it('clamps currentPage if it is too high', () => {
		const result = paginateAndFilter(mockData, '', 999, 2, filterFn);

		expect(result.paginatedData).toEqual([
			{ id: 5, name: 'Carlos' },
			{ id: 6, name: 'Lucia' },
		]);
	});

	it('clamps currentPage if it is less than 1', () => {
		const result = paginateAndFilter(mockData, '', 0, 2, filterFn);

		expect(result.paginatedData).toEqual([
			{ id: 1, name: 'Juan' },
			{ id: 2, name: 'Maria' },
		]);
	});

	it('handles case when no results match search', () => {
		const result = paginateAndFilter(mockData, 'zzz', 1, 2, filterFn);

		expect(result.filteredData).toHaveLength(0);
		expect(result.paginatedData).toHaveLength(0);
		expect(result.totalPages).toBe(0);
		expect(result.totalItems).toBe(0);
	});
});
