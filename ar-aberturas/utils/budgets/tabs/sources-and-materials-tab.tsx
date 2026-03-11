'use client';

import { Card } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { SalesMetrics } from '../types';

interface SourcesAndMaterialsTabProps {
  metrics: SalesMetrics;
  loading: boolean;
}

export function SourcesAndMaterialsTab({ metrics, loading }: SourcesAndMaterialsTabProps) {
  // Get labels for contact methods
  const contactMethodLabels: Record<string, string> = {
    'CLIENTE': 'Cliente',
    'CONTACTO_REHAU': 'Contacto Rehau',
    'GMAIL': 'Gmail',
    'INSTAGRAM': 'Instagram',
    'REFERIDO': 'Referido',
    'SHOWROOM': 'Showroom',
    'WHATSAPP': 'WhatsApp',
  };

  const formatContactMethodData = metrics.clientsByContactMethod.map(item => ({
    ...item,
    method: contactMethodLabels[item.method] || item.method
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

  return (
    <TabsContent value="sources" className="space-y-4">
      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Contact Method Chart */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-6">Clientes por Medio de Contacto</h3>
          {formatContactMethodData && formatContactMethodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={formatContactMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ method, count }) => `${method}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {formatContactMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} clientes`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <p>Sin datos disponibles</p>
            </div>
          )}
        </Card>

        {/* Material Distribution Chart */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-6">Distribución de Presupuestos por Material</h3>
          {metrics.budgetsByMaterial && metrics.budgetsByMaterial.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.budgetsByMaterial}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="material" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} presupuestos`} />
                <Bar dataKey="count" fill="#06b6d4" name="Presupuestos" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <p>Sin datos disponibles</p>
            </div>
          )}
        </Card>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 bg-card border-border hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Medio de Contacto Principal</p>
            <p className="text-3xl font-bold text-foreground">
              {formatContactMethodData && formatContactMethodData.length > 0
                ? formatContactMethodData[0].method
                : '--'}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatContactMethodData && formatContactMethodData.length > 0
                ? `${formatContactMethodData[0].count} clientes`
                : 'Sin datos'}
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Material Más Utilizado</p>
            <p className="text-3xl font-bold text-foreground">
              {metrics.budgetsByMaterial && metrics.budgetsByMaterial.length > 0
                ? metrics.budgetsByMaterial[0].material
                : '--'}
            </p>
            <p className="text-xs text-muted-foreground">
              {metrics.budgetsByMaterial && metrics.budgetsByMaterial.length > 0
                ? `${metrics.budgetsByMaterial[0].count} presupuestos`
                : 'Sin datos'}
            </p>
          </div>
        </Card>
      </div>
    </TabsContent>
  );
}
