'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Send,
  Bell,
  Users,
  Briefcase,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ChevronRight,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { broadcastNotificationApi } from '@/lib/api';

export default function AdminBroadcastPage() {
  const [form, setForm] = useState({
    title: '',
    message: '',
    linkUrl: '',
    targetRole: 'MERCHANT',
  });
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [history, setHistory] = useState<
    Array<{
      title: string;
      message: string;
      targetRole: string;
      count: number;
      sentAt: string;
    }>
  >([]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      setFeedback({ type: 'error', message: 'Título e mensagem são obrigatórios.' });
      return;
    }

    try {
      setSending(true);
      const res = await broadcastNotificationApi({
        title: form.title.trim(),
        message: form.message.trim(),
        linkUrl: form.linkUrl.trim() || undefined,
        targetRole: form.targetRole,
      });

      setFeedback({ type: 'success', message: res.message });
      setHistory((prev) => [
        {
          title: form.title,
          message: form.message,
          targetRole: form.targetRole,
          count: res.count,
          sentAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ]);

      setForm({
        title: '',
        message: '',
        linkUrl: '',
        targetRole: 'MERCHANT',
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao disparar comunicado.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Topo / Breadcrumb */}
      <div className="pb-4 border-b border-gray-800">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <Link href="/admin" className="hover:text-white transition">
            Painel Admin
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-300 font-semibold">Comunicados em Massa</span>
        </div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Send className="w-6 h-6 text-[#FF3B4F]" />
          Disparo de Avisos & Notificações do Sistema
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Envie avisos operacionais, comunicados de manutenção ou mensagens promocionais diretamente para os painéis dos lojistas.
        </p>
      </div>

      {/* Alerta de Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-200'
              : 'bg-red-950/80 border border-red-800 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Formulário de Envio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#1C1C1C] border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-5">
          <form onSubmit={handleSend} className="space-y-4">
            {/* Destinatários */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                Público Alvo / Destinatários *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'MERCHANT', label: 'Comerciantes', icon: Briefcase },
                  { id: 'USER', label: 'Clientes / Usuários', icon: Users },
                  { id: 'ALL', label: 'Toda a Base', icon: Globe },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = form.targetRole === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setForm({ ...form, targetRole: item.id })}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                        isSelected
                          ? 'bg-[#FF3B4F] border-[#FF3B4F] text-white shadow-xs'
                          : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Título do Comunicado */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Título do Comunicado *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Campanha de Férias de Verão - Cadastre seus Cupons!"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF3B4F]"
              />
            </div>

            {/* Mensagem Completa */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Mensagem do Comunicado *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Escreva a mensagem que aparecerá no sino de alertas do painel dos destinatários..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF3B4F]"
              />
            </div>

            {/* Link de Destino (Opcional) */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Link de Destino / Ação (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: /comerciante/cupons ou /comerciante/eventos"
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF3B4F]"
              />
            </div>

            <div className="pt-3 border-t border-gray-800 flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-3 rounded-xl bg-[#FF3B4F] text-white font-bold text-xs sm:text-sm hover:bg-[#e03445] transition flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Enviar Comunicado em Massa
              </button>
            </div>
          </form>
        </div>

        {/* Preview do Alerta */}
        <div className="space-y-4">
          <div className="bg-[#1C1C1C] border border-gray-800 rounded-3xl p-5 space-y-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Pré-visualização do Aviso
            </span>
            <div className="p-3.5 rounded-2xl bg-gray-900 border border-gray-800 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FF3B4F]/20 text-[#FF3B4F] flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-xs text-white block truncate">
                    {form.title || 'Título do comunicado'}
                  </span>
                  <span className="text-[10px] text-gray-500">Agora mesmo</span>
                </div>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-9">
                {form.message || 'O texto da mensagem aparecerá aqui para os usuários selecionados.'}
              </p>
            </div>
          </div>

          {/* Histórico da Sessão */}
          {history.length > 0 && (
            <div className="bg-[#1C1C1C] border border-gray-800 rounded-3xl p-5 space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Disparos Recentes da Sessão
              </span>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {history.map((h, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-gray-900 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white truncate">{h.title}</span>
                      <span className="text-[10px] text-gray-500">{h.sentAt}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 block">
                      ✓ Entregue a {h.count} usuário(s)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

