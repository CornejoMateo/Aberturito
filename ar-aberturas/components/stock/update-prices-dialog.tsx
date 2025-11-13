'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updatePrices } from '@/lib/update-prices';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

export function UpdatePricesDialog() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [processedLines, setProcessedLines] = useState(0);
  const [totalLines, setTotalLines] = useState(0);
  const { toast } = useToast();

  // Function to handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona un archivo',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setIsProcessing(true);
    setProcessedLines(0);
    
    try {
      // Leer el archivo para contar las líneas
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      setTotalLines(lines.length);
      
      // Crear un nuevo archivo para la función updatePrices
      const fileBlob = new Blob([text], { type: 'text/plain' });
      const newFile = new File([fileBlob], file.name, { type: 'text/plain' });
      
      // Función para actualizar el progreso
      const progressCallback = (current: number, total: number) => {
        setProcessedLines(current);
        setProgress(Math.round((current / total) * 100));
      };
      
      const result = await updatePrices(newFile, progressCallback);
      
      toast({
        title: '¡Actualización completada!',
        description: `Se actualizaron ${result.updated} precios correctamente`,
      });
      
      // Pequeño retraso antes de cerrar para que el pana David vea el mensaje de éxito
      setTimeout(() => {
        setIsOpen(false);
        setFile(null);
        setIsProcessing(false);
        setProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('Error updating prices:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al actualizar los precios. Por favor, verifica el formato del archivo.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="whitespace-nowrap">
          Actualizar Precios
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar precios desde archivo</DialogTitle>
          <DialogDescription>
            Sube un archivo .txt con los códigos y precios actualizados.
            Formato: CÓDIGO[tab]PRECIO
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file" className="text-right">
              Archivo
            </Label>
            <Input
              id="file"
              type="file"
              accept=".txt"
              className="col-span-3"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </div>
        </div>
        {isProcessing ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Procesando archivo...</span>
              <span>{processedLines} de {totalLines} líneas</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-center py-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          </div>
        ) : (
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleSubmit}
              disabled={!file || isLoading}
            >
              {isLoading ? 'Cargando...' : 'Actualizar precios'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
