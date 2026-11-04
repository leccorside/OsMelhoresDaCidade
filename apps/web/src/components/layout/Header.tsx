'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export interface HeaderProps {
  currentCitySlug?: string;
  currentCityName?: string;
  currentCityUf?: string;
  showCityPill?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentCitySlug = 'caldas-novas',
  currentCityName = 'Caldas Novas',
  currentCityUf = 'GO',
  showCityPill = true,
}) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [lugaresMenuOpen, setLugaresMenuOpen] = useState(false);

  const cityPrefix = currentCitySlug ? `/${currentCitySlug}` : '/caldas-novas';

  const citiesList = [
    { name: 'Caldas Novas', uf: 'GO', slug: 'caldas-novas', badge: 'Estância Hidrotermal', active: true },
    { name: 'Goiânia', uf: 'GO', slug: 'goiania', badge: 'Em breve', active: false },
    { name: 'Brasília', uf: 'DF', slug: 'brasilia', badge: 'Em breve', active: false },
    { name: 'São Paulo', uf: 'SP', slug: 'sao-paulo', badge: 'Em breve', active: false },
    { name: 'Rio de Janeiro', uf: 'RJ', slug: 'rio-de-janeiro', badge: 'Em breve', active: false },
    { name: 'Florianópolis', uf: 'SC', slug: 'florianopolis', badge: 'Em breve', active: false },
  ];

  const handleSelectCity = (slug: string) => {
    setCityModalOpen(false);
    router.push(`/${slug}`);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 shadow-[0_1px_8px_rgba(0,0,0,0.04)] bg-white">
        {/* 1. TOP BAR INSTITUCIONAL ESCURA */}
        <div className="bg-[#313030] text-[#F3F0EF]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 h-10 flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="material-symbols-outlined text-[16px] text-[#FFB95F] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              <p className="truncate text-[#F3F0EF]">O maior guia comercial, turístico e gastronômico do Brasil</p>
            </div>
            <div className="hidden md:flex items-center gap-6 shrink-0">
              <div className="flex items-center gap-2">
                <a
                  aria-label="Canal de suporte"
                  className="flex items-center gap-1 text-[#F3F0EF] hover:text-white transition-colors"
                  href="tel:1140028922"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  <span>(11) 4002-8922</span>
                </a>
              </div>
              <div className="flex items-center gap-3">
                <a
                  aria-label="Instagram oficial"
                  className="text-[#F3F0EF] hover:text-white transition-colors flex items-center"
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                </a>
                <a
                  aria-label="Facebook oficial"
                  className="text-[#F3F0EF] hover:text-white transition-colors flex items-center"
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="material-symbols-outlined text-[16px]">share</span>
                </a>
                <a
                  aria-label="YouTube oficial"
                  className="text-[#F3F0EF] hover:text-white transition-colors flex items-center"
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="material-symbols-outlined text-[16px]">smart_display</span>
                </a>
              </div>
              <div className="relative flex items-center gap-1 text-[#F3F0EF]">
                <span className="cursor-pointer hover:text-white flex items-center gap-1">
                  <span>🇧🇷 Português</span>
                  <span className="material-symbols-outlined text-[14px]">expand_more</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. HEADER PRINCIPAL BRANCO */}
        <div className="bg-white border-b border-[#F0EDED]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link className="flex items-center shrink-0" href={cityPrefix}>
                <Image
                  alt="Os Melhores da Cidade"
                  className="h-10 w-auto object-contain"
                  src="/logo-01.png"
                  width={160}
                  height={40}
                  priority
                />
              </Link>
              <nav className="hidden xl:flex items-center gap-2">
                {/* Dropdown de Lugares com ponte contígua e suporte a hover e clique */}
                <div
                  className="relative group"
                  onMouseEnter={() => setLugaresMenuOpen(true)}
                  onMouseLeave={() => setLugaresMenuOpen(false)}
                >
                  <button
                    onClick={() => setLugaresMenuOpen(!lugaresMenuOpen)}
                    className="flex items-center gap-1 text-[13px] font-semibold text-[#5C3F3F] hover:text-[#1C1B1B] transition-colors px-2 py-1"
                    type="button"
                    aria-expanded={lugaresMenuOpen}
                  >
                    <span>Lugares</span>
                    <span
                      className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
                        lugaresMenuOpen ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  {/* Wrapper contíguo: o padding superior (pt-2) garante que o mouse nunca saia da área de hover */}
                  <div
                    className={`absolute left-0 top-full pt-1.5 w-56 z-50 transition-all duration-150 ${
                      lugaresMenuOpen
                        ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                        : 'opacity-0 invisible -translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto group-hover:translate-y-0'
                    }`}
                  >
                    <div className="bg-white rounded-2xl shadow-[0_12px_28px_-4px_rgba(23,23,23,0.12)] py-2 border border-[#EAE7E7] overflow-hidden">
                      <Link
                        onClick={() => setLugaresMenuOpen(false)}
                        className="block px-4 py-2 text-[13px] font-medium text-[#5C3F3F] hover:bg-[#F6F3F2] hover:text-[#1C1B1B] transition-colors"
                        href={`${cityPrefix}/lugares`}
                      >
                        Todos os Lugares
                      </Link>
                      <Link
                        onClick={() => setLugaresMenuOpen(false)}
                        className="block px-4 py-2 text-[13px] font-medium text-[#5C3F3F] hover:bg-[#F6F3F2] hover:text-[#1C1B1B] transition-colors"
                        href={`${cityPrefix}/lugares?cat=restaurantes`}
                      >
                        Restaurantes & Bares
                      </Link>
                      <Link
                        onClick={() => setLugaresMenuOpen(false)}
                        className="block px-4 py-2 text-[13px] font-medium text-[#5C3F3F] hover:bg-[#F6F3F2] hover:text-[#1C1B1B] transition-colors"
                        href={`${cityPrefix}/lugares?cat=hoteis`}
                      >
                        Hotéis & Pousadas
                      </Link>
                      <Link
                        onClick={() => setLugaresMenuOpen(false)}
                        className="block px-4 py-2 text-[13px] font-medium text-[#5C3F3F] hover:bg-[#F6F3F2] hover:text-[#1C1B1B] transition-colors"
                        href={`${cityPrefix}/lugares?cat=servicos`}
                      >
                        Serviços
                      </Link>
                      <Link
                        onClick={() => setLugaresMenuOpen(false)}
                        className="block px-4 py-2 text-[13px] font-medium text-[#5C3F3F] hover:bg-[#F6F3F2] hover:text-[#1C1B1B] transition-colors"
                        href={`${cityPrefix}/lugares?cat=comercio`}
                      >
                        Comércio
                      </Link>
                    </div>
                  </div>
                </div>

                <Link className="text-[13px] font-semibold text-[#5C3F3F] hover:text-[#1C1B1B] transition-colors px-2 py-1" href={`${cityPrefix}/categorias`}>
                  Categorias
                </Link>
                <Link className="text-[13px] font-semibold text-[#5C3F3F] hover:text-[#1C1B1B] transition-colors px-2 py-1" href={`${cityPrefix}/eventos`}>
                  Eventos
                </Link>
                <Link className="text-[13px] font-semibold text-[#5C3F3F] hover:text-[#1C1B1B] transition-colors px-2 py-1" href={`${cityPrefix}/blog`}>
                  Blog
                </Link>
                <Link className="text-[13px] font-semibold text-[#5C3F3F] hover:text-[#1C1B1B] transition-colors px-2 py-1" href="/contato">
                  Contato
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {/* Botão Selecionar Cidade com Pin Vermelho */}
              <button
                onClick={() => setCityModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F0EDED] hover:bg-[#EAE7E7] transition-colors text-[13px] font-semibold text-[#1C1B1B]"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-[#FF3B4F]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  location_on
                </span>
                <span className="hidden md:inline">{currentCityName} ({currentCityUf})</span>
                <span className="material-symbols-outlined text-[16px] text-gray-500">expand_more</span>
              </button>

              {/* Botão de Busca */}
              <Link
                href={`${cityPrefix}/lugares`}
                aria-label="Buscar lugares"
                className="p-2 rounded-full hover:bg-[#F0EDED] text-[#5C3F3F] hover:text-[#1C1B1B] transition-colors flex items-center"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
              </Link>

              {/* Botão Vermelho Arredondado Anuncie Seu Negócio */}
              <Link
                href="/anuncie"
                className="inline-flex items-center gap-1.5 bg-[#FF3B4F] hover:bg-[#D91F35] text-white px-4 py-2 rounded-full text-[13px] font-semibold transition-all shadow-[0_2px_8px_-1px_rgba(23,23,23,0.04)]"
              >
                <span className="material-symbols-outlined text-[18px]">storefront</span>
                <span className="hidden sm:inline">Anuncie seu Negócio</span>
              </Link>

              {/* Avatar Vermelho com Ícone Branco */}
              <Link
                href="/login"
                className="w-8 h-8 rounded-full bg-[#FF3B4F] flex items-center justify-center shrink-0 text-white shadow-sm hover:opacity-90 transition"
                title="Entrar ou acessar conta"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
              </Link>

              {/* Gatilho Mobile Menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-lg text-[#1C1B1B] hover:bg-gray-100"
                aria-label="Abrir menu"
              >
                <span className="material-symbols-outlined text-[24px]">
                  {mobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. SUB-BARRA CONTEXTUAL DA CIDADE */}
        {showCityPill && (
          <div className="w-full bg-[#F6F3F2] px-6 py-2 border-b border-[#F0EDED]">
            <div className="max-w-7xl mx-auto flex items-center justify-between text-[13px] font-semibold">
              <div className="flex items-center gap-2 text-[#1C1B1B]">
                <span className="material-symbols-outlined text-[16px] text-[#FF3B4F]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  location_on
                </span>
                <span>
                  Você está explorando o guia de: <strong className="text-[#1C1B1B] text-[14px]">{currentCityName}, {currentCityUf}</strong>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#FFDDB8] text-[#2A1700] text-[11px] font-bold">
                  Estância Hidrotermal
                </span>
              </div>
              <a className="hidden md:flex items-center gap-1 text-[#FF3B4F] hover:text-[#D91F35] transition-colors" href={`${cityPrefix}#mapa-caldas`}>
                <span className="material-symbols-outlined text-[16px]">map</span>
                <span>Ver no mapa ao vivo</span>
              </a>
            </div>
          </div>
        )}

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-b border-[#E5E7EB] px-6 py-4 space-y-3">
            <Link onClick={() => setMobileMenuOpen(false)} href={`${cityPrefix}/lugares`} className="block text-base font-semibold text-[#1C1B1B]">
              Lugares
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} href={`${cityPrefix}/categorias`} className="block text-base font-semibold text-[#1C1B1B]">
              Categorias
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} href={`${cityPrefix}/eventos`} className="block text-base font-semibold text-[#1C1B1B]">
              Eventos
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} href={`${cityPrefix}/blog`} className="block text-base font-semibold text-[#1C1B1B]">
              Blog
            </Link>
            <Link onClick={() => setMobileMenuOpen(false)} href="/contato" className="block text-base font-semibold text-[#1C1B1B]">
              Contato
            </Link>
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <Link onClick={() => setMobileMenuOpen(false)} href="/anuncie" className="w-full text-center py-2.5 rounded-full bg-[#FF3B4F] text-white text-sm font-bold">
                Anuncie seu Negócio
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Espaçador para compensar o header fixo em todas as páginas */}
      <div className={showCityPill ? "h-[157px]" : "h-[120px]"} aria-hidden="true" />

      {/* MODAL DE SELEÇÃO DE CIDADE */}
      {cityModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#1C1B1B]">Selecione a Cidade</h3>
              <button
                onClick={() => setCityModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Explore o guia municipal completo da sua região.
            </p>
            <div className="space-y-2">
              {citiesList.map((city) => (
                <button
                  key={city.slug}
                  disabled={!city.active}
                  onClick={() => handleSelectCity(city.slug)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition ${
                    city.active
                      ? 'bg-red-50 border border-red-200 text-[#FF3B4F] hover:bg-red-100'
                      : 'bg-gray-50 border border-gray-200 opacity-60 cursor-not-allowed text-gray-700'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm">
                      {city.name} ({city.uf})
                    </h4>
                    <p className="text-[11px] text-gray-500">{city.badge}</p>
                  </div>
                  {city.active ? (
                    <span className="material-symbols-outlined text-[20px] text-[#FF3B4F]">check_circle</span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">
                      Em breve
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
