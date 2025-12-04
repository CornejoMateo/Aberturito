{/* para usar luego en obra */}
{/* implementar para el mapa de ios */}
'use client';

import { MapPin } from 'lucide-react';
import { Button } from './button';

interface LocationLinkProps {
  locality: string;
  className?: string;
}

export function LocationLink({ locality, className = '' }: LocationLinkProps) {
  const handleOpenMaps = () => {
    if (!locality) return;
    
    // Crear la URL para abrir en el navegador (redirigirá a la app de Maps correspondiente)
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locality)}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  if (!locality) return null;

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <MapPin className="h-4 w-4" />
      <Button
        variant="ghost"
        size="sm"
        className={`p-0 h-auto text-muted-foreground hover:text-primary hover:bg-transparent ${className}`}
        onClick={handleOpenMaps}
      >
        <span className="text-sm">{locality}</span>
      </Button>
    </div>
  );
}
