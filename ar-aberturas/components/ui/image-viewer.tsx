'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import React from 'react';

interface ImageViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src?: string | null;
  alt?: string;
}

export function ImageViewer({ open, onOpenChange, src, alt = 'Imagen' }: ImageViewerProps) {
  if (!src) return null;

  // Try to request a larger version if URL pattern contains '/upload/' (cloudinary style)
  const largeSrc = src.includes('/upload/') ? src.replace('/upload/', '/upload/f_auto,q_auto,w_1200/') : src;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full p-4">
        <DialogHeader>
          <DialogTitle>Imagen</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center items-center">
          <img
            src={largeSrc}
            alt={alt}
            className="max-w-[85vw] max-h-[75vh] object-contain rounded-md shadow-md"
          />
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ImageViewer;
