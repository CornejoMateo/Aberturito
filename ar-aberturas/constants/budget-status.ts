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
	LOCKED_STATUSES: ['sold', 'accepted'], // Budgets that shouldn't be updated
	UPDATABLE_STATUSES: ['in_progress', 'lost'], // Only budgets with these flags can be updated
} as const;

// Helper functions for budget filtering
export const isBudgetLocked = (budget: { sold?: boolean | null; accepted?: boolean | null }): boolean => {
	return Boolean(budget.sold || budget.accepted);
};

export const canUpdateBudget = (budget: { sold?: boolean | null; accepted?: boolean | null }): boolean => {
	return !isBudgetLocked(budget);
};

// Status labels for UI
export const BUDGET_STATUS_LABELS = {
	in_progress: 'En proceso',
	sold: 'Vendida',
	lost: 'Perdida',
	accepted: 'Elegido',
} as const;

// Status colors for UI
export const BUDGET_STATUS_COLORS = {
	in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-300',
	sold: 'bg-green-100 text-green-800 border-green-300',
	lost: 'bg-red-100 text-red-800 border-red-300',
	accepted: 'bg-blue-100 text-blue-800 border-blue-300',
} as const;

// All available status options for dropdown
export const BUDGET_STATUS_OPTIONS = [
	{ value: BUDGET_STATUS.IN_PROGRESS, label: BUDGET_STATUS_LABELS.in_progress },
	{ value: BUDGET_STATUS.SOLD, label: BUDGET_STATUS_LABELS.sold },
	{ value: BUDGET_STATUS.LOST, label: BUDGET_STATUS_LABELS.lost },
] as const;

// Helper function to get current budget status
export const getBudgetStatus = (budget: { sold?: boolean | null; accepted?: boolean | null; lost?: boolean | null }): string => {
	if (budget.sold) return BUDGET_STATUS.SOLD;
	if (budget.accepted) return BUDGET_STATUS.ACCEPTED;
	if (budget.lost) return BUDGET_STATUS.LOST;
	return BUDGET_STATUS.IN_PROGRESS;
};
