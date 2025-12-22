'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Checklist, editChecklist } from '@/lib/works/checklists';

type ChecklistCompletionModalProps = {
  workId: string;
  children?: React.ReactNode;
};

export function ChecklistCompletionModal({ workId, children }: ChecklistCompletionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load checklists when modal opens
  useEffect(() => {
    if (isOpen && workId) {
      loadChecklists();
    }
  }, [isOpen, workId]);

  const loadChecklists = async () => {
    try {
      setLoading(true);
      const { getChecklistsByWorkId } = await import('@/lib/works/checklists');
      const { data, error } = await getChecklistsByWorkId(workId);
      
      if (error) {
        console.error('Error loading checklists:', error);
        return;
      }
      
      if (data) {
        // Sort checklists by name or identifier to ensure sequential order
        const sortedChecklists = data.sort((a, b) => {
          // Try to extract number from name (e.g., "Ventana 1", "Ventana 2")
          const aName = a.name || '';
          const bName = b.name || '';
          
          const aNum = parseInt(aName.match(/\d+/)?.[0] || '0');
          const bNum = parseInt(bName.match(/\d+/)?.[0] || '0');
          
          // If both have numbers, sort by number
          if (aNum > 0 && bNum > 0) {
            return aNum - bNum;
          }
          
          // Otherwise, sort alphabetically by name
          return aName.localeCompare(bName);
        });
        
        setChecklists(sortedChecklists);
      }
    } catch (error) {
      console.error('Error loading checklists:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleChecklistItem = async (checklistId: string, itemIndex: number, currentItems: any[]) => {
    // Update local state optimistically
    const updatedChecklists = checklists.map(checklist => {
      if (checklist.id === checklistId) {
        const updatedItems = [...(checklist.items || [])];
        if (updatedItems[itemIndex]) {
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            done: !updatedItems[itemIndex].done
          };
        }
        return { ...checklist, items: updatedItems };
      }
      return checklist;
    });
    
    setChecklists(updatedChecklists);

    // Save to database
    try {
      setSaving(true);
      const targetChecklist = updatedChecklists.find(c => c.id === checklistId);
      if (targetChecklist) {
        const { error } = await editChecklist(checklistId, {
          items: targetChecklist.items
        });
        
        if (error) {
          console.error('Error saving checklist:', error);
          // Revert on error
          setChecklists(checklists);
        }
      }
    } catch (error) {
      console.error('Error saving checklist:', error);
      // Revert on error
      setChecklists(checklists);
    } finally {
      setSaving(false);
    }
  };

  const calculateProgress = (items: any[] = []) => {
    if (items.length === 0) return 0;
    const completed = items.filter(item => item.done).length;
    return Math.round((completed / items.length) * 100);
  };

  const totalProgress = checklists.reduce((acc, checklist) => {
    return acc + calculateProgress(checklist.items || []);
  }, 0) / (checklists.length || 1);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Completar Checklists
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>Completar Checklists</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Cargando checklists...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Progress Overview */}
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">{Math.round(totalProgress)}%</div>
              <div className="text-sm text-muted-foreground">Progreso general de la obra</div>
            </div>

            {/* Checklists */}
            <div className="space-y-8">
              {checklists.map((checklist, index) => (
                <Card key={checklist.id} className="border-2 shadow-sm">
                  <CardHeader className="pb-6 space-y-4">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                        {checklist.name || `Abertura ${index + 1}`}
                      </h3>
                      
                      {/* Display fixed fields as read-only */}
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        {checklist.width && (
                          <div>
                            <Label className="text-xs">Ancho</Label>
                            <div className="font-medium text-foreground">{checklist.width} cm</div>
                          </div>
                        )}
                        {checklist.height && (
                          <div>
                            <Label className="text-xs">Alto</Label>
                            <div className="font-medium text-foreground">{checklist.height} cm</div>
                          </div>
                        )}
                      </div>
                      
                      {checklist.description && (
                        <div className="text-sm">
                          <Label className="text-xs">Descripción</Label>
                          <div className="font-medium text-foreground mt-1">{checklist.description}</div>
                        </div>
                      )}

                      {/* Progress for this checklist */}
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Progreso: {calculateProgress(checklist.items || [])}%
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-center text-muted-foreground">Items de Checklist</h4>
                      
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {(checklist.items || []).map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border">
                            <div className="flex items-center gap-3 flex-1">
                              <Checkbox
                                id={`checklist-${checklist.id}-item-${itemIndex}`}
                                checked={item.done || false}
                                onCheckedChange={() => toggleChecklistItem(checklist.id, itemIndex, checklist.items || [])}
                                disabled={saving}
                              />
                              <label
                                htmlFor={`checklist-${checklist.id}-item-${itemIndex}`}
                                className={`text-sm font-medium cursor-pointer flex-1 ${
                                  item.done ? 'line-through text-muted-foreground' : 'text-foreground'
                                }`}
                              >
                                {item.name}
                              </label>
                            </div>
                            {item.done && (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-center pt-8 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="px-8"
                disabled={saving}
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
