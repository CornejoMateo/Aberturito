'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, X, Plus, Trash2 } from 'lucide-react';
import { pvcChecklistItems, aluminioChecklistNames } from '@/lib/works/checklists.constants';

type ChecklistModalProps = {
  workId: string;
  opening_type: 'pvc' | 'aluminio';
  onSave: (checklists: Array<{ 
    name?: string | null;
    description?: string | null;
    width?: number | null;
    height?: number | null;
    items: Array<{ name: string; completed: boolean }> 
  }>) => void;
  children?: React.ReactNode; 
};

export function ChecklistModal({ workId, opening_type, onSave }: ChecklistModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [windowCount, setWindowCount] = useState(1);
  const [checklists, setChecklists] = useState<Array<{
    name?: string | null;
    description?: string | null;
    width?: number | null;
    height?: number | null;
    items: Array<{ name: string; completed: boolean }> 
  }>>([]);

  const defaultChecklistItems = opening_type === 'pvc' ? pvcChecklistItems : aluminioChecklistNames;

  // Initialize checklists with default items when window count changes
  const initializeChecklists = (count: number) => {
    const newChecklists = Array.from({ length: count }, () => ({
      name: null,
      description: null,
      width: null,
      height: null,
      items: defaultChecklistItems.map(item => ({
        name: item,
        completed: false,
      })),
    }));
    setChecklists(newChecklists);
  };

  const handleWindowCountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    initializeChecklists(windowCount);
    setStep(2);
  };

  const addChecklistItem = (windowIndex: number, itemText: string) => {
    if (itemText.trim()) {
      const updatedChecklists = [...checklists];
      updatedChecklists[windowIndex].items.push({
        name: itemText.trim(),
        completed: false
      });
      setChecklists(updatedChecklists);
    }
  };

  const removeChecklistItem = (windowIndex: number, itemIndex: number) => {
    const updatedChecklists = [...checklists];
    updatedChecklists[windowIndex].items = updatedChecklists[windowIndex].items.filter((_, i) => i !== itemIndex);
    setChecklists(updatedChecklists);
  };

  const toggleChecklistItem = (windowIndex: number, itemIndex: number) => {
    const updatedChecklists = [...checklists];
    updatedChecklists[windowIndex].items[itemIndex].completed = 
      !updatedChecklists[windowIndex].items[itemIndex].completed;
    setChecklists(updatedChecklists);
  };

  const handleSave = () => {
    onSave(checklists);
    setIsOpen(false);
    setStep(1);
    setWindowCount(1);
    setChecklists([]);
  };

  const updateChecklistField = (index: number, field: string, value: any) => {
    const updatedChecklists = [...checklists];
    updatedChecklists[index] = {
      ...updatedChecklists[index],
      [field]: value === '' ? null : value
    };
    setChecklists(updatedChecklists);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Checklist
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Cantidad de Ventanas' : 'Configurar Checklists'}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <form onSubmit={handleWindowCountSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="windowCount">Número de ventanas a instalar:</Label>
              <Input
                id="windowCount"
                type="number"
                min="1"
                value={windowCount}
                onChange={(e) => setWindowCount(Number(e.target.value))}
                className="w-32"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Siguiente</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {checklists.map((checklist, windowIndex) => (
                <Card key={windowIndex}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      <Input
                        placeholder="Identificador (opcional)"
                        value={checklist.name || ''}
                        onChange={(e) => updateChecklistField(windowIndex, 'name', e.target.value)}
                        className="text-lg font-semibold border-0 shadow-none focus-visible:ring-1"
                      />
                    </CardTitle>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label htmlFor={`width-${windowIndex}`}>Ancho (cm)</Label>
                        <Input
                          id={`width-${windowIndex}`}
                          type="number"
                          placeholder="Ancho"
                          value={checklist.width || ''}
                          onChange={(e) => updateChecklistField(windowIndex, 'width', parseFloat(e.target.value) || null)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`height-${windowIndex}`}>Alto (cm)</Label>
                        <Input
                          id={`height-${windowIndex}`}
                          type="number"
                          placeholder="Alto"
                          value={checklist.height || ''}
                          onChange={(e) => updateChecklistField(windowIndex, 'height', parseFloat(e.target.value) || null)}
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <Label htmlFor={`description-${windowIndex}`}>Descripción</Label>
                      <Input
                        id={`description-${windowIndex}`}
                        placeholder="Descripción (opcional)"
                        value={checklist.description || ''}
                        onChange={(e) => updateChecklistField(windowIndex, 'description', e.target.value)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    
                    {checklist.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center justify-between p-2 border rounded-md">
                        <span className="text-sm">{item.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeChecklistItem(windowIndex, itemIndex)}
                          className="text-destructive hover:text-destructive h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    
                    <div className="flex items-center gap-2 pt-2">
                      <Input
                        placeholder="Nuevo item..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement;
                            addChecklistItem(windowIndex, target.value);
                            target.value = '';
                          }
                        }}
                        className="flex-1 text-sm"
                      />
                      <Button
                        type="button"
                        onClick={(e) => {
                          const input = e.currentTarget.parentElement?.querySelector('input');
                          if (input) {
                            addChecklistItem(windowIndex, input.value);
                            input.value = '';
                          }
                        }}
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep(1);
                  setChecklists([]);
                }}
              >
                Atrás
              </Button>
              <Button onClick={handleSave}>
                Crear Checklists
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
