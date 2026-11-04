'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface MapPlaceItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: string;
  rating: number;
  reviewsCount: number | string;
  lat: number;
  lng: number;
  image: string;
  neighborhood: string;
  isOpen?: boolean;
}

interface DirectoryPlacesMapProps {
  places: MapPlaceItem[];
  selectedPlaceId?: string | null;
  onSelectPlace?: (id: string | null) => void;
  citySlug?: string;
}

export function DirectoryPlacesMap({
  places,
  selectedPlaceId,
  onSelectPlace,
  citySlug = 'caldas-novas',
}: DirectoryPlacesMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const [activePopupPlace, setActivePopupPlace] = useState<MapPlaceItem | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchAsIMove, setSearchAsIMove] = useState(true);

  // Caldas Novas center
  const defaultCenter = { lat: -17.7444, lng: -48.6253 };

  // Atualizar o popup se o card selecionado vier de fora (ex: hover no card da lista)
  useEffect(() => {
    if (selectedPlaceId) {
      const place = places.find((p) => p.id === selectedPlaceId);
      if (place) {
        setActivePopupPlace(place);
        if (leafletMapRef.current) {
          leafletMapRef.current.panTo([place.lat, place.lng], { animate: true, duration: 0.6 });
        }
      }
    }
  }, [selectedPlaceId, places]);

  // Inicializar Leaflet no cliente
  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      try {
        const L = (await import('leaflet')).default;

        // Se já existe um mapa nessa div, limpamos
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [defaultCenter.lat, defaultCenter.lng],
          zoom: 14,
          zoomControl: false,
        });

        // Adicionar zoom no canto inferior direito
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Tile layer elegante e moderno (CartoDB Positron / OSM)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }).addTo(map);

        leafletMapRef.current = map;

        // Adicionar marcadores
        markersRef.current = {};
        places.forEach((place) => {
          // Marcador personalizado estilo pino com ícone (igual à imagem de referência)
          const customIcon = L.divIcon({
            className: 'custom-map-marker',
            html: `
              <div class="relative group cursor-pointer" data-id="${place.id}">
                <div class="flex items-center gap-1 px-2.5 py-1 rounded-full shadow-lg text-[11px] font-bold text-white transition-transform duration-200 transform hover:scale-110 ${
                  place.id === selectedPlaceId
                    ? 'bg-[#FF3B4F] ring-4 ring-[#FF3B4F]/30 scale-110'
                    : 'bg-[#0D9488] hover:bg-[#0F766E]'
                }">
                  <span class="material-symbols-outlined text-[13px]">location_on</span>
                  <span class="whitespace-nowrap">${place.name.split(' ')[0]}</span>
                </div>
                <div class="w-0 h-0 mx-auto border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] ${
                  place.id === selectedPlaceId ? 'border-t-[#FF3B4F]' : 'border-t-[#0D9488]'
                }"></div>
              </div>
            `,
            iconSize: [60, 36],
            iconAnchor: [30, 36],
          });

          const marker = L.marker([place.lat, place.lng], { icon: customIcon }).addTo(map);

          marker.on('click', () => {
            setActivePopupPlace(place);
            onSelectPlace?.(place.id);
            map.panTo([place.lat, place.lng], { animate: true });
          });

          markersRef.current[place.id] = marker;
        });

        if (isMounted) setMapLoaded(true);
      } catch (err) {
        console.warn('Leaflet initialization fallback:', err);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [places]);

  const handleClosePopup = () => {
    setActivePopupPlace(null);
    onSelectPlace?.(null);
  };

  return (
    <div className="w-full h-full min-h-[580px] rounded-3xl overflow-hidden shadow-md border border-gray-200 relative bg-[#EBF0EE]">
      {/* Container Leaflet Real */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[580px] z-10" />

      {/* Floating Controls no Topo do Mapa */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-2 pointer-events-auto">
        <label className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-md text-xs font-semibold text-[#1C1B1B] cursor-pointer hover:bg-white transition-all border border-gray-100">
          <input
            type="checkbox"
            checked={searchAsIMove}
            onChange={(e) => setSearchAsIMove(e.target.checked)}
            className="w-3.5 h-3.5 accent-[#FF3B4F] rounded cursor-pointer"
          />
          <span>Buscar ao mover o mapa</span>
        </label>

        <button
          onClick={() => {
            if (leafletMapRef.current) {
              leafletMapRef.current.setView([defaultCenter.lat, defaultCenter.lng], 14);
            }
          }}
          className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-md text-[#1C1B1B] hover:text-[#FF3B4F] flex items-center justify-center shadow-md transition-all border border-gray-100"
          title="Centralizar em Caldas Novas"
        >
          <span className="material-symbols-outlined text-[18px]">my_location</span>
        </button>
      </div>

      {/* POPUP CARD FLUTUANTE - Exatamente como na imagem de referência do usuário */}
      {activePopupPlace && (
        <div className="absolute top-16 left-6 z-30 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-2.5 w-64 border border-gray-100 relative">
            {/* Botão fechar (X) */}
            <button
              onClick={handleClosePopup}
              className="absolute top-4 right-4 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors z-20 shadow-sm"
              aria-label="Fechar"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>

            {/* Imagem do Local */}
            <div className="relative h-28 w-full rounded-xl overflow-hidden bg-gray-100">
              <Image
                src={activePopupPlace.image}
                alt={activePopupPlace.name}
                fill
                className="object-cover"
                sizes="250px"
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold">
                {activePopupPlace.neighborhood}
              </span>
            </div>

            {/* Informações */}
            <div className="pt-2 px-1 pb-1">
              <h4 className="text-[13px] font-bold text-[#1C1B1B] leading-snug line-clamp-1">
                {activePopupPlace.name}
              </h4>
              <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                {activePopupPlace.category}
              </p>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                <span className="text-[13px] font-extrabold text-[#4338CA]">
                  {activePopupPlace.price}
                </span>

                <Link
                  href={`/${citySlug}/lugar/${activePopupPlace.slug}`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF3B4F] hover:underline"
                >
                  Ver local
                  <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

