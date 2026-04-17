// metrics
export interface SalesMetrics {
	totalClients: number;
	totalBudgets: number;
	totalSales: number;
	totalRevenue: number; // Total amount of sold budgets in ARS
	chosenRevenue: number; // Total amount of chosen budgets in ARS
	lostRevenue: number; // Total amount of lost budgets in ARS
	totalBudgetsRevenue: number; // Total amount of all budgets in ARS
	conversionRate: number; // Percentage of budgets that were sold
	averageTicket: number; // Average amount of all budgets
	soldAverageTicket: number; // Average amount of sold budgets
	chosenAverageTicket: number; // Average amount of chosen budgets (accepted)
	totalAverageTicket: number; // Average amount of all budgets
	lostAverageTicket: number; // Average amount of lost budgets
	clientsWithBudget: number; 
	budgetsByMonth: Array<{ month: string; presupuestos: number; vendidos: number }>;
	budgetsByLocation: Array<{ location: string; count: number }>;
	clientsByContactMethod: Array<{ method: string; count: number }>;
	budgetsByMaterial: Array<{ material: string; count: number }>;
 	soldBudgetsByMaterial: Array<{ material: string; count: number }>;
}

export interface MonthlyData {
  month: string;
	clients: number;
	budgets: number;
	sales: number;
	revenue: number;
}

export interface LocationData {
	location: string;
	clients: number;
	percentage: number;
}

export interface ConversionData {
	category: string;
	value: number;
	total: number;
	percentage: number;
}

export const DEFAULT_METRICS: SalesMetrics = {
	totalClients: 0,
	totalBudgets: 0,
	totalSales: 0,
	totalRevenue: 0,
	chosenRevenue: 0,
	lostRevenue: 0,
	totalBudgetsRevenue: 0,
	conversionRate: 0,
	averageTicket: 0,
	soldAverageTicket: 0,
	chosenAverageTicket: 0,
	totalAverageTicket: 0,
	lostAverageTicket: 0,
	clientsWithBudget: 0,
	budgetsByMonth: [],
	budgetsByLocation: [],
	clientsByContactMethod: [],
	budgetsByMaterial: [],
	soldBudgetsByMaterial: [],
};
