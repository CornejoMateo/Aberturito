'use client';

import { useState, useEffect } from 'react';
import { getClientsCount } from '@/lib/clients/clients';
import {
  getBudgetsCount,
  getSoldBudgetsCount,
  getChosenBudgetsCount,
  getSoldBudgetsTotalAmount,
  getChosenBudgetsTotalAmount,
  getClientsWithBudgetCount,
  getBudgetsByMonth,
  getBudgetsByAmountRange,
  getBudgetsByAmountRangeChosen,
  getBudgetsByAmountRangeSold,
  getBudgetsByAmountRangeLost,
  getBudgetsByLocation,
  getClientsByContactMethod,
  getBudgetsByMaterial,
  getSoldBudgetsByMaterial,
  getSoldBudgetsByMaterialByMonth,
  getLostBudgetsCount,
  getBudgetsTotalAmount,
  getLostBudgetsTotalAmount
} from '@/lib/budgets/budgets';
import { SalesMetrics, DEFAULT_METRICS } from '@/lib/budgets/types';
import { normalize } from '@/helpers/budget/normalize';

export const useBudgetMetrics = () => {
  const [metrics, setMetrics] = useState<SalesMetrics>(DEFAULT_METRICS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Obtain total clients
        const { data: clientsCount, error: clientsError } = await getClientsCount();
        if (!clientsError && clientsCount !== null) {
          setMetrics(prev => ({ ...prev, totalClients: clientsCount }));
        }

        // Obtain clients with budgets
        const { data: clientsWithBudget, error: clientsWithBudgetError } = await getClientsWithBudgetCount();
        if (!clientsWithBudgetError && clientsWithBudget !== null) {
          setMetrics(prev => ({ ...prev, clientsWithBudget }));
        }

        // Obtain total quantity budgets
        const { data: budgetsCount, error: budgetsError } = await getBudgetsCount();
        if (!budgetsError && budgetsCount !== null) {
          setMetrics(prev => ({ ...prev, totalBudgets: budgetsCount }));
        }

        // Obtain total quantity of sold budgets
        const { data: soldBudgetsCount, error: soldError } = await getSoldBudgetsCount();
        if (!soldError && soldBudgetsCount !== null) {
          setMetrics(prev => ({
            ...prev,
            totalSales: soldBudgetsCount,
            conversionRate: clientsCount > 0 ? Math.round((soldBudgetsCount / clientsCount) * 100) : 0
          }));
        }


        // Obtain total amount of sold budgets
        const { data: soldAmounts, error: soldAmountError } = await getSoldBudgetsTotalAmount();
        if (!soldAmountError && soldAmounts) {
          const soldCount = await getSoldBudgetsCount();
          if (!soldCount.error && soldCount.data > 0) {
            setMetrics(prev => ({
              ...prev,
              totalRevenue: soldAmounts.totalArs,
              soldAverageTicket: Math.round(soldAmounts.totalArs / soldCount.data)
            }));
          }
        }

        // Obtain total amount of lost budgets
        const { data: lostAmounts, error: lostAmountError } = await getLostBudgetsTotalAmount();
        if (!lostAmountError && lostAmounts) {
          const lostCount = await getLostBudgetsCount();
          if (!lostCount.error && lostCount.data > 0) {
            setMetrics(prev => ({
              ...prev,
              lostRevenue: lostAmounts.totalArs,
              lostAverageTicket: Math.round(lostAmounts.totalArs / lostCount.data)
            }));
          }
        }

        // Obtain total amount of chosen budgets
        const { data: chosenAmounts, error: chosenAmountError } = await getChosenBudgetsTotalAmount();
        if (!chosenAmountError && chosenAmounts) {
          const chosenCount = await getChosenBudgetsCount();
          if (!chosenCount.error && chosenCount.data > 0) {
            setMetrics(prev => ({
              ...prev,
              chosenRevenue: chosenAmounts.totalArs,
              chosenAverageTicket: Math.round(chosenAmounts.totalArs / chosenCount.data)
            }));
          }
        }

        // Obtain total revenue (sum of sold budgets)
        const { data: totalAmounts, error: amountError } = await getBudgetsTotalAmount();
        if (!amountError && totalAmounts) {

          // Obtain total average ticket
          if (budgetsCount > 0) {
            setMetrics(prev => ({
              ...prev,
              totalBudgetsRevenue: totalAmounts.totalArs,
              totalAverageTicket: Math.round(totalAmounts.totalArs / budgetsCount)
            }));
          }
        }

        // Obtain budgets by month
        const { data: budgetsByMonth, error: budgetsByMonthError } = await getBudgetsByMonth();
        if (!budgetsByMonthError && budgetsByMonth) {
          
          setMetrics(prev => ({
            ...prev,
            budgetsByMonth
          }));
        }

        // Obtain budgets by amount range
        const { data: budgetsByAmount, error: budgetsByAmountError } = await getBudgetsByAmountRange();
        if (!budgetsByAmountError && budgetsByAmount) {
          setMetrics(prev => ({
            ...prev,
            budgetsByAmount
          }));
        }

        // Obtain budgets by amount range for chosen
        const { data: budgetsByAmountChosen, error: budgetsByAmountChosenError } = await getBudgetsByAmountRangeChosen();
        if (!budgetsByAmountChosenError && budgetsByAmountChosen) {
          setMetrics(prev => ({
            ...prev,
            budgetsByAmountChosen
          }));
        }

        // Obtain budgets by amount range for sold
        const { data: budgetsByAmountSold, error: budgetsByAmountSoldError } = await getBudgetsByAmountRangeSold();
        if (!budgetsByAmountSoldError && budgetsByAmountSold) {
          setMetrics(prev => ({
            ...prev,
            budgetsByAmountSold
          }));
        }

        // Obtain budgets by amount range for lost
        const { data: budgetsByAmountLost, error: budgetsByAmountLostError } = await getBudgetsByAmountRangeLost();
        if (!budgetsByAmountLostError && budgetsByAmountLost) {
          setMetrics(prev => ({
            ...prev,
            budgetsByAmountLost
          }));
        }

        // Obtain budgets by location
        const { data: budgetsByLocation, error: budgetsByLocationError } = await getBudgetsByLocation();
        if (!budgetsByLocationError && budgetsByLocation) {

          const grouped = Object.values(
            budgetsByLocation.reduce((acc, item) => {
              const key = normalize(item.location);

              if (!acc[key]) {
                acc[key] = {
                  location: item.location.trim(),
                  count: 0,
                };
              }

              acc[key].count += item.count;

              return acc;
            }, {} as Record<string, { location: string; count: number }>)
          );

          setMetrics(prev => ({
            ...prev,
            budgetsByLocation: grouped
          }));
        }

        // Obtain clients by contact method
        const { data: clientsByContactMethod, error: clientsByContactMethodError } = await getClientsByContactMethod();
        if (!clientsByContactMethodError && clientsByContactMethod) {
          setMetrics(prev => ({
            ...prev,
            clientsByContactMethod
          }));
        }

        // Obtain budgets by material
        const { data: budgetsByMaterial, error: budgetsByMaterialError } = await getBudgetsByMaterial();
        if (!budgetsByMaterialError && budgetsByMaterial) {
          setMetrics(prev => ({
            ...prev,
            budgetsByMaterial
          }));
        }

        // Obtain sold budgets by material
        const { data: soldBudgetsByMaterial, error: soldBudgetsByMaterialError } = await getSoldBudgetsByMaterial();
        if (!soldBudgetsByMaterialError && soldBudgetsByMaterial) {
          setMetrics(prev => ({
            ...prev,
            soldBudgetsByMaterial
          }));
        }

        // Obtain sold budgets by month split by material (PVC and Aluminio)
        const { data: soldBudgetsByMaterialByMonth, error: soldBudgetsByMaterialByMonthError } = await getSoldBudgetsByMaterialByMonth();
        if (!soldBudgetsByMaterialByMonthError && soldBudgetsByMaterialByMonth) {
          setMetrics(prev => ({
            ...prev,
            soldBudgetsByMaterialByMonth
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
