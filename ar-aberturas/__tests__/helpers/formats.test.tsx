import {
	formatCurrency,
	formatCurrencyUSD,
} from '@/helpers/format-prices.tsx/formats';

describe('formatCurrency', () => {
	it('returns $0.00 for null, undefined and 0', () => {
		expect(formatCurrency(null)).toBe('$0.00');
		expect(formatCurrency(undefined)).toBe('$0.00');
		expect(formatCurrency(0)).toBe('$0.00');
	});

	it('formats positive numbers as ARS currency', () => {
		const amount = 1234.5;
		const expected = new Intl.NumberFormat('es-AR', {
			style: 'currency',
			currency: 'ARS',
			minimumFractionDigits: 2,
		}).format(amount);

		expect(formatCurrency(amount)).toBe(expected);
	});
});

describe('formatCurrencyUSD', () => {
	it('returns empty string for null, undefined and 0', () => {
		expect(formatCurrencyUSD(null)).toBe('');
		expect(formatCurrencyUSD(undefined)).toBe('');
		expect(formatCurrencyUSD(0)).toBe('');
	});

	it('formats positive numbers as USD currency', () => {
		const amount = 1234.5;
		const expected = new Intl.NumberFormat('es-AR', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
		}).format(amount);

		expect(formatCurrencyUSD(amount)).toBe(expected);
	});
});
