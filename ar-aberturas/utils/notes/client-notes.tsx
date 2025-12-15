'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, Send } from 'lucide-react';
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

  // Update local state when client prop changes
  useEffect(() => {
    if (client.notes) {
      setNotes(client.notes);
    }
  }, [client.notes]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    const updatedNotes = [
      ...notes,
      `${format(new Date(), "dd/MM/yyyy HH:mm")}|${newNote}`
    ];
    
    setNotes(updatedNotes);
    setNewNote('');
    
    try {
      setIsSaving(true);
      await updateClient(client.id, { notes: updatedNotes });
      onNotesUpdate?.(updatedNotes);
    } catch (error) {
      console.error('Error al guardar la nota:', error);
      // Revert the UI if there's an error
      setNotes(notes);
    } finally {
      setIsSaving(false);
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
              <Card key={index} className="w-full max-w-md ml-auto bg-muted/10">
                <CardHeader className="p-3 pb-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium"></span>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{date}</span>
                      <span className="text-muted-foreground">•</span>
                      <span>{time}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <p className="text-sm">{content}</p>
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
            className="min-h-[80px] resize-none"
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
            className="h-10 w-10 mb-1"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
