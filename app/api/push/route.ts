import { NextRequest, NextResponse } from 'next/server';
import {
  savePushSubscription,
  dispatchWebPush,
  shouldSendNotification,
} from '@/lib/notification-service';

export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
  return NextResponse.json({ publicKey });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'subscribe') {
      const { subscription } = body;
      if (!subscription) {
        return NextResponse.json({ success: false, error: 'Subscription data missing' }, { status: 400 });
      }
      await savePushSubscription(subscription);
      return NextResponse.json({ success: true, message: 'Subscription tersimpan' });
    }

    if (action === 'broadcast' || action === 'test') {
      const { title, message, severity, water_level_cm, force } = body;

      // Fingerprint anti-spam jika bukan force test
      const fingerprint = `${title}-${severity || 'warning'}`;
      if (!force && !shouldSendNotification(fingerprint)) {
        return NextResponse.json({
          success: true,
          skipped: true,
          message: 'Notifikasi dalam masa cooldown (anti-spam 15 menit).',
        });
      }

      const result = await dispatchWebPush({
        title: title || '⚠️ Peringatan EWS',
        message: message || 'Terjadi perubahan signifikan pada level air.',
        severity: severity || 'warning',
        water_level_cm: water_level_cm || 0,
      });

      return NextResponse.json({
        success: true,
        sent: result.sent,
        failed: result.failed,
      });
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak dikenali' }, { status: 400 });
  } catch (error: any) {
    console.error('Push API error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Server error' }, { status: 500 });
  }
}
