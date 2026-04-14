export const BUDGETS_REPORT_TITLE = 'Presupuestos';

export const BUDGETS_REPORT_COLUMNS = {
	date: 'FECHA',
	client: 'CLIENTE',
	number: 'NÚMERO',
	type: 'TIPO',
	work: 'OBRA',
	amountArs: 'MONTO ARS',
	amountUsd: 'MONTO USD',
	status: 'ESTADO',
} as const;

export const BUDGET_TYPES = {
	STANDARD: 'Estándar',
	OPTIMAL: 'Óptimo',
	MINIMAL: 'Mínimo',
} as const;

export const BUDGET_STATUS = {
	PENDING: 'Pendiente',
	ACCEPTED: 'Aceptado',
	SOLD: 'Vendido',
} as const;
