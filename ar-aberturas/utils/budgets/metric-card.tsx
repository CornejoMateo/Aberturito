'use client';

import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  loading?: boolean;
  status?: string | boolean;
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  loading = false,
  status = true,
}: MetricCardProps) {
  const statusText = typeof status === 'boolean'
    ? status
      ? 'Datos disponibles'
      : 'Sin datos'
    : status;

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {loading ? '...' : value}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {loading ? 'Cargando...' : statusText}
          </p>
        </div>
        <div className="rounded-lg bg-secondary p-3 text-chart-1">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
