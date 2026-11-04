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
  isFeatured?: boolean;
  featuredPlan?: 'BRONZE_DESTAQUE' | 'PRATA_REGIONAL' | 'OURO_MASTER' | string | null;
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
  { url: string; attribution: string; label: string; icon: string; subdomains?: string[] }
> = {
  osm: {
    label: 'Ruas (OpenStreetMap)',
    icon: 'map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c'],
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
  const cat = (category || '').toLowerCase();
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

// Cria o ícone em formato de gota/pin clássico com círculo interno branco e ícone da categoria (SEM NOME DO LUGAR)
// Inclui suporte ao badge verde-limão translúcido com contador de agrupamento conforme protótipo de referência
function createCategoryMarkerIcon(
  L: any,
  place: MapPlaceItem,
  isSelected: boolean,
  clusterCount?: number
) {
  const iconName = getCategoryIcon(place.category);
  const pinColor = isSelected ? '#FF3B4F' : '#008779';
  const iconColor = isSelected ? '#FF3B4F' : '#008779';
  const scaleClass = isSelected ? 'scale-110 z-50' : 'hover:scale-105 transition-transform duration-200';

  const clusterBadgeHtml =
    clusterCount && clusterCount > 1
      ? `
        <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 min-w-[26px] h-[26px] px-1 rounded-full bg-[#84cc16]/70 border-2 border-white flex items-center justify-center shadow-md pointer-events-none z-10">
          <span class="text-[11px] font-extrabold text-[#14532d] leading-none">${clusterCount}</span>
        </div>
      `
      : '';

  return L.divIcon({
    className: 'custom-map-category-marker',
    html: `
      <div class="relative cursor-pointer select-none ${scaleClass}" style="width: 44px; height: 56px;" data-id="${place.id}">
        <!-- Pin SVG em formato de gota elegante com sombra -->
        <svg width="44" height="52" viewBox="0 0 44 52" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-md">
          <!-- Gota externa do pino com borda branca fina -->
          <path d="M22 1.5C10.68 1.5 1.5 10.68 1.5 22C1.5 35.8 20.8 50.4 21.4 50.8C21.75 51.05 22.25 51.05 22.6 50.8C23.2 50.4 42.5 35.8 42.5 22C42.5 10.68 33.32 1.5 22 1.5Z" 
                fill="${pinColor}" 
                stroke="#FFFFFF" 
                stroke-width="2"/>
          <!-- Círculo interno branco -->
          <circle cx="22" cy="21.5" r="13.5" fill="#FFFFFF"/>
        </svg>

        <!-- Ícone da categoria perfeitamente centralizado no círculo branco -->
        <div class="absolute top-[8px] left-[7.5px] w-[29px] h-[27px] flex items-center justify-center pointer-events-none">
          <span class="material-symbols-outlined text-[18px]" style="color: ${iconColor}; font-variation-settings: 'FILL' 1;">
            ${iconName}
          </span>
        </div>

        <!-- Badge translúcido verde-limão com contagem de agrupamento (quando há mais de 1 local próximo) -->
        ${clusterBadgeHtml}
      </div>
    `,
    iconSize: [44, 56],
    iconAnchor: [22, 52],
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
  const spiderLayerRef = useRef<any>(null);
  const [activePopupPlace, setActivePopupPlace] = useState<MapPlaceItem | null>(null);
  const [activeCluster, setActiveCluster] = useState<{
    center: { lat: number; lng: number };
    items: MapPlaceItem[];
  } | null>(null);
  const [currentStyle, setCurrentStyle] = useState<MapTileStyle>('osm');
  const [styleMenuOpen, setStyleMenuOpen] = useState(false);
  const [searchAsIMove, setSearchAsIMove] = useState(true);

  // Coordenadas centrais de Caldas Novas, GO
  const defaultCenter = { lat: -17.7444, lng: -48.6253 };

  // Calcula aglomeração de pontos próximos (~350 metros) para exibir badge numérico idêntico à referência
  const clusterCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    const THRESHOLD = 0.0035;

    places.forEach((p1) => {
      let count = 0;
      places.forEach((p2) => {
        const dLat = Math.abs(p1.lat - p2.lat);
        const dLng = Math.abs(p1.lng - p2.lng);
        if (dLat < THRESHOLD && dLng < THRESHOLD) {
          count++;
        }
      });
      counts[p1.id] = count;
    });

    return counts;
  }, [places]);

  // Função para limpar dispersão em leque (unspiderfy)
  const clearSpiderfy = () => {
    if (spiderLayerRef.current && leafletMapRef.current) {
      leafletMapRef.current.removeLayer(spiderLayerRef.current);
      spiderLayerRef.current = null;
    }
    // Restaura opacidade dos marcadores originais
    places.forEach((p) => {
      const marker = markersRef.current[p.id];
      if (marker && marker.setOpacity) {
        marker.setOpacity(1);
      }
    });
  };

  // Dispersa os marcadores em círculo/leque ao redor do centro com linhas conectoras
  const triggerSpiderfy = (L: any, map: any, items: MapPlaceItem[], centerPlace: MapPlaceItem) => {
    clearSpiderfy();

    const layerGroup = L.layerGroup().addTo(map);
    spiderLayerRef.current = layerGroup;

    // Diminui a opacidade dos marcadores originais centralizados
    items.forEach((it) => {
      const marker = markersRef.current[it.id];
      if (marker && marker.setOpacity) {
        marker.setOpacity(0.25);
      }
    });

    const N = items.length;
    const radiusPixels = Math.min(55 + N * 5, 85); // Raio dinâmico proporcional à quantidade
    const centerPoint = map.latLngToLayerPoint([centerPlace.lat, centerPlace.lng]);

    items.forEach((item, index) => {
      const angle = (2 * Math.PI * index) / N - Math.PI / 2;
      const spiderX = centerPoint.x + radiusPixels * Math.cos(angle);
      const spiderY = centerPoint.y + radiusPixels * Math.sin(angle);
      const spiderLatLng = map.layerPointToLatLng(L.point(spiderX, spiderY));

      // Linha conectora suave com pontilhado teal
      const polyline = L.polyline([[centerPlace.lat, centerPlace.lng], spiderLatLng], {
        color: '#008779',
        weight: 2.5,
        dashArray: '4, 5',
        opacity: 0.85,
      });
      layerGroup.addLayer(polyline);

      // Marcador disperso individual com ícone da categoria do estabelecimento
      const isSelected = item.id === selectedPlaceId;
      const spiderIcon = createCategoryMarkerIcon(L, item, isSelected, 1);
      const spiderMarker = L.marker(spiderLatLng, {
        icon: spiderIcon,
        zIndexOffset: 1500,
      });

      spiderMarker.on('click', (e: any) => {
        L.DomEvent.stopPropagation(e);
        setActivePopupPlace(item);
        onSelectPlace?.(item.id);
        map.panTo(spiderLatLng, { animate: true });
      });

      layerGroup.addLayer(spiderMarker);
    });
  };

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
          const count = clusterCounts[place.id];
          marker.setIcon(createCategoryMarkerIcon(L.default, place, isSelected, count));
          if (isSelected) {
            marker.setZIndexOffset(1000);
          } else {
            marker.setZIndexOffset(0);
          }
        }
      });
    });
  }, [selectedPlaceId, places, clusterCounts]);

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
        subdomains: provider.subdomains || 'abc',
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
          subdomains: provider.subdomains || 'abc',
          maxZoom: 19,
        }).addTo(map);

        currentTileLayerRef.current = tileLayer;
        leafletMapRef.current = map;

        // Limpa cluster e popups ao clicar no mapa livre
        map.on('click', () => {
          clearSpiderfy();
          setActivePopupPlace(null);
          setActiveCluster(null);
          onSelectPlace?.(null);
        });

        // Desfaz o leque ao alterar o nível de zoom
        map.on('zoomstart', () => {
          clearSpiderfy();
          setActiveCluster(null);
        });

        // Adicionar marcadores com pino da categoria
        markersRef.current = {};
        places.forEach((place) => {
          const isSelected = place.id === selectedPlaceId;
          const count = clusterCounts[place.id] || 1;
          const customIcon = createCategoryMarkerIcon(L, place, isSelected, count);

          const marker = L.marker([place.lat, place.lng], { icon: customIcon }).addTo(map);

          marker.on('click', (e: any) => {
            L.DomEvent.stopPropagation(e);

            if (count > 1) {
              // Identifica todos os estabelecimentos deste agrupamento
              const clusterGroup = places.filter((p) => {
                const dLat = Math.abs(p.lat - place.lat);
                const dLng = Math.abs(p.lng - place.lng);
                return dLat < 0.0035 && dLng < 0.0035;
              });

              // Zoom suave de aproximação se estiver afastado
              const currentZoom = map.getZoom();
              const targetZoom = Math.min(Math.max(currentZoom + 1, 16), 18);
              map.flyTo([place.lat, place.lng], targetZoom, { duration: 0.6 });

              // Dispersa os pinos em leque suave
              triggerSpiderfy(L, map, clusterGroup, place);

              // Abre o painel com a listagem dos locais do cluster
              setActiveCluster({
                center: { lat: place.lat, lng: place.lng },
                items: clusterGroup,
              });
              setActivePopupPlace(null);
            } else {
              clearSpiderfy();
              setActiveCluster(null);
              setActivePopupPlace(place);
              onSelectPlace?.(place.id);
              map.panTo([place.lat, place.lng], { animate: true });
            }
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
      clearSpiderfy();
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

      {/* CARD FLUTUANTE DE AGRUPAMENTO (CLUSTER SPIDERFY) */}
      {activeCluster && !activePopupPlace && (
        <div className="absolute top-16 left-4 sm:left-6 z-30 animate-in fade-in zoom-in-95 duration-200 max-w-[92vw]">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-3 w-72 sm:w-84 border border-teal-100 relative">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#008779] text-white flex items-center justify-center text-xs font-black shadow-xs">
                  {activeCluster.items.length}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">
                    Locais neste Endereço
                  </h4>
                  <p className="text-[10px] text-gray-500">
                    Dispersos em leque no mapa
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  clearSpiderfy();
                  setActiveCluster(null);
                }}
                className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
                title="Fechar agrupamento"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {activeCluster.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setActivePopupPlace(item);
                    onSelectPlace?.(item.id);
                    if (leafletMapRef.current) {
                      leafletMapRef.current.panTo([item.lat, item.lng], { animate: true });
                    }
                  }}
                  className="flex items-center gap-2.5 p-2 rounded-xl border border-gray-100 hover:border-teal-400 bg-white hover:bg-teal-50/40 cursor-pointer transition-all shadow-2xs group"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 relative shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="50px"
                    />
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <h5 className="text-[12px] font-bold text-gray-900 truncate group-hover:text-teal-700">
                      {item.name}
                    </h5>
                    <p className="text-[10px] text-gray-500 truncate">{item.category}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] font-extrabold text-[#4338CA]">
                        {item.price}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                        Ver local →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
