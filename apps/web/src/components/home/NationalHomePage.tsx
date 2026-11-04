'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export function NationalHomePage() {
  const router = useRouter();

  // Estados do seletor
  const [selectorMode, setSelectorMode] = useState<'city' | 'cep'>('city');
  const [selectedUf, setSelectedUf] = useState('GO');
  const [selectedCity, setSelectedCity] = useState('caldas-novas');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('todos');
  const [cepInput, setCepInput] = useState('');
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  const citiesByState: Record<string, Array<{ name: string; slug: string; featured?: boolean }>> = {
    GO: [
      { name: 'Caldas Novas', slug: 'caldas-novas', featured: true },
      { name: 'Goiânia', slug: 'goiania', featured: true },
      { name: 'Rio Verde', slug: 'rio-verde' },
      { name: 'Anápolis', slug: 'anapolis' },
      { name: 'Pirenópolis', slug: 'pirenopolis' },
      { name: 'Itumbiara', slug: 'itumbiara' },
    ],
    SP: [
      { name: 'São Paulo', slug: 'sao-paulo', featured: true },
      { name: 'Campinas', slug: 'campinas' },
      { name: 'Santos', slug: 'santos' },
      { name: 'Ribeirão Preto', slug: 'ribeirao-preto' },
      { name: 'Campos do Jordão', slug: 'campos-do-jordao' },
    ],
    RJ: [
      { name: 'Rio de Janeiro', slug: 'rio-de-janeiro', featured: true },
      { name: 'Niterói', slug: 'niteroi' },
      { name: 'Búzios', slug: 'buzios' },
      { name: 'Petrópolis', slug: 'petropolis' },
      { name: 'Paraty', slug: 'paraty' },
    ],
    DF: [
      { name: 'Brasília', slug: 'brasilia', featured: true },
      { name: 'Taguatinga', slug: 'taguatinga' },
      { name: 'Águas Claras', slug: 'aguas-claras' },
    ],
    MG: [
      { name: 'Belo Horizonte', slug: 'belo-horizonte' },
      { name: 'Tiradentes', slug: 'tiradentes' },
      { name: 'Ouro Preto', slug: 'ouro-preto' },
      { name: 'Uberlândia', slug: 'uberlandia' },
    ],
    SC: [
      { name: 'Florianópolis', slug: 'florianopolis', featured: true },
      { name: 'Balneário Camboriú', slug: 'balneario-camboriu' },
      { name: 'Blumenau', slug: 'blumenau' },
      { name: 'Joinville', slug: 'joinville' },
    ],
    PR: [
      { name: 'Curitiba', slug: 'curitiba' },
      { name: 'Foz do Iguaçu', slug: 'foz-do-iguacu' },
      { name: 'Londrina', slug: 'londrina' },
    ],
    RS: [
      { name: 'Porto Alegre', slug: 'porto-alegre' },
      { name: 'Gramado', slug: 'gramado' },
      { name: 'Canela', slug: 'canela' },
    ],
    BA: [
      { name: 'Salvador', slug: 'salvador' },
      { name: 'Porto Seguro', slug: 'porto-seguro' },
      { name: 'Trancoso', slug: 'trancoso' },
    ],
  };

  const currentCities = citiesByState[selectedUf] || [];

  const handleStateChange = (uf: string) => {
    setSelectedUf(uf);
    const cities = citiesByState[uf] || [];
    if (cities.length > 0) {
      setSelectedCity(cities[0].slug);
    }
  };

  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleNavigateToCity = (slug: string, name?: string) => {
    showToast(
      `Conectando a ${name || slug}`,
      `Acessando o portal oficial da cidade...`
    );
    setTimeout(() => {
      router.push(`/${slug}`);
    }, 600);
  };

  const handleQuickSelect = (uf: string, citySlug: string, cityName: string) => {
    setSelectedUf(uf);
    setSelectedCity(citySlug);
    handleNavigateToCity(citySlug, cityName);
  };

  const handleGpsDetect = () => {
    showToast('Detectando localização via GPS...', 'Identificado: Caldas Novas - GO');
    setTimeout(() => {
      setSelectedUf('GO');
      setSelectedCity('caldas-novas');
      router.push('/caldas-novas');
    }, 1200);
  };

  return (
    <div className="bg-[#FCF9F8] text-[#1C1B1B] font-sans antialiased min-h-screen flex flex-col">
      <Header showCityPill={false} />

      <main className="w-full bg-[#FCF9F8] min-h-screen flex-1">
        <div className="flex flex-col w-full">
          {/* HERO SECTION COM BACKDROP CINEMATOGRÁFICO URBANO BRASILEIRO */}
          <section className="relative w-full overflow-hidden bg-[#313030] pt-12 pb-24 lg:pb-32">
            <div
              className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-35 scale-105 transition-transform duration-1000 ease-out"
              style={{
                backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCMqp9uuFmXDiaf0kNgie2AUSCT5J839SUsdO7BBQZ_xGCP5XQe5UmMSZJOoiXTprkzfKTvsYloZOiBqv-11DIsz_A0dPZ9otZtdlnon1F_lyFBXELMJwoMeCaqt1wFzd-jhphDczL6zO0p29Vzs76MJJ-gVi5yMcO0NWiH6r8ILK_DNNrkSnjQc-TZ-y3Py6_0X4FHpNwSrJZeQWxnKHJSIp4p2BSm7XB9Vsf8zV8N')"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#313030]/80 via-[#313030]/90 to-[#FCF9F8] pointer-events-none" />
            <div className="absolute -top-32 right-1/4 w-96 h-96 bg-[#FF3B4F]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 -left-20 w-80 h-80 bg-[#FFB95F]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-6 lg:px-12 z-10 flex flex-col items-center text-center">
              {/* Badge de Destaque */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md shadow-sm mb-6">
                <span className="text-sm leading-none">🇧🇷</span>
                <span className="text-[12px] font-bold uppercase tracking-wider text-white">O Guia Definitivo dos Municípios Brasileiros</span>
              </div>

              {/* Título Principal */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold max-w-4xl text-white tracking-tight mb-4 leading-tight">
                Descubra os melhores lugares da <span className="text-[#FFDAD8]">sua cidade</span>
              </h1>
              <p className="text-base sm:text-[18px] text-[#E5E2E1] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
                Encontre restaurantes premiados, bares autênticos, eventos imperdíveis, comércios locais e atrações turísticas avaliadas por moradores reais.
              </p>

              {/* CARD FLUTUANTE INTERATIVO DE SELEÇÃO DE CIDADE */}
              <div id="city-selector-card" className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 text-left transition-all border border-gray-100">
                {/* Switch Tabs de Modo */}
                <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-100">
                  <div className="flex items-center gap-2 p-1 bg-[#F0EDED] rounded-full">
                    <button
                      onClick={() => setSelectorMode('city')}
                      className={`px-5 py-2 rounded-full text-[13px] font-semibold transition-all flex items-center gap-2 ${
                        selectorMode === 'city'
                          ? 'bg-white text-[#1C1B1B] shadow-sm'
                          : 'text-[#5C3F3F] hover:text-[#1C1B1B]'
                      }`}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#FF3B4F]">location_city</span>
                      <span>Explorar por Cidade</span>
                    </button>
                    <button
                      onClick={() => setSelectorMode('cep')}
                      className={`px-5 py-2 rounded-full text-[13px] font-semibold transition-all flex items-center gap-2 ${
                        selectorMode === 'cep'
                          ? 'bg-white text-[#1C1B1B] shadow-sm'
                          : 'text-[#5C3F3F] hover:text-[#1C1B1B]'
                      }`}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#FF3B4F]">near_me</span>
                      <span>Busca Rápida por CEP</span>
                    </button>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-[#5C3F3F] text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>27 Estados Mapeados</span>
                  </div>
                </div>

                {/* Painel Modo Cidade */}
                {selectorMode === 'city' ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    {/* Dropdown 1: UF */}
                    <div className="md:col-span-3 flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#5C3F3F] flex items-center gap-1" htmlFor="uf-select">
                        <span className="material-symbols-outlined text-[14px]">map</span>
                        <span>Estado (UF)</span>
                      </label>
                      <div className="relative bg-[#F6F3F2] rounded-xl border border-gray-200">
                        <select
                          id="uf-select"
                          value={selectedUf}
                          onChange={(e) => handleStateChange(e.target.value)}
                          className="w-full bg-transparent appearance-none px-4 py-3 text-[13px] font-semibold text-[#1C1B1B] focus:outline-none cursor-pointer pr-10"
                        >
                          <option value="GO">Goiás (GO)</option>
                          <option value="SP">São Paulo (SP)</option>
                          <option value="RJ">Rio de Janeiro (RJ)</option>
                          <option value="DF">Distrito Federal (DF)</option>
                          <option value="MG">Minas Gerais (MG)</option>
                          <option value="SC">Santa Catarina (SC)</option>
                          <option value="PR">Paraná (PR)</option>
                          <option value="RS">Rio Grande do Sul (RS)</option>
                          <option value="BA">Bahia (BA)</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-gray-500 text-[20px]">expand_more</span>
                      </div>
                    </div>

                    {/* Dropdown 2: Cidade */}
                    <div className="md:col-span-4 flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#5C3F3F] flex items-center gap-1" htmlFor="city-select">
                        <span className="material-symbols-outlined text-[14px]">apartment</span>
                        <span>Município</span>
                      </label>
                      <div className="relative bg-[#F6F3F2] rounded-xl border border-gray-200">
                        <select
                          id="city-select"
                          value={selectedCity}
                          onChange={(e) => setSelectedCity(e.target.value)}
                          className="w-full bg-transparent appearance-none px-4 py-3 text-[13px] font-semibold text-[#1C1B1B] focus:outline-none cursor-pointer pr-10"
                        >
                          {currentCities.map((c) => (
                            <option key={c.slug} value={c.slug}>
                              {c.name} {c.featured ? '⭐' : ''}
                            </option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-gray-500 text-[20px]">expand_more</span>
                      </div>
                    </div>

                    {/* Dropdown 3: Bairro */}
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#5C3F3F] flex items-center gap-1" htmlFor="neighborhood-select">
                        <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                        <span>Bairro</span>
                      </label>
                      <div className="relative bg-[#F6F3F2] rounded-xl border border-gray-200">
                        <select
                          id="neighborhood-select"
                          value={selectedNeighborhood}
                          onChange={(e) => setSelectedNeighborhood(e.target.value)}
                          className="w-full bg-transparent appearance-none px-3 py-3 text-[13px] font-semibold text-[#1C1B1B] focus:outline-none cursor-pointer pr-8 truncate"
                        >
                          <option value="todos">Todos</option>
                          <option value="centro">Centro</option>
                          <option value="turistico">Setor Turístico</option>
                          <option value="sul">Zona Sul</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-3 pointer-events-none text-gray-500 text-[18px]">expand_more</span>
                      </div>
                    </div>

                    {/* Botão de Ação */}
                    <div className="md:col-span-3">
                      <button
                        onClick={() => handleNavigateToCity(selectedCity)}
                        className="w-full h-[48px] rounded-full bg-[#FF3B4F] hover:bg-[#D91F35] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[20px]">explore</span>
                        <span>Explorar Agora</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Painel Modo CEP */
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-6 flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#5C3F3F] flex items-center gap-1" htmlFor="cep-input">
                        <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                        <span>Informe seu CEP</span>
                      </label>
                      <input
                        id="cep-input"
                        value={cepInput}
                        onChange={(e) => setCepInput(e.target.value)}
                        className="w-full bg-[#F6F3F2] px-4 py-3 rounded-xl border border-gray-200 text-[13px] font-semibold text-[#1C1B1B] focus:outline-none placeholder:text-gray-400"
                        maxLength={9}
                        placeholder="75690-000"
                        type="text"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <button
                        onClick={handleGpsDetect}
                        className="w-full h-[48px] rounded-xl bg-[#F0EDED] hover:bg-[#EAE7E7] text-[#1C1B1B] text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px] text-[#FF3B4F]">my_location</span>
                        <span>GPS Automático</span>
                      </button>
                    </div>
                    <div className="md:col-span-3">
                      <button
                        onClick={() => handleNavigateToCity('caldas-novas', 'Caldas Novas (CEP)')}
                        className="w-full h-[48px] rounded-full bg-[#FF3B4F] hover:bg-[#D91F35] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-md transition-all"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[20px]">search</span>
                        <span>Acessar Guia</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Tags Rápidas de Cidades */}
                <div className="pt-5 mt-5 flex flex-wrap items-center gap-2 text-[13px] border-t border-gray-100">
                  <span className="text-[11px] font-bold text-[#5C3F3F] uppercase tracking-wider shrink-0 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-[#825100]">trending_up</span>
                    <span>Mais buscadas:</span>
                  </span>
                  <button
                    onClick={() => handleQuickSelect('GO', 'caldas-novas', 'Caldas Novas')}
                    className="px-3 py-1 rounded-full bg-[#FFDAD9] text-[#410008] text-[12px] font-bold hover:bg-[#FFB3B2] transition-colors"
                    type="button"
                  >
                    Caldas Novas ⭐
                  </button>
                  <button
                    onClick={() => handleQuickSelect('GO', 'goiania', 'Goiânia')}
                    className="px-3 py-1 rounded-full bg-[#F0EDED] hover:bg-[#EAE7E7] text-[#1C1B1B] text-[12px] font-semibold transition-colors"
                    type="button"
                  >
                    Goiânia
                  </button>
                  <button
                    onClick={() => handleQuickSelect('DF', 'brasilia', 'Brasília')}
                    className="px-3 py-1 rounded-full bg-[#F0EDED] hover:bg-[#EAE7E7] text-[#1C1B1B] text-[12px] font-semibold transition-colors"
                    type="button"
                  >
                    Brasília
                  </button>
                  <button
                    onClick={() => handleQuickSelect('RJ', 'rio-de-janeiro', 'Rio de Janeiro')}
                    className="px-3 py-1 rounded-full bg-[#F0EDED] hover:bg-[#EAE7E7] text-[#1C1B1B] text-[12px] font-semibold transition-colors"
                    type="button"
                  >
                    Rio de Janeiro
                  </button>
                  <button
                    onClick={() => handleQuickSelect('SP', 'sao-paulo', 'São Paulo')}
                    className="px-3 py-1 rounded-full bg-[#F0EDED] hover:bg-[#EAE7E7] text-[#1C1B1B] text-[12px] font-semibold transition-colors"
                    type="button"
                  >
                    São Paulo
                  </button>
                  <button
                    onClick={() => handleQuickSelect('SC', 'florianopolis', 'Florianópolis')}
                    className="px-3 py-1 rounded-full bg-[#F0EDED] hover:bg-[#EAE7E7] text-[#1C1B1B] text-[12px] font-semibold transition-colors"
                    type="button"
                  >
                    Florianópolis
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SEÇÃO 2: CIDADES POPULARES EM DESTAQUE (EDITORIAL GRID) */}
          <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-1 bg-[#FF3B4F] rounded-full" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF3B4F]">Cidades Selecionadas</span>
                </div>
                <h2 className="text-3xl lg:text-[40px] font-bold text-[#1C1B1B] tracking-tight">Destinos e Cidades em Alta no Brasil</h2>
                <p className="text-[15px] text-[#5C3F3F] mt-2 max-w-2xl">
                  Selecione uma das cidades mais acessadas e encontre os melhores roteiros gastronômicos, atrações e comércio local curado.
                </p>
              </div>
              <Link
                className="hidden md:inline-flex items-center gap-2 text-[14px] font-bold text-[#FF3B4F] hover:text-[#D91F35] transition-colors group"
                href="/caldas-novas/lugares"
              >
                <span>Ver catálogo completo de cidades</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>

            {/* 6 Premium Destination Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: Caldas Novas (GO) - DESTAQUE ESPECIAL */}
              <div className="group relative rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    alt="Caldas Novas"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnAH59Yw0FRXbQwlQjEt6Mqr8D5mKfltOgnM7Jg8E-uDaquGops-XqtnWZegFhqqPd4tdUWi_3sxaKKYNPTXxxV3q-QZNFf46kWIxdak9JQ0mPzlKrNenGNSQfA8qVqEZ_Ut2ve5LZr_5WXtmN6NYdEOeWtkIjpn22O4EWFC6ix5ZwJpkzbNVOyGy2zCeB6hPT004XmdYECon2D92WNm_uaGtV6zHUFC0cUQruPa43"
                    width={400}
                    height={260}
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#313030]/90 via-[#313030]/20 to-transparent" />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#FFDDB8] text-[#2A1700] text-[11px] font-bold shadow-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">star</span>
                      <span>Destaque Ouro</span>
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 bg-[#313030]/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-[#FFB95F]">thumb_up</span>
                    <span>4.9</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-300">Goiás</p>
                    <h3 className="text-[22px] tracking-tight font-bold">Caldas Novas</h3>
                  </div>
                </div>
                <div className="p-5 flex flex-col justify-between flex-1">
                  <p className="text-[13px] text-[#5C3F3F] mb-4">
                    A Maior Estância Hidrotermal do Mundo. Piscinas termais, parques aquáticos fascinantes e culinária típica goiana.
                  </p>
                  <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-[#5C3F3F] text-[13px] font-semibold">
                      <span className="material-symbols-outlined text-[18px] text-[#FF3B4F]">verified_user</span>
                      <span>480+ Lugares</span>
                    </div>
                    <button
                      className="px-4 py-2 rounded-full bg-[#FF3B4F] hover:bg-[#D91F35] text-white text-[13px] font-bold transition-all flex items-center gap-1.5 shadow-sm"
                      onClick={() => handleNavigateToCity('caldas-novas', 'Caldas Novas')}
                      type="button"
                    >
                      <span>Explorar</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Goiânia (GO) */}
              <div className="group relative rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    alt="Goiânia"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7QQw0tlaX8GJE5mwcCnU1uK-r4Jocv8YIZu-nqJM_jxLuEYxM47NNE79gfZleNa3uDn3-4wfRhbUhgFAhOtu28S0B50MjozBK3l-UsBJmLqTK6F4A9cOK9_14CezrAE4kjKqslYN-TN7yAx7fH7Bx-i45CgX82WYcByd8dI4wZW2um-IXsnJAJI_ZtCwMUANu42ZTDeTxa3loALdy8Z8Alb9k73QNWLfxE6na0qTU"
                    width={400}
                    height={260}
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#313030]/90 via-[#313030]/20 to-transparent" />
                  <div className="absolute top-4 right-4 bg-[#313030]/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-[#FFB95F]">thumb_up</span>
                    <span>4.9</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-300">Goiás</p>
                    <h3 className="text-[22px] tracking-tight font-bold">Goiânia</h3>
                  </div>
                </div>
                <div className="p-5 flex flex-col justify-between flex-1">
                  <p className="text-[13px] text-[#5C3F3F] mb-4">
                    Capital Sertaneja e Gastronômica. Bares cosmopolitas, praças arborizadas e os melhores restaurantes de alta cozinha regional.
                  </p>
                  <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-[#5C3F3F] text-[13px] font-semibold">
                      <span className="material-symbols-outlined text-[18px] text-[#FF3B4F]">verified_user</span>
                      <span>1.250+ Lugares</span>
                    </div>
                    <button
                      className="px-4 py-2 rounded-full bg-[#F0EDED] hover:bg-[#EAE7E7] text-[#1C1B1B] text-[13px] font-semibold transition-all flex items-center gap-1.5"
                      onClick={() => handleNavigateToCity('caldas-novas', 'Goiânia')}
                      type="button"
                    >
                      <span>Explorar</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 3: Brasília (DF) */}
              <div className="group relative rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    alt="Brasília"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhYSSLh7WIbVuRNZTuuK-8v6Q_rPTjsdcaFHGa8J7JqM6jOMjeBBrNRbaFNz7zkSMcWAvScgwFlaaorg5eMQTSPRW62hC8kyQ0cqqI2eIt8CFQPr-Ch8DvpTDgEDj6Ca9d4GMHUUWcQ7AFFvCktOWxqdlVcMnAQiofTkpAht9SPJ_BjjhPYOgErqWh3Eaj6aMsG47SsdlVzzJzTVnagrZn2Syp7pTvO1CqM-2SnYDp"
                    width={400}
                    height={260}
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#313030]/90 via-[#313030]/20 to-transparent" />
                  <div className="absolute top-4 right-4 bg-[#313030]/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-[#FFB95F]">thumb_up</span>
                    <span>4.8</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-300">Distrito Federal</p>
                    <h3 className="text-[22px] tracking-tight font-bold">Brasília</h3>
                  </div>
                </div>
                <div className="p-5 flex flex-col justify-between flex-1">
                  <p className="text-[13px] text-[#5C3F3F] mb-4">
                    Arquitetura monumental, embaixadas, vida noturna requintada no Pontão do Lago Sul e alta gastronomia internacional.
                  </p>
                  <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-[#5C3F3F] text-[13px] font-semibold">
                      <span className="material-symbols-outlined text-[18px] text-[#FF3B4F]">verified_user</span>
                      <span>940+ Lugares</span>
                    </div>
                    <button
                      className="px-4 py-2 rounded-full bg-[#F0EDED] hover:bg-[#EAE7E7] text-[#1C1B1B] text-[13px] font-semibold transition-all flex items-center gap-1.5"
                      onClick={() => handleNavigateToCity('caldas-novas', 'Brasília')}
                      type="button"
                    >
                      <span>Explorar</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 4: São Paulo (SP) */}
              <div className="group relative rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    alt="São Paulo"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-bNV9-YfG36lpbvMkuX-TAg0t84q1f2OjwZ-aRsAIwSh0gXl7I02T3xayrIYK4DlrMY2fwDf_aELrMxkuXg_5_vdwM_jX0ZOQjttefLT4vkDFw1miNGcRCPY3g1ETqvrreljkyrQ8SWYSfPfK2-AfUqI6d-lI0JV88KvjfXLH1rb1ORopKI0aWsnm2mEitO8InFUWhSPSYiKy4RfPjzXPuE9xbUEktur-bF2aiWl8"
                    width={400}
                    height={260}
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#313030]/90 via-[#313030]/20 to-transparent" />
                  <div className="absolute top-4 right-4 bg-[#313030]/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-[#FFB95F]">thumb_up</span>
                    <span>4.9</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-300">São Paulo</p>
                    <h3 className="text-[22px] tracking-tight font-bold">São Paulo</h3>
                  </div>
                </div>
                <div className="p-5 flex flex-col justify-between flex-1">
                  <p className="text-[13px] text-[#5C3F3F] mb-4">
                    Maior polo gastronômico da América Latina. Estrelas Michelin, padarias premiadas, galerias de arte e centros de compras.
                  </p>
                  <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-[#5C3F3F] text-[13px] font-semibold">
                      <span className="material-symbols-outlined text-[18px] text-[#FF3B4F]">verified_user</span>
                      <span>4.300+ Lugares</span>
                    </div>
                    <button
                      className="px-4 py-2 rounded-full bg-[#F0EDED] hover:bg-[#EAE7E7] text-[#1C1B1B] text-[13px] font-semibold transition-all flex items-center gap-1.5"
                      onClick={() => handleNavigateToCity('caldas-novas', 'São Paulo')}
                      type="button"
                    >
                      <span>Explorar</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 5: Rio de Janeiro (RJ) */}
              <div className="group relative rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    alt="Rio de Janeiro"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCl1DqBM1vLKx2l1ug16pUVHj4iSUYcYheLDCQjfsfm03hjj-2gOkNW_N86-7JQWr4R1Oizc62802RE_WHCImBF2duFPNfvbkA5MbpAkql8uEfzDhmR3a_1BVjimW5FEY6Unzr44IVkxxvnw68MGnzd3hh-yNzIyb0vcpWsi1kVaeZqQ0pHh2nM4RDCSyiHDTUlScBksbV7m2t6bjqwN2b4hpKoPowZzYDaB7Ygpq7Y"
                    width={400}
                    height={260}
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#313030]/90 via-[#313030]/20 to-transparent" />
                  <div className="absolute top-4 right-4 bg-[#313030]/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-[#FFB95F]">thumb_up</span>
                    <span>4.9</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-300">Rio de Janeiro</p>
                    <h3 className="text-[22px] tracking-tight font-bold">Rio de Janeiro</h3>
                  </div>
                </div>
                <div className="p-5 flex flex-col justify-between flex-1">
                  <p className="text-[13px] text-[#5C3F3F] mb-4">
                    A Cidade Maravilhosa. Bares boêmios na Lapa e Ipanema, quiosques sofisticados na orla e roteiros culturais inesquecíveis.
                  </p>
                  <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-[#5C3F3F] text-[13px] font-semibold">
                      <span className="material-symbols-outlined text-[18px] text-[#FF3B4F]">verified_user</span>
                      <span>2.800+ Lugares</span>
                    </div>
                    <button
                      className="px-4 py-2 rounded-full bg-[#F0EDED] hover:bg-[#EAE7E7] text-[#1C1B1B] text-[13px] font-semibold transition-all flex items-center gap-1.5"
                      onClick={() => handleNavigateToCity('caldas-novas', 'Rio de Janeiro')}
                      type="button"
                    >
                      <span>Explorar</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 6: Florianópolis (SC) */}
              <div className="group relative rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    alt="Florianópolis"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLru1PXujrtJszjVS6Alg-CB6MoFZYHsQNvRxgV5fMxB5VkQqJDx_NqgIJJWdiT422_jxW0TMvriLWpT9OQwDhFCNzWYG-54M16yHvckYHIFLtDNYGxqdwOm6ijDnd_a9yzVoH0PqySMPQIKkUbQPEuEhHjBXmFQXs7Z8YZi9SHndDBqWZzuiewiDcFlF47uXBUdOV7QvG4UGpPCAXuVvqsFOkqY5zKcTUpEMlfiqJ"
                    width={400}
                    height={260}
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#313030]/90 via-[#313030]/20 to-transparent" />
                  <div className="absolute top-4 right-4 bg-[#313030]/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-[#FFB95F]">thumb_up</span>
                    <span>4.8</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-300">Santa Catarina</p>
                    <h3 className="text-[22px] tracking-tight font-bold">Florianópolis</h3>
                  </div>
                </div>
                <div className="p-5 flex flex-col justify-between flex-1">
                  <p className="text-[13px] text-[#5C3F3F] mb-4">
                    A Ilha da Magia. Ostras frescas premiadas mundialmente, praias paradisíacas e um vibrante ecossistema de lazer e inovação.
                  </p>
                  <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-[#5C3F3F] text-[13px] font-semibold">
                      <span className="material-symbols-outlined text-[18px] text-[#FF3B4F]">verified_user</span>
                      <span>670+ Lugares</span>
                    </div>
                    <button
                      className="px-4 py-2 rounded-full bg-[#F0EDED] hover:bg-[#EAE7E7] text-[#1C1B1B] text-[13px] font-semibold transition-all flex items-center gap-1.5"
                      onClick={() => handleNavigateToCity('caldas-novas', 'Florianópolis')}
                      type="button"
                    >
                      <span>Explorar</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SEÇÃO 3: COMO FUNCIONA A PLATAFORMA (3 PASSOS) */}
          <section className="w-full bg-[#F6F3F2] py-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF3B4F]">Simples, Preciso e Local</span>
                <h2 className="text-3xl lg:text-[40px] font-bold text-[#1C1B1B] tracking-tight mt-1 mb-3">
                  Como Funciona o Guia da Sua Cidade
                </h2>
                <p className="text-[15px] text-[#5C3F3F]">
                  Sem anúncios invasivos ou algoritmos enviesados. Uma experiência limpa voltada para valorizar os estabelecimentos que realmente fazem a diferença.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Passo 1 */}
                <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all relative border border-gray-100">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFDAD9] text-[#FF3B4F] flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-[28px]">domain</span>
                  </div>
                  <span className="absolute top-6 right-6 text-4xl text-gray-200 leading-none select-none font-bold">01</span>
                  <h3 className="text-[18px] font-bold text-[#1C1B1B] mb-2">1. Escolha sua Cidade</h3>
                  <p className="text-[13px] text-[#5C3F3F] leading-relaxed">
                    Selecione seu município para ter uma experiência 100% personalizada e sem ruído de outras regiões. Tudo focado no seu raio de convivência.
                  </p>
                </div>

                {/* Passo 2 */}
                <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all relative border border-gray-100">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFDAD8] text-[#BB0025] flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-[28px]">verified</span>
                  </div>
                  <span className="absolute top-6 right-6 text-4xl text-gray-200 leading-none select-none font-bold">02</span>
                  <h3 className="text-[18px] font-bold text-[#1C1B1B] mb-2">2. Descubra o Melhor</h3>
                  <p className="text-[13px] text-[#5C3F3F] leading-relaxed">
                    Filtre por restaurantes com selo de excelência, eventos semanais, serviços recomendados pela vizinhança e ofertas exclusivas do comércio local.
                  </p>
                </div>

                {/* Passo 3 */}
                <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all relative border border-gray-100">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFDDB8] text-[#825100] flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-[28px]">stars</span>
                  </div>
                  <span className="absolute top-6 right-6 text-4xl text-gray-200 leading-none select-none font-bold">03</span>
                  <h3 className="text-[18px] font-bold text-[#1C1B1B] mb-2">3. Aproveite & Avalie</h3>
                  <p className="text-[13px] text-[#5C3F3F] leading-relaxed">
                    Acesse horários em tempo real, cardápios, WhatsApp direto, rotas de GPS e contribua avaliando para fortalecer os negócios locais.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SEÇÃO 4: CATEGORIAS MAIS PROCURADAS NACIONALMENTE */}
          <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF3B4F]">Catálogo Setorial</span>
                <h2 className="text-3xl lg:text-[40px] font-bold text-[#1C1B1B] tracking-tight mt-1">Categorias Mais Procuradas</h2>
                <p className="text-[15px] text-[#5C3F3F] mt-2">
                  Navegue pelas principais áreas de interesse em qualquer município do país
                </p>
              </div>
              <span className="text-[13px] text-[#5C3F3F] hidden md:block">Mais de 40 subcategorias ativas</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { label: 'Gastronomia & Bares', icon: 'restaurant', slug: 'restaurantes' },
                { label: 'Parques & Termas', icon: 'pool', slug: 'termas' },
                { label: 'Hospedagem & Pousadas', icon: 'hotel', slug: 'hospedagem' },
                { label: 'Eventos & Festivais', icon: 'confirmation_number', slug: 'eventos' },
                { label: 'Comércio Local', icon: 'shopping_bag', slug: 'comercio' },
                { label: 'Saúde & Beleza', icon: 'spa', slug: 'saude' },
                { label: 'Serviços Especializados', icon: 'handyman', slug: 'servicos' },
                { label: 'Passeios & Experiências', icon: 'attractions', slug: 'experiencias' },
              ].map((cat) => (
                <Link
                  key={cat.label}
                  href={`/caldas-novas/lugares?cat=${cat.slug}`}
                  className="flex flex-col items-center text-center p-5 rounded-2xl bg-white hover:bg-gray-50 transition-all group shadow-sm hover:shadow-md border border-gray-100"
                >
                  <div className="w-12 h-12 rounded-full bg-[#FF3B4F]/10 text-[#FF3B4F] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
                  </div>
                  <span className="text-[13px] font-semibold text-[#1C1B1B] group-hover:text-[#FF3B4F] transition-colors">
                    {cat.label}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* SEÇÃO 5: BANNER PROMOCIONAL PARA NEGÓCIOS LOCAIS */}
          <section className="max-w-7xl mx-auto px-6 lg:px-12 py-8 w-full">
            <div className="relative rounded-3xl overflow-hidden shadow-xl p-8 sm:p-12 lg:p-16 text-white" style={{ background: 'linear-gradient(135deg, rgb(255, 59, 79) 0%, rgb(225, 34, 61) 50%, rgb(187, 0, 37) 100%)' }}>
              <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 w-64 h-64 rounded-full bg-black/10 blur-2xl pointer-events-none" />
              <div className="relative z-10 max-w-3xl flex flex-col items-start">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm mb-4">
                  <span className="material-symbols-outlined text-[16px] text-[#FFDDB8]">verified</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white">Para Empreendedores & Lojistas</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 leading-tight">
                  Seu negócio merece estar entre os melhores da sua cidade!
                </h2>
                <p className="text-[16px] text-white/90 mb-8 max-w-2xl leading-relaxed">
                  Aumente sua visibilidade, atraia novos clientes e conecte-se com milhares de consumidores qualificados que buscam pelos seus serviços diariamente no maior guia do Brasil.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/anuncie"
                    className="px-6 py-3.5 rounded-full bg-white text-[#FF3B4F] hover:bg-gray-50 text-[14px] font-bold transition-all shadow-md hover:scale-[1.02] flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">storefront</span>
                    <span>Cadastrar Meu Estabelecimento</span>
                  </Link>
                  <Link
                    href="/anuncie#planos"
                    className="px-6 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-[14px] font-bold backdrop-blur-sm transition-all flex items-center gap-2"
                  >
                    <span>Conhecer Planos de Visibilidade</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* SEÇÃO 6: ESTATÍSTICAS DA REDE */}
          <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center text-center border border-gray-100">
                <span className="material-symbols-outlined text-[#FF3B4F] text-[32px] mb-2">map</span>
                <span className="text-4xl font-extrabold text-[#1C1B1B] tracking-tight">27</span>
                <span className="text-[13px] font-semibold text-[#5C3F3F] mt-1">Estados & DF Cobertos</span>
                <div className="w-8 h-0.5 bg-[#FF3B4F]/20 rounded-full mt-3" />
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center text-center border border-gray-100">
                <span className="material-symbols-outlined text-[#FF3B4F] text-[32px] mb-2">location_city</span>
                <span className="text-4xl font-extrabold text-[#1C1B1B] tracking-tight">+1.500</span>
                <span className="text-[13px] font-semibold text-[#5C3F3F] mt-1">Cidades Mapeadas</span>
                <div className="w-8 h-0.5 bg-[#FF3B4F]/20 rounded-full mt-3" />
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center text-center border border-gray-100">
                <span className="material-symbols-outlined text-[#FF3B4F] text-[32px] mb-2">rate_review</span>
                <span className="text-4xl font-extrabold text-[#1C1B1B] tracking-tight">+85.000</span>
                <span className="text-[13px] font-semibold text-[#5C3F3F] mt-1">Locais Avaliados</span>
                <div className="w-8 h-0.5 bg-[#FF3B4F]/20 rounded-full mt-3" />
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center text-center border border-gray-100">
                <span className="material-symbols-outlined text-[#FF3B4F] text-[32px] mb-2">visibility</span>
                <span className="text-4xl font-extrabold text-[#1C1B1B] tracking-tight">+2.5M</span>
                <span className="text-[13px] font-semibold text-[#5C3F3F] mt-1">Visitas Mensais</span>
                <div className="w-8 h-0.5 bg-[#FF3B4F]/20 rounded-full mt-3" />
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      {/* TOAST DE FEEDBACK INTERATIVO */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#313030] text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3 border border-gray-700 animate-in slide-in-from-bottom duration-300">
          <div className="w-10 h-10 rounded-full bg-[#FF3B4F] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-[20px]">explore</span>
          </div>
          <div className="flex-1">
            <h4 className="text-[14px] font-bold text-white">{toastMessage.title}</h4>
            <p className="text-[12px] text-gray-300 mt-0.5">{toastMessage.desc}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
}

