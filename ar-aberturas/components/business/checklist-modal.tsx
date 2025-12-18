'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, X } from 'lucide-react';
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

  const checklistItems = opening_type === 'pvc' ? pvcChecklistItems : aluminioChecklistNames;

  const handleWindowCountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Inicializar las checklists con el número de ventanas
    const newChecklists = Array.from({ length: windowCount }, () => ({
      name: null,
      description: null,
      width: null,
      height: null,
      items: checklistItems.map(item => ({
        name: item,
        completed: false,
      })),
    }));
    setChecklists(newChecklists);
    setStep(2);
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
            {step === 1 ? 'Cantidad de Ventanas' : 'Checklist de Instalación'}
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
                      <div key={itemIndex} className="flex items-center space-x-2">
                        <Checkbox
                          id={`window-${windowIndex}-item-${itemIndex}`}
                          checked={item.completed}
                          onCheckedChange={() => toggleChecklistItem(windowIndex, itemIndex)}
                        />
                        <label
                          htmlFor={`window-${windowIndex}-item-${itemIndex}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {item.name}
                        </label>
                      </div>
                    ))}
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
                Guardar Checklists
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
