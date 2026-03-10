'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ConversionRateCardProps {
  conversionRate: number;
  totalBudgets: number;
  totalSales: number;
}

export function ConversionRateCard({
  conversionRate,
  totalBudgets,
  totalSales,
}: ConversionRateCardProps) {
  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Tasa de concreción</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Presupuestos → Ventas</span>
          <span className="text-2xl font-bold text-foreground">
            {conversionRate > 0 ? `${conversionRate}%` : '--'}
          </span>
        </div>
        <Progress value={conversionRate} className="h-3" />
        <p className="text-xs text-muted-foreground">
          {totalBudgets > 0
            ? `${totalSales} de ${totalBudgets} presupuestos concretados`
            : 'Sin datos para calcular'}
        </p>
      </div>
    </Card>
  );
}
