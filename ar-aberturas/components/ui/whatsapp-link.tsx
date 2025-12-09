'use client';

import { cn } from '@/lib/utils';
import { Phone } from 'lucide-react';
import Link from 'next/link';

interface WhatsAppLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  phone: string;
  message?: string;
  children?: React.ReactNode;
  className?: string;
  iconClassName?: string;
}

export function WhatsAppLink({
  phone,
  message = '',
  children,
  className = '',
  iconClassName = 'h-3 w-3 mr-1 text-muted-foreground flex-shrink-0',
  ...props
}: WhatsAppLinkProps) {
  // Remove any non-numeric characters except + from the phone number
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center text-xs text-foreground hover:text-primary transition-colors',
        className
      )}
      {...props}
    >
      <Phone className={iconClassName} />
      {children || phone}
    </Link>
  );
}
