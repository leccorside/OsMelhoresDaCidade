'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { MapPlaceItem } from './DirectoryPlacesMap';

// Dynamic import do mapa Leaflet sem SSR para evitar erros de renderização no servidor
const DirectoryPlacesMap = dynamic(
  () => import('./DirectoryPlacesMap').then((mod) => mod.DirectoryPlacesMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[580px] rounded-3xl bg-[#EBF0EE] flex flex-col items-center justify-center p-6 text-gray-500 animate-pulse border border-gray-200">
        <span className="material-symbols-outlined text-[48px] text-[#FF3B4F] mb-2 animate-bounce">
          location_on
        </span>
        <span className="text-sm font-semibold text-[#1C1B1B]">Carregando mapa interativo...</span>
        <span className="text-xs text-gray-500 mt-1">Mapeando estabelecimentos de Caldas Novas</span>
      </div>
    ),
  }
);

export interface DirectoryPlacesClientProps {
  citySlug?: string;
  cityName?: string;
  initialCategory?: string;
  initialSearch?: string;
}

export function DirectoryPlacesClient({
  citySlug = 'caldas-novas',
  cityName = 'Caldas Novas',
  initialCategory = '',
  initialSearch = '',
}: DirectoryPlacesClientProps) {
  // Lista inicial de estabelecimentos com coordenadas reais de Caldas Novas
  const initialPlaces: MapPlaceItem[] = [
    {
      id: 'diroma-acqua-park',
      name: 'DiRoma Acqua Park',
      slug: 'diroma-acqua-park',
      category: 'Parques Aquáticos & Termas',
      price: 'R$ 110 - R$ 160',
      rating: 4.9,
      reviewsCount: 1820,
      lat: -17.7315,
      lng: -48.632,
      neighborhood: 'Solar de Caldas',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBL5Lt2hRfCCgCiFoYSU6-YWG4jxhqODLuqkq-NJiwyt0dADEp4Zo77yEWlRwTBE48I_9O6Dn4LBtyfb768F-5Kvu2W8xyXA0FKUaeK3oUF8HW2ywR-ovHLE--BOcH07Omqu4pkQ0iOrkrbWvuzGLWuaCPTJsqKVF7SoOM-szG1Wrf63rWxXTOq3mO5a1kgyu8RoJG84lWlgqAip6q6fpJYpC2WuDWRZisXExlRqP6u',
      isOpen: true,
    },
    {
      id: 'restaurante-nonna-mia',
      name: 'Restaurante Nonna Mia',
      slug: 'restaurante-nonna-mia',
      category: 'Restaurante',
      price: 'R$ 65 - R$ 120',
      rating: 4.9,
      reviewsCount: 940,
      lat: -17.742,
      lng: -48.625,
      neighborhood: 'Centro',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBZ2G8frowggGLN94bVj_jgzVU9dJGK6DA6ey_dcN-hh-5Cj2VXl62lAOyBBJqG3wL05Tz98OX-boe7hs7PK3w2guk0xexliX-HwBZU-GmbscQFIp-ZBKEOy7jGhj87lm7jZYkE-d4xAA85WUW0KqttxbeCFbY73n8pdtRf7UMPO-ps4erYpJ7o2RE3N41X573YiNxUQHcy9Q6NpehGyXG3R49hrTbk5Pcbr-Nv7NKM',
      isOpen: true,
    },
    {
      id: 'water-park-caldas-novas',
      name: 'Water Park Caldas Novas',
      slug: 'water-park-caldas-novas',
      category: 'Parques Aquáticos & Termas',
      price: 'R$ 90 - R$ 130',
      rating: 4.8,
      reviewsCount: 1200,
      lat: -17.7405,
      lng: -48.628,
      neighborhood: 'Setor Turista',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAOAVy8aEGUi97Jb4g4BtSHyDqe_FFCLW5lCE3Rucz6Ft-T7OnMzohK5nqZT-DKdfGjFXtdH6Sfg9HYdpEtTjyIvrzmqU-TCJA_1dbhVMiBn5RVZbD4J56ui61bNqnDZ7BexwaTKacOZfDmLtYvpRGfO-7oMyHLI09kSz_FIaEmAlqwCi0NN2PrsO5Ni99VAAfaLE-ayQpViWJwdYqvTt_zQ0QwChdSa8GFvIbZmrLN',
      isOpen: true,
    },
    {
      id: 'choperia-ipe-sertanejo-bar',
      name: 'Choperia Ipê & Sertanejo Bar',
      slug: 'choperia-ipe-sertanejo-bar',
      category: 'Bares & Pubs',
      price: 'R$ 40 - R$ 90',
      rating: 4.8,
      reviewsCount: 430,
      lat: -17.748,
      lng: -48.621,
      neighborhood: 'Setor Itanhangá',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDSKrQ4KwUbpWLawQYs66f7EeupgYmtyQymvzPRRSUGsj0EvPzcvXMw6SdnXi29_oT6v_p3HFxM_mA_kJjCds0logE4iHH0oFFiGkGCeNDStt8pvk_MeFK4Ib3l411cMK1gDft45oyRlD8CJmzqHWCj99uyQh57FTJe9FJCITUkG8JTPceCjJZ9YNgtXyqO37OZBSlgJEoOajk_ksxit8ZGmbZ5UdsgQqI9s8bAiQQ2',
      isOpen: true,
    },
    {
      id: 'empadao-goiano-da-tania',
      name: 'Empadão Goiano da Tânia',
      slug: 'empadao-goiano-da-tania',
      category: 'Restaurante',
      price: 'R$ 25 - R$ 45',
      rating: 4.9,
      reviewsCount: 650,
      lat: -17.741,
      lng: -48.627,
      neighborhood: 'Centro',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD-_wP9odi23LkZp-H1Mct_iEKEXCXMgYcnaawn9G0PqfuPNOeprqp00O0TmeYnGRjV3AZoVw299BIX1JjjY7N4471iaT09npVO0ciO4MQBdBO2T7j-KFVqfse0X-3csysN-UT5jj4uPK-JxLI3AeBcblR9M_3aIHljoFsfG8Y6oJmYf9gvbXowkfdvjpq-LulqJgt498Zh-AQys5ZVK25E5wy_xcE3y9ol62IjWy5x',
      isOpen: true,
    },
    {
      id: 'hot-park-parque-das-fontes',
      name: 'Hot Park & Parque das Fontes',
      slug: 'hot-park-parque-das-fontes',
      category: 'Turismo & Termas',
      price: 'R$ 190 - R$ 280',
      rating: 4.9,
      reviewsCount: 3400,
      lat: -17.778,
      lng: -48.761,
      neighborhood: 'Rio Quente / Caldas',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCxdBgIVh3ef8gijIiovkSuJh1yLoJo-AIcXtArueU5EF1V3GzB7VU2jtgoRoAFTZ_jO54ZL4rp0EmP04Sl8BlxLbG5GevET5uLW2lx9SOwYHsWylwRg6cFaKfsJYW-6wvr3ypQPmnFFH6ja5LOe6RngepuNk6LhF9D_-kleKDQNEibKoOorm84W6rWa-WyRgSLLTeybDvHqh4hZws1H4EpHAE5FMpiYe099PAQrJ6o',
      isOpen: true,
    },
    {
      id: 'pousada-termal-do-lago',
      name: 'Pousada Termal do Lago Corumbá',
      slug: 'pousada-termal-do-lago',
      category: 'Resorts & Pousadas',
      price: 'R$ 250 - R$ 480',
      rating: 4.9,
      reviewsCount: 890,
      lat: -17.755,
      lng: -48.595,
      neighborhood: 'Lago Corumbá',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDdBKw1Ta--MizDuHKhZdLgw9-Gh0pXr17IRQ3riXkHkdrHTUMRjydns5szX_2s2sE04We5A6iCE_o4Vkd2OKT7LloOVFyKVyr-xf170VR5R3AHJkwEoPaMO6sAB5ML-71Di7RwY9cxE0flt6ygzqzoclTCsZAAufzTUM6g97bJZ9iDsLapIfZobzEv3zw4N5B7BN-t69KVmYhR2k7VRsRRqqzyCfTU61xNomgixTpI',
      isOpen: true,
    },
    {
      id: 'clube-prive-caldas',
      name: 'Clube Privé Caldas Novas',
      slug: 'clube-prive-caldas',
      category: 'Parques Aquáticos & Termas',
      price: 'R$ 80 - R$ 120',
      rating: 4.7,
      reviewsCount: 910,
      lat: -17.739,
      lng: -48.6295,
      neighborhood: 'Bandeirantes',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuADE04srticTD_ZxLyD0d-nEbmNW1dBdw9UHj2txNRPez-hVnJJBt4VC1emiSom7qXmz5U3Yw74VXpNMnaqA-0SnAyPv-TL_OEZ4wkyQ9JZJk5OZzoOjc5LCY0Q73d2VaCO_iL4HKKtOtCvhYNEtBRUUSjr6EgCpBytamb_rVczkjJMDgYA6dmUIbmY0YqBx46Tp0HkiMp67Y_xjBT4u2p-79kjsiBxoDV_AEYU7l77',
      isOpen: true,
    },
  ];

  // ESTADOS PRINCIPAIS
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // Imagem 1: Alternar entre 2 colunas e linhas
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // ESTADOS DOS FILTROS (Imagem 3)
  const [searchKeyword, setSearchKeyword] = useState(initialSearch);
  const [selectedCategoryPill, setSelectedCategoryPill] = useState(initialCategory);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory === 'restaurantes' ? ['Restaurante'] : []
  );
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [searchRadius, setSearchRadius] = useState<number>(30); // 30 km / milhas
  const [minPrice, setMinPrice] = useState<number>(10);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [sortBy, setSortBy] = useState<string>('melhores');

  // Filtros rápidos
  const [filterOpenNow, setFilterOpenNow] = useState<boolean>(true);
  const [filterVerified, setFilterVerified] = useState<boolean>(true);
  const [filterReservations, setFilterReservations] = useState<boolean>(false);
  const [filterParking, setFilterParking] = useState<boolean>(false);

  // Estados de expansão dos accordions na barra de filtro
  const [keywordOpen, setKeywordOpen] = useState(true);
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [locationOpen, setLocationOpen] = useState(true);
  const [radiusOpen, setRadiusOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);

  // Estados "Ver Mais" dentro dos grupos de filtros
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [showMoreLocations, setShowMoreLocations] = useState(false);

  // Categorias disponíveis conforme imagem 3
  const filterCategories = [
    { label: 'Médico', count: 6 },
    { label: 'Evento', count: 5 },
    { label: 'GINÁSIO', count: 2 },
    { label: 'Museu', count: 3 },
    { label: 'Restaurante', count: 10 },
    { label: 'Parques Aquáticos & Termas', count: 14 },
    { label: 'Hotéis & Resorts', count: 18 },
    { label: 'Bares & Pubs', count: 8 },
  ];

  // Localizações / Bairros disponíveis conforme imagem 3
  const filterLocations = [
    { label: 'Centro', count: 12 },
    { label: 'Setor Turista', count: 9 },
    { label: 'Bairro do Turista', count: 8 },
    { label: 'Do Turista', count: 6 },
    { label: 'Bandeirantes', count: 5 },
    { label: 'Lago Corumbá', count: 4 },
  ];

  // Alternar seleção de categoria
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Alternar seleção de localização
  const toggleLocation = (loc: string) => {
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  // Limpar todos os filtros
  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedCategoryPill('');
    setSelectedCategories([]);
    setSelectedLocations([]);
    setSearchRadius(30);
    setMinPrice(10);
    setMaxPrice(500);
    setFilterOpenNow(false);
    setFilterVerified(false);
    setFilterReservations(false);
    setFilterParking(false);
    setSelectedPlaceId(null);
  };

  // Filtragem reativa
  const filteredPlaces = useMemo(() => {
    return initialPlaces.filter((place) => {
      // Busca por palavra-chave
      if (searchKeyword.trim()) {
        const query = searchKeyword.toLowerCase();
        const matchesName = place.name.toLowerCase().includes(query);
        const matchesCategory = place.category.toLowerCase().includes(query);
        const matchesNeighborhood = place.neighborhood.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesNeighborhood) return false;
      }

      // Pílula de categoria rápida
      if (selectedCategoryPill) {
        if (selectedCategoryPill === 'restaurantes' && !place.category.includes('Restaurante'))
          return false;
        if (
          selectedCategoryPill === 'atracoes' &&
          !place.category.includes('Parques') &&
          !place.category.includes('Termas')
        )
          return false;
        if (selectedCategoryPill === 'bares' && !place.category.includes('Bares')) return false;
        if (selectedCategoryPill === 'hospedagem' && !place.category.includes('Pousadas'))
          return false;
      }

      // Categorias marcadas nos checkboxes
      if (selectedCategories.length > 0) {
        const matchesAnyCategory = selectedCategories.some((cat) =>
          place.category.toLowerCase().includes(cat.toLowerCase())
        );
        if (!matchesAnyCategory) return false;
      }

      // Bairros marcados nos checkboxes
      if (selectedLocations.length > 0) {
        const matchesAnyLocation = selectedLocations.some((loc) =>
          place.neighborhood.toLowerCase().includes(loc.toLowerCase())
        );
        if (!matchesAnyLocation) return false;
      }

      // Aberto agora
      if (filterOpenNow && !place.isOpen) return false;

      return true;
    });
  }, [
    initialPlaces,
    searchKeyword,
    selectedCategoryPill,
    selectedCategories,
    selectedLocations,
    filterOpenNow,
  ]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="w-full bg-[#FCF9F8] min-h-screen">
      {/* 1. BARRA SUPERIOR DE SUB-HEADER / CONTROLES RÁPIDOS */}
      <section className="w-full bg-white border-b border-[#E5E7EB] py-3.5 px-4 sm:px-6 lg:px-10 sticky top-[120px] z-20 shadow-xs">
        <div className="max-w-[1720px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Breadcrumb & Título */}
          <div className="w-full lg:w-auto">
            <Breadcrumbs
              items={[
                { label: cityName, href: `/${citySlug}` },
                { label: 'Lugares e Estabelecimentos' },
              ]}
              className="text-xs text-gray-500"
            />
          </div>

          {/* Quick Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 text-xs font-semibold">
            {[
              { label: 'Todos (42)', slug: '' },
              { label: 'Parques Aquáticos', slug: 'atracoes', icon: 'pool' },
              { label: 'Restaurantes & Gastronomia', slug: 'restaurantes', icon: 'restaurant' },
              { label: 'Bares & Chopp', slug: 'bares', icon: 'sports_bar' },
              { label: 'Resorts & Pousadas', slug: 'hospedagem', icon: 'hotel' },
            ].map((cat) => {
              const active = selectedCategoryPill === cat.slug;
              return (
                <button
                  key={cat.label}
                  onClick={() => setSelectedCategoryPill(cat.slug)}
                  className={`px-3.5 py-1.5 rounded-full shrink-0 transition-all flex items-center gap-1.5 shadow-xs ${
                    active
                      ? 'bg-[#1C1B1B] text-white shadow-sm'
                      : 'bg-[#F6F3F2] text-[#1C1B1B] hover:bg-gray-200'
                  }`}
                >
                  {cat.icon && (
                    <span className="material-symbols-outlined text-[15px] text-[#FF3B4F]">
                      {cat.icon}
                    </span>
                  )}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Contagem, Ordenação e Botões de Visualização (Imagem 1) */}
          <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto ml-auto">
            <span className="text-xs text-gray-500 hidden sm:inline">
              <strong className="text-[#1C1B1B] font-bold">{filteredPlaces.length}</strong> locais
            </span>

            {/* Select Ordenação */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#F6F3F2] text-xs font-semibold text-[#1C1B1B] border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#FF3B4F] cursor-pointer"
            >
              <option value="melhores">Mais bem avaliados</option>
              <option value="populares">Mais populares</option>
              <option value="menor_preco">Menor preço</option>
              <option value="recentes">Mais recentes</option>
            </select>

            {/* BOTÕES DE ALTERNAR ENTRE LINHAS E COLUNAS (Exatamente como na Imagem 1) */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Botão Linhas / Lista */}
              <button
                onClick={() => setViewMode('list')}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  viewMode === 'list'
                    ? 'bg-[#FF3B4F] text-white shadow-sm border border-[#FF3B4F]'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                title="Visualização em Lista / Linhas"
                aria-label="Visualização em Linhas"
              >
                {/* Ícone de 3 linhas com bullets conforme imagem 1 */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="9" y1="6" x2="20" y2="6"></line>
                  <line x1="9" y1="12" x2="20" y2="12"></line>
                  <line x1="9" y1="18" x2="20" y2="18"></line>
                  <circle cx="4" cy="6" r="1.5" fill="currentColor"></circle>
                  <circle cx="4" cy="12" r="1.5" fill="currentColor"></circle>
                  <circle cx="4" cy="18" r="1.5" fill="currentColor"></circle>
                </svg>
              </button>

              {/* Botão Grade / 2 Colunas */}
              <button
                onClick={() => setViewMode('grid')}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#FF3B4F] text-white shadow-sm border border-[#FF3B4F]'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                title="Visualização em Grade (2 Colunas)"
                aria-label="Visualização em Grade"
              >
                {/* Ícone de 4 quadradinhos conforme imagem 1 */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
                  <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
                  <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
                  <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LAYOUT SPLIT EM 3 COLUNAS PRINCIPAIS */}
      <main className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ========================================================= */}
          {/* COLUNA 1: SIDEBAR DE FILTROS REFINADOS (Imagem 3)         */}
          {/* ========================================================= */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-[180px] bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Título "Filtro" com indicador vermelho */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-extrabold text-[#1C1B1B] tracking-tight">Filtro</h3>
                  <div className="w-8 h-0.5 bg-[#FF3B4F] mt-1 rounded-full" />
                </div>
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-[#FF3B4F] hover:underline"
                >
                  Limpar
                </button>
              </div>

              {/* 1. Palavra-chave */}
              <div className="space-y-2 border-b border-gray-100 pb-5">
                <div
                  onClick={() => setKeywordOpen(!keywordOpen)}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <span className="text-xs font-bold text-[#1C1B1B] group-hover:text-[#FF3B4F] transition-colors">
                    Palavra-chave
                  </span>
                  <span
                    className={`material-symbols-outlined text-[18px] text-[#FF3B4F] transition-transform ${
                      keywordOpen ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </div>

                {keywordOpen && (
                  <div className="relative mt-2">
                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      placeholder="Pesquisar..."
                      className="w-full pl-3.5 pr-9 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-[#1C1B1B] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FF3B4F]"
                    />
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                      search
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Categoria */}
              <div className="space-y-2 border-b border-gray-100 pb-5">
                <div
                  onClick={() => setCategoryOpen(!categoryOpen)}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <span className="text-xs font-bold text-[#1C1B1B] group-hover:text-[#FF3B4F] transition-colors">
                    Categoria
                  </span>
                  <span
                    className={`material-symbols-outlined text-[18px] text-[#FF3B4F] transition-transform ${
                      categoryOpen ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </div>

                {categoryOpen && (
                  <div className="space-y-2.5 pt-1">
                    {filterCategories
                      .slice(0, showMoreCategories ? filterCategories.length : 5)
                      .map((cat) => {
                        const checked = selectedCategories.includes(cat.label);
                        return (
                          <label
                            key={cat.label}
                            className="flex items-center justify-between text-xs text-gray-700 hover:text-[#1C1B1B] cursor-pointer select-none group"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleCategory(cat.label)}
                                className="w-4 h-4 rounded text-[#FF3B4F] accent-[#FF3B4F] cursor-pointer"
                              />
                              <span className="font-medium group-hover:text-[#FF3B4F] transition-colors">
                                {cat.label}{' '}
                                <span className="text-gray-400 font-normal">({cat.count})</span>
                              </span>
                            </div>
                            <span className="text-gray-400 text-xs font-bold hover:text-[#FF3B4F]">
                              +
                            </span>
                          </label>
                        );
                      })}

                    <button
                      onClick={() => setShowMoreCategories(!showMoreCategories)}
                      className="text-[11px] font-bold text-[#4338CA] hover:text-[#3730A3] pt-1 block"
                    >
                      {showMoreCategories ? '˄ Menos' : '˅ Mais'}
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Localização */}
              <div className="space-y-2 border-b border-gray-100 pb-5">
                <div
                  onClick={() => setLocationOpen(!locationOpen)}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <span className="text-xs font-bold text-[#1C1B1B] group-hover:text-[#FF3B4F] transition-colors">
                    Localização
                  </span>
                  <span
                    className={`material-symbols-outlined text-[18px] text-[#FF3B4F] transition-transform ${
                      locationOpen ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </div>

                {locationOpen && (
                  <div className="space-y-2.5 pt-1">
                    {filterLocations
                      .slice(0, showMoreLocations ? filterLocations.length : 5)
                      .map((loc) => {
                        const checked = selectedLocations.includes(loc.label);
                        return (
                          <label
                            key={loc.label}
                            className="flex items-center justify-between text-xs text-gray-700 hover:text-[#1C1B1B] cursor-pointer select-none group"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleLocation(loc.label)}
                                className="w-4 h-4 rounded text-[#FF3B4F] accent-[#FF3B4F] cursor-pointer"
                              />
                              <span className="font-medium group-hover:text-[#FF3B4F] transition-colors">
                                {loc.label}{' '}
                                <span className="text-gray-400 font-normal">({loc.count})</span>
                              </span>
                            </div>
                          </label>
                        );
                      })}

                    <button
                      onClick={() => setShowMoreLocations(!showMoreLocations)}
                      className="text-[11px] font-bold text-[#4338CA] hover:text-[#3730A3] pt-1 block"
                    >
                      {showMoreLocations ? '˄ Menos' : '˅ Mais'}
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Raio Pesquisar */}
              <div className="space-y-3 border-b border-gray-100 pb-5">
                <div className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-1.5">
                    <span
                      onClick={() => setRadiusOpen(!radiusOpen)}
                      className="text-xs font-bold text-[#1C1B1B]"
                    >
                      Raio Pesquisar
                    </span>
                    <button
                      onClick={() => setSearchRadius(30)}
                      title="Resetar Raio"
                      className="text-gray-400 hover:text-[#FF3B4F]"
                    >
                      <span className="material-symbols-outlined text-[14px]">rotate_left</span>
                    </button>
                  </div>
                  <span
                    onClick={() => setRadiusOpen(!radiusOpen)}
                    className={`material-symbols-outlined text-[18px] text-[#FF3B4F] transition-transform ${
                      radiusOpen ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </div>

                {radiusOpen && (
                  <div className="space-y-3 pt-1">
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value="Caldas Novas, GO"
                        className="w-full pl-3 pr-8 py-2 rounded-xl bg-white border border-gray-200 text-xs text-[#1C1B1B] cursor-pointer"
                      />
                      <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-[18px]">
                        near_me
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-[#1C1B1B] font-semibold">
                        <span>Raio ({searchRadius} km)</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={searchRadius}
                        onChange={(e) => setSearchRadius(Number(e.target.value))}
                        className="w-full accent-[#FF3B4F] cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Faixa de Preço */}
              <div className="space-y-3 pb-2">
                <div className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-1.5">
                    <span
                      onClick={() => setPriceOpen(!priceOpen)}
                      className="text-xs font-bold text-[#1C1B1B]"
                    >
                      Faixa de preço
                    </span>
                    <button
                      onClick={() => {
                        setMinPrice(10);
                        setMaxPrice(500);
                      }}
                      title="Resetar Preço"
                      className="text-gray-400 hover:text-[#FF3B4F]"
                    >
                      <span className="material-symbols-outlined text-[14px]">rotate_left</span>
                    </button>
                  </div>
                  <span
                    onClick={() => setPriceOpen(!priceOpen)}
                    className={`material-symbols-outlined text-[18px] text-[#FF3B4F] transition-transform ${
                      priceOpen ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </div>

                {priceOpen && (
                  <div className="space-y-3 pt-1">
                    {/* Linha indicativa com nós circulares */}
                    <div className="relative flex items-center pt-2 pb-1">
                      <div className="h-1 w-full bg-[#FF3B4F] rounded-full" />
                      <div className="absolute left-0 w-3 h-3 rounded-full bg-white border-2 border-blue-600 shadow-sm" />
                      <div className="absolute right-0 w-3 h-3 rounded-full bg-white border-2 border-blue-600 shadow-sm" />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-[#1C1B1B] text-center font-bold focus:outline-none focus:ring-1 focus:ring-[#FF3B4F]"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-[#1C1B1B] text-center font-bold focus:outline-none focus:ring-1 focus:ring-[#FF3B4F]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Filtros Rápidos (Toggles) */}
              <div className="pt-4 border-t border-gray-100 space-y-2.5">
                <label className="flex items-center justify-between text-xs text-gray-700 cursor-pointer">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Aberto Agora
                  </span>
                  <input
                    type="checkbox"
                    checked={filterOpenNow}
                    onChange={(e) => setFilterOpenNow(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FF3B4F] accent-[#FF3B4F] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-gray-700 cursor-pointer">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="material-symbols-outlined text-[16px] text-amber-500">
                      verified
                    </span>
                    Destaque Verificado
                  </span>
                  <input
                    type="checkbox"
                    checked={filterVerified}
                    onChange={(e) => setFilterVerified(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FF3B4F] accent-[#FF3B4F] cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </aside>

          {/* ========================================================= */}
          {/* COLUNA 2: LISTAGEM DE LUGARES (2 Colunas em Grid ou Linhas)*/}
          {/* ========================================================= */}
          <section className="col-span-1 lg:col-span-9 xl:col-span-5 flex flex-col space-y-5">
            {/* Chips de Filtros Ativos */}
            <div className="flex items-center flex-wrap gap-2 text-xs">
              <span className="text-gray-500 font-medium">Filtros ativos:</span>
              <span className="px-2.5 py-1 rounded-full bg-[#F6F3F2] text-[#1C1B1B] font-semibold">
                {cityName}
              </span>
              {filterOpenNow && (
                <span className="px-2.5 py-1 rounded-full bg-[#F6F3F2] text-[#1C1B1B] font-semibold flex items-center gap-1">
                  Aberto Agora
                  <button onClick={() => setFilterOpenNow(false)} className="hover:text-[#FF3B4F]">
                    ×
                  </button>
                </span>
              )}
              {selectedCategories.map((c) => (
                <span
                  key={c}
                  className="px-2.5 py-1 rounded-full bg-red-50 text-[#FF3B4F] font-bold flex items-center gap-1 border border-red-100"
                >
                  {c}
                  <button onClick={() => toggleCategory(c)} className="hover:text-red-800">
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* CONTAINER DE CARDS: 2 COLUNAS QUANDO GRID, LINHAS QUANDO LIST */}
            {filteredPlaces.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm">
                <span className="material-symbols-outlined text-[48px] text-gray-300 mb-2">
                  search_off
                </span>
                <h4 className="text-base font-bold text-[#1C1B1B]">
                  Nenhum estabelecimento encontrado
                </h4>
                <p className="text-xs text-gray-500 mt-1 mb-4">
                  Tente ajustar os filtros ou pesquisar por outro termo.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-full bg-[#FF3B4F] text-white text-xs font-bold hover:bg-[#D91F35] transition"
                >
                  Limpar todos os filtros
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-5' // 2 COLUNAS DE LUGARES
                    : 'flex flex-col gap-4' // LINHAS HORIZONTAIS
                }
              >
                {filteredPlaces.map((place) => {
                  const isSelected = selectedPlaceId === place.id;
                  const isFavorited = !!favorites[place.id];

                  if (viewMode === 'list') {
                    // LAYOUT HORIZONTAL (LINHAS)
                    return (
                      <article
                        key={place.id}
                        onMouseEnter={() => setSelectedPlaceId(place.id)}
                        className={`group relative bg-white rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col sm:flex-row hover:shadow-lg ${
                          isSelected
                            ? 'border-[#FF3B4F] ring-2 ring-[#FF3B4F]/20'
                            : 'border-gray-200'
                        }`}
                      >
                        {/* Imagem à esquerda */}
                        <div className="relative w-full sm:w-5/12 h-44 sm:h-auto overflow-hidden shrink-0">
                          <Image
                            src={place.image}
                            alt={place.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="300px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                          {/* Badge de Destaque */}
                          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold flex items-center gap-1 shadow-xs">
                              <span className="material-symbols-outlined text-[12px]">star</span>
                              Destaque
                            </span>
                            {place.isOpen && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-600 text-white font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                Aberto
                              </span>
                            )}
                          </div>

                          {/* Favorito */}
                          <button
                            onClick={(e) => toggleFavorite(place.id, e)}
                            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/85 text-gray-600 hover:text-[#FF3B4F] flex items-center justify-center shadow-xs"
                          >
                            <span
                              className="material-symbols-outlined text-[16px]"
                              style={{
                                fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0",
                              }}
                            >
                              favorite
                            </span>
                          </button>

                          <span className="absolute bottom-2 left-2 text-[11px] font-semibold text-white flex items-center gap-1 drop-shadow-md">
                            <span className="material-symbols-outlined text-[13px]">
                              location_on
                            </span>
                            {place.neighborhood}
                          </span>
                        </div>

                        {/* Conteúdo à direita */}
                        <div className="p-4 flex flex-col justify-between flex-1">
                          <div>
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span className="font-semibold text-[#FF3B4F]">{place.category}</span>
                              <span className="font-bold text-[#4338CA]">{place.price}</span>
                            </div>

                            <Link href={`/${citySlug}/lugar/${place.slug}`}>
                              <h3 className="text-sm font-bold text-[#1C1B1B] hover:text-[#FF3B4F] transition-colors leading-snug">
                                {place.name}
                              </h3>
                            </Link>

                            <div className="flex items-center gap-1 text-xs mt-1.5">
                              <span
                                className="material-symbols-outlined text-[15px] text-amber-500"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                star
                              </span>
                              <span className="font-bold text-[#1C1B1B]">{place.rating}</span>
                              <span className="text-gray-400">({place.reviewsCount} avaliações)</span>
                            </div>
                          </div>

                          <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[11px] text-gray-500">Caldas Novas, GO</span>
                            <Link
                              href={`/${citySlug}/lugar/${place.slug}`}
                              className="px-3.5 py-1.5 rounded-full bg-[#1C1B1B] hover:bg-[#FF3B4F] text-white text-xs font-bold transition-colors"
                            >
                              Ver detalhes
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  }

                  // LAYOUT EM GRADE (2 COLUNAS)
                  return (
                    <article
                      key={place.id}
                      onMouseEnter={() => setSelectedPlaceId(place.id)}
                      className={`group relative bg-white rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col hover:shadow-lg ${
                        isSelected
                          ? 'border-[#FF3B4F] ring-2 ring-[#FF3B4F]/20'
                          : 'border-gray-200'
                      }`}
                    >
                      {/* Imagem do Card */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                        <Image
                          src={place.image}
                          alt={place.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 300px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                        {/* Badges superiores */}
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold flex items-center gap-1 shadow-xs">
                            <span className="material-symbols-outlined text-[12px]">star</span>
                            Destaque
                          </span>
                          {place.isOpen && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-600 text-white font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              Aberto
                            </span>
                          )}
                        </div>

                        {/* Botão Favoritar */}
                        <button
                          onClick={(e) => toggleFavorite(place.id, e)}
                          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/85 text-gray-600 hover:text-[#FF3B4F] flex items-center justify-center shadow-xs transition-colors"
                        >
                          <span
                            className="material-symbols-outlined text-[16px]"
                            style={{ fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            favorite
                          </span>
                        </button>

                        <span className="absolute bottom-2 left-2 text-[11px] font-semibold text-white flex items-center gap-1 drop-shadow-md">
                          <span className="material-symbols-outlined text-[13px]">location_on</span>
                          {place.neighborhood}
                        </span>
                      </div>

                      {/* Informações do Card */}
                      <div className="p-3.5 flex flex-col justify-between flex-1">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                            <span className="font-semibold text-[#FF3B4F] truncate max-w-[130px]">
                              {place.category}
                            </span>
                            <span className="font-bold text-[#4338CA] shrink-0">{place.price}</span>
                          </div>

                          <Link href={`/${citySlug}/lugar/${place.slug}`}>
                            <h3 className="text-xs font-bold text-[#1C1B1B] hover:text-[#FF3B4F] transition-colors leading-snug line-clamp-1">
                              {place.name}
                            </h3>
                          </Link>

                          <div className="flex items-center gap-1 text-xs mt-1">
                            <span
                              className="material-symbols-outlined text-[14px] text-amber-500"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              star
                            </span>
                            <span className="font-bold text-[#1C1B1B] text-xs">{place.rating}</span>
                            <span className="text-gray-400 text-[11px]">
                              ({place.reviewsCount})
                            </span>
                          </div>
                        </div>

                        <div className="pt-2.5 mt-2.5 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-[11px] text-gray-400">Verificado</span>
                          <Link
                            href={`/${citySlug}/lugar/${place.slug}`}
                            className="text-xs font-bold text-[#FF3B4F] hover:text-[#D91F35] flex items-center gap-0.5"
                          >
                            Detalhes
                            <span className="material-symbols-outlined text-[13px]">
                              chevron_right
                            </span>
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* ========================================================= */}
          {/* COLUNA 3: MAPA COM OS MARCADORES AO LADO DIREITO (Imagem 2)*/}
          {/* ========================================================= */}
          <aside className="col-span-1 lg:col-span-12 xl:col-span-4 relative">
            <div className="sticky top-[180px] w-full h-[calc(100vh-200px)] min-h-[580px]">
              <DirectoryPlacesMap
                places={filteredPlaces}
                selectedPlaceId={selectedPlaceId}
                onSelectPlace={(id) => setSelectedPlaceId(id)}
                citySlug={citySlug}
              />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

