'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Work } from '@/lib/works/works';
import { useState } from 'react';

interface WorkFormProps {
  clientId: string;
  onSubmit: (work: Omit<Work, 'id' | 'created_at' | 'client_id'>) => Promise<void>;
  onCancel: () => void;
}

export function WorkForm({ clientId, onSubmit, onCancel }: WorkFormProps) {
  const [formData, setFormData] = useState<Omit<Work, 'id' | 'created_at' | 'client_id'>>({
    locality: '',
    addres: '',
    status: 'Sin empezar',
    transfer: 0,
    architect: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'transfer' ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="locality">Localidad</Label>
          <Input
            id="locality"
            name="locality"
            value={formData.locality || ''}
            onChange={handleChange}
            placeholder="Ej: Córdoba Capital"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="addres">Dirección</Label>
          <Input
            id="addres"
            name="addres"
            value={formData.addres || ''}
            onChange={handleChange}
            placeholder="Ej: Av. Colón 1234"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select
            name="status"
            value={formData.status || 'Sin empezar'}
            onValueChange={(value) => 
              setFormData(prev => ({
                ...prev,
                status: value as 'Sin empezar' | 'En progreso' | 'Finalizado'
              }))
            }
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sin empezar">Sin empezar</SelectItem>
              <SelectItem value="En progreso">En progreso</SelectItem>
              <SelectItem value="Finalizado">Finalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transfer">Entregado</Label>
          <Input
            id="transfer"
            name="transfer"
            type="number"
            value={formData.transfer || ''}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="architect">Arquitecto</Label>
          <Input
            id="architect"
            name="architect"
            value={formData.architect || ''}
            onChange={handleChange}
            placeholder="Nombre del arquitecto"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar Obra</Button>
      </div>
    </form>
  );
}
