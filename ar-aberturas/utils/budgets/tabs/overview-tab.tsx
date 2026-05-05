'use client';

import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { ChartsCarousel } from '../charts-carousel';
import { ConversionRateCard } from '../conversion-rate-card';
import { AverageTicketCard } from '../average-ticket-card';
import { SumTicketCard } from '@/utils/budgets/sum-ticket-card';
import { SalesMetrics } from '../../../lib/budgets/types';
import { calculateChartPercentages } from '../calculations';
import { TicketType, TicketTypeId } from '@/constants/budgets/tickets';

interface OverviewTabProps {
  metrics: SalesMetrics;
  loading: boolean;
  chartPages: any[];
  chartPage: number;
  ticketType: TicketTypeId;
  ticketTypes: readonly TicketType[];
  sumTicketType: TicketTypeId;
  onPrevChart: () => void;
  onNextChart: () => void;
  onSelectChart: (index: number) => void;
  onPrevTicket: () => void;
  onNextTicket: () => void;
  onSelectTicket: (type: TicketTypeId) => void;
  onPrevSumTicket: () => void;
  onNextSumTicket: () => void;
  onSelectSumTicket: (type: TicketTypeId) => void;
  formatChartValue: (value: number) => string;
  getCurrentTicketValue: () => number;
  getCurrentTicketLabel: () => string;
  getCurrentSumTicketValue: () => number;
  getCurrentSumTicketLabel: () => string;
}

export function OverviewTab({
  metrics,
  loading,
  chartPages,
  chartPage,
  ticketType,
  ticketTypes,
  sumTicketType,
  onPrevChart,
  onNextChart,
  onSelectChart,
  onPrevTicket,
  onNextTicket,
  onSelectTicket,
  onPrevSumTicket,
  onNextSumTicket,
  onSelectSumTicket,
  formatChartValue,
  getCurrentTicketValue,
  getCurrentTicketLabel,
  getCurrentSumTicketValue,
  getCurrentSumTicketLabel,
}: OverviewTabProps) {
  const percentages = calculateChartPercentages(metrics);
  const currentPage = chartPages[chartPage % chartPages.length];

  return (
    <TabsContent value="overview" className="space-y-4">
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold text-foreground mb-6">Resumen de ventas</h3>
        <ChartsCarousel
          chartPages={chartPages}
          currentPage={currentPage}
          currentPageIndex={chartPage}
          onPrevChart={onPrevChart}
          onNextChart={onNextChart}
          onSelectChart={onSelectChart}
          formatChartValue={formatChartValue}
          percentageLabels={{
            'Vendidos': percentages.soldPercentage,
            'En proceso': percentages.chosenPercentage,
            'Perdidos': percentages.lostPercentage,
            'Con presupuesto': percentages.clientsWithBudgetPercentage,
            'Sin presupuesto': percentages.clientsWithoutBudgetPercentage,
            'De ventas': percentages.soldPercentage > 0 ? Math.round((metrics.totalSales * metrics.soldAverageTicket) / metrics.totalRevenue * 100) : 0,
            'Totales': 100 - percentages.soldPercentage,
          }}
        />
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ConversionRateCard
          conversionRate={metrics.conversionRate}
          totalClients={metrics.totalClients}
          totalSales={metrics.totalSales}
        />

        <AverageTicketCard
          loading={loading}
          ticketValue={getCurrentTicketValue()}
          ticketLabel={getCurrentTicketLabel()}
          ticketType={ticketType}
          ticketTypes={ticketTypes}
          onPrevTicket={onPrevTicket}
          onNextTicket={onNextTicket}
          onSelectTicket={onSelectTicket}
        />

        <SumTicketCard
          loading={loading}
          ticketValue={getCurrentSumTicketValue()}
          ticketLabel={getCurrentSumTicketLabel()}
          ticketType={sumTicketType}
          ticketTypes={ticketTypes}
          onPrevTicket={onPrevSumTicket}
          onNextTicket={onNextSumTicket}
          onSelectTicket={onSelectSumTicket}
        />

      </div>
    </TabsContent>
  );
}
