import { checklistTypes } from '@/lib/works/checklists.constants';

export const DEFAULT_TYPES = [...Object.values(checklistTypes), 'Otros'];

export const BUDGET_VARIANTS = [
	'Mínimo',
	'Estándar',
	'Óptimo',
] as const;

export type BudgetVariant = typeof BUDGET_VARIANTS[number];

export const FORM_DEFAULTS = {
	type: 'PVC',
	version: '',
	number: '',
	amount: '',
	amountUsd: '',
	workId: 'none',
} as const;

export const TOAST_MESSAGES = {
	budgetCreated: 'Presupuesto creado',
	budgetUpdated: 'Presupuesto actualizado',
	budgetDeleted: 'Presupuesto eliminado',
	folderDeleted: 'Carpeta eliminada',
	budgetChosen: 'Presupuesto elegido',
	budgetUnchosen: 'Presupuesto deseleccionado',
	soldMarked: 'Presupuesto marcado como vendido',
	soldUnmarked: 'Presupuesto marcado como no vendido',
	pricesUpdated: 'Presupuestos actualizados',
} as const;
