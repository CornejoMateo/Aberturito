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
        data: metrics.budgetsByMaterial && metrics.budgetsByMaterial.length > 0 ? 
          metrics.budgetsByMaterial.map((item: any, index: number) => ({
            name: item.material,
            value: Math.round((item.count / (metrics.totalBudgets || 1)) * 100),
            color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'][index % 7]
          })) : []
      },
      {
        title: 'Distribución de presupuestos vendidos por material',
        data: metrics.soldBudgetsByMaterial && metrics.soldBudgetsByMaterial.length > 0 ? 
          metrics.soldBudgetsByMaterial.map((item: any, index: number) => ({
            name: item.material,
            value: Math.round((item.count / (metrics.totalSales || 1)) * 100),
            color: ['#06b6d4', '#ec4899', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][index % 7]
          })) : []
      }
    ]
  }
];
