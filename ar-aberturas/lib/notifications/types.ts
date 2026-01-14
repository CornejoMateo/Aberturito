export interface NotificationSettings {
  id: string;
  enabled: boolean;
  emails: string[];
  time: string; // HH:MM format
  filters: EventFilter[];
  created_at?: string;
  updated_at?: string;
}

export interface EventFilter {
  id: string;
  type: 'type' | 'title';
  value: string;
  enabled: boolean;
}

export interface EmailNotification {
  id: string;
  settings_id: string;
  event_id: number;
  sent_at: string;
  status: 'pending' | 'sent' | 'failed';
  error_message?: string;
}
