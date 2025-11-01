'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface PhotoGalleryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PhotoGalleryModal({ open, onOpenChange }: PhotoGalleryModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] lg:max-w-[95vw] w-full h-[80vh] p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>Galería de Fotos</DialogTitle>
                    <DialogDescription>
                        Vista previa de las imágenes del stock
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 p-6 overflow-auto">
                    {/* Contenido del modal - Por ahora vacío */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                            <p className="text-muted-foreground">Contenido próximamente</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}