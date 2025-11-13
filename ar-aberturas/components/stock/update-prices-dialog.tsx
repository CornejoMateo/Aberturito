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
      // Leer el archivo y parsear entradas (cliente sólo prepara datos; el servidor hace el upsert)
      const text = await file.text();
      const rawLines = text.split('\n');
      const entriesMap = new Map<string, number>();

      for (const line of rawLines) {
        if (!line || !line.trim()) continue;
        const [codeRaw, priceRaw] = line.split('\t');
        if (!codeRaw || !priceRaw) continue;
        const code = codeRaw.trim();
        const price = parseFloat(priceRaw.replace(',', '.'));
        if (Number.isNaN(price)) continue;
        entriesMap.set(code, price);
      }

      const entries = Array.from(entriesMap.entries()).map(([code, price]) => ({ code, price }));
      setTotalLines(entries.length);

      if (!entries.length) {
        toast({ title: 'Aviso', description: 'No se encontraron entradas válidas en el archivo' });
        setIsProcessing(false);
        return;
      }

      // Enviar por chunks al servidor para aprovechar service_role y batching del servidor
      const BATCH_SIZE = 500; // debe coincidir con el servidor
      const concurrency = 3; // número de requests paralelos por lote
      const chunks: typeof entries[] = [];
      for (let i = 0; i < entries.length; i += BATCH_SIZE) chunks.push(entries.slice(i, i + BATCH_SIZE));

      let processed = 0;
      const runChunk = async (chunk: typeof entries) => {
        const res = await fetch('/api/update-prices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entries: chunk }),
        });
        if (!res.ok) {
          const errorBody = await res.json().catch(() => null);
          throw new Error(errorBody?.errors?.join(', ') || `Chunk request failed: ${res.status}`);
        }
        const body = await res.json();
        return body;
      };

      // Ejecutar chunks con concurrencia limitada
      for (let i = 0; i < chunks.length; i += concurrency) {
        const group = chunks.slice(i, i + concurrency);
        try {
          const results = await Promise.all(group.map(c => runChunk(c)));
          // sumar los actualizados y actualizar progreso
          for (const r of results) {
            processed += (r.updated || 0);
            if (r.errors && r.errors.length) console.error('Chunk errors:', r.errors);
          }
          setProcessedLines(processed);
          setProgress(Math.round((processed / entries.length) * 100));
        } catch (err: any) {
          console.error('Error enviando chunks:', err);
          toast({ title: 'Error', description: 'Ocurrió un error al enviar los datos al servidor', variant: 'destructive' });
          setIsProcessing(false);
          return;
        }
      }

      toast({ title: '¡Actualización completada!', description: `Se procesaron ${processed} registros` });
      
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
