import { NextRequest, NextResponse } from 'next/server';
import { triggerSensorCalibration } from '@/lib/firebase-service';

export async function POST(request: NextRequest) {
  try {
    let coordinates: { latitude: number; longitude: number } | undefined;
    try {
      const body = await request.json();
      if (typeof body?.latitude === 'number' && typeof body?.longitude === 'number') {
        coordinates = {
          latitude: body.latitude,
          longitude: body.longitude,
        };
      }
    } catch (e) {
      // Body kosong / bukan JSON tetap valid untuk kalibrasi normal
    }

    const result = await triggerSensorCalibration(coordinates);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error?.message || 'Terjadi kesalahan saat memproses kalibrasi',
    }, { status: 500 });
  }
}
