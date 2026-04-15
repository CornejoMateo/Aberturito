// Budget status constants
export const BUDGET_STATUS = {
	// Main status options
	IN_PROGRESS: 'in_progress',
	SOLD: 'sold',
	LOST: 'lost',
	
	// Legacy status flags for compatibility
	ACCEPTED: 'accepted',
	
	// Default status
	DEFAULT: 'in_progress',
	
	// Status combinations for filtering
	LOCKED_STATUSES: ['sold', 'accepted', 'lost'], // Budgets that shouldn't be updated
	UPDATABLE_STATUSES: ['in_progress'], // Only budgets with these flags can be updated
} as const;

// Helper functions for budget filtering
export const isBudgetLocked = (budget: { sold?: boolean | null; accepted?: boolean | null; lost?: boolean | null }): boolean => {
	return Boolean(budget.sold || budget.accepted || budget.lost);
};

export const canUpdateBudget = (budget: { sold?: boolean | null; accepted?: boolean | null; lost?: boolean | null }): boolean => {
	return !isBudgetLocked(budget);
};

// Status labels for UI
export const BUDGET_STATUS_LABELS = {
	in_progress: 'En proceso',
	sold: 'Vendido',
	lost: 'Perdido',
	accepted: 'Elegido',
} as const;

// Status colors for UI (badges, selectors, and card bars)
export const BUDGET_STATUS_COLORS = {
	in_progress: 'bg-yellow-500 text-yellow-100 border-yellow-600',
	sold: 'bg-green-500 text-green-100 border-green-600',
	lost: 'bg-red-500 text-red-100 border-red-600',
	accepted: 'bg-blue-500 text-blue-100 border-blue-600',
} as const;

// All available status options for dropdown
export const BUDGET_STATUS_OPTIONS = [
	{ value: BUDGET_STATUS.IN_PROGRESS, label: BUDGET_STATUS_LABELS.in_progress },
	{ value: BUDGET_STATUS.SOLD, label: BUDGET_STATUS_LABELS.sold },
	{ value: BUDGET_STATUS.LOST, label: BUDGET_STATUS_LABELS.lost },
] as const;

// Helper function to get current budget status (excluding 'accepted' which is independent)
export const getBudgetStatus = (budget: { sold?: boolean | null; accepted?: boolean | null; lost?: boolean | null }): string => {
	if (budget.sold) return BUDGET_STATUS.SOLD;
	if (budget.lost) return BUDGET_STATUS.LOST;
	return BUDGET_STATUS.IN_PROGRESS;
};

// Helper function to check if budget is chosen/accepted (independent status)
export const isBudgetChosen = (budget: { accepted?: boolean | null }): boolean => {
	return Boolean(budget.accepted);
};
