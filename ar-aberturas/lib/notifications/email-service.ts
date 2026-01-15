import { Event } from '../calendar/events';
import { NotificationSettings } from './types';

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export function generateEmailContent(events: Event[], settings: NotificationSettings): EmailContent {
  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const subject = `📅 Recordatorio de eventos para ${today}`;

  const eventsHtml = events.map(event => `
    <div style="border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; background-color: #f8fafc; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 8px 0; color: #1e40af; font-size: 18px;">
        ${event.title || 'Sin título'}
      </h3>
      <div style="color: #64748b; font-size: 14px; line-height: 1.6;">
        ${event.type ? `<p style="margin: 4px 0;"><strong>Tipo:</strong> ${event.type}</p>` : ''}
        ${event.client ? `<p style="margin: 4px 0;"><strong>Cliente:</strong> ${event.client}</p>` : ''}
        ${event.location ? `<p style="margin: 4px 0;"><strong>Ubicación:</strong> ${event.location}</p>` : ''}
        ${event.address ? `<p style="margin: 4px 0;"><strong>Dirección:</strong> ${event.address}</p>` : ''}
        ${event.description ? `<p style="margin: 8px 0;">${event.description}</p>` : ''}
        <p style="margin: 8px 0 0 0;"><strong>Estado:</strong> <span style="color: ${event.status === 'Pendiente' ? '#f59e0b' : '#10b981'};">${event.status || 'Pendiente'}</span></p>
      </div>
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #1e293b; margin: 0; font-size: 28px;">📅 Recordatorio de Eventos</h1>
          <p style="color: #64748b; margin: 8px 0 0 0; font-size: 16px;">${today}</p>
        </div>
        
        <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <p style="margin: 0; color: #475569; font-size: 15px;">
            <strong>Tienes ${events.length} evento${events.length !== 1 ? 's' : ''} programado${events.length !== 1 ? 's' : ''} para hoy:</strong>
          </p>
        </div>

        ${eventsHtml}

        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
            Este es un recordatorio automático generado por el sistema de gestión de eventos.
            <br>
            Si no deseas recibir estos correos, por favor contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Recordatorio de Eventos - ${today}

Tienes ${events.length} evento${events.length !== 1 ? 's' : ''} programado${events.length !== 1 ? 's' : ''} para hoy:

${events.map((event, index) => `
${index + 1}. ${event.title || 'Sin título'}
   ${event.type ? `Tipo: ${event.type}` : ''}
   ${event.client ? `Cliente: ${event.client}` : ''}
   ${event.location ? `Ubicación: ${event.location}` : ''}
   ${event.address ? `Dirección: ${event.address}` : ''}
   ${event.description ? `Descripción: ${event.description}` : ''}
   Estado: ${event.status || 'Pendiente'}
`).join('\n')}

---
Este es un recordatorio automático generado por el sistema de gestión de eventos.
Si no deseas recibir estos correos, por favor contacta al administrador del sistema.
  `;

  return { subject, html, text };
}

export async function sendEmail(
  to: string[],
  subject: string,
  html: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // En desarrollo, intentamos enviar el email real si hay configuración SMTP
    if (process.env.NODE_ENV === 'development' && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      return await sendRealEmail(to, subject, html, text);
    }

    // En producción, siempre enviamos email real
    if (process.env.NODE_ENV === 'production') {
      return await sendRealEmail(to, subject, html, text);
    }

    // Simulación para desarrollo sin configuración SMTP
    return { success: true };

  } catch (error) {
    console.error('Error al enviar email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido al enviar email' 
    };
  }
}

async function sendRealEmail(
  to: string[],
  subject: string,
  html: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Importar nodemailer dinámicamente
    const nodemailer = await import('nodemailer');
    
    // Configurar el transporter de Gmail
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false // Para Gmail
      }
    });

    // Verificar la conexión
    await transporter.verify();

    // Enviar el email
    const info = await transporter.sendMail({
      from: `"AR Aberturas" <${process.env.SMTP_USER}>`,
      to: to.join(', '),
      subject: subject,
      html: html,
      text: text,
    });

    return { success: true };

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido al enviar email' 
    };
  }
}
