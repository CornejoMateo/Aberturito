import { BUDGET_TYPES, BUDGET_STATUS } from '@/constants/reports/budgets-report';

export function formatBudgetType(type: string | null | undefined) {
	if (!type) return BUDGET_TYPES.STANDARD;
	
	switch (type.toLowerCase()) {
		case 'optimo':
		case 'optimal':
			return BUDGET_TYPES.OPTIMAL;
		case 'minimo':
		case 'minimal':
			return BUDGET_TYPES.MINIMAL;
		case 'estandar':
		case 'standard':
		default:
			return BUDGET_TYPES.STANDARD;
	}
}

export function formatBudgetStatus(accepted: boolean | null | undefined, sold: boolean | null | undefined) {
	if (sold) return BUDGET_STATUS.SOLD;
	if (accepted) return BUDGET_STATUS.ACCEPTED;
	return BUDGET_STATUS.PENDING;
}
