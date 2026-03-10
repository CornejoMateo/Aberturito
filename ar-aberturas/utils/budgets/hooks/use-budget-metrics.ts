'use client';

import { useState, useEffect } from 'react';
import { getClientsCount } from '@/lib/clients/clients';
import {
  getBudgetsCount,
  getBudgetsTotalAmount,
  getSoldBudgetsCount,
  getChosenBudgetsCount,
  getSoldBudgetsTotalAmount,
  getChosenBudgetsTotalAmount,
  getClientsWithBudgetCount,
  getBudgetsByMonth
} from '@/lib/budgets/budgets';
import { SalesMetrics, DEFAULT_METRICS } from '../types';

export const useBudgetMetrics = () => {
  const [metrics, setMetrics] = useState<SalesMetrics>(DEFAULT_METRICS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Obtener clientes
        const { data: clientsCount, error: clientsError } = await getClientsCount();
        if (!clientsError && clientsCount !== null) {
          setMetrics(prev => ({ ...prev, totalClients: clientsCount }));
        }

        // Obtener clientes con presupuesto
        const { data: clientsWithBudget, error: clientsWithBudgetError } = await getClientsWithBudgetCount();
        if (!clientsWithBudgetError && clientsWithBudget !== null) {
          setMetrics(prev => ({ ...prev, clientsWithBudget }));
        }

        // Obtener presupuestos totales
        const { data: budgetsCount, error: budgetsError } = await getBudgetsCount();
        if (!budgetsError && budgetsCount !== null) {
          setMetrics(prev => ({ ...prev, totalBudgets: budgetsCount }));
        }

        // Obtener presupuestos vendidos
        const { data: soldBudgetsCount, error: soldError } = await getSoldBudgetsCount();
        if (!soldError && soldBudgetsCount !== null) {
          setMetrics(prev => ({
            ...prev,
            totalSales: soldBudgetsCount,
            conversionRate: budgetsCount > 0 ? Math.round((soldBudgetsCount / budgetsCount) * 100) : 0
          }));
        }

        // Obtener monto total de presupuestos vendidos
        const { data: soldAmounts, error: soldAmountError } = await getSoldBudgetsTotalAmount();
        if (!soldAmountError && soldAmounts) {
          const soldCount = await getSoldBudgetsCount();
          if (!soldCount.error && soldCount.data > 0) {
            setMetrics(prev => ({
              ...prev,
              soldAverageTicket: Math.round(soldAmounts.totalArs / soldCount.data)
            }));
          }
        }

        // Obtener monto total de presupuestos elegidos
        const { data: chosenAmounts, error: chosenAmountError } = await getChosenBudgetsTotalAmount();
        if (!chosenAmountError && chosenAmounts) {
          const chosenCount = await getChosenBudgetsCount();
          if (!chosenCount.error && chosenCount.data > 0) {
            setMetrics(prev => ({
              ...prev,
              chosenAverageTicket: Math.round(chosenAmounts.totalArs / chosenCount.data)
            }));
          }
        }

        // Obtener monto total de presupuestos generales
        const { data: totalAmounts, error: amountError } = await getBudgetsTotalAmount();
        if (!amountError && totalAmounts) {
          setMetrics(prev => ({
            ...prev,
            totalRevenue: totalAmounts.totalArs
          }));

          // Obtener ticket promedio general
          if (budgetsCount > 0) {
            setMetrics(prev => ({
              ...prev,
              totalAverageTicket: Math.round(totalAmounts.totalArs / budgetsCount)
            }));
          }
        }

        // Obtener presupuestos por mes
        const { data: budgetsByMonth, error: budgetsByMonthError } = await getBudgetsByMonth();
        if (!budgetsByMonthError && budgetsByMonth) {
          setMetrics(prev => ({
            ...prev,
            budgetsByMonth
          }));
        }
      } catch (err) {
        console.error('Error fetching metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return { metrics, loading };
};
