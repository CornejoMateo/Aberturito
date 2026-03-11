'use client';

import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { PerformanceChartsCarousel } from '../performance-charts-carousel';
import { SalesMetrics } from '../../../lib/budgets/types';

interface PerformanceTabProps {
  metrics: SalesMetrics;
  loading: boolean;
}

export function PerformanceTab({ metrics, loading }: PerformanceTabProps) {
  return (
    <TabsContent value="performance" className="space-y-4">
      {/* Carousel Graphics */}
      <PerformanceChartsCarousel metrics={metrics} />

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 bg-card border-border hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Clientes con Presupuesto</p>
            <p className="text-3xl font-bold text-foreground">{metrics.clientsWithBudget || '--'}</p>
            <p className="text-xs text-muted-foreground">
              {metrics.clientsWithBudget > 0
                ? `${Math.round((metrics.clientsWithBudget / Math.max(metrics.totalClients, 1)) * 100)}% de cobertura`
                : 'Sin datos'}
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Ventas Cerradas</p>
            <p className="text-3xl font-bold text-foreground">{metrics.totalSales || '--'}</p>
            <p className="text-xs text-muted-foreground">
              {metrics.totalSales > 0
                ? `${Math.round((metrics.totalSales / Math.max(metrics.totalBudgets, 1)) * 100)}% de conversión`
                : 'Sin datos'}
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Facturación Total</p>
            <p className="text-3xl font-bold text-foreground">
              {metrics.totalRevenue > 0 ? `$${(metrics.totalRevenue / 1000000).toFixed(1)}M` : '--'}
            </p>
            <p className="text-xs text-muted-foreground">
              {metrics.totalRevenue > 0 ? 'Ingresos generados' : 'Sin datos'}
            </p>
          </div>
        </Card>
      </div>
    </TabsContent>
  );
}
