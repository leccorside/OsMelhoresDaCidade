'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapMarker } from './InteractiveMap';

// Custom Pin Icon no formato gota SVG
const customDropIcon = L.divIcon({
  className: 'custom-interactive-map-marker',
  html: `
    <div class="relative cursor-pointer select-none hover:scale-105 transition-transform" style="width: 38px; height: 48px;">
      <svg width="38" height="48" viewBox="0 0 44 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 5px rgba(0,0,0,0.25));">
        <path d="M22 1.5C10.68 1.5 1.5 10.68 1.5 22C1.5 35.8 20.8 50.4 21.4 50.8C21.75 51.05 22.25 51.05 22.6 50.8C23.2 50.4 42.5 35.8 42.5 22C42.5 10.68 33.32 1.5 22 1.5Z" 
              fill="#008779" 
              stroke="#FFFFFF" 
              stroke-width="2"/>
        <circle cx="22" cy="21.5" r="13.5" fill="#FFFFFF"/>
      </svg>
      <div class="absolute top-[7px] left-[6.5px] w-[25px] h-[25px] flex items-center justify-center pointer-events-none">
        <span class="material-symbols-outlined text-[16px] text-[#008779]" style="font-variation-settings: 'FILL' 1;">
          place
        </span>
      </div>
    </div>
  `,
  iconSize: [38, 48],
  iconAnchor: [19, 48],
});

interface LeafletMapClientProps {
  center: [number, number];
  zoom: number;
  markers: MapMarker[];
  className: string;
}

export const LeafletMapClient: React.FC<LeafletMapClientProps> = ({
  center,
  zoom,
  markers,
  className,
}) => {
  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m) => (
          <Marker key={m.id} position={[m.latitude, m.longitude]} icon={customDropIcon}>
            <Popup>
              <div className="p-1">
                <span className="text-[10px] uppercase font-bold text-[#FF3B4F] block">
                  {m.categoryName || 'Local'}
                </span>
                <strong className="text-xs text-[#171717]">{m.name}</strong>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

