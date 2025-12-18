'use client';

import { MapPin } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AddressLinkProps {
  address: string;
  locality?: string | null;
  className?: string;
}

export function AddressLink({ address, locality, className }: AddressLinkProps) {
  if (!address || address === 'Dirección no especificada') {
    return <span className={cn('text-muted-foreground', className)}>Dirección no especificada</span>;
  }

  // Create the Google Maps URL
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${address}${locality ? `, ${locality}` : ''}`
  )}`;

  return (
    <Link
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline',
        'transition-colors duration-200',
        className
      )}
    >
      <MapPin className="h-4 w-4 flex-shrink-0" />
      <span>{address}{locality && `, ${locality}`}</span>
    </Link>
  );
}
