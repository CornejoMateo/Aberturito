'use client';

import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { BarChart3 } from 'lucide-react';
import { SalesMetrics } from '../types';

interface PerformanceTabProps {
  metrics: SalesMetrics;
  loading: boolean;
}

export function PerformanceTab({ metrics, loading }: PerformanceTabProps) {
  return (
    <TabsContent value="performance" className="space-y-4">
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold text-foreground mb-6">Rendimiento de Ventas</h3>
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No hay datos de rendimiento disponibles</p>
          <p className="text-sm text-muted-foreground mt-2">Conecta las fuentes de datos para ver métricas de rendimiento</p>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 bg-card border-border">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Presupuestos del mes</p>
            <p className="text-3xl font-bold text-foreground">{metrics.totalBudgets || '--'}</p>
            <p className="text-xs text-muted-foreground">
              {metrics.totalBudgets > 0 ? 'Datos del mes actual' : 'Sin datos'}
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Ventas cerradas</p>
            <p className="text-3xl font-bold text-foreground">{metrics.totalSales || '--'}</p>
            <p className="text-xs text-muted-foreground">
              {metrics.totalSales > 0 ? 'Ventas del mes actual' : 'Sin datos'}
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Facturación mensual</p>
            <p className="text-3xl font-bold text-foreground">
              {metrics.totalRevenue > 0 ? `$${(metrics.totalRevenue / 1000000).toFixed(1)}M` : '--'}
            </p>
            <p className="text-xs text-muted-foreground">
              {metrics.totalRevenue > 0 ? 'Facturación del mes' : 'Sin datos'}
            </p>
          </div>
        </Card>
      </div>
    </TabsContent>
  );
}
