import {
  calculatePercentage,
  calculateChartPercentages,
  formatChartValue,
  formatCurrency,
  buildChartPages,
} from '@/utils/budgets/calculations';

const metrics = {
  totalSales: 4,
  totalLost: 1,
  totalBudgets: 10,
  clientsWithBudget: 8,
  totalClients: 20,
};

describe('budget calculations', () => {
  it('calculates percentage with a valid total', () => {
    expect(calculatePercentage(25, 100)).toBe(25);
  });

  it('returns 0 percentage when total is 0', () => {
    expect(calculatePercentage(25, 0)).toBe(0);
  });

  it('builds chart percentages from metrics', () => {
    expect(calculateChartPercentages(metrics)).toEqual({
      soldPercentage: 40,
      chosenPercentage: 50,
      lostPercentage: 10,
      clientsWithBudgetPercentage: 40,
      clientsWithoutBudgetPercentage: 60,
    });
  });

  it('formats chart value with k and M suffixes', () => {
    expect(formatChartValue(950)).toBe('950');
    expect(formatChartValue(1500)).toBe('1.5k');
    expect(formatChartValue(2500000)).toBe('2.5M');
  });

  it('formats currency values', () => {
    expect(formatCurrency(0)).toBe('--');
    expect(formatCurrency(15000)).toBe('$15k');
  });

  it('builds chart pages using provided metrics', () => {
    const metrics = {
      totalBudgets: 10,
      totalSales: 4,
      totalLost: 2,
      totalClients: 20,
      clientsWithBudget: 8,
      soldAverageTicket: 1000,
      totalRevenue: 20000,
      budgetsByMaterial: [
        { material: 'PVC', count: 6 },
        { material: 'Aluminio', count: 4 },
      ],
      soldBudgetsByMaterial: [
        { material: 'PVC', count: 3 },
        { material: 'Aluminio', count: 1 },
      ],
    };

    const pages = buildChartPages(metrics);

    expect(pages).toHaveLength(2);
    expect(pages[0].charts[0].title).toBe('Distribución de presupuestos');
    expect(pages[0].charts[0].data[0]).toEqual({ name: 'Vendidos', value: 4, color: '#10b981' });
    expect(pages[0].charts[0].data[1]).toEqual({ name: 'En proceso', value: 4, color: '#3b82f6' });
    expect(pages[0].charts[0].data[2]).toEqual({ name: 'Perdidos', value: 2, color: '#a82222' });
    expect(pages[1].charts[0].title).toBe('Distribución de presupuestos por material');
    expect(pages[1].charts[1].title).toBe('Distribución de presupuestos vendidos por material');
    expect(pages[1].charts[0].data).toHaveLength(2);
    expect(pages[1].charts[1].data).toHaveLength(2);
  });
});
