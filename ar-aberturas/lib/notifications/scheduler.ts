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
    
    // Reprogram every hour to detect changes in settings
    cron.schedule('0 * * * *', () => {
      this.refreshSchedules();
    });
  }

  stop() {
    console.log('🛑 Deteniendo scheduler de notificaciones...');
    this.isRunning = false;
    
    // Stop all scheduled tasks
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
      
      // Remove old tasks
      this.scheduledTasks.forEach(({ task }) => task.stop());
      this.scheduledTasks.clear();

      // Schedule new tasks
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

    // Parse hour (format HH:MM)
    const [hours, minutes] = settings.time.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      console.warn(`Hora inválida en configuración ${settings.id}: ${settings.time}`);
      return;
    }

    // Create cron expression: minutes hours * * *
    const cronExpression = `${minutes} ${hours} * * *`;
    
    try {
      const task = cron.schedule(cronExpression, async () => {
        await this.processNotification(settings);
      }, {
        timezone: 'America/Argentina/Buenos_Aires'
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
      
      // Get events for today
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

      // Filter events according to criteria
      const filteredEvents = filterEvents(events, settings);
      
      if (filteredEvents.length === 0) {
        console.log('🔍 No hay eventos que coincidan con los filtros');
        return;
      }

      console.log(`🎯 Se encontraron ${filteredEvents.length} eventos que coinciden con los filtros`);

      // Generate and send email
      const emailContent = generateEmailContent(filteredEvents, settings);
      
      const emailResult = await sendEmail(
        settings.emails,
        emailContent.subject,
        emailContent.html,
        emailContent.text
      );

      // Register the notification attempt
      for (const event of filteredEvents) {
        await createEmailNotification({
          settings_id: settings.id,
          event_id: parseInt(event.id),
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

  // Method to check and send pending notifications for Vercel Cron
  async checkAndSendPendingNotifications() {
    try {
      console.log('Verificando notificaciones pendientes...');
      
      const settings = await getNotificationSettings();
      if (!settings.data || settings.data.length === 0) {
        return { message: 'No hay configuraciones activas' };
      }

      const results = [];
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      for (const setting of settings.data) {
        if (!setting.enabled) continue;
        
        // Verify if it's the scheduled time (with a 1-minute window)
        if (setting.time === currentTime) {
          console.log(`Procesando notificación para configuración ${setting.id} a las ${currentTime}`);
          const result = await this.processNotification(setting);
          results.push({ settingsId: setting.id, result });
        }
      }
      
      return {
        processed: results.length,
        results,
        currentTime
      };
    } catch (error) {
      console.error('Error verificando notificaciones pendientes:', error);
      throw error;
    }
  }

  // Method to manually test a notification
  async testNotification(settingsId: string) {
    try {
      const settings = await getNotificationSettings();
      const setting = settings.data?.find(s => s.id === settingsId);
      
      if (!setting) {
        throw new Error('Configuración no encontrada');
      }
      
      await this.processNotification(setting);
      
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

// Export a singleton instance
export const notificationScheduler = new NotificationScheduler();

// Auto-start the scheduler if we're not in test mode
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  notificationScheduler.start();
}
