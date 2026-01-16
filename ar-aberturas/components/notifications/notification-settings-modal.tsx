'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Plus, Trash2, Mail, Clock, Filter, Save, X } from 'lucide-react';
import { NotificationSettings, EventFilter } from '@/lib/notifications/types';
import { getNotificationSettings, createNotificationSettings, updateNotificationSettings, deleteNotificationSettings } from '@/lib/notifications/database';
import { getEventTypes, validateNotificationSettings } from '@/lib/notifications/event-filter';
import { Event } from '@/lib/calendar/events';

interface NotificationSettingsModalProps {
  children?: React.ReactNode;
}

export function NotificationSettingsModal({ children }: NotificationSettingsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableEventTypes, setAvailableEventTypes] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('list');
  const [editingSettings, setEditingSettings] = useState<Partial<NotificationSettings>>({
    enabled: true,
    emails: [''],
    time: '09:00',
    filters: [{ id: '1', type: 'type', value: '', enabled: true }]
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      loadEventTypes();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const result = await getNotificationSettings();
      if (result.data) {
        setSettings(result.data);
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEventTypes = async () => {
    try {
      const { listEvents } = await import('@/lib/calendar/events');
      const result = await listEvents();
      if (result.data) {
        const types = getEventTypes(result.data);
        setAvailableEventTypes(types);
      }
    } catch (error) {
      console.error('Error al cargar tipos de eventos:', error);
    }
  };

  const handleSave = async () => {
    const validation = validateNotificationSettings(editingSettings);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    setIsLoading(true);

    try {
      const settingsToSave = {
        ...editingSettings,
        emails: editingSettings.emails?.filter(email => email.trim() !== '') || [],
        filters: editingSettings.filters?.filter(filter => filter.value.trim() !== '') || []
      } as NotificationSettings;

      let result;
      if (editingSettings.id) {
        result = await updateNotificationSettings(editingSettings.id, settingsToSave);
      } else {
        result = await createNotificationSettings(settingsToSave);
      }

      if (result.error) {
        console.error('Error al guardar configuración:', result.error);
        return;
      }

      await loadSettings();
      setActiveTab('list');
      resetEditingSettings();
    } catch (error) {
      console.error('Error al guardar configuración:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await deleteNotificationSettings(id);
      if (result.error) {
        console.error('Error al eliminar configuración:', result.error);
        return;
      }
      await loadSettings();
    } catch (error) {
      console.error('Error al eliminar configuración:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetEditingSettings = () => {
    setEditingSettings({
      enabled: true,
      emails: [''],
      time: '09:00',
      filters: [{ id: '1', type: 'type', value: '', enabled: true }]
    });
    setValidationErrors([]);
  };

  const addEmail = () => {
    setEditingSettings(prev => ({
      ...prev,
      emails: [...(prev.emails || []), '']
    }));
  };

  const updateEmail = (index: number, value: string) => {
    setEditingSettings(prev => ({
      ...prev,
      emails: prev.emails?.map((email, i) => i === index ? value : email) || []
    }));
  };

  const removeEmail = (index: number) => {
    setEditingSettings(prev => ({
      ...prev,
      emails: prev.emails?.filter((_, i) => i !== index) || []
    }));
  };

  const addFilter = () => {
    setEditingSettings(prev => ({
      ...prev,
      filters: [...(prev.filters || []), { 
        id: Date.now().toString(), 
        type: 'type' as 'type' | 'title', 
        value: '', 
        enabled: true 
      }]
    }));
  };

  const updateFilter = (index: number, field: keyof EventFilter, value: any) => {
    setEditingSettings(prev => ({
      ...prev,
      filters: (prev.filters || []).map((filter, i) => 
        i === index ? { ...filter, [field]: value } : filter
      )
    }));
  };

  const removeFilter = (index: number) => {
    setEditingSettings(prev => ({
      ...prev,
      filters: (prev.filters || []).filter((_, i) => i !== index)
    }));
  };

  const startEditing = (settingsItem: NotificationSettings) => {
    setEditingSettings(settingsItem);
    setActiveTab('create');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurar Notificaciones
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto sm:max-w-2xl md:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Settings className="h-5 w-5" />
            <span className="hidden sm:inline">Configuración de Notificaciones por Email</span>
            <span className="sm:hidden">Notificaciones</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="list" className="text-xs sm:text-sm py-2 px-2">
              <span className="hidden sm:inline">Configuraciones Activas</span>
              <span className="sm:hidden">Activas</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="text-xs sm:text-sm py-2 px-2">
              {editingSettings.id ? 'Editar' : 'Nueva'} Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Cargando configuraciones...</div>
            ) : settings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay configuraciones de notificaciones activas.
                <br />
                Crea una nueva configuración para empezar a recibir recordatorios.
              </div>
            ) : (
              <div className="space-y-4">
                {settings.map((setting) => (
                  <Card key={setting.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Mail className="h-5 w-5" />
                          Configuración #{String(setting.id).slice(0, 8)}
                          <Badge variant={setting.enabled ? "default" : "secondary"}>
                            {setting.enabled ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditing(setting)}
                          >
                            Editar
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar configuración?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente esta configuración de notificaciones.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(setting.id)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Hora de notificación: <strong>{setting.time}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">Emails: <strong>{setting.emails.join(', ')}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span className="text-sm">Filtros activos: <strong>{setting.filters?.filter(f => f.enabled).length || 0}</strong></span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {setting.filters?.filter(f => f.enabled).map((filter, index) => (
                          <Badge key={index} variant="outline">
                            {filter.type === 'type' ? 'Tipo' : 'Título'}: {filter.value}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enabled">Activar notificaciones</Label>
                <Switch
                  id="enabled"
                  checked={editingSettings.enabled}
                  onCheckedChange={(checked) => setEditingSettings(prev => ({ ...prev, enabled: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Hora de notificación</Label>
                <Input
                  id="time"
                  type="time"
                  value={editingSettings.time}
                  onChange={(e) => setEditingSettings(prev => ({ ...prev, time: e.target.value }))}
                  placeholder="09:00"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Emails para notificar</Label>
                <div className="space-y-2">
                  {editingSettings.emails?.map((email, index) => (
                    <div key={index} className="flex gap-2 flex-col sm:flex-row">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => updateEmail(index, e.target.value)}
                        placeholder="correo@ejemplo.com"
                        className="flex-1"
                      />
                      {editingSettings.emails!.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeEmail(index)}
                          className="w-full sm:w-auto"
                        >
                          <X className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">Eliminar</span>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={addEmail} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Email
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Filtros de Eventos</Label>
                {(editingSettings.filters && editingSettings.filters.length > 0) ? (
                  editingSettings.filters.map((filter, index) => (
                  <Card key={filter.id} className="p-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`filter-type-${index}`} className="text-sm">Tipo de filtro</Label>
                          <Select
                            value={filter.type}
                            onValueChange={(value: 'type' | 'title') => updateFilter(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="type">Por tipo de evento</SelectItem>
                              <SelectItem value="title">Por palabras en el título</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor={`filter-value-${index}`} className="text-sm">Valor</Label>
                          {filter.type === 'type' ? (
                            <Select
                              value={filter.value}
                              onValueChange={(value) => updateFilter(index, 'value', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableEventTypes.map(type => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={filter.value}
                              onChange={(e) => updateFilter(index, 'value', e.target.value)}
                              placeholder="Ej: cumpleaños"
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={filter.enabled}
                            onCheckedChange={(checked) => updateFilter(index, 'enabled', checked)}
                          />
                          <Label className="text-sm">Filtro activo</Label>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFilter(index)}
                        >
                          <X className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">Eliminar</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
                ) : (
                  <div className="text-sm text-muted-foreground">No hay filtros configurados</div>
                )}
                <Button variant="outline" onClick={addFilter} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Filtro
                </Button>
              </div>

              {validationErrors.length > 0 && (
                <div className="bg-destructive/15 p-3 rounded-md">
                  <div className="text-sm text-destructive font-medium mb-2">Errores de validación:</div>
                  <ul className="text-sm text-destructive space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 pt-4 flex-col sm:flex-row">
                <Button onClick={handleSave} disabled={isLoading} className="flex-1 w-full sm:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  {editingSettings.id ? 'Actualizar' : 'Guardar'} Configuración
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveTab('list');
                    resetEditingSettings();
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
