import { BALANCE_TYPES } from '@/constants/reports/balances-report';

export interface BalanceStats {
	totalDebtors: number;
	totalCreditors: number;
	total: number;
	debtorsCount: number;
	creditorsCount: number;
}

export function calculateBalanceStats(balances: Array<{ balanceType: string; balanceAmountArs: number }>): BalanceStats {
	return balances.reduce(
		(stats, balance) => {
			if (balance.balanceType === BALANCE_TYPES.DEBTOR) {
				stats.totalDebtors += balance.balanceAmountArs;
				stats.debtorsCount += 1;
			} else if (balance.balanceType === BALANCE_TYPES.CREDITOR) {
				stats.totalCreditors += Math.abs(balance.balanceAmountArs);
				stats.creditorsCount += 1;
			}
			return stats;
		},
		{
			totalDebtors: 0,
			totalCreditors: 0,
			total: 0,
			debtorsCount: 0,
			creditorsCount: 0,
		}
	);
}
