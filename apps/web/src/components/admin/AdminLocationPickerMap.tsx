'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

interface AdminLocationPickerMapProps {
  lat: number;
  lng: number;
  onChangeLocation: (lat: number, lng: number) => void;
  className?: string;
}

export function AdminLocationPickerMap({
  lat,
  lng,
  onChangeLocation,
  className = 'h-72 w-full rounded-2xl overflow-hidden border border-gray-800 shadow-inner relative',
}: AdminLocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Inicializa o mapa Leaflet
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      try {
        const L = (await import('leaflet')).default;

        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const validLat = typeof lat === 'number' && !isNaN(lat) ? lat : -17.7444;
        const validLng = typeof lng === 'number' && !isNaN(lng) ? lng : -48.6253;

        const map = L.map(mapContainerRef.current, {
          center: [validLat, validLng],
          zoom: 15,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          subdomains: ['a', 'b', 'c'],
          maxZoom: 19,
        }).addTo(map);

        // Ícone em formato gota vermelho vibrante com pino interativo
        const dropIcon = L.divIcon({
          className: 'custom-admin-picker-marker',
          html: `
            <div class="relative cursor-grab active:cursor-grabbing select-none" style="width: 44px; height: 52px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));">
              <svg width="44" height="52" viewBox="0 0 44 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 1.5C10.68 1.5 1.5 10.68 1.5 22C1.5 35.8 20.8 50.4 21.4 50.8C21.75 51.05 22.25 51.05 22.6 50.8C23.2 50.4 42.5 35.8 42.5 22C42.5 10.68 33.32 1.5 22 1.5Z" 
                      fill="#FF3B4F" 
                      stroke="#FFFFFF" 
                      stroke-width="2"/>
                <circle cx="22" cy="21.5" r="13.5" fill="#FFFFFF"/>
              </svg>
              <div class="absolute top-[8px] left-[7.5px] w-[29px] h-[27px] flex items-center justify-center pointer-events-none">
                <span class="material-symbols-outlined text-[18px] text-[#FF3B4F]" style="font-variation-settings: 'FILL' 1;">
                  pin_drop
                </span>
              </div>
            </div>
          `,
          iconSize: [44, 52],
          iconAnchor: [22, 52],
        });

        const marker = L.marker([validLat, validLng], {
          icon: dropIcon,
          draggable: true,
        }).addTo(map);

        // Ao arrastar o pino
        marker.on('dragend', (e: any) => {
          const newPos = e.target.getLatLng();
          onChangeLocation(parseFloat(newPos.lat.toFixed(6)), parseFloat(newPos.lng.toFixed(6)));
        });

        // Ao clicar em qualquer ponto do mapa
        map.on('click', (e: any) => {
          const clickLat = parseFloat(e.latlng.lat.toFixed(6));
          const clickLng = parseFloat(e.latlng.lng.toFixed(6));
          marker.setLatLng([clickLat, clickLng]);
          onChangeLocation(clickLat, clickLng);
        });

        mapRef.current = map;
        markerRef.current = marker;
      } catch (err) {
        console.warn('Erro ao inicializar picker de mapa:', err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Quando as coordenadas externas mudam (via geocodificação ou digitação manual)
  useEffect(() => {
    if (mapRef.current && markerRef.current && typeof lat === 'number' && typeof lng === 'number') {
      const currentPos = markerRef.current.getLatLng();
      if (
        Math.abs(currentPos.lat - lat) > 0.00001 ||
        Math.abs(currentPos.lng - lng) > 0.00001
      ) {
        markerRef.current.setLatLng([lat, lng]);
        mapRef.current.setView([lat, lng], mapRef.current.getZoom() || 15, { animate: true });
      }
    }
  }, [lat, lng]);

  return (
    <div className={className}>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
