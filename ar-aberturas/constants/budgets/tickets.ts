export type TicketTypeId = 'sold' | 'chosen' | 'total';

export interface TicketType {
	readonly id: TicketTypeId;
	readonly label: string;
	readonly description: string;
}

export const TICKET_TYPES = [
	{ id: 'sold', label: 'Vendidos', description: 'Presupuestos vendidos' },
	{ id: 'chosen', label: 'Pendientes', description: 'Presupuestos pendientes' },
	{ id: 'total', label: 'General', description: 'Todos los presupuestos' }
] as const;

export const DEFAULT_TICKET_TYPE: TicketTypeId = 'sold';
