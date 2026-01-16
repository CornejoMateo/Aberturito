import { NextRequest, NextResponse } from 'next/server';
import { notificationScheduler } from '@/lib/notifications/scheduler';

export async function POST(request: NextRequest) {
  try {
    // Verify that it's a Vercel Cron request
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.VERCEL_CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Process all pending notifications
    const result = await notificationScheduler.checkAndSendPendingNotifications();
    
    return NextResponse.json({
      success: true,
      message: 'Cron job executed successfully',
      ...result
    });
  } catch (error) {
    console.error('Error in cron job of notifications:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
