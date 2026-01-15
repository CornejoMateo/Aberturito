'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Mail, Bell } from 'lucide-react';
import { NotificationSettingsModal } from './notification-settings-modal';
import { getNotificationSettings } from '@/lib/notifications/database';

export function NotificationButton() {
  const [activeSettings, setActiveSettings] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadActiveSettings = async () => {
    setIsLoading(true);
    try {
      const result = await getNotificationSettings();
      if (result.data) {
        const active = result.data.filter(setting => setting.enabled).length;
        setActiveSettings(active);
      }
    } catch (error) {
      console.error('Error al cargar configuraciones activas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar configuraciones activas al montar el componente
  useEffect(() => {
    loadActiveSettings();
  }, []);

  return (
    <NotificationSettingsModal>
      <Button variant="outline" size="sm" className="relative">
        <Settings className="h-4 w-4 mr-2" />
        <Bell className="h-4 w-4 mr-2" />
        Notificaciones
        {activeSettings > 0 && (
          <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {activeSettings}
          </Badge>
        )}
      </Button>
    </NotificationSettingsModal>
  );
}
