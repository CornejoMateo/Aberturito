interface BalanceCalculationInput {
	budgetAmountArs?: number | null;
	budgetAmountUsd?: number | null;
	usdCurrent?: number | null;
	totalPaidArs?: number | null;
	totalPaidUsd?: number | null;
	budgetInitialArs?: number | null;
	budgetInitialUsd?: number | null;
}

export interface BalanceSummary {
	budgetArsInitial: number;
	budgetUsdInitial: number;
	budgetUsd: number;
	budgetArsCurrent: number;
	totalPaidArs: number;
	totalPaidUsd: number;
	remainingArs: number;
	remainingUsd: number;
	progressPercentage: number;
	type: string;
}

const toSafeNumber = (value?: number | null) => Number(value) || 0;

export function calculateBalanceSummary(input: BalanceCalculationInput): BalanceSummary {
	const budgetArsInitial = toSafeNumber(input.budgetInitialArs);
	const budgetUsdInitial = toSafeNumber(input.budgetInitialUsd);
	const budgetUsd = toSafeNumber(input.budgetAmountUsd);
	const budgetArsCurrent = toSafeNumber(input.budgetAmountArs);
	const totalPaidArs = toSafeNumber(input.totalPaidArs);
	const totalPaidUsd = toSafeNumber(input.totalPaidUsd);

	const remainingUsd = budgetUsd - totalPaidUsd;
	const remainingArs = budgetArsCurrent - totalPaidArs;
	const progressBase = budgetArsCurrent > 0 ? budgetArsCurrent : budgetArsInitial;
	const progressPercentage =
		progressBase > 0 ? Math.min(Math.round((totalPaidArs / progressBase) * 100), 100) : 0;

	return {
		budgetArsInitial,
		budgetUsdInitial,
		budgetUsd,
		budgetArsCurrent,
		totalPaidArs,
		totalPaidUsd,
		remainingArs,
		remainingUsd,
		progressPercentage,
		type: remainingUsd > 0 ? 'Deudor' : remainingUsd < 0 ? 'Acreedor' : 'Cancelado',
	};
}
