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
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] p-0 overflow-hidden" showCloseButton={false}>
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Imagen</DialogTitle>
        </DialogHeader>

        <div className="flex-1 p-6 pt-4 overflow-auto">
          <div className="flex justify-center items-center w-full h-full min-h-[50vh]">
            <img
              src={largeSrc}
              alt={alt}
              className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-md shadow-md"
              style={{
                maxWidth: '100%',
                maxHeight: 'calc(100vh - 200px)',
                width: 'auto',
                height: 'auto'
              }}
            />
          </div>
        </div>

        <div className="flex justify-end p-6 pt-0">
          <Button onClick={() => onOpenChange(false)} className="px-6">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ImageViewer;
