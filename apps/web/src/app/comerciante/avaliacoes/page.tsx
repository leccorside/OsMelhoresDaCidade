'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  MessageSquare,
  MessageCircle,
  Store,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  Award,
  ChevronDown,
  User,
  Plus,
} from 'lucide-react';
import {
  fetchMerchantReviews,
  replyMerchantReviewApi,
  deleteMerchantReviewReplyApi,
  MerchantReviewItem,
  MerchantReviewsData,
} from '@/lib/api';

export default function MerchantReviewsPage() {
  const [data, setData] = useState<MerchantReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filtros
  const [selectedListingId, setSelectedListingId] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);
  const [selectedAnswered, setSelectedAnswered] = useState<boolean | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado do formulário de resposta inline
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Modal de confirmação de exclusão
  const [deleteReplyModal, setDeleteReplyModal] = useState<{
    isOpen: boolean;
    replyId: string;
    reviewAuthor: string;
  }>({ isOpen: false, replyId: '', reviewAuthor: '' });

  // Auto-fechar feedback após 4 segundos
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Carregar avaliações do comerciante
  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await fetchMerchantReviews({
        listingId: selectedListingId !== 'all' ? selectedListingId : undefined,
        rating: selectedRating,
        answered: selectedAnswered,
      });
      setData(res);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Erro ao carregar avaliações.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [selectedListingId, selectedRating, selectedAnswered]);

  // Iniciar resposta inline
  const handleStartReply = (review: MerchantReviewItem) => {
    setReplyingReviewId(review.id);
    setReplyText(review.reply?.reply || '');
  };

  const handleCancelReply = () => {
    setReplyingReviewId(null);
    setReplyText('');
  };

  // Enviar resposta
  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      setFeedback({ type: 'error', message: 'A resposta não pode estar vazia.' });
      return;
    }

    try {
      setSubmittingReply(true);
      await replyMerchantReviewApi(reviewId, replyText.trim());
      setFeedback({
        type: 'success',
        message: 'Resposta enviada com sucesso! O cliente receberá a notificação.',
      });
      setReplyingReviewId(null);
      setReplyText('');
      await loadReviews();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Erro ao enviar resposta.',
      });
    } finally {
      setSubmittingReply(false);
    }
  };

  // Excluir resposta
  const handleDeleteReplyConfirm = async () => {
    try {
      await deleteMerchantReviewReplyApi(deleteReplyModal.replyId);
      setFeedback({
        type: 'success',
        message: 'Resposta removida com sucesso.',
      });
      setDeleteReplyModal({ isOpen: false, replyId: '', reviewAuthor: '' });
      await loadReviews();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Erro ao remover resposta.',
      });
    }
  };

  // Filtragem adicional no cliente por busca textual
  const filteredReviews = (data?.reviews || []).filter((r) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const matchName = r.user?.name?.toLowerCase().includes(q);
    const matchComment = r.comment?.toLowerCase().includes(q);
    const matchListing = r.listing?.name?.toLowerCase().includes(q);
    return matchName || matchComment || matchListing;
  });

  const metrics = data?.metrics || {
    totalReviews: 0,
    averageRating: 0,
    answeredCount: 0,
    unansweredCount: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  };

  const responseRate = metrics.totalReviews > 0
    ? Math.round((metrics.answeredCount / metrics.totalReviews) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Topo / Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
            Avaliações & Reputação
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Acompanhe o que seus clientes dizem e responda oficialmente para fortalecer a confiança na sua empresa.
          </p>
        </div>

        {/* Seletor de Estabelecimento */}
        {data?.listings && data.listings.length > 0 && (
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
            <Store className="w-5 h-5 text-gray-400 shrink-0" />
            <select
              value={selectedListingId}
              onChange={(e) => setSelectedListingId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Todos os Estabelecimentos</option>
              {data.listings.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        )}
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
        {/* Nota Média Geral */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Nota Média</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">
              {metrics.averageRating > 0 ? metrics.averageRating.toFixed(1) : '5.0'}
            </span>
            <div className="flex items-center text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= Math.round(metrics.averageRating || 5)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Total de Avaliações */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Recebidas</span>
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{metrics.totalReviews}</p>
        </div>

        {/* Taxa de Resposta */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Respondidas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{metrics.answeredCount}</span>
            <span className="text-xs font-bold text-gray-400">({responseRate}%)</span>
          </div>
        </div>

        {/* Pendentes de Resposta */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Aguardando Resposta</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <p className={`text-3xl font-extrabold ${metrics.unansweredCount > 0 ? 'text-rose-600' : 'text-gray-900'}`}>
            {metrics.unansweredCount}
          </p>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Busca Textual */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por cliente ou texto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]/20 focus:border-[#FF3B4F]"
          />
        </div>

        {/* Filtros de Estrelas e Resposta */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filtro por Estrelas */}
          <select
            value={selectedRating !== undefined ? String(selectedRating) : 'all'}
            onChange={(e) =>
              setSelectedRating(e.target.value === 'all' ? undefined : parseInt(e.target.value, 10))
            }
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none"
          >
            <option value="all">Todas as Notas (1 a 5★)</option>
            <option value="5">5 Estrelas ({metrics.distribution?.[5] || 0})</option>
            <option value="4">4 Estrelas ({metrics.distribution?.[4] || 0})</option>
            <option value="3">3 Estrelas ({metrics.distribution?.[3] || 0})</option>
            <option value="2">2 Estrelas ({metrics.distribution?.[2] || 0})</option>
            <option value="1">1 Estrela ({metrics.distribution?.[1] || 0})</option>
          </select>

          {/* Filtro por Status de Resposta */}
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSelectedAnswered(undefined)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedAnswered === undefined
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setSelectedAnswered(true)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedAnswered === true
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Respondidas
            </button>
            <button
              onClick={() => setSelectedAnswered(false)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedAnswered === false
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Sem Resposta
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-gray-500">
          <Loader2 className="w-8 h-8 text-[#FF3B4F] animate-spin mb-3" />
          <span className="text-sm font-medium">Carregando avaliações...</span>
        </div>
      )}

      {/* Vazio */}
      {!loading && filteredReviews.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-sm text-center max-w-lg mx-auto my-6">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">Nenhuma avaliação encontrada</h3>
          <p className="text-sm text-gray-500 mb-4">
            {searchTerm || selectedRating !== undefined || selectedAnswered !== undefined
              ? 'Tente ajustar os filtros acima para ver mais avaliações.'
              : 'Seus estabelecimentos ainda não receberam avaliações públicas dos clientes.'}
          </p>
        </div>
      )}

      {/* Lista de Avaliações */}
      {!loading && filteredReviews.length > 0 && (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const isReplying = replyingReviewId === review.id;
            const reviewDate = new Date(review.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            });

            return (
              <div
                key={review.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs hover:shadow-xs transition-shadow space-y-4"
              >
                {/* Cabeçalho da Avaliação */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative w-11 h-11 rounded-full bg-linear-to-tr from-[#FF3B4F] to-amber-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                      {review.user?.avatarUrl ? (
                        <Image
                          src={review.user.avatarUrl}
                          alt={review.user.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span>{review.user?.name ? review.user.name.charAt(0).toUpperCase() : 'U'}</span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-gray-900 leading-snug">
                        {review.user?.name || 'Cliente'}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                        <span>{reviewDate}</span>
                        <span>•</span>
                        <span className="font-semibold text-gray-600">
                          {review.listing?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Estrelas */}
                  <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 self-start sm:self-auto">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-xs font-bold text-amber-700">
                      {review.rating}.0
                    </span>
                  </div>
                </div>

                {/* Comentário do Cliente */}
                {review.comment ? (
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                    &quot;{review.comment}&quot;
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    Avaliação enviada sem comentário em texto.
                  </p>
                )}

                {/* Bloco de Resposta da Empresa (se houver) */}
                {review.reply && !isReplying && (
                  <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4.5 space-y-2 mt-3 ml-4 sm:ml-8">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                          ✓
                        </div>
                        <span className="text-xs font-bold text-emerald-900">
                          Resposta da Empresa ({review.listing?.name})
                        </span>
                        <span className="text-[11px] text-emerald-700">
                          • {new Date(review.reply.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {/* Ações da resposta */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartReply(review)}
                          className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 rounded-lg transition-colors"
                          title="Editar Resposta"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteReplyModal({
                              isOpen: true,
                              replyId: review.reply!.id,
                              reviewAuthor: review.user?.name || 'Cliente',
                            })
                          }
                          className="p-1.5 text-emerald-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Excluir Resposta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed pl-8">
                      {review.reply.reply}
                    </p>
                  </div>
                )}

                {/* Formulário Inline de Resposta */}
                {isReplying && (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4.5 space-y-3 ml-4 sm:ml-8 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5 text-[#FF3B4F]" />
                        {review.reply ? 'Editar resposta oficial' : 'Responder ao cliente publicamente'}
                      </span>
                      <button
                        onClick={handleCancelReply}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Cancelar
                      </button>
                    </div>

                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Agradeça pelo feedback, esclareça dúvidas ou informe melhorias implementadas..."
                      className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]/20 focus:border-[#FF3B4F] text-xs sm:text-sm text-gray-900 bg-white"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-gray-400">
                        Sua resposta será exibida publicamente na página do local.
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCancelReply}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          disabled={submittingReply || !replyText.trim()}
                          onClick={() => handleSubmitReply(review.id)}
                          className="inline-flex items-center gap-1.5 bg-[#FF3B4F] text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-rose-600 transition-colors disabled:opacity-50 shadow-xs"
                        >
                          {submittingReply && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          <span>{review.reply ? 'Atualizar Resposta' : 'Publicar Resposta'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botão para responder quando não respondida e formulário fechado */}
                {!review.reply && !isReplying && (
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      onClick={() => handleStartReply(review)}
                      className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#FF3B4F]" />
                      Responder Avaliação
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Confirmação de Exclusão de Resposta */}
      {deleteReplyModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Excluir Resposta?</h3>
            <p className="text-xs text-gray-500 mb-6">
              Tem certeza que deseja remover sua resposta pública para a avaliação de &quot;
              <strong className="text-gray-800">{deleteReplyModal.reviewAuthor}</strong>&quot;?
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteReplyModal({ isOpen: false, replyId: '', reviewAuthor: '' })}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteReplyConfirm}
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

