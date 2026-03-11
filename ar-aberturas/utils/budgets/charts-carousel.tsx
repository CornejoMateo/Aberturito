'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ChartPage {
  charts: Array<{
    title: string;
    data: Array<{ name: string; value: number; color: string }>;
  }>;
}

interface ChartsCarouselProps {
  chartPages: ChartPage[];
  currentPage: ChartPage;
  currentPageIndex: number;
  onPrevChart: () => void;
  onNextChart: () => void;
  onSelectChart: (index: number) => void;
  formatChartValue: (value: number) => string;
  percentageLabels?: Record<string, number>;
}

export function ChartsCarousel({
  chartPages,
  currentPage,
  currentPageIndex,
  onPrevChart,
  onNextChart,
  onSelectChart,
  formatChartValue,
  percentageLabels = {},
}: ChartsCarouselProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-muted-foreground">
          Gráficos ({currentPageIndex + 1} / {chartPages.length})
        </h4>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevChart}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNextChart}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {currentPage.charts.map((chart, idx) => (
          <div key={idx} className="flex flex-col items-center p-4 rounded-lg bg-secondary/20">
            <h5 className="text-sm font-medium text-foreground mb-4">{chart.title}</h5>
            {chart.data && chart.data.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chart.data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name }) => {
                      if (percentageLabels[name]) {
                        return `${percentageLabels[name]}%`;
                      }
                      return;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chart.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatChartValue(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <p>Sin datos disponibles</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-1">
        {chartPages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => onSelectChart(idx)}
            className={`h-2 w-2 rounded-full transition-colors ${
              currentPageIndex === idx ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
