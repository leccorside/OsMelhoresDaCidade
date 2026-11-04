'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Store,
  ExternalLink,
  MapPin,
  Clock,
  Ticket,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UploadCloud,
  ImageIcon,
  Sparkles,
  Search,
  Filter,
  Check,
  CalendarCheck2,
  Tag,
  DollarSign,
} from 'lucide-react';
import {
  fetchMerchantListings,
  fetchEventCategories,
  fetchMerchantEvents,
  createMerchantEventApi,
  updateMerchantEventApi,
  deleteMerchantEventApi,
  uploadImage,
  EventCategoryItem,
  MerchantEventItem,
} from '@/lib/api';

export default function MerchantEventsPage() {
  const [events, setEvents] = useState<MerchantEventItem[]>([]);
  const [categories, setCategories] = useState<EventCategoryItem[]>([]);
  const [listings, setListings] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterListingId, setFilterListingId] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'upcoming' | 'past'>('all');

  // Modais
  const [eventModal, setEventModal] = useState<{
    isOpen: boolean;
    event?: MerchantEventItem | null;
  }>({ isOpen: false, event: null });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
  }>({ isOpen: false, id: '', name: '' });

  // Formulário de Evento
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    programDetails: '',
    categoryId: '',
    listingId: '',
    address: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    isFree: true,
    priceInfo: '',
    ticketUrl: '',
    imageUrl: '',
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auto-fechar feedback após 4 segundos
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Carregar dados iniciais
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [eventsData, catsData, listingsData] = await Promise.all([
        fetchMerchantEvents().catch(() => []),
        fetchEventCategories().catch(() => []),
        fetchMerchantListings().catch(() => []),
      ]);

      setEvents(eventsData || []);
      setCategories(catsData || []);
      setListings(listingsData || []);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Erro ao carregar dados dos eventos.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Handlers do Modal
  const handleOpenModal = (evt?: MerchantEventItem) => {
    if (evt) {
      const startFormatted = evt.startDate ? new Date(evt.startDate).toISOString().slice(0, 10) : '';
      const endFormatted = evt.endDate ? new Date(evt.endDate).toISOString().slice(0, 10) : '';

      setFormData({
        name: evt.name,
        description: evt.description || '',
        programDetails: evt.programDetails || '',
        categoryId: evt.categoryId,
        listingId: evt.listingId || '',
        address: evt.address || '',
        startDate: startFormatted,
        endDate: endFormatted,
        startTime: evt.startTime || '',
        endTime: evt.endTime || '',
        isFree: evt.isFree,
        priceInfo: evt.priceInfo || '',
        ticketUrl: evt.ticketUrl || '',
        imageUrl: evt.images?.find((img) => img.isCover)?.url || evt.images?.[0]?.url || '',
      });
      setEventModal({ isOpen: true, event: evt });
    } else {
      setFormData({
        name: '',
        description: '',
        programDetails: '',
        categoryId: categories[0]?.id || '',
        listingId: listings[0]?.id || '',
        address: '',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: '',
        startTime: '20:00',
        endTime: '',
        isFree: true,
        priceInfo: '',
        ticketUrl: '',
        imageUrl: '',
      });
      setEventModal({ isOpen: true, event: null });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const res = await uploadImage(file, 'events');
      setFormData((prev) => ({ ...prev, imageUrl: res.url }));
      setFeedback({ type: 'success', message: 'Cartaz/foto do evento enviada!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Erro no upload da imagem.' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFeedback({ type: 'error', message: 'O título do evento é obrigatório.' });
      return;
    }
    if (!formData.categoryId) {
      setFeedback({ type: 'error', message: 'Selecione uma categoria para o evento.' });
      return;
    }
    if (!formData.startDate) {
      setFeedback({ type: 'error', message: 'A data do evento é obrigatória.' });
      return;
    }

    try {
      setSaving(true);
      if (eventModal.event) {
        await updateMerchantEventApi(eventModal.event.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          programDetails: formData.programDetails.trim() || undefined,
          categoryId: formData.categoryId,
          listingId: formData.listingId || undefined,
          address: formData.address.trim() || undefined,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          startTime: formData.startTime || undefined,
          endTime: formData.endTime || undefined,
          isFree: formData.isFree,
          priceInfo: !formData.isFree ? formData.priceInfo.trim() || undefined : undefined,
          ticketUrl: formData.ticketUrl.trim() || undefined,
          imageUrl: formData.imageUrl.trim() || undefined,
        });
        setFeedback({ type: 'success', message: 'Evento atualizado com sucesso!' });
      } else {
        await createMerchantEventApi({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          programDetails: formData.programDetails.trim() || undefined,
          categoryId: formData.categoryId,
          listingId: formData.listingId || undefined,
          address: formData.address.trim() || undefined,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          startTime: formData.startTime || undefined,
          endTime: formData.endTime || undefined,
          isFree: formData.isFree,
          priceInfo: !formData.isFree ? formData.priceInfo.trim() || undefined : undefined,
          ticketUrl: formData.ticketUrl.trim() || undefined,
          imageUrl: formData.imageUrl.trim() || undefined,
        });
        setFeedback({ type: 'success', message: 'Evento cadastrado e publicado com sucesso!' });
      }

      setEventModal({ isOpen: false, event: null });
      await loadInitialData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Erro ao salvar evento.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMerchantEventApi(deleteModal.id);
      setFeedback({ type: 'success', message: 'Evento excluído com sucesso!' });
      setDeleteModal({ isOpen: false, id: '', name: '' });
      await loadInitialData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Erro ao excluir evento.' });
    }
  };

  // Filtragem de eventos
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const filteredEvents = events.filter((evt) => {
    // Busca textual
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = evt.name?.toLowerCase().includes(q);
      const matchDesc = evt.description?.toLowerCase().includes(q);
      const matchListing = evt.listing?.name?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchListing) return false;
    }

    // Filtro por estabelecimento
    if (filterListingId !== 'all') {
      if (evt.listingId !== filterListingId) return false;
    }

    // Filtro por período
    if (filterPeriod === 'upcoming') {
      const evtDate = new Date(evt.startDate);
      if (evtDate < now) return false;
    } else if (filterPeriod === 'past') {
      const evtDate = new Date(evt.startDate);
      if (evtDate >= now) return false;
    }

    return true;
  });

  // Métricas
  const totalEvents = events.length;
  const upcomingEvents = events.filter((e) => new Date(e.startDate) >= now).length;
  const freeEvents = events.filter((e) => e.isFree).length;
  const ticketEvents = totalEvents - freeEvents;

  return (
    <div className="space-y-6">
      {/* Topo / Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-[#FF3B4F]" />
            Eventos, Shows & Atrações
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Divulgue música ao vivo, festivais, happy hour e programações especiais do seu estabelecimento.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 bg-[#FF3B4F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Evento / Show
        </button>
      </div>

      {/* Alerta de Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline hover:opacity-80"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total de Eventos</span>
            <CalendarCheck2 className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Próximos / Ativos</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{upcomingEvents}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Entrada Gratuita</span>
            <Tag className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{freeEvents}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Ingressos / Couvert</span>
            <Ticket className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{ticketEvents}</p>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Busca Textual */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome, show..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]/20 focus:border-[#FF3B4F]"
          />
        </div>

        {/* Filtros Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Filtro por Estabelecimento */}
          {listings.length > 0 && (
            <select
              value={filterListingId}
              onChange={(e) => setFilterListingId(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none"
            >
              <option value="all">Todos os Estabelecimentos</option>
              {listings.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title || l.name}
                </option>
              ))}
            </select>
          )}

          {/* Filtro por Período */}
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterPeriod('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterPeriod === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterPeriod('upcoming')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterPeriod === 'upcoming' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Próximos
            </button>
            <button
              onClick={() => setFilterPeriod('past')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterPeriod === 'past' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Passados
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-gray-500">
          <Loader2 className="w-8 h-8 text-[#FF3B4F] animate-spin mb-3" />
          <span className="text-sm font-medium">Carregando seus eventos e shows...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredEvents.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-sm text-center max-w-lg mx-auto my-6">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {searchTerm || filterPeriod !== 'all' || filterListingId !== 'all'
              ? 'Nenhum evento encontrado para este filtro'
              : 'Nenhum evento cadastrado ainda'}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Cadastre apresentações musicais, festivais gastronômicos ou promoções temáticas para atrair o público da cidade.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 bg-[#FF3B4F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Primeiro Evento
          </button>
        </div>
      )}

      {/* Grade de Eventos */}
      {!loading && filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((evt) => {
            const coverImg =
              evt.images?.find((img) => img.isCover)?.url || evt.images?.[0]?.url;
            const eventDate = new Date(evt.startDate);
            const isUpcoming = eventDate >= now;

            const formattedDate = eventDate.toLocaleDateString('pt-BR', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
            });

            return (
              <div
                key={evt.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div>
                  {/* Banner do Evento */}
                  <div className="relative w-full h-44 bg-gray-100 overflow-hidden">
                    {coverImg ? (
                      <Image
                        src={coverImg}
                        alt={evt.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                        <Calendar className="w-10 h-10 mb-1 opacity-40" />
                        <span className="text-xs">Sem cartaz de divulgação</span>
                      </div>
                    )}

                    {/* Badge de Preço / Gratuito */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-xs ${
                          evt.isFree
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {evt.isFree ? (
                          'Gratuito'
                        ) : (
                          <>
                            <Ticket className="w-3.5 h-3.5" />
                            {evt.priceInfo || 'Couvert / Ingresso'}
                          </>
                        )}
                      </span>
                    </div>

                    {/* Badge de Status / Período */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-xs ${
                          isUpcoming
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800/80 text-white'
                        }`}
                      >
                        {isUpcoming ? 'Próximo' : 'Finalizado'}
                      </span>
                    </div>
                  </div>

                  {/* Informações do Evento */}
                  <div className="p-4 space-y-3">
                    {/* Data e Horário */}
                    <div className="flex items-center gap-2 text-xs font-bold text-[#FF3B4F]">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span className="capitalize">{formattedDate}</span>
                      {evt.startTime && <span>• {evt.startTime}</span>}
                    </div>

                    {/* Nome do Evento */}
                    <h2 className="text-base font-bold text-gray-900 leading-snug line-clamp-1">
                      {evt.name}
                    </h2>

                    {/* Descrição Curta */}
                    {evt.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>
                    )}

                    {/* Local do Evento */}
                    <div className="pt-2 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-600">
                      <Store className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="font-semibold truncate">
                        {evt.listing?.name || 'Local próprio / sob consulta'}
                      </span>
                    </div>

                    {/* Link para Compra de Ingresso se houver */}
                    {evt.ticketUrl && (
                      <a
                        href={evt.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline pt-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Comprar Ingressos / Reservas
                      </a>
                    )}
                  </div>
                </div>

                {/* Rodapé do Card com Ações */}
                <div className="px-4 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400" title="Visualizações">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{evt.viewsCount || 0} acessos</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(evt)}
                      className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar Evento"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteModal({
                          isOpen: true,
                          id: evt.id,
                          name: evt.name,
                        })
                      }
                      className="p-1.5 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Excluir Evento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Criar / Editar Evento */}
      {eventModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#FF3B4F]" />
                {eventModal.event ? 'Editar Evento / Show' : 'Novo Evento ou Show'}
              </h3>
              <button
                onClick={() => setEventModal({ isOpen: false, event: null })}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-6 space-y-4 overflow-y-auto">
              {/* Foto / Banner */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Cartaz ou Imagem de Divulgação
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative w-28 h-20 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                    {formData.imageUrl ? (
                      <Image
                        src={formData.imageUrl}
                        alt="Cartaz Preview"
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <label className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                      {uploadingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#FF3B4F]" />
                      ) : (
                        <UploadCloud className="w-4 h-4 text-[#FF3B4F]" />
                      )}
                      <span>{uploadingImage ? 'Enviando banner...' : 'Fazer upload do cartaz'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                        disabled={uploadingImage}
                        onChange={handleImageUpload}
                      />
                    </label>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Banner recomendado em formato paisagem (1200x675) ou cartaz PNG/JPG até 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Título do Evento */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Título do Evento ou Show *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sexta Sertaneja com Lucas & Gabriel, Noite do Jazz, Festival do Chopp..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]/20 focus:border-[#FF3B4F] text-sm text-gray-900 font-medium"
                />
              </div>

              {/* Estabelecimento & Categoria */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Estabelecimento Anfitrião
                  </label>
                  <select
                    value={formData.listingId}
                    onChange={(e) => setFormData({ ...formData, listingId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]/20 focus:border-[#FF3B4F] text-sm text-gray-900 bg-white"
                  >
                    <option value="">Nenhum / Espaço Externo</option>
                    {listings.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title || l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Categoria do Evento *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]/20 focus:border-[#FF3B4F] text-sm text-gray-900 bg-white"
                  >
                    <option value="">Selecione uma categoria...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Datas e Horários */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Data de Início *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]/20 focus:border-[#FF3B4F] text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Data de Término
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]/20 focus:border-[#FF3B4F] text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Horário de Início
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]/20 focus:border-[#FF3B4F] text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Horário de Término
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]/20 focus:border-[#FF3B4F] text-sm text-gray-900"
                  />
                </div>
              </div>

              {/* Preço e Ingressos */}
              <div className="p-4 bg-gray-50 rounded-xl space-y-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isFree}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isFree: e.target.checked,
                          priceInfo: e.target.checked ? '' : formData.priceInfo,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 relative"></div>
                    <span className="text-xs font-bold text-gray-800">
                      Entrada Gratuita (Sem cobrança de couvert ou ingresso)
                    </span>
                  </label>
                </div>

                {!formData.isFree && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Informação de Preço / Couvert
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: R$ 20,00 couvert ou R$ 50,00 pista"
                        value={formData.priceInfo}
                        onChange={(e) => setFormData({ ...formData, priceInfo: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]/20 focus:border-[#FF3B4F] text-sm text-gray-900 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Link para Compra de Ingressos
                      </label>
                      <input
                        type="url"
                        placeholder="Ex: https://sympla.com.br/evento-exemplo"
                        value={formData.ticketUrl}
                        onChange={(e) => setFormData({ ...formData, ticketUrl: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]/20 focus:border-[#FF3B4F] text-sm text-gray-900 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Descrição e Programação */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Descrição do Evento
                </label>
                <textarea
                  rows={3}
                  placeholder="Conte os detalhes do show, bandas participantes, cardápio temático, promoções..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]/20 focus:border-[#FF3B4F] text-sm text-gray-900"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setEventModal({ isOpen: false, event: null })}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="bg-[#FF3B4F] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{eventModal.event ? 'Salvar Alterações' : 'Publicar Evento'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Confirmação de Exclusão */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Excluir Evento?</h3>
            <p className="text-xs text-gray-500 mb-6">
              Tem certeza que deseja remover o evento &quot;<strong className="text-gray-800">{deleteModal.name}</strong>&quot;? Esta ação não pode ser desfeita.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-rose-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors shadow-sm"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

