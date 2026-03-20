// Budget status constants
export const BUDGET_STATUS = {
	// Status flags
	SOLD: 'sold',
	ACCEPTED: 'accepted',
	
	// Status combinations for filtering
	LOCKED_STATUSES: ['sold', 'accepted'], // Budgets that shouldn't be updated
	UPDATABLE_STATUSES: [], // Only budgets without these flags can be updated
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
	sold: 'Vendido',
	accepted: 'Elegido',
} as const;

// Status colors for UI
export const BUDGET_STATUS_COLORS = {
	sold: 'bg-green-100 text-green-800 border-green-300',
	accepted: 'bg-blue-100 text-blue-800 border-blue-300',
} as const;
