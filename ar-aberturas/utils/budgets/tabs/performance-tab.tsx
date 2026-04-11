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
    </TabsContent>
  );
}
