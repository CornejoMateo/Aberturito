import { getPercentages } from "@/helpers/reports/percentajes";

export const calculatePercentage = (value: number, total: number): number => {
  return total > 0 ? Math.round((value / total) * 100) : 0;
};

export const calculateChartPercentages = (metrics: any) => {
  const soldPercentage = calculatePercentage(metrics.totalSales, metrics.totalBudgets);
  const lostPercentage = calculatePercentage(metrics.totalLost, metrics.totalBudgets);
  const chosenPercentage = 100 - soldPercentage - lostPercentage;
  const clientsWithBudgetPercentage = calculatePercentage(metrics.clientsWithBudget, metrics.totalClients);
  const clientsWithoutBudgetPercentage = 100 - clientsWithBudgetPercentage;

  return {
    soldPercentage,
    chosenPercentage,
    lostPercentage,
    clientsWithBudgetPercentage,
    clientsWithoutBudgetPercentage,
  };
};

export const formatChartValue = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return `${value}`;
};

export const formatCurrency = (value: number): string => {
  if (value > 0) return `$${(value / 1000).toFixed(0)}k`;
  return '--';
};

export const buildChartPages = (metrics: any) => [
  {
    charts: [
      {
        title: 'Distribución de presupuestos',
        data: metrics.totalBudgets > 0 ? [
          { name: 'Vendidos', value: metrics.totalSales, color: '#10b981' },
          { name: 'En proceso', value: metrics.totalBudgets - (metrics.totalSales + metrics.totalLost), color: '#3b82f6' },
          { name: 'Perdidos', value: metrics.totalLost, color: '#a82222' },
        ] : []
      },
      {
        title: 'Total de presupuestos',
        data: [
          { name: 'Totales', value: metrics.totalBudgets, color: '#8b5cf6' },
          { name: 'Vendidos', value: metrics.totalSales, color: '#f59e0b' },
        ]
      }
    ]
  },
  {
    charts: [
      {
        title: 'Distribución de presupuestos por material',
        showPercentage: true,
        data: metrics.budgetsByMaterial && metrics.budgetsByMaterial.length > 0
          ? getPercentages(metrics.budgetsByMaterial, metrics.totalBudgets)
              .map((item: any, index:number) => ({
                name: item.material,
                value: item.percent,
                color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'][index % 7],
              }))
          : []
      },
      {
        title: 'Distribución de presupuestos vendidos por material',
        showPercentage: true,
        data: metrics.soldBudgetsByMaterial && metrics.soldBudgetsByMaterial.length > 0
          ? getPercentages(metrics.soldBudgetsByMaterial, metrics.totalSales)
              .map((item: any, index: number) => ({
                name: item.material,
                value: item.percent,
                color: ['#06b6d4', '#ec4899', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][index % 7],
              }))
          : []
      }
    ]
  }
];

