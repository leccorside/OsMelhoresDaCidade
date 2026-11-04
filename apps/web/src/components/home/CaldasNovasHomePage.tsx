'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export function CaldasNovasHomePage() {
  const router = useRouter();

  // Estados interativos
  const [selectedPlaceFilter, setSelectedPlaceFilter] = useState<'todos' | 'termas' | 'sabores'>('todos');
  const [selectedEventFilter, setSelectedEventFilter] = useState<'hoje' | 'amanha' | 'semana' | 'fim-semana' | 'todos'>('fim-semana');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');

  const toggleFavorite = (id: string) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('cat', selectedCategory);
    if (selectedNeighborhood) params.set('bairro', selectedNeighborhood);
    router.push(`/caldas-novas/lugares?${params.toString()}`);
  };

  const places = [
    {
      id: 'diroma-acqua-park',
      name: 'DiRoma Acqua Park',
      category: 'Parques Aquáticos & Termas',
      type: 'termas',
      tag: 'Destaque Ouro',
      tagIcon: 'star',
      tagClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
      hours: 'Aberto até 18:00',
      hoursActive: true,
      neighborhood: 'Bairro do Turista',
      rating: 4.9,
      reviewsCount: '1.820',
      description: 'Complexo monumental de lazer com toboáguas radicais, piscina de ondas termais, grutas relaxantes e infraestrutura premium para todas as idades.',
      price: '$$$ • Termas & Lazer',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjouixm8b4fhFv_5etvk4_NCQhDo9Lu0IuTEpe3xXo_tabMy1lrwgEVL7ZhmcY96zZ3q0aD3zEYuT_byiqUjgXd_LJFi-DfYTP7FrbKmgYhvJuTX5f966obQiZJXllJw-rFW18pRJe0h-tX_wPk3NsKlmv3iaILC2eV44Lmhoxyc8rwCuBjPIfjATiZiwv6vzOG91m3z1w6iDTAg2t35Ll3JWiFDT8BDtPKrPBZxlu',
      slug: 'diroma-acqua-park',
    },
    {
      id: 'restaurante-nonna-mia',
      name: 'Restaurante Nonna Mia',
      category: 'Italiano & Goiano',
      type: 'sabores',
      hours: 'Aberto agora',
      hoursActive: true,
      neighborhood: 'Centro',
      rating: 4.8,
      reviewsCount: '940',
      description: 'O lendário Galeto al Primo Canto, massas frescas caseiras, sopa de capeletti e saboroso casamento entre Itália e as delícias do Centro-Oeste.',
      price: '$$ • Carta de Vinhos',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMLBLce-jLqPZrWUnmaIMpvljt5pFDXPc02IPQMaEj3yY-JEL-42qNaQpCi1tRFx5DjIYVaKw3UZuO_iBDxCx8E1Q2mqfklVtp5NAPCLg0AHcQ5uvjIijKvhBrlw-WVWFdzQDjkdjFP_fyrLwqTis6_Mpv3reiJGWU98BFQPyulbnQKr6hSHnHncgqT68nmSo-vmNbnmecqHDbut0ytVlY_J2OSeW04CzuVtCxPJ4A',
      slug: 'restaurante-nonna-mia',
    },
    {
      id: 'water-park',
      name: 'Water Park Caldas Novas',
      category: 'Parques & Lazer',
      type: 'termas',
      hours: 'Aberto agora',
      hoursActive: true,
      neighborhood: 'Setor Turista',
      rating: 4.8,
      reviewsCount: '1.200',
      description: 'Mega piscina de ondas quentes, toboáguas emocionantes, área infantil tematizada e gastronomia completa no coração turístico.',
      price: '$$$ • Família & Crianças',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOAVy8aEGUi97Jb4g4BtSHyDqe_FFCLW5lCE3Rucz6Ft-T7OnMzohK5nqZT-DKdfGjFXtdH6Sfg9HYdpEtTjyIvrzmqU-TCJA_1dbhVMiBn5RVZbD4J56ui61bNqnDZ7BexwaTKacOZfDmLtYvpRGfO-7oMyHLI09kSz_FIaEmAlqwCi0NN2PrsO5Ni99VAAfaLE-ayQpViWJwdYqvTt_zQ0QwChdSa8GFvIbZmrLN',
      slug: 'water-park-caldas-novas',
    },
    {
      id: 'empadao-goiano-tania',
      name: 'Empadão Goiano da Tânia',
      category: 'Gastronomia Típica',
      type: 'sabores',
      tag: 'Patrimônio Típico',
      tagIcon: 'local_fire_department',
      tagClass: 'bg-primary-fixed text-primary',
      neighborhood: 'Centro',
      rating: 4.9,
      reviewsCount: '650',
      description: 'Receita centenária com frango caipira, queijo curado, pequi selecionado e massa artesanal que derrete na boca. Parada gastronômica obrigatória.',
      price: '$ • Prato Típico',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-_wP9odi23LkZp-H1Mct_iEKEXCXMgYcnaawn9G0PqfuPNOeprqp00O0TmeYnGRjV3AZoVw299BIX1JjjY7N4471iaT09npVO0ciO4MQBdBO2T7j-KFVqfse0X-3csysN-UT5jj4uPK-JxLI3AeBcblR9M_3aIHljoFsfG8Y6oJmYf9gvbXowkfdvjpq-LulqJgt498Zh-AQys5ZVK25E5wy_xcE3y9ol62IjWy5x',
      slug: 'empadao-goiano-da-tania',
    },
    {
      id: 'hot-park',
      name: 'Hot Park & Parque das Fontes',
      category: 'Turismo & Termas',
      type: 'termas',
      tag: 'Experiência Imperdível',
      tagIcon: 'auto_awesome',
      tagClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
      neighborhood: 'Rio Quente / Arredores',
      rating: 4.9,
      reviewsCount: '3.400',
      description: 'A única praia de águas quentes correntes do planeta, nascentes termais puras com temperatura natural de até 37,5°C e mega atrações.',
      price: '$$$$ • Internacional',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv1XR7CGNsW48oOy-k0I1bNRxlwsy2iiy-4II9tNHjXpXvntolGr0S1J9gpIMtjJ9dF0_62jDSpNYezYRmEkkDYuCn_n_vndUqEqkdShfTUShBeMfvIjNRa2R93yZvX14DNjKd-tdNalQlOrnZDVeMIVNe7iBlk-BnQg5Nza3Em7r4k_QPFKybPrKdwjNvYaMLifFrXXLBgjsWH9qPf2O6E-nkgQHuHHrTsc9upmEB',
      slug: 'hot-park-parque-das-fontes',
    },
    {
      id: 'choperia-ipe',
      name: 'Choperia Ipê & Sertanejo Bar',
      category: 'Bares & Pubs',
      type: 'sabores',
      hours: 'Abre às 18:00',
      hoursActive: false,
      neighborhood: 'Setor Itanhangá',
      rating: 4.7,
      reviewsCount: '430',
      description: 'Música sertaneja ao vivo todos os finais de semana, torres de chopp trincando de gelado e porções generosas de picanha na chapa com mandioca frita.',
      price: '$$ • Música ao Vivo',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMVOx74KPzOPhVeD2hLjcPiKPDe4dYOMECZQzQhd1LKFLw4jpIYL5pu5oIUazGHkJ0mAVXuGkcDlUnJI99joQQINqGBD8WqiAiuHi6SRYDrfi7TPeSI7LpKDvJpx13rtZYSYavbBViK7rlZrYZGesxQCJANcJKlSezngIi53t6idpGmrqUBOLsbJk2SWqnjiqBLmD8N62uOIEj_r2TM2Hmue1MZ3jnQRDtS9IDz7G9',
      slug: 'choperia-ipe-sertanejo-bar',
    },
  ];

  const filteredPlaces = places.filter(place => {
    if (selectedPlaceFilter === 'termas') return place.type === 'termas';
    if (selectedPlaceFilter === 'sabores') return place.type === 'sabores';
    return true;
  });

  const events = [
    {
      id: 'caldas-country',
      dateDay: '14',
      dateMonth: 'NOV',
      isPaid: true,
      category: 'Sertanejo & Festivais',
      name: 'Festival Caldas Country Show',
      description: 'O maior festival sertanejo do Brasil reunindo os maiores artistas nacionais em 3 noites inesquecíveis.',
      location: 'Arena Caldas',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBT9E-aEblhKFYMHGnPnGVb7TToBInZpDUxgt5vgNuY2_fqf5E3g8fEGLtqYXDOehmDg90Q3flzGe0T6oH0qczh643E5s05AvE8WU1sAHOmjh76vEmuLcTQQMoYVJa91HSUrKlU7BnUazl1fqPO4bVWsDzNbAi2XRSdZJVSwsfhmssYCcV5W-ugI2daVrzbfPie1xft4z0nSDrussT4Pc7oRLHjotRXovUysXXFURFv',
      cta: 'Ingressos →',
      slug: 'festival-caldas-country-show',
    },
    {
      id: 'jazz-termas',
      dateDay: 'SÁB',
      dateMonth: '20h',
      isPaid: false,
      category: 'Música & Gastronomia',
      name: 'Noite das Águas Termais & Jazz',
      description: 'Encontro intimista ao luar com repertório de bossa nova e jazz à beira da lagoa aquecida.',
      location: 'Deck Lagoa Quente',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdBKw1Ta--MizDuHKhZdLgw9-Gh0pXr17IRQ3riXkHkdrHTUMRjydns5szX_2s2sE04We5A6iCE_o4Vkd2OKT7LloOVFyKVyr-xf170VR5R3AHJkwEoPaMO6sAB5ML-71Di7RwY9cxE0flt6ygzqzoclTCsZAAufzTUM6g97bJZ9iDsLapIfZobzEv3zw4N5B7BN-t69KVmYhR2k7VRsRRqqzyCfTU61xNomgixTpI',
      cta: 'Ver local →',
      slug: 'noite-aguas-termais-jazz',
    },
    {
      id: 'feira-sabores',
      dateDay: 'DOM',
      dateMonth: '09h',
      isPaid: false,
      category: 'Feiras Culturais',
      name: 'Feira de Sabores & Artesanato',
      description: 'Doces cristalizados, licores tradicionais de pequi, cerâmica goiana e comidas típicas preparadas na hora.',
      location: 'Praça Mestre Orlando',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA03pujhn1KxE5PDZi52wBxeY8XA1s8RFDaGWJRrocIxRyqe86nWdZ3l4JpWIhL2avbk-rzB-maD14RySiasY2QNtYMxZNnjgRP1JVt4iFux3xOKyF7Y6ZdI2Rzlc9LxNvNz1NAHmt38C9f3jVchqYZEulHQ1ZJ8XHhR33GbGnthawLvxIUqTMbIfutdWimr2_urbxD-cvFy2gV1ZwX36nkluk4gEFZnJn10_wgs4Cl',
      cta: 'Ver feira →',
      slug: 'feira-de-sabores-artesanato',
    },
    {
      id: 'sunset-termal',
      dateDay: 'SEX',
      dateMonth: '17h',
      isPaid: true,
      category: 'Festas & Sunset',
      name: 'Sunset Termal com DJ',
      description: 'Fim de tarde com vista deslumbrante do lago, drinks tropicais exclusivos e seleção de house e brasilidades.',
      location: 'Náutico Praia Clube',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVmXf-BOMY-x8pSVqxlhBobRZZKWaOp2Fr8nBmSv8WGYGcYqqr33d3a492NnnmdPADYhG-AgdAPbLkVzUTh5uk4n83VyqMRIU7lHH6Ynrhx5calOl1nyu4DVQrHImaSgaJrrLuX5uCJCXihKy-lDh6l3vp0V8qAzOYwzK1UUfhEPyrzsr16wArvfkUqg1RnLwEXE-OTPQfYE1qEk3MEAWdzvVKlb_w5BmY491Uy1up',
      cta: 'Ingressos →',
      slug: 'sunset-termal-dj',
    },
  ];

  return (
    <div className="bg-[#FCF9F8] text-[#1C1B1B] font-sans antialiased min-h-screen flex flex-col">
      <Header currentCitySlug="caldas-novas" currentCityName="Caldas Novas" currentCityUf="GO" showCityPill={true} />

      <main className="w-full bg-[#FCF9F8] min-h-screen flex-1">
        <div className="flex flex-col w-full">
          {/* 6.1 HERO PRINCIPAL */}
          <section className="relative w-full bg-[#313030] overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-40 scale-105 transition-transform duration-1000 ease-out"
              style={{
                backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuADE04srticTD_ZxLyD0d-nEbmNW1dBdw9UHj2txNRPez-hVnJJBt4VC1emiSom7qXmz5U3Yw74VXpNMnaqA-0SnAyPv-TL_OEZ4wkyQ9JZJk5OZzoOjc5LCY0Q73d2VaCO_iL4HKKtOtCvhYNEtBRUUSjr6EgCpBytamb_rVczkjJMDgYA6dmUIbmY0YqBx46Tp0HkiMp67Y_xjBT4u2p-79kjsiBxoDV_AEYU7l77')"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#313030]/85 via-[#313030]/70 to-[#313030]/95" />

            <div className="relative max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-28 md:pt-20 md:pb-36 flex flex-col items-center text-center">
              {/* Badge de Cidade */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-[#F3F0EF] text-[12px] font-semibold shadow-sm mb-6">
                <span className="text-lg">🌴</span>
                <span className="tracking-wide uppercase text-[11px] font-bold">O GUIA DEFINITIVO DA MAIOR ESTÂNCIA HIDROTERMAL DO MUNDO</span>
              </div>

              {/* Título & Subtítulo */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-[#F3F0EF] max-w-4xl tracking-tight mb-4 leading-tight">
                Descubra Caldas Novas
              </h1>
              <p className="text-base sm:text-[18px] text-[#E5E2E1] max-w-2xl mb-10 leading-relaxed font-normal">
                Os melhores lugares, eventos imperdíveis e experiências gastronômicas da capital das águas termais estão reunidos aqui.
              </p>

              {/* Barra de Busca Inteligente Segmentada */}
              <form onSubmit={handleSearch} className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-2 md:p-3 flex flex-col md:flex-row items-stretch gap-2">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-[#F6F3F2]/60 rounded-xl">
                  <span className="material-symbols-outlined text-[22px] text-[#FF3B4F] shrink-0">search</span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-[#1C1B1B] text-[14px] placeholder:text-gray-400 focus:outline-none"
                    placeholder="O que você procura? (Ex: Parques termais, empadão, bares...)"
                    type="text"
                  />
                </div>
                <div className="w-full md:w-56 flex items-center gap-2 px-4 py-3 bg-[#F6F3F2]/60 rounded-xl">
                  <span className="material-symbols-outlined text-[20px] text-gray-500 shrink-0">category</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-transparent text-[#1C1B1B] text-[13px] focus:outline-none cursor-pointer"
                  >
                    <option value="">Todas Categorias</option>
                    <option value="termas">Parques & Termas</option>
                    <option value="gastronomia">Gastronomia Típica</option>
                    <option value="resorts">Hotéis & Resorts</option>
                    <option value="bares">Bares & Sertanejo</option>
                    <option value="ecoturismo">Ecoturismo</option>
                  </select>
                </div>
                <div className="w-full md:w-56 flex items-center gap-2 px-4 py-3 bg-[#F6F3F2]/60 rounded-xl">
                  <span className="material-symbols-outlined text-[20px] text-gray-500 shrink-0">near_me</span>
                  <select
                    value={selectedNeighborhood}
                    onChange={(e) => setSelectedNeighborhood(e.target.value)}
                    className="w-full bg-transparent text-[#1C1B1B] text-[13px] focus:outline-none cursor-pointer"
                  >
                    <option value="">Todos os Bairros</option>
                    <option value="centro">Centro</option>
                    <option value="turista">Setor Turista</option>
                    <option value="bairro-turista">Bairro do Turista</option>
                    <option value="lagoa">Lagoa Quente</option>
                    <option value="itanhanga">Setor Itanhangá</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#FF3B4F] hover:bg-[#D91F35] text-white text-[14px] font-bold transition-transform hover:-translate-y-0.5 shadow-md shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">search</span>
                  <span>Buscar</span>
                </button>
              </form>

              {/* Quick Metrics Bar */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[#F3F0EF]/80 text-[13px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFB95F]" />
                  +420 locais cadastrados
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFDAD9]" />
                  Avaliações 100% verificadas
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  Atualizado semanalmente
                </span>
              </div>
            </div>
          </section>

          {/* 6.2 CATEGORIAS EM DESTAQUE (Cards sobrepostos ao Hero) */}
          <section className="max-w-7xl mx-auto px-6 lg:px-12 w-full -mt-14 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Categoria 1 */}
              <Link
                href="/caldas-novas/lugares?cat=restaurantes"
                className="group bg-white hover:bg-white/95 p-5 rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-center text-center border border-gray-100"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#FFDAD6] text-[#FF3B4F] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
                </div>
                <span className="text-[16px] font-bold text-[#1C1B1B] leading-tight mb-1">Restaurantes</span>
                <span className="text-[13px] text-[#5C3F3F]">84 locais</span>
              </Link>

              {/* Categoria 2 */}
              <Link
                href="/caldas-novas/lugares?cat=termas"
                className="group bg-white hover:bg-white/95 p-5 rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-center text-center border border-gray-100"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#FFDDB8] text-[#825100] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>pool</span>
                </div>
                <span className="text-[16px] font-bold text-[#1C1B1B] leading-tight mb-1">Parques & Termas</span>
                <span className="text-[13px] text-[#5C3F3F]">28 locais</span>
              </Link>

              {/* Categoria 3 */}
              <Link
                href="/caldas-novas/lugares?cat=bares"
                className="group bg-white hover:bg-white/95 p-5 rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-center text-center border border-gray-100"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#F0EDED] text-[#1C1B1B] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>sports_bar</span>
                </div>
                <span className="text-[16px] font-bold text-[#1C1B1B] leading-tight mb-1">Bares & Chopp</span>
                <span className="text-[13px] text-[#5C3F3F]">42 locais</span>
              </Link>

              {/* Categoria 4 */}
              <Link
                href="/caldas-novas/lugares?cat=hoteis"
                className="group bg-white hover:bg-white/95 p-5 rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-center text-center border border-gray-100"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#FFDAD9] text-[#FF3B4F] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>hotel</span>
                </div>
                <span className="text-[16px] font-bold text-[#1C1B1B] leading-tight mb-1">Hotéis & Resorts</span>
                <span className="text-[13px] text-[#5C3F3F]">65 locais</span>
              </Link>

              {/* Categoria 5 */}
              <Link
                href="/caldas-novas/lugares?cat=turismo"
                className="group bg-white hover:bg-white/95 p-5 rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-center text-center border border-gray-100"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#EAE7E7] text-[#1C1B1B] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>sailing</span>
                </div>
                <span className="text-[16px] font-bold text-[#1C1B1B] leading-tight mb-1">Turismo & Lazer</span>
                <span className="text-[13px] text-[#5C3F3F]">36 locais</span>
              </Link>

              {/* Categoria 6 */}
              <Link
                href="/caldas-novas/lugares?cat=comercio"
                className="group bg-white hover:bg-white/95 p-5 rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-center text-center border border-gray-100"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#FFB95F]/30 text-[#2A1700] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
                </div>
                <span className="text-[16px] font-bold text-[#1C1B1B] leading-tight mb-1">Comércio Local</span>
                <span className="text-[13px] text-[#5C3F3F]">110 locais</span>
              </Link>
            </div>

            <div className="flex justify-center mt-6">
              <Link
                href="/caldas-novas/categorias"
                className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#FF3B4F] hover:text-[#D91F35] transition-colors"
              >
                <span>Ver todas as 12 categorias de Caldas Novas</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </section>

          {/* 6.3 LUGARES EM DESTAQUE */}
          <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <div className="inline-flex items-center gap-1 text-[#FF3B4F] text-[12px] font-bold uppercase tracking-wider mb-1">
                  <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                  <span>Seleção Especial da Cidade</span>
                </div>
                <h2 className="text-3xl lg:text-[40px] font-bold text-[#1C1B1B] tracking-tight">Os melhores lugares de Caldas Novas</h2>
                <p className="text-[15px] text-[#5C3F3F] mt-1">Descubra estabelecimentos verificados que fazem a diferença na experiência de moradores e viajantes.</p>
              </div>

              {/* Filtros em Abas */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedPlaceFilter('todos')}
                  className={`px-4 py-2 rounded-full text-[12px] font-bold transition-all shadow-sm ${
                    selectedPlaceFilter === 'todos'
                      ? 'bg-[#1C1B1B] text-white'
                      : 'bg-[#F0EDED] hover:bg-[#EAE7E7] text-[#1C1B1B]'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setSelectedPlaceFilter('termas')}
                  className={`px-4 py-2 rounded-full text-[12px] font-bold transition-all ${
                    selectedPlaceFilter === 'termas'
                      ? 'bg-[#1C1B1B] text-white shadow-sm'
                      : 'bg-[#F0EDED] hover:bg-[#EAE7E7] text-[#1C1B1B]'
                  }`}
                >
                  Termas
                </button>
                <button
                  onClick={() => setSelectedPlaceFilter('sabores')}
                  className={`px-4 py-2 rounded-full text-[12px] font-bold transition-all ${
                    selectedPlaceFilter === 'sabores'
                      ? 'bg-[#1C1B1B] text-white shadow-sm'
                      : 'bg-[#F0EDED] hover:bg-[#EAE7E7] text-[#1C1B1B]'
                  }`}
                >
                  Sabores Goianos
                </button>
              </div>
            </div>

            {/* 6 Cards Ricos de Estabelecimentos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPlaces.map((place) => {
                const isFav = favorites[place.id];
                return (
                  <article key={place.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group border border-gray-100">
                    <div className="relative w-full h-56 overflow-hidden">
                      <div
                        className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                        style={{ backgroundImage: `url('${place.image}')` }}
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        {place.tag && (
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-[11px] shadow-sm ${place.tagClass}`}>
                            <span className="material-symbols-outlined text-[14px]">{place.tagIcon}</span> {place.tag}
                          </span>
                        )}
                        {place.hours && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-[#1C1B1B] font-bold text-[11px] shadow-sm">
                            <span className={`w-2 h-2 rounded-full ${place.hoursActive ? 'bg-[#825100] animate-pulse' : 'bg-gray-400'}`} />
                            {place.hours}
                          </span>
                        )}
                      </div>

                      {/* Botão Favoritar Interativo */}
                      <button
                        onClick={() => toggleFavorite(place.id)}
                        aria-label="Favoritar"
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur hover:bg-white flex items-center justify-center text-[#1C1B1B] hover:text-[#FF3B4F] transition-colors shadow-sm"
                      >
                        <span
                          className="material-symbols-outlined text-[20px]"
                          style={{
                            color: isFav ? '#FF3B4F' : undefined,
                            fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0",
                          }}
                        >
                          {isFav ? 'favorite' : 'favorite_border'}
                        </span>
                      </button>

                      <div className="absolute bottom-3 left-3 bg-[#1C1B1B]/80 backdrop-blur px-2.5 py-0.5 rounded text-white text-[11px] font-bold">
                        {place.neighborhood}
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[11px] font-bold uppercase text-[#FF3B4F]">{place.category}</span>
                          <div className="flex items-center gap-1 font-semibold text-[13px]">
                            <span className="material-symbols-outlined text-[16px] text-[#825100]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span className="font-bold text-[#1C1B1B]">{place.rating}</span>
                            <span className="text-[#5C3F3F] text-[12px]">({place.reviewsCount})</span>
                          </div>
                        </div>

                        <h3 className="text-[20px] font-bold text-[#1C1B1B] group-hover:text-[#FF3B4F] transition-colors mb-2">
                          {place.name}
                        </h3>
                        <p className="text-[13px] text-[#5C3F3F] line-clamp-2 mb-4 leading-relaxed">
                          {place.description}
                        </p>
                      </div>

                      <div className="pt-4 flex items-center justify-between border-t border-[#F0EDED]">
                        <span className="text-[13px] text-[#916F6E]">{place.price}</span>
                        <Link className="inline-flex items-center gap-1 text-[13px] font-bold text-[#FF3B4F] hover:text-[#D91F35]" href={`/caldas-novas/lugar/${place.slug}`}>
                          <span>Ver detalhes</span>
                          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* 6.4 EVENTOS E AGENDA DA CIDADE */}
          <section className="w-full bg-[#F6F3F2] py-16">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                  <div className="inline-flex items-center gap-1 text-[#FF3B4F] text-[12px] font-bold uppercase tracking-wider mb-1">
                    <span className="material-symbols-outlined text-[18px]">event</span>
                    <span>Agenda Cultural & Shows</span>
                  </div>
                  <h2 className="text-3xl lg:text-[40px] font-bold text-[#1C1B1B]">O que acontece em Caldas Novas</h2>
                  <p className="text-[15px] text-[#5C3F3F] mt-1">Festivais consagrados, música ao vivo, noites gastronômicas e feiras culturais.</p>
                </div>

                {/* Filtros em Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F0EDED] rounded-full">
                  {(['hoje', 'amanha', 'semana', 'fim-semana', 'todos'] as const).map((filter) => {
                    const labels: Record<string, string> = {
                      hoje: 'Hoje',
                      amanha: 'Amanhã',
                      semana: 'Esta semana',
                      'fim-semana': 'Este fim de semana',
                      todos: 'Todos',
                    };
                    const isActive = selectedEventFilter === filter;
                    return (
                      <button
                        key={filter}
                        onClick={() => setSelectedEventFilter(filter)}
                        className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                          isActive
                            ? 'bg-[#FF3B4F] text-white shadow-sm'
                            : 'text-[#5C3F3F] hover:text-[#1C1B1B]'
                        }`}
                      >
                        {labels[filter]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid de Eventos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {events.map((evt) => (
                  <div key={evt.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group border border-gray-100">
                    <div className="relative h-44 overflow-hidden">
                      <div
                        className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                        style={{ backgroundImage: `url('${evt.image}')` }}
                      />
                      <div className="absolute top-3 left-3 bg-[#FF3B4F] text-white px-3 py-1.5 rounded-xl shadow-md text-center flex flex-col leading-tight min-w-[50px]">
                        <span className="text-[18px] font-bold">{evt.dateDay}</span>
                        <span className="text-[11px] font-bold uppercase">{evt.dateMonth}</span>
                      </div>
                      <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        evt.isPaid
                          ? 'bg-[#313030]/80 backdrop-blur text-white'
                          : 'bg-[#FFDDB8] text-[#2A1700]'
                      }`}>
                        {evt.isPaid ? 'Pago' : 'Gratuito'}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] text-[#FF3B4F] uppercase font-bold">{evt.category}</span>
                        <h3 className="text-[18px] font-bold text-[#1C1B1B] group-hover:text-[#FF3B4F] transition-colors mt-1 mb-2">
                          {evt.name}
                        </h3>
                        <p className="text-[13px] text-[#5C3F3F] line-clamp-2 leading-relaxed">
                          {evt.description}
                        </p>
                      </div>

                      <div className="pt-4 mt-3 flex items-center justify-between text-[13px] text-[#916F6E] border-t border-[#F0EDED]">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">pin_drop</span>
                          {evt.location}
                        </span>
                        <Link href={`/caldas-novas/eventos/${evt.slug}`} className="text-[13px] font-bold text-[#FF3B4F] group-hover:translate-x-1 transition-transform">
                          {evt.cta}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 6.5 EXPLORE A ESSÊNCIA DE CALDAS NOVAS (Cards Panorâmicos) */}
          <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full">
            <div className="mb-10 text-center md:text-left">
              <span className="text-[#FF3B4F] text-[12px] font-bold uppercase tracking-wider">Cultura & Estilo de Vida</span>
              <h2 className="text-3xl lg:text-[40px] font-bold text-[#1C1B1B] mt-1">Explore a essência de Caldas Novas</h2>
              <p className="text-[15px] text-[#5C3F3F]">Quatro experiências definidoras que transformam cada visita em uma memória viva.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1 */}
              <Link
                href="/caldas-novas/lugares?cat=gastronomia"
                className="group relative h-72 rounded-2xl overflow-hidden shadow-md flex items-end p-8"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                  style={{
                    backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCL1CzF-RvHjUJWOPRvN7l0IgDhPdvPu-gDR5fbRSn1SBr0NnuHDgBUG4VggfilDnaDpjqYmQ_pQQZhkvt0ETkQbNVRFaqoPjSYm1l0CUW_zsXEx6GTz8TOXPzGw7mcCTRCGn81pNo37UaVEcUE3UyaI7PYFeCGQA4YaUWgK0v1CQlrkz9h3mlGK04C-uEqTPg4Wa30bWX40LiZWxulYoy48CL3_zptIWwv5uqYi2lJ')"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#313030] via-[#313030]/40 to-transparent" />
                <div className="relative z-10 flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#FFDAD9] mb-1">Tradição & Sabor</span>
                  <h3 className="text-2xl lg:text-[30px] font-bold text-white group-hover:text-[#FFB3B2] transition-colors leading-tight">
                    Gastronomia & Sabores Goianos
                  </h3>
                  <p className="text-[13px] text-[#E5E2E1] mt-2 line-clamp-2 max-w-md">
                    Do lendário empadão recheado às galinhadas com pequi fresco e feijão tropeiro preparados no fogão a lenha.
                  </p>
                </div>
              </Link>

              {/* Box 2 */}
              <Link
                href="/caldas-novas/lugares?cat=termas"
                className="group relative h-72 rounded-2xl overflow-hidden shadow-md flex items-end p-8"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                  style={{
                    backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDTSTWWGCB4HE9tXmWIxTQseSKdO4s1A0FfDBIRG4B9qaa5Y91ijn0sx4j5cZT015sn7IyROSVuYRpfNmw38qAL5_HlLI27z5_PsmpeeRHtUqT9HqrI1HTq5YwVDk3prhdVipd2C8pFSG3tdn9-Y9Ybg004LWiMjJRsbj0KBYnp8TxR3nN3YB5RrFRC2TNr_CftQ9ZzCQtLBuL806UKR80v3TtfqHqffuzFXXBcvlXU')"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#313030] via-[#313030]/40 to-transparent" />
                <div className="relative z-10 flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#FFDAD9] mb-1">Relaxamento & Cura</span>
                  <h3 className="text-2xl lg:text-[30px] font-bold text-white group-hover:text-[#FFB3B2] transition-colors leading-tight">
                    Parques Termais & Resorts
                  </h3>
                  <p className="text-[13px] text-[#E5E2E1] mt-2 line-clamp-2 max-w-md">
                    Piscinas naturalmente aquecidas, spas holísticos e hotéis de alto padrão com hospitalidade goiana.
                  </p>
                </div>
              </Link>

              {/* Box 3 */}
              <Link
                href="/caldas-novas/lugares?cat=bares"
                className="group relative h-72 rounded-2xl overflow-hidden shadow-md flex items-end p-8"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                  style={{
                    backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCjvBFqyP6kGaX6Wb1dCTOqK9UAmCSkE17WfXgqUu2ZT_xfYdi9snFtrdJfGZIsA1IT5JuklQnrwD1rvs40h0l4PKCwAsOZl9xNgvMPRD77FyrmPKXBoOQZVevVMGNnh15wEMzCuhp8g795PD62ZyMLIXCG3otF1y5iExi0x924t-PA9-2d1CZncgIDHnE9JVKADheR1EBJJrMwYthfGff_9d0kUt4-_L_ybnTLe9fw')"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#313030] via-[#313030]/40 to-transparent" />
                <div className="relative z-10 flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#FFDAD9] mb-1">Vida Noturna & Viola</span>
                  <h3 className="text-2xl lg:text-[30px] font-bold text-white group-hover:text-[#FFB3B2] transition-colors leading-tight">
                    Noite & Sertanejo
                  </h3>
                  <p className="text-[13px] text-[#E5E2E1] mt-2 line-clamp-2 max-w-md">
                    Choperias vibrantes, modas de viola e grandes casas de shows que celebram o coração da música brasileira.
                  </p>
                </div>
              </Link>

              {/* Box 4 */}
              <Link
                href="/caldas-novas/lugares?cat=turismo"
                className="group relative h-72 rounded-2xl overflow-hidden shadow-md flex items-end p-8"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                  style={{
                    backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAYCJjKNmCM-qyfSvYzmX1uD8V6xHprFmw8-P09Wl5lB6Eh7Yt2BngBjQLelhTow3H9xgNXwIhS4CkFFP_nqiMoiTRvzjFjkuD4weJULTHAr1Jo6cm3MCAVa34V5kcGwhDXTqyQBkSlZCQBkaXJ9oIrAye6vC3B9rVnxhrAo1YNxbqAy1ryUedS61_nSnRIRnvYjJ0LCmF3PjX1PjNToBK6-zvfJ9kUNL2Md7u-Czio')"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#313030] via-[#313030]/40 to-transparent" />
                <div className="relative z-10 flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#FFDAD9] mb-1">Trilhas & Cachoeiras</span>
                  <h3 className="text-2xl lg:text-[30px] font-bold text-white group-hover:text-[#FFB3B2] transition-colors leading-tight">
                    Natureza & Serra de Caldas
                  </h3>
                  <p className="text-[13px] text-[#E5E2E1] mt-2 line-clamp-2 max-w-md">
                    O Parque Estadual PESCAN com mirantes panorâmicos, quedas d&apos;água refrescantes e fauna preservada do Cerrado.
                  </p>
                </div>
              </Link>
            </div>
          </section>

          {/* 6.6 DESCUBRA OS MELHORES BAIRROS */}
          <section className="w-full bg-[#F6F3F2] py-16">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                  <span className="text-[#FF3B4F] text-[12px] font-bold uppercase tracking-wider">Mapeamento Local</span>
                  <h2 className="text-3xl lg:text-[40px] font-bold text-[#1C1B1B] mt-1">Descubra os melhores bairros</h2>
                  <p className="text-[15px] text-[#5C3F3F]">Conheça as regiões mais procuradas de Caldas Novas e encontre o que está por perto.</p>
                </div>
                <span className="text-[#916F6E] text-[13px] hidden md:inline">Selecione para ver a lista de cada região</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Bairro 1 */}
                <Link
                  href="/caldas-novas/lugares?bairro=centro"
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col border border-gray-100"
                >
                  <div className="relative h-44 overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{
                        backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDKnabuz--ymC0Nv4pdXymIaNhUZ5KQjQNmhIbSYqnOcrwcN5aZq4w3vsu0AcJzktogSCHdbq2jhJW0ctCTbVEwHPFzKQcKaH-eyXmMJx0jjfO6RygroxK8Z-YTqj8qLZI_ZgOd8O-cT5txIjShJMP_TJTCHhdAEZ4VwQmpvK60V3AW2U-8wF1DyQczvPUpu0vZINg_hm7DyRdS-eGSMQOAesVlpam1cHuy4XVgSU0D')"
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#313030]/70 to-transparent" />
                    <div className="absolute bottom-3 left-4 text-white">
                      <span className="text-[11px] font-bold uppercase text-[#FFDAD9]">Ponto Central</span>
                      <h3 className="text-[18px] font-bold">Centro</h3>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between text-[13px] font-semibold text-[#5C3F3F]">
                    <span>140 lugares cadastrados</span>
                    <span className="material-symbols-outlined text-[18px] text-[#FF3B4F] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </Link>

                {/* Bairro 2 */}
                <Link
                  href="/caldas-novas/lugares?bairro=setor-turista"
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col border border-gray-100"
                >
                  <div className="relative h-44 overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{
                        backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBHdMZoXDiqhyqYyUAqatM7guzZY8SWv7P6lVmyfr3RZdsfGLUqekWET6zmUR02Cl2pnNd05uuK1MTrtdNmJO1PtpH-aDrfsGK1-LRfuo85QUN9djLcBiUhoOSc5cjlqK5enRQ4n29hfuxocAbvSSdS_ZSNhzYqOw9sPoAEG2hLO_YOuKCbrMyQPTAnNWjL1Bza-hBHW3g8pb3SGeMTeKMdDwuvJnfALNbi4eG0i1eK')"
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#313030]/70 to-transparent" />
                    <div className="absolute bottom-3 left-4 text-white">
                      <span className="text-[11px] font-bold uppercase text-[#FFDAD9]">Área dos Parques</span>
                      <h3 className="text-[18px] font-bold">Setor Turista</h3>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between text-[13px] font-semibold text-[#5C3F3F]">
                    <span>95 lugares cadastrados</span>
                    <span className="material-symbols-outlined text-[18px] text-[#FF3B4F] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </Link>

                {/* Bairro 3 */}
                <Link
                  href="/caldas-novas/lugares?bairro=jardim-roma"
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col border border-gray-100"
                >
                  <div className="relative h-44 overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{
                        backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuARTtS3SiK5pEzf9XfDAum5CMnplcl9FKQIwd6wcuVM40jD74pR-kbmVY9XFNC_flVlmS4azyd0mQsxyG1ia8QNYTVPdyQx3qPuaohCWRpmjmZZ3TYoJPJ3QsRccqk3no4JoJ3UoIWsxZhixlCXDRUJ40AXmIMik3X954QDVSTEJ7EonMzmm8QNpAIcTkvnFa91MJDnwMJuVG_jDdheLQToEq7PLdOJQaIKcNysfo-N')"
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#313030]/70 to-transparent" />
                    <div className="absolute bottom-3 left-4 text-white">
                      <span className="text-[11px] font-bold uppercase text-[#FFDAD9]">Resorts & Conforto</span>
                      <h3 className="text-[18px] font-bold">Jardim Roma</h3>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between text-[13px] font-semibold text-[#5C3F3F]">
                    <span>48 lugares cadastrados</span>
                    <span className="material-symbols-outlined text-[18px] text-[#FF3B4F] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </Link>

                {/* Bairro 4 */}
                <Link
                  href="/caldas-novas/lugares?bairro=lagoa-quente"
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col border border-gray-100"
                >
                  <div className="relative h-44 overflow-hidden">
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{
                        backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCxGbzhSw8Wff6_QS7XcMbMYBJmnjXDml9ogYFAhbd9rtuWXHVLB1PLoklZdeGJuPeIIpmIanhwnmz8s8vK0sz2ssHNIdk6Y-u2UFmNda5soB3Y5BvjhahNf7Jbopu6Q_H6--imawCnA2gJP0oRMDuyC-SpntQQ9iyLZxB3LbPnFTaMsoRjpaZOISUs8_7P1GYvehYU7cnem4m2SEHgQgOECvsZrT2roV3P0ON3m1sY')"
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#313030]/70 to-transparent" />
                    <div className="absolute bottom-3 left-4 text-white">
                      <span className="text-[11px] font-bold uppercase text-[#FFDAD9]">Lago & Náutica</span>
                      <h3 className="text-[18px] font-bold">Lagoa Quente & Náutico</h3>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between text-[13px] font-semibold text-[#5C3F3F]">
                    <span>32 lugares cadastrados</span>
                    <span className="material-symbols-outlined text-[18px] text-[#FF3B4F] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </Link>
              </div>
            </div>
          </section>

          {/* 6.7 LUGARES PRÓXIMOS NO MAPA */}
          <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full" id="mapa-caldas">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1 text-[#FF3B4F] text-[12px] font-bold uppercase tracking-wider mb-1">
                  <span className="material-symbols-outlined text-[18px]">explore</span>
                  <span>Navegação Geográfica</span>
                </div>
                <h2 className="text-3xl lg:text-[40px] font-bold text-[#1C1B1B]">Lugares próximos a você em Caldas Novas</h2>
                <p className="text-[15px] text-[#5C3F3F] mt-1">Interaja com o mapa para descobrir atrações, termas e restaurantes em tempo real.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => alert('Localização ativada: Mostrando atrações em Caldas Novas.')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF3B4F] hover:bg-[#D91F35] text-white text-[13px] font-semibold shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">my_location</span>
                  <span>Usar Minha Localização</span>
                </button>
              </div>
            </div>

            {/* Mapa Container com Pins e Card Flutuante */}
            <div className="relative w-full h-[460px] rounded-3xl overflow-hidden shadow-lg border border-[#F0EDED]">
              <div
                className="w-full h-full bg-cover bg-center filter contrast-105"
                style={{
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB0djNgEzur0rxhtDZ4qAllIpQC0jlJqcHHwgPRZuHv0M84lhsXlSFCArtiMfI7WEuP4AEtgkJuUNXj62ghL5iOsLhGynmzq3FNX3Upf84yQEO1mcM_HthSutmeC1K3otkU5YU-x2k8o4FjayP1-3-UWQy6jYkt0HhqsfcyX-1PW9Ab6yrcRgpmuhoOflPpfJA_vGaff2arSv7mCE4KJhEbf_PePDdE9ARBjnNKofJa')"
                }}
              />
              <div className="absolute inset-0 bg-[#313030]/10 pointer-events-none" />

              {/* Pin 1: DiRoma */}
              <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-[#FF3B4F] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>pool</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#313030] text-white text-[11px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap">
                  DiRoma Acqua Park
                </div>
              </div>

              {/* Pin 2: Nonna Mia */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-[#FF3B4F] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#313030] text-white text-[11px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap">
                  Restaurante Nonna Mia
                </div>
              </div>

              {/* Pin 3: Resorts */}
              <div className="absolute top-2/3 right-1/3 -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-[#FF3B4F] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>hotel</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#313030] text-white text-[11px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap">
                  Resorts Termais
                </div>
              </div>

              {/* Card Flutuante de Prévia */}
              <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-96 bg-white rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center gap-4 border border-gray-100">
                <div
                  className="w-20 h-20 rounded-xl bg-cover bg-center shrink-0"
                  style={{
                    backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCjSNgc8oqinKDkDAFzO_N5P8afB0LIyQwo9bHCz9ogtzWISLa9mUVLXBHwRqZ7nodEQ9Hl5DFyJrRbpo1Gh1_Tsc3bBd_Te_L6rU0fosvAqQGlr3adocd2hPoU_nWqL2oSRFT3cBOOPCHcl9SpIg9yn3ve2iSOtHy-Eub-AtsiJLryEvvutZGjfUYW8Dl7nFjLJ9SKLYlu0vXMAq_FUVdTTVLEdSfJwjPpkEn31vvM')"
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] text-[#FF3B4F] uppercase font-bold truncate">Parques & Lazer</span>
                    <span className="text-[#825100] text-[11px] font-bold flex items-center">★ 4.9</span>
                  </div>
                  <h4 className="text-[16px] font-bold text-[#1C1B1B] truncate">DiRoma Acqua Park</h4>
                  <p className="text-[12px] text-[#5C3F3F] truncate">Bairro do Turista • Aberto agora</p>
                  <a
                    className="inline-flex items-center gap-1 text-[#FF3B4F] text-[11px] font-bold mt-1 hover:underline"
                    href="https://maps.google.com/?q=DiRoma+Acqua+Park+Caldas+Novas"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>Traçar rota no GPS</span>
                    <span className="material-symbols-outlined text-[14px]">turn_right</span>
                  </a>
                </div>
              </div>

              {/* Botão Flutuante de Tela Cheia */}
              <Link
                href="/caldas-novas/lugares"
                className="hidden sm:inline-flex items-center gap-2 absolute top-6 right-6 px-4 py-2.5 rounded-full bg-white/90 backdrop-blur hover:bg-white text-[#1C1B1B] text-[13px] font-semibold shadow-md transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">fullscreen</span>
                <span>Explorar mapa completo da cidade</span>
              </Link>
            </div>
          </section>

          {/* 6.8 SEÇÃO PROMOCIONAL (Comerciantes e Empresas de Caldas Novas) */}
          <section className="max-w-7xl mx-auto px-6 lg:px-12 py-10 w-full">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-[#FF3B4F] via-[#E1223D] to-[#BB0025] p-8 md:p-14 text-white flex flex-col lg:flex-row items-center justify-between gap-10">
              <svg className="absolute -right-20 -bottom-20 w-96 h-96 opacity-10 text-white pointer-events-none" fill="currentColor" viewBox="0 0 200 200">
                <path d="M40,-68.1C51.6,-61.7,60.6,-50.7,68.4,-38.3C76.2,-25.9,82.8,-12.9,83.1,0.2C83.4,13.2,77.4,26.4,69.5,38.3C61.6,50.2,51.8,60.8,39.9,67.6C28,74.4,14,77.4,-0.6,78.5C-15.3,79.5,-30.5,78.6,-43.3,72.2C-56.1,65.8,-66.4,53.8,-73.4,40.1C-80.4,26.4,-84.1,11.2,-82.7,-3.6C-81.3,-18.4,-74.8,-32.8,-65.4,-44.4C-56,-56,-43.7,-64.8,-30.7,-70.4C-17.7,-76,-4,-78.4,9,-79.8C22.1,-81.2,44.2,-81.6,40,-68.1Z" transform="translate(100 100)" />
              </svg>
              <div className="max-w-2xl text-center lg:text-left z-10">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur text-[11px] font-bold uppercase tracking-wider mb-4">
                  <span className="material-symbols-outlined text-[16px]">storefront</span>
                  Oportunidade para Empreendedores
                </span>
                <h2 className="text-3xl lg:text-[40px] font-bold leading-tight mb-4">
                  Seu negócio merece estar entre os melhores de Caldas Novas!
                </h2>
                <p className="text-[17px] text-white/90 leading-relaxed max-w-xl">
                  Aumente sua visibilidade, atraia turistas qualificados e moradores da cidade que procuram onde comer, passear, comprar e se hospedar todos os dias.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 z-10 w-full sm:w-auto">
                <Link
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-[#FF3B4F] hover:bg-gray-50 text-[16px] font-bold shadow-xl transition-transform hover:-translate-y-1 text-center"
                  href="/anuncie"
                >
                  <span className="material-symbols-outlined text-[20px]">add_business</span>
                  <span>Cadastrar Meu Estabelecimento</span>
                </Link>
                <Link
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-6 py-4 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur text-white text-[14px] font-semibold transition-colors text-center"
                  href="/anuncie#planos"
                >
                  <span>Conhecer Planos de Visibilidade</span>
                </Link>
              </div>
            </div>
          </section>

          {/* 6.9 BLOG E DICAS DE CALDAS NOVAS */}
          <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <div className="inline-flex items-center gap-1 text-[#FF3B4F] text-[12px] font-bold uppercase tracking-wider mb-1">
                  <span className="material-symbols-outlined text-[18px]">article</span>
                  <span>Guia Editorial & Roteiros</span>
                </div>
                <h2 className="text-3xl lg:text-[40px] font-bold text-[#1C1B1B]">Descubra mais sobre Caldas Novas</h2>
                <p className="text-[15px] text-[#5C3F3F] mt-1">Dicas locais, segredos de viagem e sugestões gastronômicas testadas por nossa equipe.</p>
              </div>
              <Link className="inline-flex items-center gap-1 text-[13px] font-bold text-[#FF3B4F] hover:text-[#D91F35]" href="/caldas-novas/blog">
                <span>Ver todos os artigos</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>

            {/* 3 Artigos de Blog */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Artigo 1 */}
              <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group border border-gray-100">
                <div className="relative h-52 overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA4E0bN9x1gvVQEMNclTp0uB_CiMMkCHZcBiSwT9FRu_7_yVbOZosFRjr9bbbjOvupiua9JEg1jOaFoOsBYqLfNrYkfslUVvS-2_1_rFqkPdW60x4Qi10222gSrQqOiH6y6jdO70-XmoJpWb5OD-reAQCRL2CXse1wQ2jyvZGYGVLkXdaiyGg6OqAWu-kMYP4HttBssK5RVqPSdH9EPYGAtNi4-XgUQgGAe-R7iw-25')"
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[11px] font-bold text-[#1C1B1B]">
                    Dicas de Viagem • 12 Outubro
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[20px] font-bold text-[#1C1B1B] group-hover:text-[#FF3B4F] transition-colors leading-snug mb-3">
                      Guia Definitivo das Águas Termais: O que fazer em Caldas Novas em 3 dias
                    </h3>
                    <p className="text-[13px] text-[#5C3F3F] line-clamp-3 mb-4 leading-relaxed">
                      Planejamento dia a dia para otimizar ingressos dos melhores parques, curtir as termas com calma e desfrutar do descanso perfeito.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#F0EDED] flex items-center justify-between text-[13px] text-[#916F6E]">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      5 min de leitura
                    </span>
                    <Link href="/caldas-novas/blog/guia-definitivo-aguas-quentes" className="text-[#FF3B4F] text-[13px] font-bold">
                      Ler matéria →
                    </Link>
                  </div>
                </div>
              </article>

              {/* Artigo 2 */}
              <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group border border-gray-100">
                <div className="relative h-52 overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCOSXDQa51euTLiU2grAlmNvPOFQk1T_HUOSe3wpnux2gF9OXFPBBQcg41pZNCJww1PCIGiTTDGSrAgdg91Un2xqJ2Q-dUy4otB56AiM5AujMw8H1SQ4SSGT2NqpsAf-SWcvrA1iwRcgidcLHBu7sUOZuAaO6TfvKwJ1NwoWarBQ5gn2FikLZVGnMCSGl14NYspjWiN9teu-UY_Zzs-AtzT0I_6Ks90KkVI1KfxEygV')"
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[11px] font-bold text-[#1C1B1B]">
                    Gastronomia • 08 Outubro
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[20px] font-bold text-[#1C1B1B] group-hover:text-[#FF3B4F] transition-colors leading-snug mb-3">
                      Roteiro Gastronômico: Onde comer o melhor empadão e pratos típicos goianos
                    </h3>
                    <p className="text-[13px] text-[#5C3F3F] line-clamp-3 mb-4 leading-relaxed">
                      Mapeamos os endereços mais tradicionais de Caldas Novas para quem busca sabores autênticos do Centro-Oeste sem pegadinhas de turistas.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#F0EDED] flex items-center justify-between text-[13px] text-[#916F6E]">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      4 min de leitura
                    </span>
                    <Link href="/caldas-novas/blog" className="text-[#FF3B4F] text-[13px] font-bold">
                      Ler matéria →
                    </Link>
                  </div>
                </div>
              </article>

              {/* Artigo 3 */}
              <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group border border-gray-100">
                <div className="relative h-52 overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDWRxBvZ1-L63EO0fdZC3r9keRv64EkImhV9jp0pXzBCtYCyCq3wR2P0aKtqwC9QBbnHL3BpJbUW7Sufm8Ba4c5uR2U_00SA4xWz_Zev50wpt93-QKHRo_Lj-VRf_G1hOfHUbYAQPGTU11HHSODGdOAixy0LiXPF5ChFP9FnNJAlsOerozB-t7ysI9zfTcx5uOHf2DPy44aVdiXgIkFi9Xtd1czcEC-4OKoDohCrVC9')"
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[11px] font-bold text-[#1C1B1B]">
                    Passeios • 02 Outubro
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[20px] font-bold text-[#1C1B1B] group-hover:text-[#FF3B4F] transition-colors leading-snug mb-3">
                      Parques Aquáticos Imperdíveis: Dicas para aproveitar com toda a família
                    </h3>
                    <p className="text-[13px] text-[#5C3F3F] line-clamp-3 mb-4 leading-relaxed">
                      Quais parques são ideais para crianças pequenas, quais têm mais atrações radicais e como evitar filas nos fins de semana e feriados.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#F0EDED] flex items-center justify-between text-[13px] text-[#916F6E]">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      6 min de leitura
                    </span>
                    <Link href="/caldas-novas/blog" className="text-[#FF3B4F] text-[13px] font-bold">
                      Ler matéria →
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>
      </main>

      <Footer currentCitySlug="caldas-novas" />
    </div>
  );
}

