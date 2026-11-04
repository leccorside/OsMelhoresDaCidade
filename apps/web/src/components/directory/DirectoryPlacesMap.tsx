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

export type MapTileStyle = 'osm' | 'satellite' | 'clean';

const TILE_PROVIDERS: Record<
  MapTileStyle,
  { url: string; attribution: string; label: string; icon: string }
> = {
  osm: {
    label: 'Ruas (OpenStreetMap)',
    icon: 'map',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    label: 'Satélite Real',
    icon: 'satellite_alt',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
  clean: {
    label: 'Cartográfico',
    icon: 'layers',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
  },
};

// Mapeia cada categoria para o ícone correspondente do Material Symbols
function getCategoryIcon(category: string): string {
  const cat = category.toLowerCase();
  if (
    cat.includes('restaurante') ||
    cat.includes('gastronomia') ||
    cat.includes('alimentação') ||
    cat.includes('típica') ||
    cat.includes('comida')
  ) {
    return 'restaurant';
  }
  if (
    cat.includes('parque') ||
    cat.includes('termas') ||
    cat.includes('água') ||
    cat.includes('lazer') ||
    cat.includes('piscinas')
  ) {
    return 'pool';
  }
  if (
    cat.includes('bar') ||
    cat.includes('chopp') ||
    cat.includes('pub') ||
    cat.includes('cervejaria')
  ) {
    return 'sports_bar';
  }
  if (
    cat.includes('hotel') ||
    cat.includes('pousada') ||
    cat.includes('resort') ||
    cat.includes('hospedagem')
  ) {
    return 'hotel';
  }
  if (cat.includes('turismo') || cat.includes('atração') || cat.includes('atracao')) {
    return 'attractions';
  }
  if (
    cat.includes('médico') ||
    cat.includes('medico') ||
    cat.includes('saúde') ||
    cat.includes('hospital')
  ) {
    return 'medical_services';
  }
  if (cat.includes('evento') || cat.includes('show') || cat.includes('festival')) {
    return 'confirmation_number';
  }
  if (cat.includes('comércio') || cat.includes('comercio') || cat.includes('loja')) {
    return 'storefront';
  }
  if (cat.includes('museu') || cat.includes('arte') || cat.includes('cultura')) {
    return 'museum';
  }
  return 'place';
}

// Cria o ícone em formato de pino com círculo interno branco e ícone da categoria (SEM O NOME DO LUGAR)
function createCategoryMarkerIcon(L: any, place: MapPlaceItem, isSelected: boolean) {
  const iconName = getCategoryIcon(place.category);
  const bgColor = isSelected ? '#FF3B4F' : '#0D9488';
  const iconColor = isSelected ? '#FF3B4F' : '#0D9488';
  const scaleClass = isSelected ? 'scale-115 ring-4 ring-[#FF3B4F]/30' : 'hover:scale-110';

  return L.divIcon({
    className: 'custom-map-category-marker',
    html: `
      <div class="relative cursor-pointer transition-transform duration-200 transform ${scaleClass}" data-id="${place.id}">
        <div class="flex flex-col items-center">
          <!-- Círculo externo colorido do pino -->
          <div style="background-color: ${bgColor};" class="w-10 h-10 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.28)] transition-all">
            <!-- Círculo interno branco -->
            <div class="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-xs">
              <!-- Ícone da Categoria (Sem o nome do lugar) -->
              <span class="material-symbols-outlined text-[17px]" style="color: ${iconColor}; font-variation-settings: 'FILL' 1;">
                ${iconName}
              </span>
            </div>
          </div>
          <!-- Ponta triangular do pino apontando para o local exato -->
          <div style="border-top-color: ${bgColor};" class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] -mt-[1px]"></div>
        </div>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 48],
  });
}

export function DirectoryPlacesMap({
  places,
  selectedPlaceId,
  onSelectPlace,
  citySlug = 'caldas-novas',
}: DirectoryPlacesMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const currentTileLayerRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const [activePopupPlace, setActivePopupPlace] = useState<MapPlaceItem | null>(null);
  const [currentStyle, setCurrentStyle] = useState<MapTileStyle>('osm');
  const [styleMenuOpen, setStyleMenuOpen] = useState(false);
  const [searchAsIMove, setSearchAsIMove] = useState(true);

  // Coordenadas centrais de Caldas Novas, GO
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

  // Atualizar visual do marcador (destaque vermelho/anel) quando selectedPlaceId mudar
  useEffect(() => {
    if (typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      places.forEach((place) => {
        const marker = markersRef.current[place.id];
        if (marker) {
          const isSelected = place.id === selectedPlaceId;
          marker.setIcon(createCategoryMarkerIcon(L.default, place, isSelected));
          if (isSelected) {
            marker.setZIndexOffset(1000);
          } else {
            marker.setZIndexOffset(0);
          }
        }
      });
    });
  }, [selectedPlaceId, places]);

  // Trocar o tile layer quando o estilo mudar
  useEffect(() => {
    if (!leafletMapRef.current) return;

    import('leaflet').then((L) => {
      if (currentTileLayerRef.current) {
        leafletMapRef.current.removeLayer(currentTileLayerRef.current);
      }

      const provider = TILE_PROVIDERS[currentStyle];
      const newLayer = L.default.tileLayer(provider.url, {
        attribution: provider.attribution,
        maxZoom: 19,
      });

      newLayer.addTo(leafletMapRef.current);
      currentTileLayerRef.current = newLayer;
    });
  }, [currentStyle]);

  // Inicializar Leaflet no cliente
  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      try {
        const L = (await import('leaflet')).default;

        // Limpeza prévia
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [defaultCenter.lat, defaultCenter.lng],
          zoom: 14,
          zoomControl: false,
        });

        // Controles de zoom
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Tile layer padrão: OpenStreetMap Standard
        const provider = TILE_PROVIDERS[currentStyle];
        const tileLayer = L.tileLayer(provider.url, {
          attribution: provider.attribution,
          maxZoom: 19,
        }).addTo(map);

        currentTileLayerRef.current = tileLayer;
        leafletMapRef.current = map;

        // Adicionar marcadores com pino da categoria (Sem o nome do lugar)
        markersRef.current = {};
        places.forEach((place) => {
          const isSelected = place.id === selectedPlaceId;
          const customIcon = createCategoryMarkerIcon(L, place, isSelected);

          const marker = L.marker([place.lat, place.lng], { icon: customIcon }).addTo(map);

          marker.on('click', () => {
            setActivePopupPlace(place);
            onSelectPlace?.(place.id);
            map.panTo([place.lat, place.lng], { animate: true });
          });

          markersRef.current[place.id] = marker;
        });
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
      {/* Container Leaflet com Mapa Real */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[580px] z-10" />

      {/* Floating Controls no Topo do Mapa */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-2 pointer-events-auto">
        {/* Toggle Buscar ao Mover */}
        <label className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-md text-xs font-semibold text-[#1C1B1B] cursor-pointer hover:bg-white transition-all border border-gray-100">
          <input
            type="checkbox"
            checked={searchAsIMove}
            onChange={(e) => setSearchAsIMove(e.target.checked)}
            className="w-3.5 h-3.5 accent-[#FF3B4F] rounded cursor-pointer"
          />
          <span>Buscar ao mover o mapa</span>
        </label>

        {/* Grupo de Ações à Direita: Seletor de Camada + Botão Centralizar */}
        <div className="flex items-center gap-2 relative">
          {/* Seletor de Camada */}
          <div className="relative">
            <button
              onClick={() => setStyleMenuOpen(!styleMenuOpen)}
              className="px-3 py-2 rounded-full bg-white/95 backdrop-blur-md text-[#1C1B1B] hover:text-[#FF3B4F] flex items-center gap-1.5 shadow-md text-xs font-bold border border-gray-100 transition-all"
              title="Trocar estilo do mapa"
            >
              <span className="material-symbols-outlined text-[16px]">
                {TILE_PROVIDERS[currentStyle].icon}
              </span>
              <span className="hidden sm:inline">Camada</span>
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>

            {styleMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 space-y-1">
                {(Object.keys(TILE_PROVIDERS) as MapTileStyle[]).map((key) => {
                  const prov = TILE_PROVIDERS[key];
                  const active = currentStyle === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setCurrentStyle(key);
                        setStyleMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-colors ${
                        active
                          ? 'bg-red-50 text-[#FF3B4F]'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {prov.icon}
                      </span>
                      <span>{prov.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botão Centralizar */}
          <button
            onClick={() => {
              if (leafletMapRef.current) {
                leafletMapRef.current.setView([defaultCenter.lat, defaultCenter.lng], 14, {
                  animate: true,
                });
              }
            }}
            className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-md text-[#1C1B1B] hover:text-[#FF3B4F] flex items-center justify-center shadow-md transition-all border border-gray-100"
            title="Centralizar em Caldas Novas"
          >
            <span className="material-symbols-outlined text-[18px]">my_location</span>
          </button>
        </div>
      </div>

      {/* POPUP CARD FLUTUANTE - Idêntico à imagem 2 de referência */}
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
