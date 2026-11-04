'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Building, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { registerUser } from '@/services/auth';

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<'USER' | 'MERCHANT'>('USER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await registerUser({
        name,
        email,
        password,
        phone,
        role,
        companyName: role === 'MERCHANT' ? companyName : undefined,
        cnpj: role === 'MERCHANT' ? cnpj : undefined,
      });

      setSuccess(res.message || 'Cadastro realizado com sucesso!');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar conta.');
    } finally {
      setLoading(false);
    }
  };

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
          Crie sua conta gratuita
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#777777]">
          Já possui uma conta?{' '}
          <Link href="/login" className="font-bold text-[#FF3B4F] hover:underline">
            Entrar aqui
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-hover border border-[#E5E7EB]">
          {/* Alternador de Perfil */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#F5F5F5] rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setRole('USER')}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                role === 'USER'
                  ? 'bg-white text-[#171717] shadow-sm'
                  : 'text-[#777777] hover:text-[#171717]'
              }`}
            >
              Sou Visitante / Morador
            </button>
            <button
              type="button"
              onClick={() => setRole('MERCHANT')}
              className={`py-2 text-xs font-bold rounded-xl transition ${
                role === 'MERCHANT'
                  ? 'bg-[#FF3B4F] text-white shadow-sm'
                  : 'text-[#777777] hover:text-[#171717]'
              }`}
            >
              Sou Comerciante
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success} Redirecionando para login...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                Nome Completo
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] focus:border-transparent outline-none transition"
                />
              </div>
            </div>

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
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(64) 99999-9999"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {role === 'MERCHANT' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                    Nome da Empresa / Estabelecimento
                  </label>
                  <div className="relative">
                    <Building className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ex: Restaurante Nonna Mia"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                    CNPJ (Opcional)
                  </label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] focus:border-transparent outline-none transition"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full mt-4"
            >
              {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
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
      </div>
    </div>
  );
}

