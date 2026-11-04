'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Store,
  MapPin,
  Phone,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Search,
  Upload,
  Image as ImageIcon,
  Loader2,
  Trash2,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  createOrUpdateListing,
  fetchAdminListingDetail,
  uploadImage,
  uploadMultipleImages,
  lookupCepApi,
  geocodeAddressApi,
} from '@/lib/api';

function MerchantNovoEstabelecimentoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get('edit');

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categorySlug, setCategorySlug] = useState('restaurantes');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [priceTier, setPriceTier] = useState('$$');

  // Localização
  const [citySlug, setCitySlug] = useState('caldas-novas');
  const [zipCode, setZipCode] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();

  // Contato
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');

  // Fotos do Estabelecimento
  const [heroImage, setHeroImage] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // SEO
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetchingExisting, setFetchingExisting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);

  // Pré-carregamento se estiver em modo edição
  useEffect(() => {
    if (!editSlug) return;

    async function loadListingToEdit() {
      try {
        setFetchingExisting(true);
        const data = await fetchAdminListingDetail(editSlug!);
        if (data) {
          setName(data.name || '');
          setSlug(data.slug || '');
          setCategorySlug(data.category?.slug || 'restaurantes');
          setShortDescription(data.shortDescription || '');
          setFullDescription(data.fullDescription || '');
          setPriceTier(data.priceTier || '$$');
          setCitySlug(data.city?.slug || 'caldas-novas');
          setNeighborhood(data.neighborhood?.name || '');
          setStreet(data.street || '');
          setNumber(data.number || '');
          setZipCode(data.zipCode || '');
          setLatitude(data.latitude || undefined);
          setLongitude(data.longitude || undefined);
          setPhone(data.phone || '');
          setWhatsapp(data.whatsapp || '');
          setWebsite(data.website || '');
          setMetaTitle(data.metaTitle || '');
          setMetaDescription(data.metaDescription || '');

          if (data.images && data.images.length > 0) {
            const cover = data.images.find((i: any) => i.isCover) || data.images[0];
            setHeroImage(cover.url);
            const others = data.images
              .filter((i: any) => i.url !== cover.url)
              .map((i: any) => i.url);
            setGalleryImages(others);
          }
        }
      } catch (err: any) {
        console.error('Erro ao buscar dados do estabelecimento:', err);
        setError('Não foi possível carregar os dados para edição.');
      } finally {
        setFetchingExisting(false);
      }
    }

    loadListingToEdit();
  }, [editSlug]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editSlug) {
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
      setMetaTitle(`${val} em Caldas Novas | Os Melhores da Cidade`);
    }
  };

  // Busca de CEP
  const handleCepLookup = async () => {
    const clean = zipCode.replace(/\D/g, '');
    if (clean.length !== 8) return;
    try {
      setCepLoading(true);
      const data = await lookupCepApi(clean);
      if (data.logradouro) setStreet(data.logradouro);
      if (data.bairro) setNeighborhood(data.bairro);

      // Tentar geocodificar automaticamente
      const geo = await geocodeAddressApi({
        address: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade || 'Caldas Novas',
        state: data.uf || 'GO',
      }).catch(() => null);

      if (geo) {
        setLatitude(geo.lat);
        setLongitude(geo.lng);
      }
    } catch (err) {
      console.warn('Falha na consulta de CEP:', err);
    } finally {
      setCepLoading(false);
    }
  };

  // Upload Hero
  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingHero(true);
      const res = await uploadImage(file);
      setHeroImage(res.url);
    } catch (err: any) {
      alert(err.message || 'Falha ao enviar foto principal');
    } finally {
      setUploadingHero(false);
    }
  };

  // Upload Múltiplas Imagens de Galeria
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setUploadingGallery(true);
      const res = await uploadMultipleImages(Array.from(files));
      const urls = (res.files || []).map((img: any) => img.url);
      setGalleryImages((prev) => [...prev, ...urls].slice(0, 4));
    } catch (err: any) {
      alert(err.message || 'Falha ao enviar fotos da galeria');
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (idx: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Montar array de imagens (Hero + galeria)
      const imagesPayload: any[] = [];
      if (heroImage) {
        imagesPayload.push({
          url: heroImage,
          altText: `${name} foto principal`,
          isCover: true,
          order: 0,
        });
      }
      galleryImages.forEach((url, i) => {
        imagesPayload.push({
          url,
          altText: `${name} foto ${i + 1}`,
          isCover: false,
          order: i + 1,
        });
      });

      const payload = {
        name,
        slug,
        categorySlug,
        citySlug,
        neighborhoodName: neighborhood,
        street,
        number,
        zipCode,
        latitude,
        longitude,
        shortDescription,
        fullDescription,
        priceTier,
        phone,
        whatsapp,
        website,
        metaTitle: metaTitle || `${name} | Os Melhores da Cidade`,
        metaDescription: metaDescription || shortDescription,
        images: imagesPayload,
      };

      await createOrUpdateListing(payload);

      setSuccess(true);
      setTimeout(() => {
        router.push('/comerciante');
      }, 2000);
    } catch (err: any) {
      console.error('Erro ao submeter anúncio do comerciante:', err);
      setError(err.message || 'Ocorreu um erro ao cadastrar o anúncio. Tente novamente.');
      setLoading(false);
    }
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
          Voltar para o Painel
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight mt-2">
          {editSlug ? 'Editar Estabelecimento' : 'Cadastrar Novo Estabelecimento'}
        </h1>
        <p className="text-xs sm:text-sm text-[#777777] mt-0.5">
          Preencha os dados do seu negócio. As alterações ou novos cadastros são enviados automaticamente para a moderação editorial da cidade.
        </p>
      </div>

      {fetchingExisting && (
        <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 text-[#FF3B4F] animate-spin" />
          <span className="text-xs font-semibold text-gray-500">
            Carregando dados do anúncio existente...
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>
            {editSlug
              ? 'Alterações salvas com sucesso e enviadas para revisão! Redirecionando...'
              : 'Estabelecimento cadastrado com sucesso e enviado para aprovação! Redirecionando...'}
          </span>
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
                placeholder="Ex: Restaurante Sabor do Cerrado"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                Categoria Principal *
              </label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none bg-white"
              >
                <option value="restaurantes">Restaurantes & Gastronomia</option>
                <option value="atracoes">Parques Aquáticos & Lazer</option>
                <option value="hospedagem">Hotéis, Resorts & Pousadas</option>
                <option value="comercio">Comércio, Lojas & Serviços</option>
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
                placeholder="ex-restaurante-sabor-cerrado"
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
              Descrição Curta (Resumo de impacto para cards e catálogo) *
            </label>
            <input
              type="text"
              required
              maxLength={160}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Ex: Culinária típica goiana, empadão caldasnovense e ambiente climatizado no centro."
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
              Descrição Completa & Diferenciais
            </label>
            <textarea
              rows={4}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="Descreva a história, horário de pico, cardápios especiais, acomodações e comodidades exclusivas..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none"
            />
          </div>
        </div>

        {/* Bloco 2: Fotos & Galeria */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <ImageIcon className="w-4 h-4 text-[#FF3B4F]" />
            <h2 className="text-sm font-bold text-[#171717]">2. Fotos do Estabelecimento (Hero + Galeria)</h2>
          </div>

          {/* Hero Cover Image */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider">
              Foto Principal (Capa / Hero)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {heroImage ? (
                <div className="relative w-full sm:w-48 h-32 rounded-2xl overflow-hidden border border-gray-200">
                  <img src={heroImage} alt="Hero Cover" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setHeroImage('')}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-white transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="w-full sm:w-48 h-32 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#FF3B4F] flex flex-col items-center justify-center cursor-pointer transition bg-gray-50 hover:bg-red-50/20">
                  {uploadingHero ? (
                    <Loader2 className="w-6 h-6 text-[#FF3B4F] animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-[11px] font-bold text-gray-600">Enviar Foto Capa</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroUpload}
                    disabled={uploadingHero}
                    className="hidden"
                  />
                </label>
              )}
              <div className="flex-1 w-full space-y-1">
                <input
                  type="url"
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  placeholder="Ou cole a URL da imagem (https://...)"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 text-[#171717] outline-none"
                />
                <span className="text-[10px] text-gray-500 block">
                  Recomendado: 1200x800px ou proporção 16:9 em alta resolução.
                </span>
              </div>
            </div>
          </div>

          {/* Galeria Secundária */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider">
                Galeria Complementar (Até 4 fotos)
              </label>
              <label className="cursor-pointer text-xs font-bold text-[#FF3B4F] hover:underline flex items-center gap-1">
                {uploadingGallery ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>Adicionar fotos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  disabled={uploadingGallery || galleryImages.length >= 4}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {galleryImages.map((img, i) => (
                <div key={i} className="relative h-24 rounded-xl overflow-hidden border border-gray-200 group">
                  <img src={img} alt={`Galeria ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(i)}
                    className="absolute top-1 right-1 p-1 rounded-md bg-black/60 hover:bg-red-600 text-white transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {Array.from({ length: Math.max(0, 4 - galleryImages.length) }).map((_, i) => (
                <label
                  key={i}
                  className="h-24 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 cursor-pointer hover:border-[#FF3B4F] hover:text-[#FF3B4F] transition bg-gray-50"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-[10px]">Foto {galleryImages.length + i + 1}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryUpload}
                    disabled={uploadingGallery}
                    className="hidden"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Bloco 3: Localização & Contatos */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <MapPin className="w-4 h-4 text-[#FF3B4F]" />
            <h2 className="text-sm font-bold text-[#171717]">3. Localização & Contatos</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                CEP (com busca automática)
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={9}
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  onBlur={handleCepLookup}
                  placeholder="75690-000"
                  className="w-full pl-4 pr-9 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none"
                />
                <button
                  type="button"
                  onClick={handleCepLookup}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF3B4F]"
                >
                  {cepLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                Cidade *
              </label>
              <select
                value={citySlug}
                onChange={(e) => setCitySlug(e.target.value)}
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
                placeholder="Ex: Do Turista"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                Logradouro / Avenida / Rua
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Av. Santo Amaro"
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
                placeholder="1000"
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
                placeholder="(64) 99999-0000"
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
                placeholder="https://meunegocio.com.br"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bloco 4: Otimização SEO */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            <h2 className="text-sm font-bold text-[#171717]">4. Otimização SEO para o Google</h2>
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

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/comerciante">
            <Button type="button" variant="ghost" size="lg">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" variant="primary" size="lg" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </span>
            ) : editSlug ? (
              'Salvar Alterações'
            ) : (
              'Salvar e Enviar para Moderação'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NovoEstabelecimentoPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-[#FF3B4F] animate-spin" />
        </div>
      }
    >
      <MerchantNovoEstabelecimentoForm />
    </Suspense>
  );
}
