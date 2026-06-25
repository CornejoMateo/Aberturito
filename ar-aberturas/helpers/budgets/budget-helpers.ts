import { BudgetWithWork } from '@/lib/works/balances';

export function getBudgetLabel(budget: BudgetWithWork): string {
	const parts: string[] = [];
	if (budget.number) parts.push(`#${budget.number}`);
	if (budget.type) parts.push(budget.type);
	return parts.length ? parts.join(' · ') : 'Presupuesto vendido';
}

export function getBudgetAddress(budget: BudgetWithWork): string | null {
	const work = budget.folder_budget?.work;
	if (!work) return null;
	const parts = [work.address, work.locality].filter(Boolean);
	return parts.join(', ') || null;
}
