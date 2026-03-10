export interface SalesMetrics {
  totalClients: number;
  totalBudgets: number;
  totalSales: number;
  totalRevenue: number;
  conversionRate: number;
  averageTicket: number;
  soldAverageTicket: number;
  chosenAverageTicket: number;
  totalAverageTicket: number;
  clientsWithBudget: number;
  budgetsByMonth: Array<{ month: string; presupuestos: number; vendidos: number }>;
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
  conversionRate: 0,
  averageTicket: 0,
  soldAverageTicket: 0,
  chosenAverageTicket: 0,
  totalAverageTicket: 0,
  clientsWithBudget: 0,
  budgetsByMonth: [],
};
