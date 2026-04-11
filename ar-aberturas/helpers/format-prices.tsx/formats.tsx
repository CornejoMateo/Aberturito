export const formatCurrency = (amount: number | null | undefined) => {
	if (!amount) return '$0.00';
	return new Intl.NumberFormat('es-AR', {
		style: 'currency',
		currency: 'ARS',
		minimumFractionDigits: 2,
	}).format(amount);
};

export const formatCurrencyUSD = (amount: number | null | undefined) => {
	if (!amount) return '';
	return new Intl.NumberFormat('es-AR', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
	}).format(amount);
};

export const normalizeMoney = (value: number): number => {
	const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
	return Object.is(rounded, -0) ? 0 : rounded;
};
