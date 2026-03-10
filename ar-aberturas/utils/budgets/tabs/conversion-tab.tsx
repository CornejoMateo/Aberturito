'use client';

import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { TrendingUp } from 'lucide-react';
import { SalesMetrics } from '../types';

interface ConversionTabProps {
  metrics: SalesMetrics;
  loading: boolean;
}

export function ConversionTab({ metrics, loading }: ConversionTabProps) {
  return (
    <TabsContent value="conversion" className="space-y-4">
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold text-foreground mb-6">Embudo de Conversión</h3>
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No hay datos de conversión disponibles</p>
          <p className="text-sm text-muted-foreground mt-2">Conecta las fuentes de datos para ver el embudo de conversión</p>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 bg-card border-border">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Tasa de aceptación</p>
            <p className="text-3xl font-bold text-foreground">{metrics.conversionRate > 0 ? `${metrics.conversionRate}%` : '--'}</p>
            <p className="text-xs text-muted-foreground">
              {metrics.totalBudgets > 0 ? 'Presupuestos aceptados' : 'Sin datos'}
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Tasa de finalización</p>
            <p className="text-3xl font-bold text-foreground">--</p>
            <p className="text-xs text-muted-foreground">
              Obras completadas vs aceptadas
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Conversión total</p>
            <p className="text-3xl font-bold text-foreground">{metrics.conversionRate > 0 ? `${metrics.conversionRate}%` : '--'}</p>
            <p className="text-xs text-muted-foreground">
              {metrics.totalBudgets > 0 ? 'Del presupuesto a la venta final' : 'Sin datos'}
            </p>
          </div>
        </Card>
      </div>
    </TabsContent>
  );
}
