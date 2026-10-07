import { NextRequest, NextResponse } from 'next/server';
import { triggerSensorCalibration } from '@/lib/firebase-service';

export async function POST(request: NextRequest) {
  try {
    const result = await triggerSensorCalibration();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error?.message || 'Terjadi kesalahan saat memproses kalibrasi',
    }, { status: 500 });
  }
}
