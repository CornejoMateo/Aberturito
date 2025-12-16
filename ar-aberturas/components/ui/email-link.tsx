'use client';

import { cn } from '@/lib/utils';
import { Mail } from 'lucide-react';
import Link from 'next/link';

interface EmailLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  email: string;
  subject?: string;
  body?: string;
  children?: React.ReactNode;
  className?: string;
  iconClassName?: string;
}

export function EmailLink({
  email,
  subject = '',
  body = '',
  children,
  className = '',
  iconClassName = 'h-3 w-3 mr-1 text-muted-foreground flex-shrink-0',
  ...props
}: EmailLinkProps) {
  const mailto = `mailto:${email}${subject || body ? '?' : ''}${
    subject ? `subject=${encodeURIComponent(subject)}` : ''
  }${subject && body ? '&' : ''}${body ? `body=${encodeURIComponent(body)}` : ''}`;

  return (
    <Link
      href={mailto}
      className={cn(
        'inline-flex items-center text-xs text-foreground hover:text-primary transition-colors',
        className
      )}
      {...props}
    >
      <Mail className={iconClassName} />
      {children || email}
    </Link>
  );
}
