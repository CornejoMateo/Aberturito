import { getSupabaseClient } from '../supabase-client';
import { NotificationSettings, EventFilter, EmailNotification } from './types';

const SETTINGS_TABLE = 'notification_settings';
const FILTERS_TABLE = 'event_filters';
const NOTIFICATIONS_TABLE = 'email_notifications';

export async function getNotificationSettings(): Promise<{ data: NotificationSettings[] | null; error: any }> {
  const supabase = getSupabaseClient();
  
  try {
    // Primero obtener las configuraciones principales
    const { data: settingsData, error: settingsError } = await supabase
      .from(SETTINGS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (settingsError) {
      console.error('Error al obtener configuraciones principales:', settingsError);
      return { data: null, error: settingsError };
    }

    if (!settingsData || settingsData.length === 0) {
      return { data: [], error: null };
    }

    // Luego obtener los filtros para cada configuración
    const settingsWithFilters = await Promise.all(
      settingsData.map(async (setting) => {
        const { data: filtersData, error: filtersError } = await supabase
          .from(FILTERS_TABLE)
          .select('*')
          .eq('settings_id', setting.id);

        if (filtersError) {
          console.error('Error al obtener filtros para configuración', setting.id, ':', filtersError);
          return {
            ...setting,
            filters: []
          };
        }

        return {
          ...setting,
          filters: filtersData || []
        };
      })
    );

    return { data: settingsWithFilters, error: null };
  } catch (error) {
    console.error('Error inesperado al obtener configuración:', error);
    return { data: null, error };
  }
}

export async function createNotificationSettings(
  settings: Omit<NotificationSettings, 'id' | 'created_at' | 'updated_at'>
): Promise<{ data: NotificationSettings | null; error: any }> {
  const supabase = getSupabaseClient();

  try {
    const { data: settingsData, error: settingsError } = await supabase
      .from(SETTINGS_TABLE)
      .insert({
        enabled: settings.enabled,
        emails: settings.emails,
        time: settings.time,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (settingsError) {
      console.error('Error al crear configuración de notificaciones:', settingsError);
      return { data: null, error: settingsError };
    }

    // Insert filters
    if (settings.filters.length > 0) {
      const filtersToInsert = settings.filters.map(filter => ({
        settings_id: settingsData.id,
        type: filter.type,
        value: filter.value,
        enabled: filter.enabled,
      }));

      const { error: filtersError } = await supabase
        .from(FILTERS_TABLE)
        .insert(filtersToInsert);

      if (filtersError) {
        console.error('Error al crear filtros:', filtersError);
        return { data: null, error: filtersError };
      }
    }

    // Get complete settings with filters
    const { data: completeSettings, error: fetchError } = await getNotificationSettings();
    
    if (fetchError) {
      return { data: null, error: fetchError };
    }

    const createdSettings = completeSettings?.find(s => s.id === settingsData.id) || null;
    return { data: createdSettings, error: null };

  } catch (error) {
    console.error('Error inesperado al crear configuración:', error);
    return { data: null, error };
  }
}

export async function updateNotificationSettings(
  id: string,
  changes: Partial<NotificationSettings>
): Promise<{ data: NotificationSettings | null; error: any }> {
  const supabase = getSupabaseClient();

  try {
    const updatePayload = {
      ...changes,
      updated_at: new Date().toISOString(),
    };

    // Remove filters from update payload as they are handled separately
    delete updatePayload.filters;
    delete updatePayload.id;

    const { data, error } = await supabase
      .from(SETTINGS_TABLE)
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar configuración:', error);
      return { data: null, error: error.message || error };
    }

    // Update filters if provided
    if (changes.filters) {
      // Delete existing filters
      const { error: deleteError } = await supabase.from(FILTERS_TABLE).delete().eq('settings_id', id);
      
      if (deleteError) {
        console.error('Error al eliminar filtros existentes:', deleteError);
        return { data: null, error: deleteError.message || deleteError };
      }

      // Insert new filters
      if (changes.filters.length > 0) {
        const filtersToInsert = changes.filters.map(filter => ({
          settings_id: id,
          type: filter.type,
          value: filter.value,
          enabled: filter.enabled,
        }));

        const { error: filtersError } = await supabase
          .from(FILTERS_TABLE)
          .insert(filtersToInsert);

        if (filtersError) {
          console.error('Error al insertar filtros:', filtersError);
          return { data: null, error: filtersError.message || filtersError };
        }
      }
    }

    // Get complete updated settings
    const { data: completeSettings, error: fetchError } = await getNotificationSettings();
    
    if (fetchError) {
      return { data: null, error: fetchError };
    }

    const finalSettings = completeSettings?.find(s => s.id === id) || null;
    return { data: finalSettings, error: null };

  } catch (error) {
    console.error('Error inesperado al actualizar configuración:', error);
    return { data: null, error };
  }
}

export async function deleteNotificationSettings(id: string): Promise<{ data: null; error: any }> {
  const supabase = getSupabaseClient();

  try {
    // Delete filters first (foreign key constraint)
    await supabase.from(FILTERS_TABLE).delete().eq('settings_id', id);
    
    // Delete settings
    const { error } = await supabase.from(SETTINGS_TABLE).delete().eq('id', id);

    if (error) {
      console.error('Error al eliminar configuración:', error);
      return { data: null, error };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Error inesperado al eliminar configuración:', error);
    return { data: null, error };
  }
}

export async function createEmailNotification(
  notification: Omit<EmailNotification, 'id' | 'sent_at'>
): Promise<{ data: EmailNotification | null; error: any }> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from(NOTIFICATIONS_TABLE)
      .insert({
        settings_id: notification.settings_id,
        event_id: notification.event_id,
        status: notification.status,
        error_message: notification.error_message,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error al crear notificación de email:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error inesperado al crear notificación:', error);
    return { data: null, error };
  }
}
