'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SalesMetrics } from '../types';

interface PerformanceChartsCarouselProps {
  metrics: SalesMetrics;
}

interface Chart {
  title: string;
  description: string;
  render: () => React.ReactNode;
}

export function PerformanceChartsCarousel({ metrics }: PerformanceChartsCarouselProps) {
  const [currentChart, setCurrentChart] = useState(0);

  const formatChartValue = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return `${value}`;
  };

  // Datos de presupuestos por mes (datos reales de la BD)
  const monthlyBudgetData = metrics.budgetsByMonth && metrics.budgetsByMonth.length > 0
    ? metrics.budgetsByMonth
    : [
        { month: 'Ene', presupuestos: 0, vendidos: 0 },
        { month: 'Feb', presupuestos: 0, vendidos: 0 },
        { month: 'Mar', presupuestos: 0, vendidos: 0 },
        { month: 'Abr', presupuestos: 0, vendidos: 0 },
        { month: 'May', presupuestos: 0, vendidos: 0 },
        { month: 'Jun', presupuestos: 0, vendidos: 0 },
        { month: 'Jul', presupuestos: 0, vendidos: 0 },
        { month: 'Ago', presupuestos: 0, vendidos: 0 },
        { month: 'Sep', presupuestos: 0, vendidos: 0 },
        { month: 'Oct', presupuestos: 0, vendidos: 0 },
        { month: 'Nov', presupuestos: 0, vendidos: 0 },
        { month: 'Dic', presupuestos: 0, vendidos: 0 },
      ];

  // Datos para el gráfico de ticket promedio por tipo
  const ticketData = [
    { name: 'Vendidos', valor: metrics.soldAverageTicket },
    { name: 'Pendientes', valor: metrics.chosenAverageTicket },
    { name: 'General', valor: metrics.totalAverageTicket },
  ];

  const charts: Chart[] = [
    {
      title: 'Presupuestos Realizados por Mes',
      description: 'Evolución de presupuestos y ventas a lo largo del año',
      render: () =>
        metrics.totalBudgets > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyBudgetData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => Math.round(value as number)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="presupuestos"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Presupuestos"
              />
              <Line
                type="monotone"
                dataKey="vendidos"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
                name="Vendidos"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Sin datos disponibles</p>
          </div>
        ),
    },
    {
      title: 'Ticket Promedio por Tipo',
      description: 'Monto promedio de presupuestos según su estado',
      render: () =>
        ticketData.some(item => item.valor > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ticketData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${formatChartValue(value as number)}`} />
              <Bar dataKey="valor" fill="#06b6d4" name="Monto Promedio" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Sin datos disponibles</p>
          </div>
        ),
    },
  ];

  const handleNext = () => {
    setCurrentChart((prev) => (prev + 1) % charts.length);
  };

  const handlePrev = () => {
    setCurrentChart((prev) => (prev - 1 + charts.length) % charts.length);
  };

  const handleSelectChart = (index: number) => {
    setCurrentChart(index);
  };

  const chart = charts[currentChart];

  return (
    <Card className="p-6 bg-card border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{chart.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{chart.description}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            className="h-9 w-9 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="h-9 w-9 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chart counter */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs text-muted-foreground">
          Gráfico {currentChart + 1} de {charts.length}
        </span>
        <div className="flex gap-1">
          {charts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectChart(idx)}
              className={`h-2 w-2 rounded-full transition-colors ${
                currentChart === idx ? 'bg-primary' : 'bg-muted'
              }`}
              aria-label={`Go to chart ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Chart content with smooth transition */}
      <div className="transition-all duration-300">
        {chart.render()}
      </div>
    </Card>
  );
}
