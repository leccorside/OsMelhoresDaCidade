'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NovoEstabelecimentoPage() {
  const router = useRouter();

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('restaurantes');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [priceTier, setPriceTier] = useState('$$');

  // Localização
  const [city, setCity] = useState('caldas-novas');
  const [neighborhood, setNeighborhood] = useState('Centro');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');

  // Contato
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');

  // SEO
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(generatedSlug);
    setMetaTitle(`${val} em Caldas Novas | Os Melhores da Cidade`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push('/comerciante');
      }, 1500);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/comerciante"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#777777] hover:text-[#171717] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight mt-2">
          Cadastrar Novo Estabelecimento
        </h1>
        <p className="text-xs sm:text-sm text-[#777777] mt-0.5">
          Preencha os dados abaixo. Após o envio, seu anúncio passará por uma breve revisão editorial antes de ser publicado.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Estabelecimento cadastrado com sucesso e enviado para aprovação! Redirecionando...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Bloco 1: Informações Básicas */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Store className="w-4 h-4 text-[#FF3B4F]" />
            <h2 className="text-sm font-bold text-[#171717]">1. Informações Básicas</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                Nome do Estabelecimento *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Bar do Lago"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                Categoria Principal *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none bg-white"
              >
                <option value="restaurantes">Restaurantes & Gastronomia</option>
                <option value="bares">Bares & Pubs</option>
                <option value="hospedagem">Hotéis & Pousadas</option>
                <option value="atracoes">Parques Aquáticos & Lazer</option>
                <option value="comercio">Comércio & Lojas</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                Slug (URL amigável) *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ex-bar-do-lago"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-gray-500 bg-gray-50 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                Faixa de Preço
              </label>
              <select
                value={priceTier}
                onChange={(e) => setPriceTier(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none bg-white"
              >
                <option value="$">$ Econômico</option>
                <option value="$$">$$ Moderado</option>
                <option value="$$$">$$$ Sofisticado</option>
                <option value="$$$$">$$$$ Luxo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
              Descrição Curta (Resumo de impacto para cards) *
            </label>
            <input
              type="text"
              required
              maxLength={160}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Ex: Cerveja artesanal gelada, petiscos clássicos e música ao vivo às sextas."
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
              Descrição Completa & História
            </label>
            <textarea
              rows={4}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="Descreva a história, especialidades e diferenciais do seu negócio..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none"
            />
          </div>
        </div>

        {/* Bloco 2: Localização & Contatos */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <MapPin className="w-4 h-4 text-[#FF3B4F]" />
            <h2 className="text-sm font-bold text-[#171717]">2. Localização & Contatos</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                Cidade *
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none bg-white"
              >
                <option value="caldas-novas">Caldas Novas (GO)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                Bairro *
              </label>
              <input
                type="text"
                required
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Ex: Centro"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                Logradouro / Rua
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Av. Principal"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                Número
              </label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="100"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                Telefone Fixo
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(64) 3453-0000"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                WhatsApp de Atendimento *
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="5564999990000"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                Site / Link Externo
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://meusite.com.br"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bloco 3: Otimização SEO Individual */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            <h2 className="text-sm font-bold text-[#171717]">3. Otimização SEO para o Google</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
              Título SEO (Meta Title)
            </label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Título que aparecerá nos resultados de busca"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
              Meta Description
            </label>
            <textarea
              rows={2}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Descrição atrativa de até 160 caracteres para mecanismos de busca"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/comerciante">
            <Button type="button" variant="ghost" size="lg">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" variant="primary" size="lg" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Salvar e Enviar para Moderação'}
          </Button>
        </div>
      </form>
    </div>
  );
}

