import { formatCreatedAt } from '@/helpers/date/format-date';

describe('formatCreatedAt', () => {
	it('returns N/A when value is undefined', () => {
		expect(formatCreatedAt(undefined)).toBe('N/A');
	});

	it('returns N/A when value is null', () => {
		expect(formatCreatedAt(null)).toBe('N/A');
	});

	it('returns N/A when value is an invalid date string', () => {
		expect(formatCreatedAt('not-a-date')).toBe('N/A');
	});

	it('formats a valid ISO date string as dd/mm/yyyy using UTC parts', () => {
		expect(formatCreatedAt('2024-06-15T00:00:00.000Z')).toBe('15/06/2024');
	});

	it('pads day and month with leading zeros', () => {
		expect(formatCreatedAt('2024-01-05T00:00:00.000Z')).toBe('05/01/2024');
	});
});
