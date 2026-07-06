interface BalanceCalculationInput {
	budgetAmountArs?: number | null;
	budgetAmountUsd?: number | null;
	usdCurrent?: number | null;
	totalPaidArs?: number | null;
	totalPaidUsd?: number | null;
	totalExtraArs?: number | null;
	totalExtraUsd?: number | null;
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
	totalExtraArs: number;
	totalExtraUsd: number;
	effectiveBudgetArs: number;
	effectiveBudgetUsd: number;
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
	const totalExtraArs = toSafeNumber(input.totalExtraArs);
	const totalExtraUsd = toSafeNumber(input.totalExtraUsd);

	const effectiveBudgetArs = budgetArsCurrent + totalExtraArs;
	const effectiveBudgetUsd = budgetUsd + totalExtraUsd;

	const remainingUsd = effectiveBudgetUsd - totalPaidUsd;
	const remainingArs = effectiveBudgetArs - totalPaidArs;
	const progressBase = effectiveBudgetArs > 0 ? effectiveBudgetArs : budgetArsInitial;
	const progressPercentage =
		progressBase > 0 ? Math.min(Math.round((totalPaidArs / progressBase) * 100), 100) : 0;

	return {
		budgetArsInitial,
		budgetUsdInitial,
		budgetUsd,
		budgetArsCurrent,
		totalPaidArs,
		totalPaidUsd,
		totalExtraArs,
		totalExtraUsd,
		effectiveBudgetArs,
		effectiveBudgetUsd,
		remainingArs,
		remainingUsd,
		progressPercentage,
		type: remainingUsd > 0 ? 'Deudor' : remainingUsd < 0 ? 'Acreedor' : 'Cancelado',
	};
}
