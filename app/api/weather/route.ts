import { NextRequest, NextResponse } from 'next/server';
import { fetchBMKGWeatherData } from '@/lib/weather-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '-6.68');
    const lon = parseFloat(searchParams.get('lon') || '106.9383');
    const region = searchParams.get('region') || 'Cisarua';

    const weatherData = await fetchBMKGWeatherData(lat, lon, region);

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
