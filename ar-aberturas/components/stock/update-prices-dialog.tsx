'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updatePrices } from '@/lib/update-prices';

export function UpdatePricesDialog() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

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
    try {
      const result = await updatePrices(file);
      toast({
        title: 'Éxito',
        description: `Se actualizaron ${result.updated} precios correctamente`,
      });
      setIsOpen(false);
      setFile(null);
    } catch (error) {
      console.error('Error updating prices:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al actualizar los precios',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
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
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={!file || isLoading}
          >
            {isLoading ? 'Actualizando...' : 'Actualizar precios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
