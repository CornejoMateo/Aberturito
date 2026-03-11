export const CONTACT_METHODS = [
  { value: 'CLIENTE', label: 'Cliente' },
  { value: 'CONTACTO_REHAU', label: 'Contacto Rehau' },
  { value: 'GMAIL', label: 'Gmail' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'REFERIDO', label: 'Referido' },
  { value: 'SHOWROOM', label: 'Showroom' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
] as const;

export const DEFAULT_CONTACT_METHOD = 'WHATSAPP';

export type ContactMethod = typeof CONTACT_METHODS[number]['value'];
