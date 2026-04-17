import { calculateBalanceSummary } from '@/helpers/balances/balance-calculations';

describe('calculateBalanceSummary', () => {
	it('calculates a debtor balance summary', () => {
		const result = calculateBalanceSummary({
			budgetAmountArs: 200000,
			budgetAmountUsd: 100,
			usdCurrent: 1200,
			totalPaidArs: 30000,
			totalPaidUsd: 20,
		});

		expect(result).toEqual({
			budgetArsInitial: 200000,
			budgetUsd: 100,
			budgetArsCurrent: 120000,
			totalPaidArs: 30000,
			totalPaidUsd: 20,
			remainingArs: 96000,
			remainingUsd: 80,
			progressPercentage: 25,
			type: 'Deudor',
		});
	});

	it('returns creditor type when paid USD exceeds budget USD', () => {
		const result = calculateBalanceSummary({
			budgetAmountUsd: 50,
			usdCurrent: 1000,
			totalPaidArs: 50000,
			totalPaidUsd: 60,
		});

		expect(result.remainingUsd).toBe(-10);
		expect(result.type).toBe('Acreedor');
	});

	it('returns cancelled type when remaining USD is zero', () => {
		const result = calculateBalanceSummary({
			budgetAmountUsd: 50,
			totalPaidUsd: 50,
			usdCurrent: 1100,
			totalPaidArs: 55000,
		});

		expect(result.remainingUsd).toBe(0);
		expect(result.type).toBe('Cancelado');
	});

	it('uses 1 as usdCurrent fallback when usdCurrent is 0 or negative', () => {
		const zeroRate = calculateBalanceSummary({
			budgetAmountUsd: 100,
			usdCurrent: 0,
		});
		const negativeRate = calculateBalanceSummary({
			budgetAmountUsd: 100,
			usdCurrent: -200,
		});

		expect(zeroRate.budgetArsCurrent).toBe(100);
		expect(negativeRate.budgetArsCurrent).toBe(100);
	});

	it('handles null and undefined values as zero safely', () => {
		const result = calculateBalanceSummary({
			budgetAmountArs: null,
			budgetAmountUsd: undefined,
			usdCurrent: null,
			totalPaidArs: undefined,
			totalPaidUsd: null,
		});

		expect(result).toEqual({
			budgetArsInitial: 0,
			budgetUsd: 0,
			budgetArsCurrent: 0,
			totalPaidArs: 0,
			totalPaidUsd: 0,
			remainingArs: 0,
			remainingUsd: 0,
			progressPercentage: 0,
			type: 'Cancelado',
		});
	});

	it('caps progress percentage at 100', () => {
		const result = calculateBalanceSummary({
			budgetAmountUsd: 100,
			usdCurrent: 1000,
			totalPaidArs: 250000,
			totalPaidUsd: 100,
		});

		expect(result.progressPercentage).toBe(100);
	});

	it('uses budgetArsInitial as progress base when budgetArsCurrent is 0', () => {
		const result = calculateBalanceSummary({
			budgetAmountArs: 50000,
			budgetAmountUsd: 0,
			usdCurrent: 1000,
			totalPaidArs: 12500,
			totalPaidUsd: 0,
		});

		expect(result.budgetArsCurrent).toBe(0);
		expect(result.progressPercentage).toBe(25);
	});
});
