'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapMarker } from './InteractiveMap';

// Custom Pin Icon
const customIcon = L.icon({
  iconUrl: '/icon.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
  className: 'rounded-full shadow-md border-2 border-white',
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
          <Marker key={m.id} position={[m.latitude, m.longitude]} icon={customIcon}>
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

