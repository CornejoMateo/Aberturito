import cron, { ScheduledTask as CronScheduledTask } from 'node-cron';
import { getNotificationSettings } from './database';
import { getEventsForDate, filterEvents } from './event-filter';
import { generateEmailContent, sendEmail } from './email-service';
import { createEmailNotification } from './database';

interface ScheduledTask {
  settingsId: string;
  task: CronScheduledTask;
}

class NotificationScheduler {
  private scheduledTasks: Map<string, ScheduledTask> = new Map();
  private isRunning = false;

  start() {
    if (this.isRunning) {
      console.log('El scheduler de notificaciones ya está en ejecución');
      return;
    }

    console.log('🚀 Iniciando scheduler de notificaciones...');
    this.isRunning = true;
    this.scheduleAllNotifications();
    
    // Re-programar cada hora para detectar cambios en la configuración
    cron.schedule('0 * * * *', () => {
      this.refreshSchedules();
    });
  }

  stop() {
    console.log('🛑 Deteniendo scheduler de notificaciones...');
    this.isRunning = false;
    
    // Detener todas las tareas programadas
    this.scheduledTasks.forEach(({ task }) => {
      task.stop();
    });
    
    this.scheduledTasks.clear();
  }

  private async scheduleAllNotifications() {
    try {
      const settingsResult = await getNotificationSettings();
      
      if (settingsResult.error || !settingsResult.data) {
        console.error('Error al obtener configuraciones para scheduler:', settingsResult.error);
        return;
      }

      const activeSettings = settingsResult.data.filter(setting => setting.enabled);
      
      // Eliminar tareas antiguas
      this.scheduledTasks.forEach(({ task }) => task.stop());
      this.scheduledTasks.clear();

      // Programar nuevas tareas
      for (const settings of activeSettings) {
        this.scheduleNotification(settings);
      }

      console.log(`✅ ${activeSettings.length} configuraciones de notificaciones programadas`);
    } catch (error) {
      console.error('Error al programar notificaciones:', error);
    }
  }

  private scheduleNotification(settings: any) {
    if (!settings.time) {
      console.warn(`Configuración ${settings.id} no tiene hora definida`);
      return;
    }

    // Parsear hora (formato HH:MM)
    const [hours, minutes] = settings.time.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      console.warn(`Hora inválida en configuración ${settings.id}: ${settings.time}`);
      return;
    }

    // Crear expresión cron: minutos hora * * *
    const cronExpression = `${minutes} ${hours} * * *`;
    
    try {
      const task = cron.schedule(cronExpression, async () => {
        await this.processNotification(settings);
      }, {
        timezone: 'America/Argentina/Buenos_Aires' // Ajustar según tu zona horaria
      });

      this.scheduledTasks.set(settings.id, {
        settingsId: settings.id,
        task
      });

      console.log(`⏰ Notificación programada para ${settings.time} (Config: ${settings.id.slice(0, 8)}...)`);
    } catch (error) {
      console.error(`Error al programar notificación para configuración ${settings.id}:`, error);
    }
  }

  private async processNotification(settings: any) {
    try {
      console.log(`📧 Procesando notificación para configuración ${settings.id.slice(0, 8)}...`);
      
      const today = new Date().toISOString().split('T')[0];
      
      // Obtener eventos de hoy
      const eventsResult = await getEventsForDate(today);
      
      if (eventsResult.error || !eventsResult.data) {
        console.error('Error al obtener eventos del día:', eventsResult.error);
        return;
      }

      const events = eventsResult.data;
      
      if (events.length === 0) {
        console.log('📅 No hay eventos para hoy');
        return;
      }

      // Filtrar eventos según los criterios
      const filteredEvents = filterEvents(events, settings);
      
      if (filteredEvents.length === 0) {
        console.log('🔍 No hay eventos que coincidan con los filtros');
        return;
      }

      console.log(`🎯 Se encontraron ${filteredEvents.length} eventos que coinciden con los filtros`);

      // Generar y enviar email
      const emailContent = generateEmailContent(filteredEvents, settings);
      
      const emailResult = await sendEmail(
        settings.emails,
        emailContent.subject,
        emailContent.html,
        emailContent.text
      );

      // Registrar el intento de notificación
      for (const event of filteredEvents) {
        await createEmailNotification({
          settings_id: settings.id,
          event_id: parseInt(event.id), // Convertir string a number
          status: emailResult.success ? 'sent' : 'failed',
          error_message: emailResult.error,
        });
      }

      if (emailResult.success) {
        // Email enviado exitosamente
      } else {
        console.error(`Error al enviar email: ${emailResult.error}`);
      }

    } catch (error) {
      console.error(`Error procesando notificación para configuración ${settings.id}:`, error);
    }
  }

  private async refreshSchedules() {
    if (!this.isRunning) return;
    
    await this.scheduleAllNotifications();
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      activeTasks: this.scheduledTasks.size,
      tasks: Array.from(this.scheduledTasks.entries()).map(([id, { settingsId }]) => ({
        id,
        settingsId
      }))
    };
  }

  // Método para probar manualmente una notificación
  async testNotification(settingsId: string, date?: string) {
    try {
      const settingsResult = await getNotificationSettings();
      
      if (settingsResult.error || !settingsResult.data) {
        return { success: false, error: 'Error al obtener configuraciones' };
      }

      const settings = settingsResult.data.find(s => s.id === settingsId);
      
      if (!settings) {
        return { success: false, error: 'Configuración no encontrada' };
      }

      const testDate = date || new Date().toISOString().split('T')[0];
      
      await this.processNotification(settings);
      
      return { success: true, message: 'Notificación de prueba enviada' };
    } catch (error) {
      console.error('Error en prueba de notificación:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }
}

// Exportar una instancia singleton
export const notificationScheduler = new NotificationScheduler();

// Auto-iniciar el scheduler si no estamos en modo de prueba
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  notificationScheduler.start();
}
