'use client';

import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { ChartsCarousel } from '../charts-carousel';
import { ConversionRateCard } from '../conversion-rate-card';
import { AverageTicketCard } from '../average-ticket-card';
import { SalesMetrics } from '../types';
import { calculateChartPercentages } from '../calculations';

interface TicketType {
  readonly id: 'sold' | 'chosen' | 'total';
  readonly label: string;
  readonly description: string;
}

interface OverviewTabProps {
  metrics: SalesMetrics;
  loading: boolean;
  chartPages: any[];
  chartPage: number;
  ticketType: 'sold' | 'chosen' | 'total';
  ticketTypes: readonly TicketType[];
  onPrevChart: () => void;
  onNextChart: () => void;
  onSelectChart: (index: number) => void;
  onPrevTicket: () => void;
  onNextTicket: () => void;
  onSelectTicket: (type: 'sold' | 'chosen' | 'total') => void;
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
        <h3 className="text-lg font-semibold text-foreground mb-6">Resumen de Ventas</h3>
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
            'Con Presupuesto': percentages.clientsWithBudgetPercentage,
            'Sin Presupuesto': percentages.clientsWithoutBudgetPercentage,
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
