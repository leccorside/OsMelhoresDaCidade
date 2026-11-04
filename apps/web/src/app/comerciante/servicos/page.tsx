'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  UtensilsCrossed,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Store,
  ChevronDown,
  ChevronUp,
  Loader2,
  UploadCloud,
  ImageIcon,
  Check,
  RefreshCw,
  FolderPlus,
  DollarSign,
  PackageCheck,
  PackageX,
  Layers,
} from 'lucide-react';
import {
  fetchMerchantListings,
  fetchMerchantServices,
  createServiceCategoryApi,
  updateServiceCategoryApi,
  deleteServiceCategoryApi,
  createServiceItemApi,
  updateServiceItemApi,
  toggleServiceItemAvailabilityApi,
  deleteServiceItemApi,
  uploadImage,
  MerchantListingServicesData,
  MerchantServiceCategory,
  MerchantServiceItem,
} from '@/lib/api';

export default function MerchantServicesPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string>('');
  const [servicesData, setServicesData] = useState<MerchantListingServicesData | null>(null);

  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Estados de feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Seções recolhidas / expandidas
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Modais
  const [categoryModal, setCategoryModal] = useState<{
    isOpen: boolean;
    category?: MerchantServiceCategory | null;
  }>({ isOpen: false, category: null });

  const [itemModal, setItemModal] = useState<{
    isOpen: boolean;
    categoryId?: string;
    item?: MerchantServiceItem | null;
  }>({ isOpen: false, categoryId: '', item: null });

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    type: 'category' | 'item';
    id: string;
    name: string;
  }>({ isOpen: false, type: 'category', id: '', name: '' });

  // Formulário de Categoria
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', order: 0 });

  // Formulário de Item
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    isAvailable: true,
    order: 0,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Auto-fechar feedback após 4 segundos
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Carregar estabelecimentos do comerciante
  useEffect(() => {
    async function loadListings() {
      try {
        setLoadingListings(true);
        const data = await fetchMerchantListings();
        setListings(data || []);
        if (data && data.length > 0) {
          setSelectedListingId(data[0].id);
        }
      } catch (err: any) {
        setFeedback({
          type: 'error',
          message: err?.message || 'Erro ao carregar lista de estabelecimentos.',
        });
      } finally {
        setLoadingListings(false);
      }
    }
    loadListings();
  }, []);

  // Carregar serviços da empresa selecionada
  useEffect(() => {
    if (!selectedListingId) {
      setServicesData(null);
      return;
    }

    async function loadServices() {
      try {
        setLoadingServices(true);
        const data = await fetchMerchantServices(selectedListingId);
        setServicesData(data);
      } catch (err: any) {
        setFeedback({
          type: 'error',
          message: err?.message || 'Erro ao carregar o cardápio e catálogo de serviços.',
        });
      } finally {
        setLoadingServices(false);
      }
    }

    loadServices();
  }, [selectedListingId]);

  // Recarregar os serviços da listing atual
  const refreshServices = async () => {
    if (!selectedListingId) return;
    try {
      const data = await fetchMerchantServices(selectedListingId);
      setServicesData(data);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Erro ao atualizar dados.',
      });
    }
  };

  const toggleCollapse = (catId: string) => {
    setCollapsedSections((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  // --- Handlers de Categoria ---
  const handleOpenCategoryModal = (cat?: MerchantServiceCategory) => {
    if (cat) {
      setCategoryForm({
        name: cat.name,
        description: cat.description || '',
        order: cat.order || 0,
      });
      setCategoryModal({ isOpen: true, category: cat });
    } else {
      setCategoryForm({ name: '', description: '', order: 0 });
      setCategoryModal({ isOpen: true, category: null });
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      setFeedback({ type: 'error', message: 'O nome da seção é obrigatório.' });
      return;
    }

    try {
      if (categoryModal.category) {
        await updateServiceCategoryApi(categoryModal.category.id, {
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim() || undefined,
          order: Number(categoryForm.order) || 0,
        });
        setFeedback({ type: 'success', message: 'Seção atualizada com sucesso!' });
      } else {
        await createServiceCategoryApi(selectedListingId, {
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim() || undefined,
          order: Number(categoryForm.order) || 0,
        });
        setFeedback({ type: 'success', message: 'Nova seção criada com sucesso!' });
      }
      setCategoryModal({ isOpen: false, category: null });
      await refreshServices();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Erro ao salvar seção.' });
    }
  };

  // --- Handlers de Item ---
  const handleOpenItemModal = (categoryId: string, item?: MerchantServiceItem) => {
    if (item) {
      setItemForm({
        name: item.name,
        description: item.description || '',
        price: item.price !== null && item.price !== undefined ? String(item.price) : '',
        imageUrl: item.imageUrl || '',
        isAvailable: item.isAvailable,
        order: item.order || 0,
      });
      setItemModal({ isOpen: true, categoryId, item });
    } else {
      setItemForm({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        isAvailable: true,
        order: 0,
      });
      setItemModal({ isOpen: true, categoryId, item: null });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const res = await uploadImage(file, 'services');
      setItemForm((prev) => ({ ...prev, imageUrl: res.url }));
      setFeedback({ type: 'success', message: 'Foto enviada com sucesso!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Erro no upload da imagem.' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name.trim()) {
      setFeedback({ type: 'error', message: 'O nome do item é obrigatório.' });
      return;
    }

    const priceNum = itemForm.price ? parseFloat(itemForm.price.replace(',', '.')) : undefined;

    try {
      if (itemModal.item) {
        await updateServiceItemApi(itemModal.item.id, {
          name: itemForm.name.trim(),
          description: itemForm.description.trim() || undefined,
          price: isNaN(priceNum as any) ? undefined : priceNum,
          imageUrl: itemForm.imageUrl.trim() || undefined,
          isAvailable: itemForm.isAvailable,
          order: Number(itemForm.order) || 0,
        });
        setFeedback({ type: 'success', message: 'Item atualizado com sucesso!' });
      } else {
        await createServiceItemApi(itemModal.categoryId!, {
          name: itemForm.name.trim(),
          description: itemForm.description.trim() || undefined,
          price: isNaN(priceNum as any) ? undefined : priceNum,
          imageUrl: itemForm.imageUrl.trim() || undefined,
          isAvailable: itemForm.isAvailable,
          order: Number(itemForm.order) || 0,
        });
        setFeedback({ type: 'success', message: 'Item adicionado ao cardápio/serviços!' });
      }
      setItemModal({ isOpen: false, categoryId: '', item: null });
      await refreshServices();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Erro ao salvar item.' });
    }
  };

  // Alternar disponibilidade com 1 clique (Toggle rápido)
  const handleToggleAvailability = async (item: MerchantServiceItem) => {
    const newStatus = !item.isAvailable;
    // Otimista na UI
    setServicesData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        categories: prev.categories.map((cat) => {
          if (cat.id !== item.categoryId) return cat;
          return {
            ...cat,
            items: cat.items.map((i) => (i.id === item.id ? { ...i, isAvailable: newStatus } : i)),
          };
        }),
      };
    });

    try {
      await toggleServiceItemAvailabilityApi(item.id, newStatus);
      setFeedback({
        type: 'success',
        message: `"${item.name}" marcado como ${newStatus ? 'DISPONÍVEL' : 'ESGOTADO/PAUSADO'}.`,
      });
    } catch (err: any) {
      // Reverter se falhou
      await refreshServices();
      setFeedback({
        type: 'error',
        message: err?.message || 'Erro ao alternar disponibilidade.',
      });
    }
  };

  // Exclusões
  const handleConfirmDelete = async () => {
    try {
      if (deleteConfirmModal.type === 'category') {
        await deleteServiceCategoryApi(deleteConfirmModal.id);
        setFeedback({ type: 'success', message: 'Seção removida com sucesso!' });
      } else {
        await deleteServiceItemApi(deleteConfirmModal.id);
        setFeedback({ type: 'success', message: 'Item excluído com sucesso!' });
      }
      setDeleteConfirmModal({ isOpen: false, type: 'category', id: '', name: '' });
      await refreshServices();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Erro ao excluir elemento.' });
    }
  };

  // Cálculos de métricas do catálogo
  const totalCategories = servicesData?.categories?.length || 0;
  const allItems = servicesData?.categories?.flatMap((c) => c.items) || [];
  const totalItems = allItems.length;
  const availableItems = allItems.filter((i) => i.isAvailable).length;
  const unavailableItems = totalItems - availableItems;

  return (
    <div className="space-y-6">
      {/* Topo / Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UtensilsCrossed className="w-7 h-7 text-[#FF3B4F]" />
            Cardápio & Catálogo de Serviços
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize suas seções, adicione produtos ou serviços com foto e controle a disponibilidade em tempo real.
          </p>
        </div>

        {/* Seletor de Estabelecimento */}
        {listings.length > 0 && (
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm">
            <Store className="w-5 h-5 text-gray-400 shrink-0" />
            <select
              value={selectedListingId}
              onChange={(e) => setSelectedListingId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer"
            >
              {listings.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title || item.name} {item.primaryCity?.name || item.city?.name ? `(${item.primaryCity?.name || item.city?.name})` : ''}
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

      {/* Caso não tenha estabelecimentos cadastrados */}
      {!loadingListings && listings.length === 0 && (
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center max-w-xl mx-auto my-12">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Nenhum estabelecimento encontrado</h2>
          <p className="text-sm text-gray-500 mb-6">
            Para gerenciar um cardápio ou catálogo de serviços, cadastre ou aguarde a aprovação do seu primeiro negócio.
          </p>
          <Link
            href="/comerciante/estabelecimentos/novo"
            className="inline-flex items-center gap-2 bg-[#FF3B4F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Novo Estabelecimento
          </Link>
        </div>
      )}

      {/* Conteúdo Principal quando há estabelecimentos */}
      {listings.length > 0 && (
        <>
          {/* Métricas Rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Seções</span>
                <Layers className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalCategories}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total de Itens</span>
                <UtensilsCrossed className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Disponíveis</span>
                <PackageCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-emerald-600">{availableItems}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Esgotados/Pausados</span>
                <PackageX className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-bold text-rose-600">{unavailableItems}</p>
            </div>
          </div>

          {/* Barra de Ações: Adicionar Nova Seção */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-600">
              Gerenciando serviços de:{' '}
              <strong className="text-gray-900">
                {servicesData?.listing.title || 'Estabelecimento selecionado'}
              </strong>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={refreshServices}
                disabled={loadingServices}
                className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="Recarregar dados"
              >
                <RefreshCw className={`w-4 h-4 ${loadingServices ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => handleOpenCategoryModal()}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#FF3B4F] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Nova Seção / Categoria
              </button>
            </div>
          </div>

          {/* Loading do Cardápio */}
          {loadingServices && (
            <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="w-8 h-8 text-[#FF3B4F] animate-spin mb-3" />
              <span className="text-sm font-medium">Carregando cardápio e itens...</span>
            </div>
          )}

          {/* Vazio: nenhuma seção criada */}
          {!loadingServices && servicesData?.categories?.length === 0 && (
            <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-sm text-center">
              <FolderPlus className="w-14 h-14 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Seu catálogo ainda está vazio</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                Crie a primeira seção para começar a adicionar itens (exemplo: &quot;Pratos Executivos&quot;, &quot;Pizzas Especiais&quot;, &quot;Cortes de Cabelo&quot;, &quot;Acomodações&quot;).
              </p>
              <button
                onClick={() => handleOpenCategoryModal()}
                className="inline-flex items-center gap-2 bg-[#FF3B4F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Criar Primeira Seção
              </button>
            </div>
          )}

          {/* Lista de Seções com Itens */}
          {!loadingServices && servicesData?.categories && servicesData.categories.length > 0 && (
            <div className="space-y-6">
              {servicesData.categories.map((cat) => {
                const isCollapsed = Boolean(collapsedSections[cat.id]);

                return (
                  <div
                    key={cat.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all"
                  >
                    {/* Header da Seção */}
                    <div className="bg-gray-50/70 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleCollapse(cat.id)}
                          className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-200/50 transition-colors"
                          title={isCollapsed ? 'Expandir' : 'Recolher'}
                        >
                          {isCollapsed ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronUp className="w-5 h-5" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-gray-900">{cat.name}</h2>
                            <span className="text-xs bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-full font-semibold">
                              {cat.items?.length || 0} {cat.items?.length === 1 ? 'item' : 'itens'}
                            </span>
                          </div>
                          {cat.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Ações da Seção */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => handleOpenItemModal(cat.id)}
                          className="inline-flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#FF3B4F]" />
                          Adicionar Item
                        </button>
                        <button
                          onClick={() => handleOpenCategoryModal(cat)}
                          className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Editar Seção"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirmModal({
                              isOpen: true,
                              type: 'category',
                              id: cat.id,
                              name: cat.name,
                            })
                          }
                          className="p-2 text-gray-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Excluir Seção"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Corpo da Seção: Lista de Itens */}
                    {!isCollapsed && (
                      <div className="p-5">
                        {(!cat.items || cat.items.length === 0) && (
                          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                            <UtensilsCrossed className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-gray-600 mb-1">
                              Nenhum item nesta seção
                            </p>
                            <p className="text-xs text-gray-400 mb-4">
                              Adicione pratos, bebidas ou serviços para esta categoria.
                            </p>
                            <button
                              onClick={() => handleOpenItemModal(cat.id)}
                              className="inline-flex items-center gap-1.5 bg-gray-900 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Cadastrar Primeiro Item
                            </button>
                          </div>
                        )}

                        {cat.items && cat.items.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {cat.items.map((item) => (
                              <div
                                key={item.id}
                                className={`rounded-xl border transition-all p-4 flex flex-col justify-between ${
                                  item.isAvailable
                                    ? 'bg-white border-gray-200 hover:border-gray-300 shadow-2xs'
                                    : 'bg-gray-50/60 border-gray-200 opacity-75'
                                }`}
                              >
                                <div>
                                  {/* Imagem do Item ou Placeholder */}
                                  <div className="relative w-full h-36 bg-gray-100 rounded-lg overflow-hidden mb-3">
                                    {item.imageUrl ? (
                                      <Image
                                        src={item.imageUrl}
                                        alt={item.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                                        <span className="text-[11px]">Sem foto</span>
                                      </div>
                                    )}

                                    {/* Badge de Disponibilidade no topo da foto */}
                                    <div className="absolute top-2 right-2">
                                      <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                                          item.isAvailable
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-rose-500 text-white'
                                        }`}
                                      >
                                        {item.isAvailable ? (
                                          <>
                                            <Check className="w-3 h-3" />
                                            Disponível
                                          </>
                                        ) : (
                                          <>
                                            <XCircle className="w-3 h-3" />
                                            Esgotado
                                          </>
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Título e Preço */}
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-1">
                                      {item.name}
                                    </h3>
                                    <span className="text-sm font-bold text-[#FF3B4F] shrink-0">
                                      {item.price !== null && item.price !== undefined
                                        ? Number(item.price).toLocaleString('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL',
                                          })
                                        : 'A consultar'}
                                    </span>
                                  </div>

                                  {/* Descrição */}
                                  {item.description && (
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                                      {item.description}
                                    </p>
                                  )}
                                </div>

                                {/* Barra de Controle: Alternador com 1 clique + Ações */}
                                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 mt-2">
                                  {/* Switch de Disponibilidade Rápida */}
                                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={item.isAvailable}
                                      onChange={() => handleToggleAvailability(item)}
                                      className="sr-only peer"
                                    />
                                    <div className="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500 relative"></div>
                                    <span className="text-[11px] font-medium text-gray-600">
                                      {item.isAvailable ? 'Ativo' : 'Pausado'}
                                    </span>
                                  </label>

                                  {/* Ações de Edição / Exclusão */}
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleOpenItemModal(cat.id, item)}
                                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                      title="Editar Item"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        setDeleteConfirmModal({
                                          isOpen: true,
                                          type: 'item',
                                          id: item.id,
                                          name: item.name,
                                        })
                                      }
                                      className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                      title="Excluir Item"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* MODAL: Criar / Editar Seção */}
      {categoryModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">
                {categoryModal.category ? 'Editar Seção' : 'Nova Seção de Serviços'}
              </h3>
              <button
                onClick={() => setCategoryModal({ isOpen: false, category: null })}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nome da Seção *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pratos Principais, Bebidas, Acomodações..."
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]/20 focus:border-[#FF3B4F] text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Descrição (opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Pratos servidos no almoço e jantar das 11h às 22h"
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]/20 focus:border-[#FF3B4F] text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Ordem de exibição
                </label>
                <input
                  type="number"
                  min="0"
                  value={categoryForm.order}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, order: Number(e.target.value) })
                  }
                  className="w-24 px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]/20 focus:border-[#FF3B4F] text-sm text-gray-900"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCategoryModal({ isOpen: false, category: null })}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#FF3B4F] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors shadow-sm"
                >
                  Salvar Seção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Criar / Editar Item */}
      {itemModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-gray-900">
                {itemModal.item ? 'Editar Item' : 'Novo Item / Prato / Serviço'}
              </h3>
              <button
                onClick={() => setItemModal({ isOpen: false, categoryId: '', item: null })}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4 overflow-y-auto">
              {/* Foto do Item */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Foto do Item / Produto
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                    {itemForm.imageUrl ? (
                      <Image
                        src={itemForm.imageUrl}
                        alt="Preview"
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <label className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                      {uploadingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#FF3B4F]" />
                      ) : (
                        <UploadCloud className="w-4 h-4 text-[#FF3B4F]" />
                      )}
                      <span>{uploadingImage ? 'Enviando foto...' : 'Escolher foto do dispositivo'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                        disabled={uploadingImage}
                        onChange={handleImageUpload}
                      />
                    </label>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Formatos recomendados: PNG, JPG ou WebP (máx. 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nome do Item *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Filé Parmegiana Completo, Quarto Luxo, Barba Terapêutica..."
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]/20 focus:border-[#FF3B4F] text-sm text-gray-900"
                />
              </div>

              {/* Preço e Ordem */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Preço (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">R$</span>
                    <input
                      type="text"
                      placeholder="0,00"
                      value={itemForm.price}
                      onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]/20 focus:border-[#FF3B4F] text-sm text-gray-900 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Ordem de exibição
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={itemForm.order}
                    onChange={(e) => setItemForm({ ...itemForm, order: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]/20 focus:border-[#FF3B4F] text-sm text-gray-900"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Descrição detalhada
                </label>
                <textarea
                  rows={3}
                  placeholder="Ingredientes, modo de preparo, o que acompanha, duração do serviço..."
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]/20 focus:border-[#FF3B4F] text-sm text-gray-900"
                />
              </div>

              {/* Disponibilidade Inicial */}
              <div className="pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={itemForm.isAvailable}
                    onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 relative"></div>
                  <span className="text-xs font-bold text-gray-700">
                    Item disponível para pedidos/consumo imediatamente
                  </span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setItemModal({ isOpen: false, categoryId: '', item: null })}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="bg-[#FF3B4F] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors shadow-sm disabled:opacity-50"
                >
                  Salvar Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Confirmação de Exclusão */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Excluir {deleteConfirmModal.type === 'category' ? 'Seção' : 'Item'}?
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Tem certeza que deseja excluir &quot;<strong className="text-gray-800">{deleteConfirmModal.name}</strong>&quot;?
              {deleteConfirmModal.type === 'category' && (
                <span className="block mt-1 text-rose-600 font-semibold">
                  Atenção: todos os itens desta seção também serão removidos.
                </span>
              )}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() =>
                  setDeleteConfirmModal({
                    isOpen: false,
                    type: 'category',
                    id: '',
                    name: '',
                  })
                }
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
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

