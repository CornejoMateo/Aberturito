'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TicketType, TicketTypeId } from '@/constants/budgets/tickets';
import { formatCurrency } from '@/helpers/format-prices.tsx/formats';

interface AverageTicketCardProps {
  loading: boolean;
  ticketValue: number;
  ticketLabel: string;
  ticketType: TicketTypeId;
  ticketTypes: readonly TicketType[];
  onPrevTicket: () => void;
  onNextTicket: () => void;
  onSelectTicket: (type: TicketTypeId) => void;
}

export function AverageTicketCard({
  loading,
  ticketValue,
  ticketLabel,
  ticketType,
  ticketTypes,
  onPrevTicket,
  onNextTicket,
  onSelectTicket,
}: AverageTicketCardProps) {
  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Ticket promedio</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{ticketLabel}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevTicket}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[60px] text-center">
              {ticketTypes.findIndex(t => t.id === ticketType) + 1} / {ticketTypes.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNextTicket}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Por presupuesto</span>
          <span className="text-2xl font-bold text-foreground">
            {loading ? '...' : ticketValue > 0 ? formatCurrency(ticketValue) : '--'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {loading
            ? 'Cargando...'
            : ticketValue > 0
              ? `Basado en ${
                  ticketType === 'sold'
                    ? 'presupuestos vendidos'
                    : ticketType === 'lost'
                      ? 'presupuestos perdidos'
                      : ticketType === 'chosen'
                        ? 'presupuestos elegidos'
                        : 'todos los presupuestos'
                }`
              : 'Sin datos para calcular'}
        </p>
        <div className="flex justify-center gap-1 mt-2">
          {ticketTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onSelectTicket(type.id)}
              className={`h-1 w-8 rounded-full transition-colors ${
                ticketType === type.id ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
