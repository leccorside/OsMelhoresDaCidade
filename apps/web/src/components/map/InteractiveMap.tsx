'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

export interface MapMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  categoryName?: string;
}

export interface InteractiveMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  center = [-17.7444, -48.6256], // Coordenadas de Caldas Novas - GO
  zoom = 14,
  markers = [
    {
      id: '1',
      name: 'Restaurante Nonna Mia',
      latitude: -17.7412,
      longitude: -48.6289,
      categoryName: 'Restaurantes & Gastronomia',
    },
    {
      id: '2',
      name: 'diRoma Acqua Park',
      latitude: -17.7289,
      longitude: -48.6321,
      categoryName: 'Parques Aquáticos',
    },
    {
      id: '3',
      name: 'Pousada Termal do Lago',
      latitude: -17.7554,
      longitude: -48.5982,
      categoryName: 'Hotéis & Pousadas',
    },
  ],
  className = 'h-96 w-full rounded-3xl overflow-hidden shadow-card border border-[#E5E7EB]',
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center text-xs text-gray-500`}>
        Carregando mapa interativo...
      </div>
    );
  }

  // Componente dinâmico que importa React-Leaflet apenas no cliente
  const LeafletMap = dynamic(
    () =>
      import('./LeafletMapClient').then((mod) => mod.LeafletMapClient),
    { ssr: false }
  );

  return <LeafletMap center={center} zoom={zoom} markers={markers} className={className} />;
};

