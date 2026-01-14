import { NextRequest, NextResponse } from 'next/server';
import { getNotificationSettings, createNotificationSettings, updateNotificationSettings, deleteNotificationSettings } from '@/lib/notifications/database';

export async function GET() {
  try {
    const result = await getNotificationSettings();
    
    if (result.error) {
      return NextResponse.json(
        { error: 'Error al obtener configuraciones' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Error en GET /api/notifications/settings:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await createNotificationSettings(body);
    
    if (result.error) {
      return NextResponse.json(
        { error: 'Error al crear configuración' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: result.data }, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/notifications/settings:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'El ID es requerido para actualizar' },
        { status: 400 }
      );
    }

    const result = await updateNotificationSettings(id, updates);
    
    if (result.error) {
      return NextResponse.json(
        { error: 'Error al actualizar configuración' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Error en PUT /api/notifications/settings:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'El ID es requerido para eliminar' },
        { status: 400 }
      );
    }

    const result = await deleteNotificationSettings(id);
    
    if (result.error) {
      return NextResponse.json(
        { error: 'Error al eliminar configuración' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Configuración eliminada exitosamente' });
  } catch (error) {
    console.error('Error en DELETE /api/notifications/settings:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
