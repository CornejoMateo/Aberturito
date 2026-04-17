import { renderHook, waitFor } from '@testing-library/react';
import { useBudgetMetrics } from '@/hooks/budgets/use-budget-metrics';

jest.mock('@/lib/clients/clients', () => ({
  getClientsCount: jest.fn(),
}));

jest.mock('@/lib/budgets/budgets', () => ({
  getBudgetsCount: jest.fn(),
  getBudgetsTotalAmount: jest.fn(),
  getSoldBudgetsCount: jest.fn(),
  getChosenBudgetsCount: jest.fn(),
  getLostBudgetsCount: jest.fn(),
  getSoldBudgetsTotalAmount: jest.fn(),
  getChosenBudgetsTotalAmount: jest.fn(),
  getLostBudgetsTotalAmount: jest.fn(),
  getClientsWithBudgetCount: jest.fn(),
  getBudgetsByMonth: jest.fn(),
  getBudgetsByLocation: jest.fn(),
  getClientsByContactMethod: jest.fn(),
  getBudgetsByMaterial: jest.fn(),
  getSoldBudgetsByMaterial: jest.fn(),
}));

const clientsLib = require('@/lib/clients/clients');
const budgetsLib = require('@/lib/budgets/budgets');

describe('useBudgetMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    clientsLib.getClientsCount.mockResolvedValue({ data: 20, error: null });
    budgetsLib.getBudgetsCount.mockResolvedValue({ data: 10, error: null });
    budgetsLib.getSoldBudgetsCount.mockResolvedValue({ data: 4, error: null });
    budgetsLib.getChosenBudgetsCount.mockResolvedValue({ data: 3, error: null });
    budgetsLib.getLostBudgetsCount.mockResolvedValue({ data: 0, error: null });
    budgetsLib.getSoldBudgetsTotalAmount.mockResolvedValue({ data: { totalArs: 40000, totalUsd: 0 }, error: null });
    budgetsLib.getChosenBudgetsTotalAmount.mockResolvedValue({ data: { totalArs: 30000, totalUsd: 0 }, error: null });
    budgetsLib.getLostBudgetsTotalAmount.mockResolvedValue({ data: { totalArs: 0, totalUsd: 0 }, error: null });
    budgetsLib.getBudgetsTotalAmount.mockResolvedValue({ data: { totalArs: 100000, totalUsd: 0 }, error: null });
    budgetsLib.getClientsWithBudgetCount.mockResolvedValue({ data: 12, error: null });
    budgetsLib.getBudgetsByMonth.mockResolvedValue({ data: [{ month: 'Ene', presupuestos: 2, vendidos: 1 }], error: null });
    budgetsLib.getBudgetsByLocation.mockResolvedValue({ data: [{ location: 'Cordoba', count: 5 }], error: null });
    budgetsLib.getClientsByContactMethod.mockResolvedValue({ data: [{ method: 'whatsapp', count: 7 }], error: null });
    budgetsLib.getBudgetsByMaterial.mockResolvedValue({ data: [{ material: 'Aluminio', count: 6 }], error: null });
    budgetsLib.getSoldBudgetsByMaterial.mockResolvedValue({ data: [{ material: 'PVC', count: 3 }], error: null });
  });

  it('loads and maps all metrics data', async () => {
    const { result } = renderHook(() => useBudgetMetrics());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.metrics.totalClients).toBe(20);
    expect(result.current.metrics.totalBudgets).toBe(10);
    expect(result.current.metrics.totalSales).toBe(4);
    expect(result.current.metrics.conversionRate).toBe(40);
    expect(result.current.metrics.totalRevenue).toBe(40000);
    expect(result.current.metrics.chosenRevenue).toBe(30000);
    expect(result.current.metrics.lostRevenue).toBe(0);
    expect(result.current.metrics.totalBudgetsRevenue).toBe(100000);
    expect(result.current.metrics.soldAverageTicket).toBe(10000);
    expect(result.current.metrics.chosenAverageTicket).toBe(10000);
    expect(result.current.metrics.totalAverageTicket).toBe(10000);
    expect(result.current.metrics.budgetsByMaterial[0].material).toBe('Aluminio');
    expect(result.current.metrics.soldBudgetsByMaterial[0].material).toBe('PVC');
  });

  it('handles service errors by ending loading state', async () => {
    clientsLib.getClientsCount.mockRejectedValueOnce(new Error('network error'));

    const { result } = renderHook(() => useBudgetMetrics());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.metrics.totalClients).toBe(0);
  });
});
