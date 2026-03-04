export interface PaginationResult<T> {
	filteredData: T[];
	paginatedData: T[];
	totalPages: number;
	totalItems: number;
}

export function paginateAndFilter<T>(
	data: T[],
	searchTerm: string,
	currentPage: number,
	itemsPerPage: number,
	filterFn: (item: T, normalizedSearch: string) => boolean
): PaginationResult<T> {
	const normalizedSearch = searchTerm.toLowerCase().trim();

	const filteredData = normalizedSearch
		? data.filter((item) => filterFn(item, normalizedSearch))
		: data;

	const totalItems = filteredData.length;
	const totalPages = Math.ceil(totalItems / itemsPerPage);

	const safePage = Math.min(Math.max(currentPage, 1), totalPages || 1);
	const startIndex = (safePage - 1) * itemsPerPage;

	const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

	return {
		filteredData,
		paginatedData,
		totalPages,
		totalItems,
	};
}
