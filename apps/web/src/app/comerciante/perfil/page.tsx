'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  Building2,
  Lock,
  CreditCard,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Phone,
  Mail,
  FileText,
  MapPin,
  ChevronRight,
  Upload,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import {
  fetchMerchantProfileApi,
  updateMerchantProfileApi,
  changeMerchantPasswordApi,
  uploadImage,
  MerchantProfileData,
} from '@/lib/api';

export default function MerchantProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'bank' | 'security'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Estados do formulário de perfil e dados comerciais
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    avatarUrl: '',
    companyName: '',
    legalName: '',
    cnpj: '',
    whatsapp: '',
    address: '',
    pixKey: '',
    pixKeyType: 'CNPJ',
    bankName: '',
    bankAgency: '',
    bankAccount: '',
  });

  // Estados de segurança (troca de senha)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Auto-fechar feedback
  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  // Carregar dados do perfil
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchMerchantProfileApi();
        setForm({
          name: data.user?.name || '',
          email: data.user?.email || '',
          phone: data.user?.phone || data.merchantProfile?.phone || '',
          avatarUrl: data.user?.avatarUrl || '',
          companyName: data.merchantProfile?.companyName || '',
          legalName: data.merchantProfile?.legalName || '',
          cnpj: data.merchantProfile?.cnpj || '',
          whatsapp: data.merchantProfile?.whatsapp || '',
          address: data.merchantProfile?.address || '',
          pixKey: data.merchantProfile?.pixKey || '',
          pixKeyType: data.merchantProfile?.pixKeyType || 'CNPJ',
          bankName: data.merchantProfile?.bankName || '',
          bankAgency: data.merchantProfile?.bankAgency || '',
          bankAccount: data.merchantProfile?.bankAccount || '',
        });
      } catch (err: any) {
        setFeedback({
          type: 'error',
          message: err?.message || 'Erro ao carregar dados cadastrais.',
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Upload de Foto de Perfil
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const res = await uploadImage(file);
      setForm((prev) => ({ ...prev, avatarUrl: res.url }));
      setFeedback({ type: 'success', message: 'Foto de perfil carregada com sucesso!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Erro ao enviar imagem.' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Salvar Dados do Perfil / Comercial / Bancário
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateMerchantProfileApi({
        name: form.name.trim(),
        phone: form.phone.trim(),
        avatarUrl: form.avatarUrl,
        companyName: form.companyName.trim(),
        legalName: form.legalName.trim(),
        cnpj: form.cnpj.trim(),
        whatsapp: form.whatsapp.trim(),
        address: form.address.trim(),
        pixKey: form.pixKey.trim(),
        pixKeyType: form.pixKeyType,
        bankName: form.bankName.trim(),
        bankAgency: form.bankAgency.trim(),
        bankAccount: form.bankAccount.trim(),
      });
      setFeedback({ type: 'success', message: 'Dados cadastrais atualizados com sucesso!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Erro ao salvar alterações.' });
    } finally {
      setSaving(false);
    }
  };

  // Alterar Senha
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFeedback({ type: 'error', message: 'A nova senha e a confirmação não conferem.' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    try {
      setChangingPass(true);
      await changeMerchantPasswordApi({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setFeedback({ type: 'success', message: 'Sua senha foi alterada com sucesso!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Erro ao alterar senha.' });
    } finally {
      setChangingPass(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center gap-3 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF3B4F]" />
        <span className="text-xs sm:text-sm font-semibold">Carregando dados da sua conta...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Topo / Cabeçalho */}
      <div className="pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <Link href="/comerciante" className="hover:text-gray-900 transition">
            Painel do Parceiro
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-800 font-semibold">Configurações & Perfil</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2.5">
              <User className="w-7 h-7 text-[#FF3B4F]" />
              Dados da Conta & Perfil Comercial
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Gerencie seus dados pessoais, informações jurídicas, canais de atendimento e dados de repasse.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Parceiro Homologado
            </span>
          </div>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold transition ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Abas de Navegação */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
        {[
          { id: 'profile', label: 'Dados do Responsável', icon: User },
          { id: 'business', label: 'Dados da Empresa', icon: Building2 },
          { id: 'bank', label: 'Dados Bancários & PIX', icon: CreditCard },
          { id: 'security', label: 'Segurança & Senha', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                isActive
                  ? 'bg-[#1C1B1B] text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs p-6 sm:p-8">
        {/* ABA 1: DADOS DO RESPONSÁVEL */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-gray-100">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center">
                  {form.avatarUrl ? (
                    <img
                      src={form.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-[#FF3B4F] text-white shadow-md cursor-pointer hover:bg-[#e03445] transition">
                  {uploadingAvatar ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900">Foto do Responsável</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Esta foto é exibida no cabeçalho do painel e identificador da conta. JPG ou PNG até 5MB.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Nome Completo do Responsável *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  E-mail de Login (Acesso)
                </label>
                <input
                  type="email"
                  disabled
                  value={form.email}
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-500 font-semibold cursor-not-allowed"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Para alterar seu e-mail de acesso, contate o suporte administrativo.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Telefone Pessoal / Celular
                </label>
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#FF3B4F] text-white font-bold text-xs sm:text-sm hover:bg-[#e03445] transition flex items-center gap-2 shadow-xs"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                Salvar Alterações
              </button>
            </div>
          </form>
        )}

        {/* ABA 2: DADOS DA EMPRESA */}
        {activeTab === 'business' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Nome Fantasia *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: DiRoma Park Hotel & Resort"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Razão Social Completa
                </label>
                <input
                  type="text"
                  placeholder="Ex: DiRoma Empreendimentos Turísticos LTDA"
                  value={form.legalName}
                  onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  CNPJ
                </label>
                <input
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={form.cnpj}
                  onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  WhatsApp Comercial de Atendimento
                </label>
                <input
                  type="text"
                  placeholder="(64) 99999-9999"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Endereço Comercial / Faturamento
              </label>
              <input
                type="text"
                placeholder="Rua, Número, Bairro, Cidade - Estado, CEP"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
              />
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#FF3B4F] text-white font-bold text-xs sm:text-sm hover:bg-[#e03445] transition flex items-center gap-2 shadow-xs"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                Salvar Dados da Empresa
              </button>
            </div>
          </form>
        )}

        {/* ABA 3: DADOS BANCÁRIOS & PIX */}
        {activeTab === 'bank' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-950 uppercase">
                  Informações de Repasse & Liquidação
                </h4>
                <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
                  Os dados informados abaixo serão utilizados para repasse automático de vouchers com venda antecipada, promoções faturadas e campanhas publicitárias.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Tipo de Chave PIX
                </label>
                <select
                  value={form.pixKeyType}
                  onChange={(e) => setForm({ ...form, pixKeyType: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
                >
                  <option value="CNPJ">CNPJ</option>
                  <option value="CPF">CPF</option>
                  <option value="EMAIL">E-mail</option>
                  <option value="TELEFONE">Telefone</option>
                  <option value="ALEATORIA">Chave Aleatória</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Chave PIX
                </label>
                <input
                  type="text"
                  placeholder="Informe sua chave PIX para recebimentos"
                  value={form.pixKey}
                  onChange={(e) => setForm({ ...form, pixKey: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Instituição Bancária
                </label>
                <input
                  type="text"
                  placeholder="Ex: Banco do Brasil, Nubank, Itaú"
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Agência
                  </label>
                  <input
                    type="text"
                    placeholder="0001"
                    value={form.bankAgency}
                    onChange={(e) => setForm({ ...form, bankAgency: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Conta Corrente
                  </label>
                  <input
                    type="text"
                    placeholder="12345-6"
                    value={form.bankAccount}
                    onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#FF3B4F] text-white font-bold text-xs sm:text-sm hover:bg-[#e03445] transition flex items-center gap-2 shadow-xs"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                Salvar Dados Bancários
              </button>
            </div>
          </form>
        )}

        {/* ABA 4: SEGURANÇA & SENHA */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Senha Atual *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Nova Senha *
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    placeholder="Mínimo de 6 caracteres"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Confirmar Nova Senha *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repita a nova senha"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={changingPass}
                className="px-6 py-2.5 rounded-xl bg-[#1C1B1B] text-white font-bold text-xs sm:text-sm hover:bg-gray-800 transition flex items-center gap-2 shadow-xs"
              >
                {changingPass && <Loader2 className="w-4 h-4 animate-spin" />}
                <KeyRound className="w-4 h-4 text-[#FF3B4F]" />
                Atualizar Senha
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

