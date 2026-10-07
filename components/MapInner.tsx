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
  const markerRef = useRef<L.Marker | null>(null);

  const lat = info.latitude || -6.68;
  const lon = info.longitude || 106.9383;
  const slope = info.kemiringan || 10.5;
  const statusColor = status.color || '#2196F3';

  // Kalkulasi Trigonometri: radius = tinggi air * tan(kemiringan)
  const exactRadiusM = calculateTrigFloodRadius(waterLevel, slope);
  // Radius untuk visual peta (jika level 0 beri lingkaran pantau 5m, jika ada nilai gunakan minimal 15m agar tampak di peta)
  const visualRadiusM = exactRadiusM > 0 ? Math.max(15, exactRadiusM) : 5;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      const customIcon = L.divIcon({
        className: 'custom-ews-marker',
        html: `
          <div style="
            background-color: ${statusColor};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
          ">
            📍
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
          <strong style="font-size: 13px;">Sensor ${info.region_name}</strong><br/>
          <span>Ketinggian Air: <b>${waterLevel} cm</b></span><br/>
          <span>Kemiringan Dataran: <b>${slope}°</b></span><br/>
          <span>Radius Luapan: <b style="color: ${statusColor};">${exactRadiusM} meter</b></span><br/>
          <span style="font-size: 10px; color: #64748b;">(Rumus: ${waterLevel} cm × tan(${slope}°))</span>
        </div>
      `);

      const circle = L.circle([lat, lon], {
        radius: visualRadiusM,
        color: statusColor,
        fillColor: statusColor,
        fillOpacity: exactRadiusM > 0 ? 0.25 : 0.08,
        weight: 2,
        dashArray: exactRadiusM > 0 ? undefined : '4, 6',
      }).addTo(map);

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;
    } else {
      const map = mapInstanceRef.current;
      map.setView([lat, lon]);

      if (circleRef.current) {
        circleRef.current.setLatLng([lat, lon]);
        circleRef.current.setRadius(visualRadiusM);
        circleRef.current.setStyle({
          color: statusColor,
          fillColor: statusColor,
          fillOpacity: exactRadiusM > 0 ? 0.25 : 0.08,
          dashArray: exactRadiusM > 0 ? undefined : '4, 6',
        });
      }

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
        markerRef.current.setPopupContent(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
            <strong style="font-size: 13px;">Sensor ${info.region_name}</strong><br/>
            <span>Ketinggian Air: <b>${waterLevel} cm</b></span><br/>
            <span>Kemiringan Dataran: <b>${slope}°</b></span><br/>
            <span>Radius Luapan: <b style="color: ${statusColor};">${exactRadiusM} meter</b></span><br/>
            <span style="font-size: 10px; color: #64748b;">(Rumus: ${waterLevel} cm × tan(${slope}°))</span>
          </div>
        `);
      }
    }
  }, [lat, lon, slope, statusColor, info.region_name, status.name, waterLevel, exactRadiusM, visualRadiusM]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-[280px] sm:h-[340px] rounded-xl z-0"
    />
  );
}
