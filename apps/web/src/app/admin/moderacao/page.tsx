'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Store,
  MapPin,
  Phone,
  MessageCircle,
  User,
  ExternalLink,
  Edit,
  Search,
  Loader2,
  Check,
  X,
  Eye,
  Layers,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  fetchAdminPendingListings,
  fetchAdminModerationStats,
  updateAdminListingStatus,
} from '@/lib/api';

export default function AdminModeracaoPage() {
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [stats, setStats] = useState<{ pendingCount: number; publishedCount: number; rejectedCount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('TODOS');

  // Modal de Rejeição
  const [rejectingItem, setRejectingItem] = useState<any | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);

  // Modal de Detalhes / Pré-visualização
  const [previewItem, setPreviewItem] = useState<any | null>(null);

  // Notificação toast
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [listings, moderationStats] = await Promise.all([
        fetchAdminPendingListings(),
        fetchAdminModerationStats().catch(() => null),
      ]);
      setPendingListings(listings);
      if (moderationStats) {
        setStats(moderationStats);
      } else {
        setStats({
          pendingCount: listings.length,
          publishedCount: 0,
          rejectedCount: 0,
        });
      }
    } catch (err: any) {
      console.error('Erro ao buscar fila de moderação:', err);
      setError(err.message || 'Falha ao conectar com o serviço de moderação.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string, name: string) => {
    try {
      setSubmittingAction(id);
      await updateAdminListingStatus(id, 'PUBLISHED');
      showNotification('success', `O anúncio "${name}" foi APROVADO e publicado com sucesso no guia!`);
      setPendingListings((prev) => prev.filter((item) => item.id !== id));
      if (previewItem?.id === id) setPreviewItem(null);
      if (stats) setStats({ ...stats, pendingCount: Math.max(0, stats.pendingCount - 1), publishedCount: stats.publishedCount + 1 });
    } catch (err: any) {
      showNotification('error', err.message || 'Falha ao aprovar estabelecimento.');
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    try {
      setSubmittingAction(rejectingItem.id);
      await updateAdminListingStatus(rejectingItem.id, 'REJECTED', rejectionNotes);
      showNotification('success', `O anúncio "${rejectingItem.name}" foi rejeitado.`);
      setPendingListings((prev) => prev.filter((item) => item.id !== rejectingItem.id));
      if (previewItem?.id === rejectingItem.id) setPreviewItem(null);
      if (stats) setStats({ ...stats, pendingCount: Math.max(0, stats.pendingCount - 1), rejectedCount: stats.rejectedCount + 1 });
      setRejectingItem(null);
      setRejectionNotes('');
    } catch (err: any) {
      showNotification('error', err.message || 'Falha ao rejeitar estabelecimento.');
    } finally {
      setSubmittingAction(null);
    }
  };

  const filteredListings = useMemo(() => {
    return pendingListings.filter((item) => {
      const matchesSearch =
        search.trim() === '' ||
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.shortDescription?.toLowerCase().includes(search.toLowerCase()) ||
        item.city?.name?.toLowerCase().includes(search.toLowerCase());

      const matchesCat =
        categoryFilter === 'TODOS' || item.category?.slug === categoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [pendingListings, search, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2.5 transition-all transform animate-in fade-in slide-in-from-bottom-3 ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Fila de Moderação Editorial
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/10 text-[#FF3B4F] border border-red-500/20">
              Admin Master
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Analise e aprove os novos estabelecimentos ou alterações submetidas pelos comerciantes antes de irem ao ar.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition"
        >
          <Clock className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar Fila</span>
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-black/60 rounded-3xl p-5 border border-red-500/30 shadow-card relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Aguardando Moderação
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-white">
            {stats?.pendingCount ?? pendingListings.length}
          </span>
          <span className="block text-[11px] text-red-400 font-semibold mt-1">
            Requer ação editorial
          </span>
        </div>

        <div className="bg-black/60 rounded-3xl p-5 border border-gray-800 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Publicados no Guia
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-white">
            {stats?.publishedCount ?? 0}
          </span>
          <span className="block text-[11px] text-emerald-400 font-semibold mt-1">
            Ativos no portal
          </span>
        </div>

        <div className="bg-black/60 rounded-3xl p-5 border border-gray-800 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Reprovados / Devolvidos
            </span>
            <div className="w-8 h-8 rounded-xl bg-gray-500/10 text-gray-400 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-black text-white">
            {stats?.rejectedCount ?? 0}
          </span>
          <span className="block text-[11px] text-gray-400 font-semibold mt-1">
            Pendentes de ajuste pelo lojista
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-black/60 rounded-2xl p-4 border border-gray-800 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, cidade ou resumo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white/5 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]/30 focus:border-[#FF3B4F]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['TODOS', 'restaurantes', 'atracoes', 'hospedagem', 'comercio'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap capitalize ${
                categoryFilter === cat
                  ? 'bg-[#FF3B4F] text-white shadow-sm'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat === 'TODOS' ? 'Todas Categorias' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-16 text-center bg-black/60 rounded-3xl border border-gray-800 shadow-card flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 text-[#FF3B4F] animate-spin" />
          <span className="text-xs font-semibold text-gray-400">
            Carregando estabelecimentos pendentes de moderação...
          </span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredListings.length === 0 && (
        <div className="p-16 text-center bg-black/60 rounded-3xl border border-gray-800 shadow-card flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">Fila de Moderação Vazia</h3>
          <p className="text-xs text-gray-400 max-w-md mt-1 mb-4">
            {search || categoryFilter !== 'TODOS'
              ? 'Nenhum estabelecimento corresponde aos filtros selecionados.'
              : 'Excelente! Todos os novos estabelecimentos submetidos pelos comerciantes foram devidamente revisados e publicados.'}
          </p>
          <Link href="/admin/estabelecimentos">
            <Button variant="outline" size="sm">
              Ver Todos os Estabelecimentos Cadastrados
            </Button>
          </Link>
        </div>
      )}

      {/* Moderation Items Cards Grid */}
      {!loading && !error && filteredListings.length > 0 && (
        <div className="grid grid-cols-1 gap-5">
          {filteredListings.map((item) => {
            const coverImage = item.images?.[0]?.url;
            const owner = item.owners?.[0]?.merchantProfile;
            const userOwner = owner?.user;
            const isSubmitting = submittingAction === item.id;

            return (
              <div
                key={item.id}
                className="bg-black/60 rounded-3xl border border-gray-800 p-6 shadow-card hover:border-gray-700 transition space-y-5"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-gray-800/80">
                  <div className="flex items-start gap-4">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-gray-800 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/5 border border-gray-800 flex items-center justify-center text-gray-500 shrink-0">
                        <Store className="w-7 h-7" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold text-white">{item.name}</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Pendente de Aprovação
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 text-gray-300">
                          {item.category?.name || 'Gastronomia'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 text-gray-400">
                          {item.priceTier || '$$'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2 max-w-2xl">
                        {item.shortDescription || 'Sem resumo cadastrado'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Pré-visualizar</span>
                    </button>

                    <Link
                      href={`/admin/estabelecimentos/novo?edit=${item.slug}`}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setRejectingItem(item);
                        setRejectionNotes('');
                      }}
                      disabled={isSubmitting}
                      className="px-3.5 py-2 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Rejeitar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApprove(item.id, item.name)}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Aprovar & Publicar</span>
                    </button>
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Localização */}
                  <div className="bg-white/5 p-3.5 rounded-2xl border border-gray-800/80 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      Localização
                    </span>
                    <p className="font-semibold text-white">
                      {item.city?.name || 'Caldas Novas'} • {item.neighborhood?.name || 'Centro'}
                    </p>
                    <p className="text-gray-400 text-[11px]">
                      {item.street ? `${item.street}${item.number ? `, ${item.number}` : ''}` : 'Endereço não informado'}
                    </p>
                  </div>

                  {/* Contatos */}
                  <div className="bg-white/5 p-3.5 rounded-2xl border border-gray-800/80 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      Canais de Atendimento
                    </span>
                    <p className="font-semibold text-white">
                      WhatsApp: {item.whatsapp || 'Não informado'}
                    </p>
                    <p className="text-gray-400 text-[11px]">
                      Telefone: {item.phone || '—'} {item.website ? `• ${item.website}` : ''}
                    </p>
                  </div>

                  {/* Solicitante / Lojista */}
                  <div className="bg-white/5 p-3.5 rounded-2xl border border-gray-800/80 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      Comerciante Solicitante
                    </span>
                    <p className="font-semibold text-white truncate">
                      {owner?.companyName || userOwner?.name || 'Comerciante Parceiro'}
                    </p>
                    <p className="text-gray-400 text-[11px] truncate">
                      {userOwner?.email || 'contato@parceiro.com'} {userOwner?.phone ? `• ${userOwner.phone}` : ''}
                    </p>
                  </div>
                </div>

                {/* Galeria de Fotos */}
                {item.images && item.images.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400">
                      Fotos Submetidas ({item.images.length})
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {item.images.map((img: any, idx: number) => (
                        <img
                          key={idx}
                          src={img.url}
                          alt={`Foto ${idx + 1}`}
                          className="w-16 h-14 rounded-xl object-cover border border-gray-800 shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Rejeição com Justificativa */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Rejeitar Estabelecimento</h3>
              </div>
              <button
                onClick={() => setRejectingItem(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Você está reprovando o anúncio <strong>"{rejectingItem.name}"</strong>. Informe o motivo para orientar o comerciante a realizar as devidas correções:
            </p>

            <textarea
              rows={3}
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              placeholder="Ex: Fotos com resolução muito baixa ou número de WhatsApp incorreto."
              className="w-full p-3 rounded-xl bg-white/5 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={submittingAction === rejectingItem.id}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                {submittingAction === rejectingItem.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirmar Rejeição</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pré-visualização Completa */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div>
                <h3 className="text-base font-bold text-white">{previewItem.name}</h3>
                <span className="text-xs text-gray-400">{previewItem.category?.name} • {previewItem.city?.name}</span>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Imagem de Capa */}
            {previewItem.images?.[0]?.url && (
              <img
                src={previewItem.images[0].url}
                alt={previewItem.name}
                className="w-full h-48 sm:h-64 rounded-2xl object-cover border border-gray-800"
              />
            )}

            <div className="space-y-3 text-xs text-gray-300">
              <div>
                <h4 className="font-bold text-white uppercase text-[11px] mb-1">Resumo Curto</h4>
                <p className="bg-white/5 p-3 rounded-xl border border-gray-800">{previewItem.shortDescription}</p>
              </div>

              {previewItem.fullDescription && (
                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] mb-1">Descrição Completa</h4>
                  <p className="bg-white/5 p-3 rounded-xl border border-gray-800 whitespace-pre-line">
                    {previewItem.fullDescription}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white/5 p-3 rounded-xl border border-gray-800">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Endereço</span>
                  <span className="font-semibold text-white">
                    {previewItem.street || '—'}, {previewItem.number || 'S/N'}
                  </span>
                  <span className="block text-gray-400">{previewItem.neighborhood?.name || 'Centro'}</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-gray-800">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Contato WhatsApp</span>
                  <span className="font-semibold text-white">{previewItem.whatsapp || '—'}</span>
                  <span className="block text-gray-400">{previewItem.phone || 'Sem telefone fixo'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => handleApprove(previewItem.id, previewItem.name)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Aprovar Estabelecimento</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

