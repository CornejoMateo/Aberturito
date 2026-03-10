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
        title: 'Distribución de Presupuestos',
        data: metrics.totalBudgets > 0 ? [
          { name: 'Vendidos', value: metrics.totalSales, color: '#10b981' },
          { name: 'Pendientes', value: metrics.totalBudgets - metrics.totalSales, color: '#3b82f6' },
        ] : []
      },
      {
        title: 'Total de Presupuestos',
        data: [
          { name: 'Totales', value: metrics.totalBudgets, color: '#8b5cf6' },
          { name: 'Procesados', value: metrics.totalSales, color: '#f59e0b' },
        ]
      }
    ]
  },
  {
    charts: [
      {
        title: 'Clientes con Presupuesto',
        data: metrics.totalClients > 0 ? [
          { name: 'Con Presupuesto', value: metrics.clientsWithBudget, color: '#10b981' },
          { name: 'Sin Presupuesto', value: metrics.totalClients - metrics.clientsWithBudget, color: '#3b82f6' },
        ] : []
      },
      {
        title: 'Ingresos por Tipo',
        data: [
          { name: 'De Ventas', value: metrics.soldAverageTicket > 0 ? Math.round(metrics.totalSales * metrics.soldAverageTicket) : 0, color: '#06b6d4' },
          { name: 'Total', value: metrics.totalRevenue, color: '#ec4899' },
        ].filter(item => item.value > 0)
      }
    ]
  }
];
