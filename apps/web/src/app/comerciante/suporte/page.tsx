'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LifeBuoy,
  MessageSquare,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Loader2,
  X,
  Building2,
  ShieldAlert,
  ArrowLeft,
  ChevronRight,
  Filter,
  Check,
} from 'lucide-react';
import {
  fetchMerchantTicketsApi,
  createMerchantTicketApi,
  fetchTicketDetailsApi,
  replyTicketApi,
  resolveTicketApi,
  SupportTicketItem,
} from '@/lib/api';

export default function MerchantSupportPage() {
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal Novo Chamado State
  const [modalOpen, setModalOpen] = useState(false);
  const [subjectInput, setSubjectInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('DUVIDAS');
  const [priorityInput, setPriorityInput] = useState('NORMAL');
  const [messageInput, setMessageInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Resposta State
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [resolving, setResolving] = useState(false);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await fetchMerchantTicketsApi();
      setTickets(data);
      if (data.length > 0 && !selectedTicket) {
        loadTicketDetails(data[0].id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao carregar chamados de suporte.');
    } finally {
      setLoading(false);
    }
  };

  const loadTicketDetails = async (ticketId: string) => {
    try {
      setLoadingDetails(true);
      const details = await fetchTicketDetailsApi(ticketId);
      setSelectedTicket(details);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectInput.trim() || !messageInput.trim()) return;

    try {
      setSubmitting(true);
      setModalError(null);
      const created = await createMerchantTicketApi({
        subject: subjectInput.trim(),
        category: categoryInput,
        priority: priorityInput,
        message: messageInput.trim(),
      });
      setModalOpen(false);
      setSubjectInput('');
      setMessageInput('');
      await loadTickets();
      loadTicketDetails(created.id);
    } catch (err: any) {
      setModalError(err.message || 'Erro ao abrir chamado.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    try {
      setSendingReply(true);
      await replyTicketApi(selectedTicket.id, replyText.trim());
      setReplyText('');
      await loadTicketDetails(selectedTicket.id);
      const updatedList = await fetchMerchantTicketsApi();
      setTickets(updatedList);
    } catch (err: any) {
      alert(err.message || 'Erro ao responder chamado.');
    } finally {
      setSendingReply(false);
    }
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket) return;
    if (!confirm('Deseja marcar este chamado como resolvido / concluído?')) return;

    try {
      setResolving(true);
      await resolveTicketApi(selectedTicket.id);
      await loadTicketDetails(selectedTicket.id);
      const updatedList = await fetchMerchantTicketsApi();
      setTickets(updatedList);
    } catch (err: any) {
      alert(err.message || 'Erro ao finalizar chamado.');
    } finally {
      setResolving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ABERTO':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">Aberto</span>;
      case 'EM_ANDAMENTO':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">Em Andamento</span>;
      case 'RESPONDIDO':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">Respondido</span>;
      case 'RESOLVIDO':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Resolvido</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-600">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 font-sans">
      
      {/* CABEÇALHO */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              Central de Atendimento ao Lojista
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Tire dúvidas sobre planos, solicite alterações cadastrais ou contate a franquia da sua cidade.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Abrir Novo Chamado
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
          <p className="text-xs text-neutral-500">Carregando seus chamados de suporte...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-neutral-200 p-12 text-center space-y-4">
          <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-neutral-800">Você não possui chamados abertos</h3>
            <p className="text-xs text-neutral-400 mt-1">Precisa de suporte com seu anúncio ou faturamento? Nossa equipe está pronta para ajudar.</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs transition-all shadow-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Iniciar Atendimento
          </button>
        </div>
      ) : (
        /* GRID DE TICKETS E CONVERSA */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LISTA LATERAL DE CHAMADOS */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Seus Chamados ({tickets.length})
              </span>
            </div>

            <div className="divide-y divide-neutral-100 max-h-[600px] overflow-y-auto">
              {tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => loadTicketDetails(t.id)}
                    className={`w-full text-left p-4.5 transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-amber-50/70 border-l-4 border-amber-500'
                        : 'hover:bg-neutral-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-neutral-500">
                        {t.ticketNumber}
                      </span>
                      {getStatusBadge(t.status)}
                    </div>
                    <div className="font-bold text-xs text-neutral-900 line-clamp-1">
                      {t.subject}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1">
                      <span className="capitalize">{t.category.toLowerCase().replace('_', ' ')}</span>
                      <span>{new Date(t.updatedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PAINEL DE MENSAGENS / CONVERSA */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
            {loadingDetails || !selectedTicket ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
            ) : (
              <>
                {/* CABEÇALHO DO TICKET */}
                <div className="p-5 border-b border-neutral-200/80 bg-neutral-50/50 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {selectedTicket.ticketNumber}
                      </span>
                      {getStatusBadge(selectedTicket.status)}
                    </div>
                    <h2 className="text-base font-bold text-neutral-900 mt-1">
                      {selectedTicket.subject}
                    </h2>
                    <span className="text-[11px] text-neutral-400">
                      Aberto em {new Date(selectedTicket.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  {selectedTicket.status !== 'RESOLVIDO' && (
                    <button
                      onClick={handleResolveTicket}
                      disabled={resolving}
                      className="px-3.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      {resolving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Finalizar Chamado
                    </button>
                  )}
                </div>

                {/* TIMELINE DE MENSAGENS */}
                <div className="flex-1 p-5 space-y-4 max-h-[420px] overflow-y-auto bg-neutral-50/30">
                  {selectedTicket.messages?.map((msg) => {
                    const isMerchant = msg.senderRole === 'MERCHANT';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMerchant ? 'items-end' : 'items-start'}`}
                      >
                        <div className="text-[10px] text-neutral-400 mb-1 px-1">
                          {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div
                          className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                            isMerchant
                              ? 'bg-neutral-900 text-white rounded-br-none'
                              : 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-none shadow-sm'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* FORMULÁRIO DE RESPOSTA */}
                {selectedTicket.status === 'RESOLVIDO' ? (
                  <div className="p-4 bg-neutral-100 text-center text-xs text-neutral-500 font-medium">
                    Este chamado foi marcado como concluído. Caso precise de novo auxílio, abra um novo chamado.
                  </div>
                ) : (
                  <form onSubmit={handleSendReply} className="p-4 border-t border-neutral-200/80 bg-white flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Digite sua resposta..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-2xl border border-neutral-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={sendingReply || !replyText.trim()}
                      className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-bold transition-all shadow-sm"
                      title="Enviar resposta"
                    >
                      {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

        </div>
      )}

      {/* MODAL DE ABERTURA DE NOVO CHAMADO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-neutral-100">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600">
                <LifeBuoy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900">
                  Novo Chamado de Suporte
                </h3>
                <p className="text-xs text-neutral-500">
                  Nossa equipe ou o franqueado da sua praça responderá prontamente.
                </p>
              </div>
            </div>

            {modalError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 mb-4 font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Assunto da Solicitação *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dúvida sobre ativação do selo Ouro Master"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="DUVIDAS">Dúvidas Gerais</option>
                    <option value="PLANO_VIP">Planos & Assinaturas VIP</option>
                    <option value="FINANCEIRO">Financeiro & Pagamentos</option>
                    <option value="ANUNCIO">Meu Anúncio / Fotos</option>
                    <option value="TECNICO">Suporte Técnico</option>
                    <option value="OUTROS">Outros Assuntos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={priorityInput}
                    onChange={(e) => setPriorityInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="BAIXA">Baixa</option>
                    <option value="NORMAL">Normal</option>
                    <option value="ALTA">Alta</option>
                    <option value="URGENTE">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Mensagem Detalhada *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Descreva detalhadamente o que você precisa..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="w-full p-3 rounded-xl border border-neutral-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none font-sans"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Abrindo...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Chamado
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
