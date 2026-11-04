'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, AlertCircle, Shield, Sparkles, Store } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { loginUser } from '@/services/auth';
import { useAuthStore } from '@/stores/authStore';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await loginUser(email, password);
      setAuth(data.user, data.accessToken, data.refreshToken);

      if (redirectUrl) {
        router.push(redirectUrl);
        return;
      }

      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else if (data.user.role === 'MERCHANT') {
        router.push('/comerciante');
      } else {
        router.push('/app');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillAdminDemo = () => {
    setEmail('admin@osmelhoresdacidade.com.br');
    setPassword('Admin@123456');
    setError(null);
  };

  const handleFillMerchantDemo = () => {
    setEmail('comerciante@osmelhoresdacidade.com.br');
    setPassword('Comerciante@123456');
    setError(null);
  };

  return (
    <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-hover border border-[#E5E7EB]">
      {/* Atalhos de Demonstração / Homologação */}
      <div className="mb-6 space-y-2">
        <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Admin Master: <strong>admin@osmelhoresdacidade...</strong></span>
          </div>
          <button
            type="button"
            onClick={handleFillAdminDemo}
            className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] transition-colors shrink-0 shadow-2xs"
          >
            Preencher
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Comerciante: <strong>comerciante@osmelhoresdacidade...</strong></span>
          </div>
          <button
            type="button"
            onClick={handleFillMerchantDemo}
            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition-colors shrink-0 shadow-2xs"
          >
            Preencher
          </button>
        </div>
      </div>

      {redirectUrl && (
        <div className="mb-5 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
          <span>🔒 Acesso restrito. Faça login para continuar para a página solicitada.</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
            E-mail
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider">
              Senha
            </label>
            <Link href="/recuperar-senha" className="text-xs text-[#FF3B4F] hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Entrando...' : 'Entrar na Plataforma'}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <Link
          href="/"
          className="text-xs font-semibold text-[#777777] hover:text-[#171717] inline-flex items-center gap-1"
        >
          &larr; Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FCF9F8] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block">
          <Image
            src="/logo-01.png"
            alt="Os Melhores da Cidade"
            width={180}
            height={48}
            className="h-11 w-auto mx-auto object-contain"
          />
        </Link>
        <h2 className="mt-6 text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
          Acesse sua conta
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#777777]">
          Não tem uma conta ainda?{' '}
          <Link href="/cadastro" className="font-bold text-[#FF3B4F] hover:underline">
            Cadastre-se grátis
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense
          fallback={
            <div className="bg-white py-12 px-6 rounded-3xl shadow-hover border border-[#E5E7EB] text-center text-xs text-gray-500">
              Carregando formulário...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
