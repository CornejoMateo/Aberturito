'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, Send, Edit, Trash2, Check, X, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { updateClient } from '@/lib/clients/clients';
import { Client } from '@/lib/clients/clients';

interface ClientNotesProps {
  client: Client;
  onNotesUpdate?: (notes: string[]) => void;
}

export function ClientNotes({ client, onNotesUpdate }: ClientNotesProps) {
  const [notes, setNotes] = useState<string[]>(client.notes || []);
  const [newNote, setNewNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Update local state when client prop changes
  useEffect(() => {
    if (client.notes) {
      setNotes(client.notes);
    }
  }, [client.notes]);

  const saveNotes = async (updatedNotes: string[]) => {
    try {
      setIsSaving(true);
      await updateClient(client.id, { notes: updatedNotes });
      onNotesUpdate?.(updatedNotes);
      return true;
    } catch (error) {
      console.error('Error al guardar la nota:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    const updatedNotes = [
      ...notes,
      `${format(new Date(), "dd/MM/yyyy HH:mm")}|${newNote}`
    ];
    
    setNotes(updatedNotes);
    setNewNote('');
    
    const success = await saveNotes(updatedNotes);
    if (!success) {
      setNotes(notes);
    }
  };

  const startEditing = (index: number) => {
    const [_, ...contentParts] = notes[index].split('|');
    setEditingContent(contentParts.join('|'));
    setEditingIndex(index);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingContent('');
  };

  const saveEditedNote = async () => {
    if (editingIndex === null || !editingContent.trim()) return;
    
    const [dateTime] = notes[editingIndex].split('|');
    const updatedNotes = [...notes];
    updatedNotes[editingIndex] = `${dateTime}|${editingContent}`;
    
    setNotes(updatedNotes);
    const success = await saveNotes(updatedNotes);
    
    if (success) {
      setEditingIndex(null);
      setEditingContent('');
    } else {
      setNotes(notes);
    }
  };

  const handleDeleteNote = async (index: number) => {
    setNoteToDelete(index);
  };

  const confirmDeleteNote = async () => {
    if (noteToDelete === null) return;
    
    const index = noteToDelete;
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
    setNoteToDelete(null);
    
    try {
      setIsDeleting(true);
      const success = await saveNotes(updatedNotes);
      if (!success) {
        setNotes(notes);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const formatNoteDate = (dateString: string) => {
    const [datePart, timePart] = dateString.split('|')[0].split(' ');
    const [day, month, year] = datePart.split('/');
    const date = new Date(`${year}-${month}-${day}T${timePart}`);
    
    return {
      date: format(date, "d 'de' MMMM 'de' yyyy", { locale: es }),
      time: format(date, "HH:mm")
    };
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Delete Confirmation Dialog */}
      <Dialog open={noteToDelete !== null} onOpenChange={(open) => !open && setNoteToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Eliminar nota
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta nota? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNoteToDelete(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteNote}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {notes.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No hay notas para este cliente.
          </div>
        ) : (
          notes.map((note, index) => {
            const [dateTime, ...contentParts] = note.split('|');
            const content = contentParts.join('|');
            const { date, time } = formatNoteDate(dateTime);
            
            return (
              <Card key={index} className="w-4/5 max-w-xs ml-auto bg-muted/10 py-1 relative group">
                <CardHeader className="p-2 pb-0">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="text-[10px]">{date}</span>
                      <span className="text-muted-foreground text-[10px]">•</span>
                      <span className="text-[10px]">{time}</span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(index);
                        }}
                        className="text-muted-foreground hover:text-primary p-1 rounded-full hover:bg-muted/50"
                        title="Editar nota"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(index);
                        }}
                        className="text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-muted/50"
                        title="Eliminar nota"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-2 pt-1">
                  {editingIndex === index ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="min-h-[60px] text-sm"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={cancelEditing}
                          className="h-7 px-2"
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Cancelar
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={saveEditedNote}
                          className="h-7 px-2"
                          disabled={!editingContent.trim()}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Guardar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs">{content}</p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
      
      <div className="sticky bottom-0 bg-background pt-2 border-t">
        <div className="flex items-end gap-2">
          <Textarea
            placeholder="Escribe una nota..."
            className="min-h-[60px] max-h-24 resize-none text-sm"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddNote();
              }
            }}
          />
          <Button 
            size="icon" 
            onClick={handleAddNote}
            disabled={!newNote.trim() || isSaving}
            className="h-9 w-9 mb-1"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
