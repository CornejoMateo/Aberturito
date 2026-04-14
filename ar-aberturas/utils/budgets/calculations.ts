import { getPercentages } from "@/helpers/reports/percentajes";

export const calculatePercentage = (value: number, total: number): number => {
  return total > 0 ? Math.round((value / total) * 100) : 0;
};

export const calculateChartPercentages = (metrics: any) => {
  const soldPercentage = calculatePercentage(metrics.totalSales, metrics.totalBudgets);
  const chosenPercentage = 100 - soldPercentage;
  const clientsWithBudgetPercentage = calculatePercentage(metrics.clientsWithBudget, metrics.totalClients);
  const clientsWithoutBudgetPercentage = 100 - clientsWithBudgetPercentage;

  return {
    soldPercentage,
    chosenPercentage,
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
          { name: 'Pendientes', value: metrics.totalBudgets - metrics.totalSales, color: '#3b82f6' },
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
          ? getPercentages(
              metrics.budgetsByMaterial.map((item: any, index: number) => ({
                material: item.material,
                count: item.count,
                originalIndex: index,
              })),
              metrics.totalBudgets,
            )
              .sort((a: any, b: any) => a.originalIndex - b.originalIndex)
              .map((item: any) => ({
                name: item.material,
                value: item.percent,
                color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'][item.originalIndex % 7],
              }))
          : []
      },
      {
        title: 'Distribución de presupuestos vendidos por material',
        showPercentage: true,
        data: metrics.soldBudgetsByMaterial && metrics.soldBudgetsByMaterial.length > 0
          ? getPercentages(
              metrics.soldBudgetsByMaterial.map((item: any, index: number) => ({
                material: item.material,
                count: item.count,
                originalIndex: index,
              })),
              metrics.totalSales,
            )
              .sort((a: any, b: any) => a.originalIndex - b.originalIndex)
              .map((item: any) => ({
                name: item.material,
                value: item.percent,
                color: ['#06b6d4', '#ec4899', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][item.originalIndex % 7],
              }))
          : []
      }
    ]
  }
];

