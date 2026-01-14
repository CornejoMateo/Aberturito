import { NextRequest, NextResponse } from 'next/server';
import { getNotificationSettings } from '@/lib/notifications/database';
import { getEventsForDate, filterEvents } from '@/lib/notifications/event-filter';
import { generateEmailContent, sendEmail } from '@/lib/notifications/email-service';
import { createEmailNotification } from '@/lib/notifications/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date } = body;

    if (!date) {
      return NextResponse.json(
        { error: 'La fecha es requerida' },
        { status: 400 }
      );
    }

    // Obtener todas las configuraciones de notificaciones activas
    const settingsResult = await getNotificationSettings();
    if (settingsResult.error || !settingsResult.data) {
      return NextResponse.json(
        { error: 'Error al obtener configuraciones de notificaciones' },
        { status: 500 }
      );
    }

    const activeSettings = settingsResult.data.filter(setting => setting.enabled);
    
    if (activeSettings.length === 0) {
      return NextResponse.json({ message: 'No hay configuraciones activas' });
    }

    // Obtener eventos para la fecha especificada
    const eventsResult = await getEventsForDate(date);
    if (eventsResult.error || !eventsResult.data) {
      return NextResponse.json(
        { error: 'Error al obtener eventos' },
        { status: 500 }
      );
    }

    const events = eventsResult.data;
    
    if (events.length === 0) {
      return NextResponse.json({ message: 'No hay eventos para esta fecha' });
    }

    const results = [];

    // Procesar cada configuración activa
    for (const settings of activeSettings) {
      try {
        // Filtrar eventos según los criterios de esta configuración
        const filteredEvents = filterEvents(events, settings);
        
        if (filteredEvents.length === 0) {
          continue; // No hay eventos que coincidan con los filtros
        }

        // Generar contenido del email
        const emailContent = generateEmailContent(filteredEvents, settings);
        
        // Enviar email
        const emailResult = await sendEmail(
          settings.emails,
          emailContent.subject,
          emailContent.html,
          emailContent.text
        );

        // Registrar el intento de notificación para cada evento
        for (const event of filteredEvents) {
          await createEmailNotification({
            settings_id: settings.id,
            event_id: parseInt(event.id), // Convertir string a number
            status: emailResult.success ? 'sent' : 'failed',
            error_message: emailResult.error,
          });
        }

        results.push({
          settingsId: settings.id,
          emails: settings.emails,
          eventsCount: filteredEvents.length,
          success: emailResult.success,
          error: emailResult.error,
        });

      } catch (error) {
        console.error(`Error procesando configuración ${settings.id}:`, error);
        results.push({
          settingsId: settings.id,
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      message: `Procesadas ${results.length} configuraciones. ${successful} exitosas, ${failed} fallidas.`,
      results,
      summary: {
        total: results.length,
        successful,
        failed,
        eventsProcessed: events.length,
      }
    });

  } catch (error) {
    console.error('Error en el endpoint de notificaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para probar manualmente el envío de notificaciones
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Simular una petición POST para reutilizar la lógica
    const response = await POST(new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ date }),
      headers: { 'Content-Type': 'application/json' },
    }));

    const data = await response.json();
    
    return NextResponse.json({
      message: 'Prueba de notificaciones completada',
      date,
      ...data,
    });

  } catch (error) {
    console.error('Error en la prueba de notificaciones:', error);
    return NextResponse.json(
      { error: 'Error en la prueba de notificaciones' },
      { status: 500 }
    );
  }
}
