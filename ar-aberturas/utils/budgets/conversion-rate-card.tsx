'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ConversionRateCardProps {
  conversionRate: number;
  totalClients?: number;
  totalSales: number;
  title?: string;
  label?: string;
}

export function ConversionRateCard({
  conversionRate,
  totalClients,
  totalSales,
  title = 'Tasa de concreción',
  label = 'Presupuestos -> Ventas',
}: ConversionRateCardProps) {
  const denominator = totalClients ?? 0;
  const denominatorLabel = 'clientes';

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-2xl font-bold text-foreground">
            {conversionRate > 0 ? `${conversionRate.toFixed(1)}%` : '--'}
          </span>
        </div>
        <Progress value={conversionRate} className="h-3" />
        <p className="text-xs text-muted-foreground">
          {denominator > 0
            ? `${totalSales} ventas de ${denominator} ${denominatorLabel}`
            : 'Sin datos para calcular'}
        </p>
      </div>
    </Card>
  );
}
