'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { FirebaseInfo, FloodStatusConfig } from '@/lib/types';
import { calculateTrigFloodRadius } from '@/lib/firebase-service';

interface MapInnerProps {
  info: FirebaseInfo;
  status: FloodStatusConfig;
  waterLevel: number;
}

export default function MapInner({ info, status, waterLevel }: MapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const siagaCircleRef = useRef<L.Circle | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const lat = info.latitude || -6.68;
  const lon = info.longitude || 106.9383;
  const slope = info.kemiringan || 10.5;
  const statusColor = status.color || '#2196F3';

  // Kalkulasi Trigonometri: radius = tinggi air * tan(kemiringan) * 10
  const exactRadiusM = calculateTrigFloodRadius(waterLevel, slope);
  
  // Radius batas Siaga (20 cm) sebagai garis referensi visual di peta
  const siagaRadiusM = calculateTrigFloodRadius(20, slope);

  // Ukuran visual lingkaran di peta
  const visualRadiusM = exactRadiusM > 0 ? exactRadiusM : 15;
  const visualSiagaRadiusM = Math.max(35, siagaRadiusM);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 16, // Zoom lebih dekat agar radius tampak detail
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Custom Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-ews-marker',
        html: `
          <div style="
            background-color: ${statusColor};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 15px;
            cursor: pointer;
          ">
            📍
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);

      // Permanent Tooltip langsung muncul di atas marker di peta!
      marker.bindTooltip(
        `<b>Sensor ${info.region_name}</b><br/><span style="color:#60a5fa">Radius Luapan: ${exactRadiusM} m</span>`,
        {
          permanent: true,
          direction: 'top',
          offset: [0, -18],
          className: 'ews-radius-tooltip',
        }
      );

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.5; min-width: 170px;">
          <strong style="font-size: 13px; color: #0f172a;">Sensor ${info.region_name}</strong><br/>
          <span>Ketinggian Air: <b>${waterLevel} cm</b></span><br/>
          <span>Kemiringan Dataran: <b>${slope}°</b></span><br/>
          <span>Status: <b style="color: ${statusColor};">${status.name}</b></span><br/>
          <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #e2e8f0;">
            <span style="font-size: 11px; font-weight: 700; color: ${statusColor};">
              Radius Luapan: ${exactRadiusM} meter
            </span><br/>
            <span style="font-size: 10px; color: #64748b;">
              Rumus: ${waterLevel} cm × tan(${slope}°) × 10
            </span>
          </div>
        </div>
      `);

      // Lingkaran Referensi Batas Siaga (garis putus-putus kuning)
      const siagaCircle = L.circle([lat, lon], {
        radius: visualSiagaRadiusM,
        color: '#F59E0B',
        fillColor: '#F59E0B',
        fillOpacity: 0.05,
        weight: 1.5,
        dashArray: '5, 8',
      }).addTo(map);

      // Lingkaran Radius Luapan Aktif Saat Ini
      const circle = L.circle([lat, lon], {
        radius: visualRadiusM,
        color: statusColor,
        fillColor: statusColor,
        fillOpacity: exactRadiusM > 0 ? 0.35 : 0.12,
        weight: exactRadiusM > 0 ? 3 : 1.5,
      }).addTo(map);

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;
      siagaCircleRef.current = siagaCircle;
    } else {
      const map = mapInstanceRef.current;
      map.setView([lat, lon]);

      // Update lingkaran radius aktif
      if (circleRef.current) {
        circleRef.current.setLatLng([lat, lon]);
        circleRef.current.setRadius(visualRadiusM);
        circleRef.current.setStyle({
          color: statusColor,
          fillColor: statusColor,
          fillOpacity: exactRadiusM > 0 ? 0.35 : 0.12,
          weight: exactRadiusM > 0 ? 3 : 1.5,
        });
      }

      // Update lingkaran batas siaga
      if (siagaCircleRef.current) {
        siagaCircleRef.current.setLatLng([lat, lon]);
        siagaCircleRef.current.setRadius(visualSiagaRadiusM);
      }

      // Update marker & tooltip permanen
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
        markerRef.current.setTooltipContent(
          `<b>Sensor ${info.region_name}</b><br/><span style="color:#60a5fa">Radius Luapan: ${exactRadiusM} m</span>`
        );
        markerRef.current.setPopupContent(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.5; min-width: 170px;">
            <strong style="font-size: 13px; color: #0f172a;">Sensor ${info.region_name}</strong><br/>
            <span>Ketinggian Air: <b>${waterLevel} cm</b></span><br/>
            <span>Kemiringan Dataran: <b>${slope}°</b></span><br/>
            <span>Status: <b style="color: ${statusColor};">${status.name}</b></span><br/>
            <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #e2e8f0;">
              <span style="font-size: 11px; font-weight: 700; color: ${statusColor};">
                Radius Luapan: ${exactRadiusM} meter
              </span><br/>
              <span style="font-size: 10px; color: #64748b;">
                Rumus: ${waterLevel} cm × tan(${slope}°)
              </span>
            </div>
          </div>
        `);
      }
    }
  }, [lat, lon, slope, statusColor, info.region_name, status.name, waterLevel, exactRadiusM, visualRadiusM, visualSiagaRadiusM]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-[300px] sm:h-[360px] rounded-xl z-0"
    />
  );
}
