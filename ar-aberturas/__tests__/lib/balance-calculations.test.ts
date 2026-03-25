import {
	calculateBalanceSummary,
} from '@/helpers/balances/balance-calculations';

describe('calculateBalanceSummary', () => {
	describe('Basic calculations', () => {
		it('should calculate correct remaining ARS', () => {
			const result = calculateBalanceSummary({
				budgetAmountArs: null,
				budgetAmountUsd: 1000,
				usdCurrent: 100,
				totalPaidArs: 50000,
				totalPaidUsd: 0,
			});

			expect(result.budgetArsCurrent).toBe(100000);
			expect(result.remainingArs).toBe(50000);
		});

		it('should calculate correct remaining USD', () => {
			const result = calculateBalanceSummary({
				budgetAmountArs: null,
				budgetAmountUsd: 1000,
				usdCurrent: 100,
				totalPaidArs: 0,
				totalPaidUsd: 300,
			});

			expect(result.remainingUsd).toBe(700);
		});

		it('should calculate current budget in ARS based on USD rate', () => {
			const result = calculateBalanceSummary({
				budgetAmountArs: null,
				budgetAmountUsd: 1000,
				usdCurrent: 150,
				totalPaidArs: 0,
				totalPaidUsd: 0,
			});

			expect(result.budgetArsCurrent).toBe(150000);
		});

		it('should handle zero USD current rate (default to 1)', () => {
			const result = calculateBalanceSummary({
				budgetAmountArs: null,
				budgetAmountUsd: 1000,
				usdCurrent: 0,
				totalPaidArs: 0,
				totalPaidUsd: 0,
			});

			expect(result.budgetArsCurrent).toBe(1000);
		});

		it('should handle null USD current rate (default to 1)', () => {
			const result = calculateBalanceSummary({
				budgetAmountArs: null,
				budgetAmountUsd: 1000,
				usdCurrent: null,
				totalPaidArs: 0,
				totalPaidUsd: 0,
			});

			expect(result.budgetArsCurrent).toBe(1000);
		});
	});

	describe('Progress Percentage', () => {
		it('should calculate correct progress percentage', () => {
			const result = calculateBalanceSummary({
				budgetAmountArs: null,
				budgetAmountUsd: 1000,
				usdCurrent: 100,
				totalPaidArs: 25000,
				totalPaidUsd: 0,
			});

			expect(result.progressPercentage).toBe(25);
		});

		it('should cap progress at 100%', () => {
			const result = calculateBalanceSummary({
				budgetAmountArs: null,
				budgetAmountUsd: 1000,
				usdCurrent: 100,
				totalPaidArs: 100000,
				totalPaidUsd: 0,
			});

			expect(result.progressPercentage).toBe(100);
		});

		it('should return 0% when budget is zero', () => {
			const result = calculateBalanceSummary({
				budgetAmountArs: null,
				budgetAmountUsd: 0,
				usdCurrent: 100,
				totalPaidArs: 0,
				totalPaidUsd: 0,
			});

			expect(result.progressPercentage).toBe(0);
		});

		it('should use budgetArsInitial as fallback for progress calculation', () => {
			const result = calculateBalanceSummary({
				budgetAmountArs: 100000,
				budgetAmountUsd: 0,
				usdCurrent: 100,
				totalPaidArs: 25000,
				totalPaidUsd: 0,
			});

			expect(result.progressPercentage).toBe(25);
		});

		it('should round progress percentage correctly', () => {
			const result = calculateBalanceSummary({
				budgetAmountArs: null,
				budgetAmountUsd: 1000,
				usdCurrent: 100,
				totalPaidArs: 33333,
				totalPaidUsd: 0,
			});

			expect(result.progressPercentage).toBe(33);
		});
	});

	describe('Debtor Status', () => {
		it('should mark as debtor when remainingUsd > 0', () => {
			const result = calculateBalanceSummary({
				budgetAmountArs: null,
				budgetAmountUsd: 1000,
				usdCurrent: 100,
				totalPaidArs: 0,
				totalPaidUsd: 500,
			});

			expect(result.isDebtor).toBe(true);
		});

		it('should mark as creditor when remainingUsd <= 0', () => {
			const result = calculateBalanceSummary({
				budgetAmountArs: null,
				budgetAmountUsd: 500,
				usdCurrent: 100,
				totalPaidArs: 0,
				totalPaidUsd: 500,
			});

			expect(result.isDebtor).toBe(false);
		});

		it('should mark as creditor when totalPaidUsd exceeds budget', () => {
			const result = calculateBalanceSummary({
				budgetAmountArs: null,
				budgetAmountUsd: 500,
				usdCurrent: 100,
				totalPaidArs: 0,
				totalPaidUsd: 700,
			});

			expect(result.isDebtor).toBe(false);
		});
	});

	describe('Null and Undefined Handling', () => {
		it('should handle all null inputs', () => {
			const result = calculateBalanceSummary({
				budgetAmountArs: null,
				budgetAmountUsd: null,
				usdCurrent: null,
				totalPaidArs: null,
				totalPaidUsd: null,
			});

			expect(result.budgetArsInitial).toBe(0);
			expect(result.budgetUsd).toBe(0);
			expect(result.budgetArsCurrent).toBe(0);
			expect(result.totalPaidArs).toBe(0);
			expect(result.totalPaidUsd).toBe(0);
			expect(result.remainingArs).toBe(0);
			expect(result.remainingUsd).toBe(0);
			expect(result.progressPercentage).toBe(0);
		});

		it('should handle mixed null and defined values', () => {
			const result = calculateBalanceSummary({
				budgetAmountArs: 500000,
				budgetAmountUsd: null,
				usdCurrent: undefined,
				totalPaidArs: 100000,
				totalPaidUsd: 0,
			});

			expect(result.budgetArsInitial).toBe(500000);
			expect(result.budgetUsd).toBe(0);
			expect(result.totalPaidArs).toBe(100000);
		});

		it('should convert undefined to 0', () => {
			const result = calculateBalanceSummary({
				budgetAmountArs: undefined,
				budgetAmountUsd: 1000,
				usdCurrent: 100,
				totalPaidArs: undefined,
				totalPaidUsd: undefined,
			});

			expect(result.budgetArsInitial).toBe(0);
			expect(result.totalPaidArs).toBe(0);
			expect(result.totalPaidUsd).toBe(0);
		});
	});

	describe('Real-World Scenarios', () => {
		it('should calculate correctly for a partially paid balance', () => {
			const result = calculateBalanceSummary({
				budgetAmountArs: null,
				budgetAmountUsd: 5000,
				usdCurrent: 150,
				totalPaidArs: 300000,
				totalPaidUsd: 1200,
			});

			expect(result.budgetArsCurrent).toBe(750000);
			expect(result.remainingArs).toBe(450000);
			expect(result.remainingUsd).toBe(3800);
			expect(result.isDebtor).toBe(true);
			expect(result.progressPercentage).toBe(40);
		});

		it('should calculate correctly for a fully paid balance', () => {
			const result = calculateBalanceSummary({
				budgetAmountArs: null,
				budgetAmountUsd: 5000,
				usdCurrent: 150,
				totalPaidArs: 750000,
				totalPaidUsd: 5000,
			});

			expect(result.remainingArs).toBe(0);
			expect(result.remainingUsd).toBe(0);
			expect(result.isDebtor).toBe(false);
			expect(result.progressPercentage).toBe(100);
		});

		it('should handle high USD rates', () => {
			const result = calculateBalanceSummary({
				budgetAmountArs: null,
				budgetAmountUsd: 10000,
				usdCurrent: 1000,
				totalPaidArs: 5000000,
				totalPaidUsd: 4000,
			});

			expect(result.budgetArsCurrent).toBe(10000000);
			expect(result.remainingArs).toBe(5000000);
			expect(result.remainingUsd).toBe(6000);
			expect(result.progressPercentage).toBe(50);
		});

		it('should handle small USD amounts', () => {
			const result = calculateBalanceSummary({
				budgetAmountArs: null,
				budgetAmountUsd: 100,
				usdCurrent: 100,
				totalPaidArs: 2500,
				totalPaidUsd: 20,
			});

			expect(result.budgetArsCurrent).toBe(10000);
			expect(result.remainingArs).toBe(7500);
			expect(result.remainingUsd).toBe(80);
			expect(result.progressPercentage).toBe(25);
		});
	});

	describe('Return Type Validation', () => {
		it('should return all required fields', () => {
			const result = calculateBalanceSummary({
				budgetAmountArs: 100000,
				budgetAmountUsd: 1000,
				usdCurrent: 100,
				totalPaidArs: 50000,
				totalPaidUsd: 400,
			});

			expect(result).toHaveProperty('budgetArsInitial');
			expect(result).toHaveProperty('budgetUsd');
			expect(result).toHaveProperty('budgetArsCurrent');
			expect(result).toHaveProperty('totalPaidArs');
			expect(result).toHaveProperty('totalPaidUsd');
			expect(result).toHaveProperty('remainingArs');
			expect(result).toHaveProperty('remainingUsd');
			expect(result).toHaveProperty('progressPercentage');
			expect(result).toHaveProperty('isDebtor');
		});

		it('should return numbers for all numeric fields', () => {
			const result = calculateBalanceSummary({
				budgetAmountArs: 100000,
				budgetAmountUsd: 1000,
				usdCurrent: 100,
				totalPaidArs: 50000,
				totalPaidUsd: 400,
			});

			expect(typeof result.budgetArsInitial).toBe('number');
			expect(typeof result.budgetUsd).toBe('number');
			expect(typeof result.budgetArsCurrent).toBe('number');
			expect(typeof result.totalPaidArs).toBe('number');
			expect(typeof result.totalPaidUsd).toBe('number');
			expect(typeof result.remainingArs).toBe('number');
			expect(typeof result.remainingUsd).toBe('number');
			expect(typeof result.progressPercentage).toBe('number');
		});

		it('should return boolean for isDebtor field', () => {
			const result = calculateBalanceSummary({
				budgetAmountArs: null,
				budgetAmountUsd: 1000,
				usdCurrent: 100,
				totalPaidArs: 0,
				totalPaidUsd: 500,
			});

			expect(typeof result.isDebtor).toBe('boolean');
		});
	});
});
