'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Smartphone,
  Send,
} from 'lucide-react';
import {
  fetchVapidPublicKeyApi,
  subscribePushApi,
  unsubscribePushApi,
  sendTestPushApi,
} from '@/lib/api';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function WebPushNotificationToggle() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw-push.js');
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (err) {
      console.warn('Erro ao verificar inscrição push existente:', err);
    }
  };

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setFeedback(null);

      // 1. Solicitar permissão do navegador
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        setFeedback({
          type: 'error',
          message: 'Permissão para notificações não foi autorizada pelo navegador.',
        });
        return;
      }

      // 2. Registrar o Service Worker de push
      const registration = await navigator.serviceWorker.register('/sw-push.js', {
        scope: '/',
      });
      await navigator.serviceWorker.ready;

      // 3. Buscar chave pública VAPID da API
      const { publicKey } = await fetchVapidPublicKeyApi();
      const applicationServerKey = urlBase64ToUint8Array(publicKey);

      // 4. Inscrever no PushManager do navegador
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }

      const rawSub = subscription.toJSON();
      if (!rawSub.endpoint || !rawSub.keys?.p256dh || !rawSub.keys?.auth) {
        throw new Error('Inscrição no navegador não retornou chaves válidas.');
      }

      // 5. Salvar na API
      await subscribePushApi({
        endpoint: rawSub.endpoint,
        keys: {
          p256dh: rawSub.keys.p256dh,
          auth: rawSub.keys.auth,
        },
        userAgent: navigator.userAgent,
      });

      setIsSubscribed(true);
      setFeedback({
        type: 'success',
        message: 'Notificações Web Push ativadas com sucesso neste navegador!',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Falha ao ativar notificações push.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setLoading(true);
      setFeedback(null);

      const registration = await navigator.serviceWorker.getRegistration('/sw-push.js');
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await unsubscribePushApi(subscription.endpoint);
          await subscription.unsubscribe();
        }
      }

      setIsSubscribed(false);
      setFeedback({
        type: 'success',
        message: 'Notificações desativadas para este dispositivo.',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Erro ao desativar notificações.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestPush = async () => {
    try {
      setLoading(true);
      setFeedback(null);
      const res = await sendTestPushApi();
      setFeedback({
        type: res.success ? 'success' : 'error',
        message: res.message,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Erro ao disparar notificação de teste.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-500 text-xs">
        Seu navegador atual não suporta notificações Web Push ou Service Workers.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
            {isSubscribed ? <BellRing className="w-6 h-6 animate-pulse" /> : <Bell className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
                Tempo Real
              </span>
              {isSubscribed ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Ativo neste Dispositivo
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-xs font-semibold">
                  Inativo
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mt-1 flex items-center gap-2">
              Notificações no Navegador & Celular (Web Push)
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5 max-w-xl leading-relaxed">
              Receba alertas instantâneos no seu computador ou smartphone sempre que um cliente clicar no seu WhatsApp, deixar uma avaliação ou resgatar cupons.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {isSubscribed ? (
            <>
              <button
                onClick={handleSendTestPush}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Testar Alerta
              </button>
              <button
                onClick={handleUnsubscribe}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors border border-rose-200"
              >
                <BellOff className="w-3.5 h-3.5" />
                Desativar
              </button>
            </>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Solicitando...
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4" />
                  Ativar Alertas Push
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}
    </div>
  );
}
