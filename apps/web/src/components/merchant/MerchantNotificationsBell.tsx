'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Star,
  Ticket,
  MessageSquare,
  Sparkles,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  Loader2,
  Clock,
  Info,
} from 'lucide-react';
import {
  fetchMerchantNotifications,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
  deleteNotificationApi,
  MerchantNotificationItem,
} from '@/lib/api';

export function MerchantNotificationsBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<MerchantNotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Carregar notificações
  const loadNotifications = async () => {
    try {
      const data = await fetchMerchantNotifications(15);
      setUnreadCount(data.unreadCount || 0);
      setNotifications(data.notifications || []);
    } catch (e) {
      // Falha silenciosa em caso de polling
    }
  };

  useEffect(() => {
    loadNotifications();

    // Polling a cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Marcar como lida e navegar
  const handleItemClick = async (notif: MerchantNotificationItem) => {
    if (!notif.isRead) {
      try {
        await markNotificationAsReadApi(notif.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
      } catch (e) {}
    }
    setIsOpen(false);
    if (notif.linkUrl) {
      router.push(notif.linkUrl);
    }
  };

  // Marcar todas como lidas
  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      await markAllNotificationsAsReadApi();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  // Excluir notificação
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteNotificationApi(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      loadNotifications();
    } catch (e) {}
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'NEW_REVIEW':
        return <Star className="w-4 h-4 text-amber-500 fill-amber-500" />;
      case 'COUPON_CLAIMED':
        return <Ticket className="w-4 h-4 text-emerald-500" />;
      case 'CONTACT_MESSAGE':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#FF3B4F]" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão Sino */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition focus:outline-none"
        title="Avisos e Notificações"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3B4F] opacity-75" />
            <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-[#FF3B4F] text-white text-[10px] font-black">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden text-[#1C1B1B] animate-in fade-in duration-150">
          {/* Topo do Menu */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#FF3B4F]" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#1C1B1B]">
                Notificações
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-[#FF3B4F]/10 text-[#FF3B4F] px-2 py-0.5 rounded-full">
                  {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-[11px] font-bold text-[#FF3B4F] hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar lidas
              </button>
            )}
          </div>

          {/* Lista de Alertas */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-gray-600">
                  Tudo em dia!
                </p>
                <p className="text-[11px] text-gray-400">
                  Você não tem novas notificações no momento.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 flex items-start gap-3 transition cursor-pointer hover:bg-gray-50/80 ${
                    !notif.isRead ? 'bg-orange-50/40 font-medium' : 'bg-white opacity-85'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-gray-100 shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#1C1B1B] truncate">
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#FF3B4F] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#5C3F3F] mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {new Date(notif.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, notif.id)}
                    title="Excluir notificação"
                    className="p-1 rounded text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Rodapé com link rápido */}
          {notifications.length > 0 && (
            <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-center">
              <Link
                href="/comerciante/avaliacoes"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-bold text-[#1C1B1B] hover:text-[#FF3B4F] transition"
              >
                Gerenciar Avaliações & Respostas →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
