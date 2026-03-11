'use client';

import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { ChartsCarousel } from '../charts-carousel';
import { ConversionRateCard } from '../conversion-rate-card';
import { AverageTicketCard } from '../average-ticket-card';
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
  onPrevChart: () => void;
  onNextChart: () => void;
  onSelectChart: (index: number) => void;
  onPrevTicket: () => void;
  onNextTicket: () => void;
  onSelectTicket: (type: TicketTypeId) => void;
  formatChartValue: (value: number) => string;
  getCurrentTicketValue: () => number;
  getCurrentTicketLabel: () => string;
}

export function OverviewTab({
  metrics,
  loading,
  chartPages,
  chartPage,
  ticketType,
  ticketTypes,
  onPrevChart,
  onNextChart,
  onSelectChart,
  onPrevTicket,
  onNextTicket,
  onSelectTicket,
  formatChartValue,
  getCurrentTicketValue,
  getCurrentTicketLabel,
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
            'Pendientes': percentages.chosenPercentage,
            'Con presupuesto': percentages.clientsWithBudgetPercentage,
            'Sin presupuesto': percentages.clientsWithoutBudgetPercentage,
          }}
        />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <ConversionRateCard
          conversionRate={metrics.conversionRate}
          totalBudgets={metrics.totalBudgets}
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
      </div>
    </TabsContent>
  );
}
