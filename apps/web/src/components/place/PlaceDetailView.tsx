'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceDetailData, TicketTier, RoomOption, MenuItem } from '@/data/mockPlaceDetails';

interface PlaceDetailViewProps {
  place: PlaceDetailData;
  citySlug?: string;
  cityName?: string;
}

export function PlaceDetailView({
  place,
  citySlug = 'caldas-novas',
  cityName = 'Caldas Novas',
}: PlaceDetailViewProps) {
  // Estados de ações
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Estados específicos para Calculadora de Ingressos (Parque / Atração)
  const [adultTickets, setAdultTickets] = useState(2);
  const [childTickets, setChildTickets] = useState(1);

  // Estados específicos para Hospedagem
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    place.rooms?.[0]?.id || ''
  );
  const [nightsCount, setNightsCount] = useState(2);

  // Exibir toast temporário
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Favoritar / Salvar
  const handleToggleFavorite = () => {
    setIsSaved(!isSaved);
    showToast(!isSaved ? 'Adicionado aos seus favoritos!' : 'Removido dos favoritos.');
  };

  // Compartilhar
  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      try {
        if (navigator.share) {
          await navigator.share({
            title: place.name,
            text: place.shortDescription,
            url: window.location.href,
          });
        } else {
          await navigator.clipboard.writeText(window.location.href);
          showToast('Link copiado para a área de transferência!');
        }
      } catch (err) {
        // Ignora cancelamento do usuário
      }
    }
  };

  // Copiar link
  const handleCopyLink = async () => {
    if (typeof window !== 'undefined') {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Link copiado com sucesso!');
    }
  };

  // Preço calculado dos ingressos
  const adultPrice = place.ticketTiers?.[0]?.price || 115;
  const childPrice = place.ticketTiers?.[1]?.price || 75;
  const ticketSubtotal = adultTickets * adultPrice + childTickets * childPrice;

  // Quarto selecionado e valor total
  const selectedRoom = place.rooms?.find((r) => r.id === selectedRoomId) || place.rooms?.[0];
  const roomDailyRate = selectedRoom?.nightRate || place.baseNightRate || 380;
  const stayTotal = roomDailyRate * nightsCount;

  return (
    <div className="w-full bg-[#FCF9F8] text-[#1C1B1B] font-sans">
      {/* Toast de notificação flutuante */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1B1B] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-semibold animate-fade-in border border-white/10">
          <span className="material-symbols-outlined text-[#FF3B4F] text-[20px]">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. BREADCRUMB & METADATA BAR */}
      <section className="w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3.5">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-[#916F6E] flex-wrap"
          >
            <Link href="/" className="hover:text-[#FF3B4F] transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">home</span>
              <span>Início</span>
            </Link>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <Link href={`/${citySlug}`} className="hover:text-[#FF3B4F] transition-colors">
              {cityName}
            </Link>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <Link
              href={`/${citySlug}/lugares?categoria=${place.categorySlug}`}
              className="hover:text-[#FF3B4F] transition-colors"
            >
              {place.category}
            </Link>
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
            <span className="text-[#1C1B1B] font-bold truncate max-w-xs sm:max-w-md">
              {place.name}
            </span>
          </nav>
        </div>
      </section>

      {/* 2. VENUE HEADER SECTION */}
      <section className="w-full bg-white pb-6 pt-2 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            {/* Esquerda: Badges, Título e Meta */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {place.badge && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFDDB8] text-[#2A1700] text-[11px] font-bold uppercase tracking-wider shadow-xs">
                    <span
                      className="material-symbols-outlined text-[14px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      workspace_premium
                    </span>
                    {place.badge}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE7E7] text-[#1C1B1B] text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[14px]">
                    {place.placeType === 'attraction'
                      ? 'pool'
                      : place.placeType === 'accommodation'
                      ? 'hotel'
                      : 'restaurant'}
                  </span>
                  {place.subCategory || place.category}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {place.statusBadge}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1C1B1B] tracking-tight">
                {place.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[#5C3F3F]">
                <div className="flex items-center gap-1.5 text-[#1C1B1B]">
                  <span
                    className="material-symbols-outlined text-[#A36700] text-[19px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span className="font-extrabold text-base">{place.ratingAverage.toFixed(1)}</span>
                  <span className="text-[#916F6E] underline cursor-pointer hover:text-[#FF3B4F]">
                    ({place.ratingCount.toLocaleString('pt-BR')} avaliações verificadas)
                  </span>
                </div>
                <span className="hidden sm:inline text-gray-300">•</span>
                <span className="flex items-center gap-1 bg-[#F0EDED] px-3 py-1 rounded-full text-xs font-semibold text-[#1C1B1B]">
                  <span>Preço:</span>
                  <strong className="text-[#FF3B4F] font-bold">{place.priceTier}</strong>
                  <span className="text-[#916F6E] text-[11px]">({place.priceRange})</span>
                </span>
                {place.awardBadge && (
                  <>
                    <span className="hidden sm:inline text-gray-300">•</span>
                    <div className="flex items-center gap-1 text-[#825100] font-semibold text-xs">
                      <span className="material-symbols-outlined text-[17px]">verified</span>
                      <span>{place.awardBadge}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Direita: Botões de Ação */}
            <div className="flex items-center gap-2 shrink-0 self-start lg:self-end">
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full transition-all text-xs font-bold shadow-xs ${
                  isSaved
                    ? 'bg-[#FF3B4F] text-white shadow-md'
                    : 'bg-[#F6F3F2] hover:bg-[#EAE7E7] text-[#1C1B1B]'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[18px] ${
                    isSaved ? 'text-white' : 'text-[#FF3B4F]'
                  }`}
                  style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
                >
                  favorite
                </span>
                <span>{isSaved ? 'Salvo' : 'Salvar'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#F6F3F2] hover:bg-[#EAE7E7] transition-all text-[#1C1B1B] text-xs font-bold shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">share</span>
                <span className="hidden sm:inline">Compartilhar</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                title="Copiar Link"
                className="p-2.5 rounded-full bg-[#F6F3F2] hover:bg-[#EAE7E7] transition-all text-[#1C1B1B] text-xs font-bold shadow-xs flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">link</span>
              </button>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  place.name + ' ' + place.address
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#1C1B1B] hover:bg-[#313030] transition-all text-white text-xs font-bold shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px] text-[#FF3B4F]">
                  directions
                </span>
                <span>Rotas GPS</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. IMMERSIVE PHOTO GALLERY (Airbnb Style Grid com 5 fotos) */}
      <section className="w-full bg-white pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="relative grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-3 h-[360px] md:h-[480px] rounded-3xl overflow-hidden shadow-md">
            {/* Foto 1: Hero Principal (Ocupa 2 colunas e 2 linhas) */}
            <div
              onClick={() => {
                setCurrentPhotoIdx(0);
                setGalleryOpen(true);
              }}
              className="relative md:col-span-2 md:row-span-2 group overflow-hidden bg-gray-200 cursor-pointer"
            >
              <img
                src={place.gallery[0]?.url || 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80'}
                alt={place.gallery[0]?.title || place.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="bg-[#FF3B4F] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Visão Geral
                </span>
                <p className="font-bold text-lg md:text-xl mt-1.5 text-white drop-shadow">
                  {place.gallery[0]?.subtitle || place.name}
                </p>
              </div>
            </div>

            {/* Fotos 2, 3, 4, 5 em Grid 2x2 no lado direito */}
            {place.gallery.slice(1, 5).map((img, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setCurrentPhotoIdx(idx + 1);
                  setGalleryOpen(true);
                }}
                className="relative hidden md:block group overflow-hidden bg-gray-200 cursor-pointer"
              >
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                <span className="absolute bottom-2.5 left-2.5 text-white text-xs font-semibold drop-shadow bg-black/40 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                  {img.title}
                </span>
              </div>
            ))}

            {/* Botão Flutuante para Abrir Modal da Galeria */}
            <button
              type="button"
              onClick={() => {
                setCurrentPhotoIdx(0);
                setGalleryOpen(true);
              }}
              className="absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-white/95 hover:bg-white text-[#1C1B1B] px-4 py-2.5 rounded-full text-xs font-bold shadow-xl backdrop-blur-md transition-all hover:scale-105"
            >
              <span className="material-symbols-outlined text-[18px]">photo_library</span>
              <span>Ver todas as fotos ({place.gallery.length || 5})</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. MAIN SPLIT CONTENT (68% Esquerda / 32% Direita Sticky Sidebar) */}
      <section className="w-full py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ======================================================== */}
            {/* COLUNA ESQUERDA: CONTEÚDO PRINCIPAL (8 Cols) */}
            {/* ======================================================== */}
            <div className="lg:col-span-8 space-y-10">
              {/* FAST HIGHLIGHTS STRIP */}
              {place.fastHighlights && place.fastHighlights.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {place.fastHighlights.map((hl, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-4 rounded-2xl flex flex-col items-center text-center shadow-xs border border-gray-100"
                    >
                      <span className="material-symbols-outlined text-[#FF3B4F] text-[28px] mb-1.5">
                        {hl.icon}
                      </span>
                      <span className="text-xs font-bold text-[#1C1B1B]">{hl.title}</span>
                      <span className="text-[11px] text-[#916F6E] mt-0.5">{hl.subtitle}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* CARD: SOBRE O LOCAL & DICA DO GUIA */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-gray-100 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FF3B4F]/10 flex items-center justify-center text-[#FF3B4F]">
                    <span className="material-symbols-outlined">
                      {place.placeType === 'attraction'
                        ? 'water_drop'
                        : place.placeType === 'accommodation'
                        ? 'hotel'
                        : 'restaurant'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1C1B1B]">
                      Sobre o {place.name}
                    </h2>
                    <p className="text-xs text-[#916F6E]">{place.subCategory}</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-sm sm:text-base text-[#5C3F3F] leading-relaxed">
                  {place.fullDescription.map((par, idx) => (
                    <p key={idx}>{par}</p>
                  ))}
                </div>

                {place.guideTip && (
                  <div className="p-4 rounded-2xl bg-[#FFDDB8]/30 border border-[#FFDDB8] flex items-start gap-3.5">
                    <span className="material-symbols-outlined text-[#A36700] text-[24px] mt-0.5 shrink-0">
                      tips_and_updates
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-[#2A1700] uppercase tracking-wide">
                        Dica dos Melhores da Cidade
                      </h3>
                      <p className="text-xs sm:text-sm text-[#5C3F3F] mt-1 leading-relaxed">
                        {place.guideTip}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ======================================================== */}
              {/* SEÇÃO ESPECÍFICA POR CATEGORIA */}
              {/* ======================================================== */}

              {/* A. CASO: PARQUE AQUÁTICO / ATRAÇÃO -> INGRESSOS & TARIFAS OFICIAIS */}
              {place.placeType === 'attraction' && place.ticketTiers && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-gray-100 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#1C1B1B]">
                        Ingressos & Tarifas Oficiais
                      </h2>
                      <p className="text-xs text-[#916F6E]">
                        Preços de bilheteria e compra antecipada garantida
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[#FF3B4F] text-xs font-bold bg-[#FF3B4F]/10 px-3 py-1 rounded-full self-start sm:self-auto">
                      <span className="material-symbols-outlined text-[16px]">local_offer</span>
                      Desconto online ativo
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {place.ticketTiers.map((tier) => (
                      <div
                        key={tier.id}
                        className="p-5 rounded-2xl bg-[#F6F3F2] flex flex-col justify-between border border-transparent hover:border-[#FF3B4F]/30 hover:shadow-md transition-all"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#1C1B1B] uppercase tracking-wide">
                              {tier.name}
                            </span>
                            {tier.badge && (
                              <span className="text-[10px] font-bold bg-[#FF3B4F] text-white px-2 py-0.5 rounded-full">
                                {tier.badge}
                              </span>
                            )}
                          </div>

                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black text-[#FF3B4F]">
                                R$ {tier.price.toFixed(2).replace('.', ',')}
                              </span>
                              {tier.originalPrice && (
                                <span className="text-xs text-gray-400 line-through">
                                  R$ {tier.originalPrice.toFixed(2).replace('.', ',')}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-500">por pessoa / dia</span>
                          </div>

                          <p className="text-xs text-[#5C3F3F] leading-relaxed">
                            {tier.description}
                          </p>

                          <ul className="space-y-1.5 pt-2 border-t border-gray-200">
                            {tier.features.map((feat, fIdx) => (
                              <li key={fIdx} className="flex items-center gap-2 text-xs text-[#1C1B1B]">
                                <span className="material-symbols-outlined text-emerald-600 text-[16px]">
                                  check
                                </span>
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <p className="text-[11px] text-[#916F6E] mt-4 pt-2 border-t border-gray-200">
                          {tier.rules}
                        </p>
                      </div>
                    ))}
                  </div>

                  {place.partnerHotelNotice && (
                    <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-start gap-3">
                      <span className="material-symbols-outlined text-teal-600 text-[24px]">
                        hotel
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-teal-900 uppercase">
                          {place.partnerHotelNotice.title}
                        </h4>
                        <p className="text-xs text-teal-700 mt-0.5">
                          {place.partnerHotelNotice.desc}
                        </p>
                        <Link
                          href={place.partnerHotelNotice.linkHref}
                          className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 underline mt-1.5 hover:text-teal-900"
                        >
                          <span>{place.partnerHotelNotice.linkText}</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* B. CASO: HOSPEDAGEM / POUSADA -> OPÇÕES DE ACOMODAÇÃO & DIÁRIAS */}
              {place.placeType === 'accommodation' && place.rooms && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-gray-100 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#1C1B1B]">
                        Opções de Acomodação & Diárias
                      </h2>
                      <p className="text-xs text-[#916F6E]">
                        Tarifas oficiais diretas com café colonial goiano incluso
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-bold bg-emerald-50 px-3 py-1 rounded-full self-start sm:self-auto border border-emerald-200">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      Melhor Preço Garantido
                    </span>
                  </div>

                  <div className="space-y-4">
                    {place.rooms.map((room) => {
                      const isSelected = selectedRoomId === room.id;
                      return (
                        <div
                          key={room.id}
                          className={`rounded-2xl overflow-hidden border transition-all flex flex-col md:flex-row ${
                            isSelected
                              ? 'border-[#FF3B4F] ring-2 ring-[#FF3B4F]/20 bg-red-50/10'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="md:w-5/12 relative h-48 md:h-auto min-h-[190px]">
                            <img
                              src={room.image}
                              alt={room.name}
                              className="w-full h-full object-cover"
                            />
                            {room.badge && (
                              <span className="absolute top-3 left-3 bg-[#FF3B4F] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                                {room.badge}
                              </span>
                            )}
                          </div>

                          <div className="p-5 md:w-7/12 flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-bold text-base text-[#1C1B1B]">{room.name}</h3>
                                <span className="text-xs font-bold text-[#916F6E] shrink-0">
                                  {room.sizeM2} m²
                                </span>
                              </div>
                              <p className="text-xs text-[#5C3F3F] leading-relaxed">
                                {room.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#1C1B1B]">
                                <span className="inline-flex items-center gap-1 bg-[#F6F3F2] px-2.5 py-1 rounded-lg">
                                  <span className="material-symbols-outlined text-[16px] text-[#FF3B4F]">
                                    group
                                  </span>
                                  {room.capacity}
                                </span>
                                <span className="inline-flex items-center gap-1 bg-[#F6F3F2] px-2.5 py-1 rounded-lg">
                                  <span className="material-symbols-outlined text-[16px] text-[#FF3B4F]">
                                    bed
                                  </span>
                                  {room.bed}
                                </span>
                              </div>
                            </div>

                            <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between">
                              <div>
                                <span className="text-xs text-[#916F6E] block">A partir de</span>
                                <div className="flex items-baseline gap-1">
                                  <span className="text-xl font-black text-[#FF3B4F]">
                                    R$ {room.nightRate}
                                  </span>
                                  <span className="text-xs text-gray-500">/ noite</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRoomId(room.id);
                                  showToast(`${room.name} selecionado para cotação!`);
                                }}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                                  isSelected
                                    ? 'bg-[#FF3B4F] text-white shadow-sm'
                                    : 'bg-[#F0EDED] hover:bg-gray-200 text-[#1C1B1B]'
                                }`}
                              >
                                {isSelected ? 'Quarto Selecionado' : 'Selecionar Quarto'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* C. CASO: RESTAURANTE / GASTRONOMIA -> DESTAQUES DO CARDÁPIO & ADEGA */}
              {place.placeType === 'restaurant' && place.menuHighlights && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-gray-100 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#1C1B1B]">
                        Destaques do Cardápio & Gastronomia
                      </h2>
                      <p className="text-xs text-[#916F6E]">
                        Receitas artesanais clássicas preparadas diariamente
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[#FF3B4F] text-xs font-bold bg-[#FF3B4F]/10 px-3 py-1 rounded-full self-start sm:self-auto">
                      <span className="material-symbols-outlined text-[16px]">menu_book</span>
                      {place.cuisine}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {place.menuHighlights.map((dish) => (
                      <div
                        key={dish.id}
                        className="rounded-2xl overflow-hidden border border-gray-100 bg-[#F6F3F2] flex flex-col justify-between hover:shadow-md transition-shadow"
                      >
                        <div className="relative h-44 w-full bg-gray-200">
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-full h-full object-cover"
                          />
                          {dish.badge && (
                            <span className="absolute top-2.5 left-2.5 bg-[#FF3B4F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                              {dish.badge}
                            </span>
                          )}
                          <span className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-xs font-black px-2.5 py-1 rounded-lg">
                            {dish.price}
                          </span>
                        </div>
                        <div className="p-4 space-y-1.5">
                          <h4 className="font-bold text-sm text-[#1C1B1B]">{dish.name}</h4>
                          <p className="text-xs text-[#5C3F3F] leading-relaxed line-clamp-2">
                            {dish.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {place.wineCellar && (
                    <div className="p-5 rounded-2xl bg-[#FAF5F0] border border-[#E8D9C5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#825100]/10 flex items-center justify-center text-[#825100] shrink-0">
                          <span className="material-symbols-outlined text-[24px]">wine_bar</span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#825100] uppercase tracking-wide">
                            {place.wineCellar.title} (+{place.wineCellar.totalLabels} Rótulos)
                          </h4>
                          <p className="text-xs text-[#5C3F3F] mt-0.5 leading-relaxed">
                            {place.wineCellar.desc}
                          </p>
                          <p className="text-[11px] font-semibold text-emerald-700 mt-1">
                            ✓ {place.wineCellar.corkageRule}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* COMODIDADES & INFRAESTRUTURA COMPLETA */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-gray-100 space-y-5">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1C1B1B] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#FF3B4F]">hotel_class</span>
                  Comodidades & Infraestrutura Completa
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                  {place.amenities.map((am, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0">
                        check_circle
                      </span>
                      <span className="text-xs sm:text-sm text-[#1C1B1B]">{am}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* LOCALIZAÇÃO & MAPA INTERATIVO */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-gray-100 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1C1B1B] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#FF3B4F]">location_on</span>
                      Localização & Como Chegar
                    </h2>
                    <p className="text-xs text-[#916F6E] mt-0.5">{place.address}</p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      place.name + ' ' + place.address
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F6F3F2] hover:bg-gray-200 text-[#1C1B1B] text-xs font-bold transition-colors"
                  >
                    <span>Abrir GPS</span>
                    <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                  </a>
                </div>

                {/* Mapa Preview */}
                <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner flex items-center justify-center">
                  <iframe
                    title="Mapa de Localização"
                    width="100%"
                    height="100%"
                    loading="lazy"
                    className="border-0 w-full h-full"
                    src={`https://maps.google.com/maps?q=${place.lat},${place.lng}&z=15&output=embed`}
                  />
                  <div className="absolute bottom-3 left-3 bg-white/95 px-3 py-1.5 rounded-xl shadow-md text-[11px] font-bold text-[#1C1B1B] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#FF3B4F] text-[16px]">
                      near_me
                    </span>
                    <span>{place.neighborhood}</span>
                  </div>
                </div>

                <p className="text-xs text-[#5C3F3F] leading-relaxed bg-[#F6F3F2] p-3 rounded-xl border border-gray-200">
                  <strong className="text-[#1C1B1B]">Como Chegar: </strong>
                  {place.locationInfo.directionsTip}
                </p>
              </div>

              {/* HORÁRIOS DE FUNCIONAMENTO */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-gray-100 space-y-4">
                <h2 className="text-xl font-bold text-[#1C1B1B] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#FF3B4F]">schedule</span>
                  Horários de Funcionamento
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {place.operatingHours.map((h, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#F6F3F2] border border-gray-200">
                      <span className="font-bold text-[#1C1B1B] block">{h.label}</span>
                      <span className="text-[#FF3B4F] font-extrabold text-sm mt-0.5 block">
                        {h.time}
                      </span>
                      {h.note && <span className="text-[#916F6E] text-[11px] mt-0.5 block">{h.note}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* AVALIAÇÕES DE VISITANTES REAIS */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-gray-100 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1C1B1B]">
                      Avaliações de Visitantes Reais
                    </h2>
                    <p className="text-xs text-[#916F6E]">
                      Mais de {place.ratingCount.toLocaleString('pt-BR')} pessoas avaliaram sua experiência
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('Para avaliar, faça login na sua conta de usuário.')}
                    className="px-4 py-2 rounded-full bg-[#1C1B1B] hover:bg-[#313030] text-white text-xs font-bold transition self-start sm:self-auto"
                  >
                    Deixar uma Avaliação
                  </button>
                </div>

                {/* Score breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-5 rounded-2xl bg-[#F6F3F2]">
                  <div className="md:col-span-4 flex flex-col items-center justify-center text-center sm:border-r border-gray-200 pr-0 sm:pr-4">
                    <span className="text-5xl font-black text-[#1C1B1B]">
                      {place.ratingAverage.toFixed(1)}
                    </span>
                    <div className="flex items-center gap-1 my-1 text-[#A36700]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span
                          key={s}
                          className="material-symbols-outlined text-[20px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-[#916F6E]">
                      Baseado em {place.ratingCount} avaliações
                    </span>
                  </div>

                  <div className="md:col-span-8 space-y-2">
                    {place.ratingBreakdown.categories.map((cat, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs">
                        <span className="w-40 font-semibold text-[#1C1B1B] truncate">{cat.name}</span>
                        <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className="h-full bg-[#FF3B4F] rounded-full"
                            style={{ width: `${(cat.score / 5) * 100}%` }}
                          />
                        </div>
                        <span className="font-bold text-[#1C1B1B] w-8 text-right">
                          {cat.score.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Depoimentos individuais */}
                <div className="space-y-4 pt-2">
                  {place.reviews.map((rev, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-gray-100 bg-white space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={rev.avatar}
                            alt={rev.author}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          />
                          <div>
                            <span className="font-bold text-xs text-[#1C1B1B] block">{rev.author}</span>
                            <span className="text-[11px] text-[#916F6E]">{rev.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[#A36700]">
                          {[...Array(rev.rating)].map((_, s) => (
                            <span
                              key={s}
                              className="material-symbols-outlined text-[15px]"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#1C1B1B]">{rev.title}</h4>
                      <p className="text-xs sm:text-sm text-[#5C3F3F] leading-relaxed">{rev.text}</p>
                      {rev.stayDetails && (
                        <span className="inline-block text-[11px] text-[#916F6E] bg-gray-50 px-2.5 py-0.5 rounded">
                          {rev.stayDetails} • {rev.date}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* PERGUNTAS FREQUENTES (FAQ) COM ACCORDION */}
              {place.faq && place.faq.length > 0 && (
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-gray-100 space-y-5">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#1C1B1B] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#FF3B4F]">help</span>
                    Dúvidas Frequentes sobre o Local
                  </h2>
                  <div className="space-y-3">
                    {place.faq.map((item, idx) => {
                      const isOpen = openFaqIndex === idx;
                      return (
                        <div
                          key={idx}
                          className="rounded-2xl border border-gray-200 overflow-hidden transition-all"
                        >
                          <button
                            type="button"
                            onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                            className="w-full p-4 text-left flex items-center justify-between gap-3 bg-white hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-xs sm:text-sm font-bold text-[#1C1B1B]">
                              {item.question}
                            </span>
                            <span
                              className={`material-symbols-outlined text-[20px] text-gray-500 transition-transform ${
                                isOpen ? 'rotate-180 text-[#FF3B4F]' : ''
                              }`}
                            >
                              expand_more
                            </span>
                          </button>
                          {isOpen && (
                            <div className="p-4 pt-1 text-xs sm:text-sm text-[#5C3F3F] leading-relaxed bg-[#F6F3F2]/50 border-t border-gray-100">
                              {item.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* COLUNA DIREITA: STICKY SIDEBAR (4 Cols - 32%) */}
            {/* ======================================================== */}
            <div className="lg:col-span-4 sticky top-32 space-y-6">
              {/* SIDEBAR CARD: ATRAÇÃO / PARQUE (Calculadora de Ingressos) */}
              {place.placeType === 'attraction' && (
                <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-200 space-y-5">
                  <div className="pb-3 border-b border-gray-100">
                    <span className="text-xs text-[#916F6E] block">Ingressos a partir de</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-3xl font-black text-[#FF3B4F]">R$ {adultPrice}</span>
                      <span className="text-xs text-gray-400">/ adulto</span>
                    </div>
                  </div>

                  {/* Seletor de Quantidades */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F6F3F2]">
                      <div>
                        <span className="font-bold text-xs text-[#1C1B1B] block">Adultos</span>
                        <span className="text-[11px] text-[#916F6E]">R$ {adultPrice} cada</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setAdultTickets(Math.max(1, adultTickets - 1))}
                          className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center font-bold text-sm hover:bg-gray-100 transition"
                        >
                          -
                        </button>
                        <span className="font-extrabold text-sm w-4 text-center">{adultTickets}</span>
                        <button
                          type="button"
                          onClick={() => setAdultTickets(adultTickets + 1)}
                          className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center font-bold text-sm hover:bg-gray-100 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F6F3F2]">
                      <div>
                        <span className="font-bold text-xs text-[#1C1B1B] block">Crianças (7-11a)</span>
                        <span className="text-[11px] text-[#916F6E]">R$ {childPrice} cada</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setChildTickets(Math.max(0, childTickets - 1))}
                          className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center font-bold text-sm hover:bg-gray-100 transition"
                        >
                          -
                        </button>
                        <span className="font-extrabold text-sm w-4 text-center">{childTickets}</span>
                        <button
                          type="button"
                          onClick={() => setChildTickets(childTickets + 1)}
                          className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center font-bold text-sm hover:bg-gray-100 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-bold text-xs text-[#1C1B1B]">Subtotal Previsto:</span>
                    <span className="text-xl font-black text-[#FF3B4F]">
                      R$ {ticketSubtotal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  {/* CTAs */}
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        showToast(`Redirecionando para a bilheteria oficial: ${adultTickets} adultos e ${childTickets} crianças.`)
                      }
                      className="w-full py-3.5 px-4 rounded-full bg-[#FF3B4F] hover:bg-[#E02639] text-white font-bold text-xs uppercase tracking-wider text-center shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                      <span>Comprar Ingressos Oficiais</span>
                    </button>

                    <a
                      href={`https://wa.me/${place.whatsapp}?text=${encodeURIComponent(
                        `Olá! Gostaria de comprar ingressos para o ${place.name} (${adultTickets} adultos e ${childTickets} crianças).`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                      <span>Falar na Bilheteria WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}

              {/* SIDEBAR CARD: HOSPEDAGEM (Calculadora de Diárias) */}
              {place.placeType === 'accommodation' && (
                <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-200 space-y-5">
                  <div className="pb-3 border-b border-gray-100">
                    <span className="text-xs text-[#916F6E] block">Tarifa por diária</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-3xl font-black text-[#FF3B4F]">R$ {roomDailyRate}</span>
                      <span className="text-xs text-gray-400">/ noite</span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 block mt-1">
                      ✓ Café colonial goiano incluso para todos
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-[#1C1B1B] uppercase tracking-wide block mb-1">
                        Acomodação Selecionada
                      </label>
                      <select
                        value={selectedRoomId}
                        onChange={(e) => setSelectedRoomId(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-[#1C1B1B] bg-white focus:outline-none focus:border-[#FF3B4F]"
                      >
                        {place.rooms?.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} (R$ {r.nightRate}/noite)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#1C1B1B] uppercase tracking-wide block mb-1">
                        Duração da Estadia (Noites)
                      </label>
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-[#F6F3F2]">
                        <button
                          type="button"
                          onClick={() => setNightsCount(Math.max(1, nightsCount - 1))}
                          className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center font-bold text-sm"
                        >
                          -
                        </button>
                        <span className="font-extrabold text-xs flex-1 text-center">
                          {nightsCount} {nightsCount === 1 ? 'diária' : 'diárias'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setNightsCount(nightsCount + 1)}
                          className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center font-bold text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-bold text-xs text-[#1C1B1B]">Total Estimado:</span>
                    <span className="text-xl font-black text-[#FF3B4F]">
                      R$ {stayTotal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  {/* CTAs */}
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        showToast(`Cotação para ${selectedRoom?.name} (${nightsCount} noites) iniciada!`)
                      }
                      className="w-full py-3.5 px-4 rounded-full bg-[#FF3B4F] hover:bg-[#E02639] text-white font-bold text-xs uppercase tracking-wider text-center shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">hotel</span>
                      <span>Cotar Disponibilidade & Reservar</span>
                    </button>

                    <a
                      href={`https://wa.me/${place.whatsapp}?text=${encodeURIComponent(
                        `Olá! Gostaria de consultar reserva para o ${selectedRoom?.name} na ${place.name} para ${nightsCount} noites.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                      <span>Falar no WhatsApp da Recepção</span>
                    </a>
                  </div>
                </div>
              )}

              {/* SIDEBAR CARD: RESTAURANTE (Reserva de Mesa & Delivery) */}
              {place.placeType === 'restaurant' && (
                <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-200 space-y-5">
                  <div className="pb-3 border-b border-gray-100">
                    <span className="text-xs text-[#916F6E] block">Consumo Médio</span>
                    <span className="text-2xl font-black text-[#FF3B4F] block mt-0.5">
                      {place.averageCost}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 block mt-1">
                      ✓ Valet e estacionamento gratuitos no local
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        showToast('Solicitação de reserva online enviada! O restaurante confirmará em instantes.')
                      }
                      className="w-full py-3.5 px-4 rounded-full bg-[#FF3B4F] hover:bg-[#E02639] text-white font-bold text-xs uppercase tracking-wider text-center shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">table_bar</span>
                      <span>Reservar Mesa Online (Sem Fila)</span>
                    </button>

                    <a
                      href={`https://wa.me/${place.whatsapp}?text=${encodeURIComponent(
                        `Olá! Gostaria de consultar reservas e pedir no cardápio do ${place.name}.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                      <span>Pedir no WhatsApp / Delivery</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => showToast('Abrindo cardápio digital oficial em PDF...')}
                      className="w-full py-2.5 px-4 rounded-full bg-[#F6F3F2] hover:bg-gray-200 text-[#1C1B1B] font-bold text-xs text-center transition flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">menu_book</span>
                      <span>Ver Cardápio Completo em PDF</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CARD DE CONTATO & HORÁRIOS RÁPIDOS */}
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 space-y-4 text-xs">
                <h3 className="font-bold text-sm text-[#1C1B1B] uppercase tracking-wide pb-2 border-b border-gray-100">
                  Canais de Atendimento
                </h3>
                <div className="space-y-3">
                  <a
                    href={`tel:${place.phone.replace(/\D/g, '')}`}
                    className="flex items-center gap-2.5 text-[#1C1B1B] hover:text-[#FF3B4F] transition"
                  >
                    <span className="material-symbols-outlined text-[#FF3B4F] text-[18px]">call</span>
                    <span className="font-semibold">{place.phone}</span>
                  </a>
                  {place.website && (
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 text-[#1C1B1B] hover:text-[#FF3B4F] transition"
                    >
                      <span className="material-symbols-outlined text-[#FF3B4F] text-[18px]">language</span>
                      <span className="font-semibold truncate">Site Oficial</span>
                    </a>
                  )}
                  {place.instagram && (
                    <div className="flex items-center gap-2.5 text-[#1C1B1B]">
                      <span className="material-symbols-outlined text-[#FF3B4F] text-[18px]">
                        photo_camera
                      </span>
                      <span className="font-semibold">{place.instagram}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* SELO DE SEGURANÇA */}
              <div className="p-4 rounded-2xl bg-[#F6F3F2] border border-gray-200 text-center space-y-1">
                <div className="inline-flex items-center gap-1 text-[#825100] font-bold text-xs">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  <span>Garantia Os Melhores da Cidade</span>
                </div>
                <p className="text-[11px] text-[#916F6E]">
                  Estabelecimento auditado, com alvará regular e avaliações 100% verificadas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MODAL DE GALERIA FOTOGRÁFICA COMPLETA */}
      {galleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 animate-fade-in backdrop-blur-md">
          {/* Topo do Modal */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/10">
            <div>
              <h3 className="font-bold text-sm sm:text-base">{place.name}</h3>
              <p className="text-xs text-gray-400">
                Foto {currentPhotoIdx + 1} de {place.gallery.length}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setGalleryOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          {/* Imagem Central com Controles Prev / Next */}
          <div className="relative flex-1 flex items-center justify-center my-4">
            <button
              type="button"
              onClick={() =>
                setCurrentPhotoIdx(
                  currentPhotoIdx === 0 ? place.gallery.length - 1 : currentPhotoIdx - 1
                )
              }
              className="absolute left-2 sm:left-4 z-10 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition border border-white/20"
            >
              <span className="material-symbols-outlined text-[28px]">chevron_left</span>
            </button>

            <img
              src={place.gallery[currentPhotoIdx]?.url}
              alt={place.gallery[currentPhotoIdx]?.title}
              className="max-h-[70vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
            />

            <button
              type="button"
              onClick={() =>
                setCurrentPhotoIdx(
                  currentPhotoIdx === place.gallery.length - 1 ? 0 : currentPhotoIdx + 1
                )
              }
              className="absolute right-2 sm:right-4 z-10 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition border border-white/20"
            >
              <span className="material-symbols-outlined text-[28px]">chevron_right</span>
            </button>
          </div>

          {/* Legenda & Miniaturas no Rodapé */}
          <div className="space-y-3">
            <p className="text-center text-xs text-gray-300 font-medium">
              {place.gallery[currentPhotoIdx]?.title} — {place.gallery[currentPhotoIdx]?.subtitle}
            </p>
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
              {place.gallery.map((g, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentPhotoIdx(idx)}
                  className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    currentPhotoIdx === idx ? 'border-[#FF3B4F] scale-105' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={g.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

