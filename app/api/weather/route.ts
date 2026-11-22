import { NextRequest, NextResponse } from 'next/server';
import { fetchBMKGWeatherData } from '@/lib/weather-service';
import { updateFirebaseWeatherInfo } from '@/lib/firebase-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '-7.2674687');
    const lon = parseFloat(searchParams.get('lon') || '112.7088787');
    const region = searchParams.get('region') || 'Surabaya';

    const weatherData = await fetchBMKGWeatherData(lat, lon, region);

    // Otomatis kirim dan perbarui data cuaca BMKG terkini ke struktur /info di Firebase RTDB
    updateFirebaseWeatherInfo(weatherData).catch((err) => {
      console.warn('Background weather sync to Firebase info failed:', err);
    });

    return NextResponse.json({
      success: true,
      data: weatherData,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Gagal memuat data cuaca BMKG',
    }, { status: 500 });
  }
}
