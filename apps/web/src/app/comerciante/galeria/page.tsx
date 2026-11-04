'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Image as ImageIcon,
  UploadCloud,
  Store,
  Star,
  Trash2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers,
  Crown,
  Plus,
  RefreshCw,
  Eye,
} from 'lucide-react';
import {
  fetchMerchantListings,
  fetchMerchantGallery,
  addMerchantGalleryImagesApi,
  setMerchantGalleryCoverApi,
  reorderMerchantGalleryImagesApi,
  deleteMerchantGalleryImageApi,
  uploadMultipleImages,
  MerchantGalleryImage,
  MerchantGalleryData,
} from '@/lib/api';

export default function MerchantGalleryPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string>('');
  const [galleryData, setGalleryData] = useState<MerchantGalleryData | null>(null);

  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    image?: MerchantGalleryImage | null;
  }>({ isOpen: false, image: null });

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

  // Carregar galeria do estabelecimento selecionado
  useEffect(() => {
    if (!selectedListingId) {
      setGalleryData(null);
      return;
    }

    async function loadGallery() {
      try {
        setLoadingGallery(true);
        const data = await fetchMerchantGallery(selectedListingId);
        setGalleryData(data);
      } catch (err: any) {
        setFeedback({
          type: 'error',
          message: err?.message || 'Erro ao carregar a galeria de fotos.',
        });
      } finally {
        setLoadingGallery(false);
      }
    }

    loadGallery();
  }, [selectedListingId]);

  const refreshGallery = async () => {
    if (!selectedListingId) return;
    try {
      setLoadingGallery(true);
      const data = await fetchMerchantGallery(selectedListingId);
      setGalleryData(data);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Erro ao recarregar a galeria.',
      });
    } finally {
      setLoadingGallery(false);
    }
  };

  // Upload de fotos em lote
  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const fileList = Array.from(files);
      const uploaded = await uploadMultipleImages(fileList, 'places');

      if (!uploaded.files || uploaded.files.length === 0) {
        throw new Error('Nenhuma imagem foi processada pelo servidor.');
      }

      const payload = uploaded.files.map((f, idx) => ({
        url: f.url,
        caption: `Foto enviada em ${new Date().toLocaleDateString('pt-BR')}`,
      }));

      await addMerchantGalleryImagesApi(selectedListingId, payload);
      setFeedback({
        type: 'success',
        message: `${payload.length} ${payload.length === 1 ? 'foto adicionada' : 'fotos adicionadas'} com sucesso!`,
      });
      await refreshGallery();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Erro ao enviar fotos para a galeria.',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Definir como capa oficial (Hero)
  const handleSetCover = async (image: MerchantGalleryImage) => {
    try {
      setActionLoadingId(image.id);
      await setMerchantGalleryCoverApi(image.id);
      setFeedback({
        type: 'success',
        message: 'Foto de capa principal atualizada com sucesso!',
      });
      await refreshGallery();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Erro ao definir foto de capa.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reordenar foto (mover para a esquerda / direita)
  const handleMove = async (index: number, direction: 'left' | 'right') => {
    if (!galleryData?.images) return;
    const images = [...galleryData.images];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= images.length) return;

    // Trocar posições
    const temp = images[index];
    images[index] = images[targetIndex];
    images[targetIndex] = temp;

    // Atualização otimista na tela
    setGalleryData({ ...galleryData, images });

    try {
      const ids = images.map((img) => img.id);
      await reorderMerchantGalleryImagesApi(selectedListingId, ids);
    } catch (err: any) {
      await refreshGallery();
      setFeedback({
        type: 'error',
        message: err?.message || 'Erro ao salvar nova ordem das fotos.',
      });
    }
  };

  // Confirmar exclusão
  const handleDeleteConfirm = async () => {
    if (!deleteModal.image) return;

    try {
      setActionLoadingId(deleteModal.image.id);
      await deleteMerchantGalleryImageApi(deleteModal.image.id);
      setFeedback({
        type: 'success',
        message: 'Foto removida da galeria.',
      });
      setDeleteModal({ isOpen: false, image: null });
      await refreshGallery();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Erro ao excluir imagem.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const images = galleryData?.images || [];
  const totalPhotos = images.length;
  const coverPhoto = images.find((i) => i.isCover) || images[0];
  const mosaicCount = Math.min(totalPhotos, 5);

  return (
    <div className="space-y-6">
      {/* Topo / Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-7 h-7 text-[#FF3B4F]" />
            Galeria de Fotos do Estabelecimento
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Envie fotos em alta resolução, defina a imagem de capa e organize o mosaico exibido no portal.
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
                  {item.title || item.name}
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
            Para gerenciar a galeria de fotos, cadastre ou aguarde a aprovação do seu primeiro negócio.
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
                <span className="text-xs font-semibold uppercase tracking-wider">Total de Fotos</span>
                <ImageIcon className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalPhotos}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Foto de Capa</span>
                <Crown className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-sm font-bold text-emerald-600 truncate mt-1">
                {coverPhoto ? 'Definida e Ativa' : 'Pendente'}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Mosaico do Topo</span>
                <Layers className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{mosaicCount} de 5</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Qualidade Visual</span>
                <Sparkles className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-sm font-bold text-gray-700 mt-1">
                {totalPhotos >= 5 ? 'Excelente (Mosaico Completo)' : 'Adicione pelo menos 5 fotos'}
              </p>
            </div>
          </div>

          {/* Dica do Mosaico */}
          <div className="bg-linear-to-r from-amber-500/10 via-rose-500/10 to-transparent p-4 rounded-2xl border border-amber-200/60 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-gray-700 leading-relaxed">
              <strong className="text-gray-900">Como funciona o Mosaico Oficial:</strong> As primeiras{' '}
              <strong className="text-[#FF3B4F]">5 fotos da galeria</strong> formam a vitrine principal no topo da página pública do seu local (sendo a primeira foto o banner principal). Você pode reordenar as fotos usando as setas para destacar seus melhores ambientes e pratos!
            </div>
          </div>

          {/* Zona de Upload / Arrastar Fotos */}
          <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#FF3B4F] transition-colors text-center relative group">
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              disabled={uploading || loadingGallery}
              onChange={handleUploadImages}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 bg-rose-50 text-[#FF3B4F] rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                {uploading ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <UploadCloud className="w-7 h-7" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {uploading ? 'Enviando imagens...' : 'Clique ou arraste fotos aqui'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Selecione uma ou várias fotos do seu estabelecimento (PNG, JPG ou WebP até 5MB cada).
                </p>
              </div>
              <button
                type="button"
                disabled={uploading}
                className="inline-flex items-center gap-2 bg-[#FF3B4F] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-rose-600 transition-colors shadow-sm pointer-events-none"
              >
                <Plus className="w-4 h-4" />
                Selecionar Imagens do Dispositivo
              </button>
            </div>
          </div>

          {/* Loading da Galeria */}
          {loadingGallery && (
            <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-sm flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="w-8 h-8 text-[#FF3B4F] animate-spin mb-3" />
              <span className="text-sm font-medium">Carregando fotos do estabelecimento...</span>
            </div>
          )}

          {/* Vazio: Nenhuma foto */}
          {!loadingGallery && images.length === 0 && (
            <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-sm text-center">
              <ImageIcon className="w-14 h-14 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Sua galeria ainda está vazia</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                Estabelecimentos com fotos reais de qualidade recebem até 5x mais cliques no WhatsApp e rotas no mapa.
              </p>
            </div>
          )}

          {/* Grade de Fotos */}
          {!loadingGallery && images.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                <span>
                  Mostrando <strong className="text-gray-900">{images.length}</strong> fotos ordenadas
                </span>
                <button
                  onClick={refreshGallery}
                  className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Atualizar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img, idx) => {
                  const isTopMosaic = idx < 5;
                  const isFirst = idx === 0;
                  const isLast = idx === images.length - 1;
                  const isLoadingThis = actionLoadingId === img.id;

                  return (
                    <div
                      key={img.id}
                      className={`relative bg-white rounded-2xl border overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group ${
                        img.isCover ? 'border-[#FF3B4F] ring-2 ring-[#FF3B4F]/20' : 'border-gray-200'
                      }`}
                    >
                      <div>
                        {/* Imagem */}
                        <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                          <Image
                            src={img.url}
                            alt={img.caption || `Foto ${idx + 1}`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Badge de Capa */}
                          {img.isCover && (
                            <div className="absolute top-2.5 left-2.5">
                              <span className="inline-flex items-center gap-1 bg-[#FF3B4F] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                                <Crown className="w-3 h-3 text-amber-300" />
                                Foto de Capa (Hero)
                              </span>
                            </div>
                          )}

                          {/* Pílula de Posição */}
                          <div className="absolute top-2.5 right-2.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs ${
                                isTopMosaic
                                  ? 'bg-black/75 text-white'
                                  : 'bg-gray-800/60 text-gray-200'
                              }`}
                            >
                              #{idx + 1} {isTopMosaic ? '(Mosaico)' : ''}
                            </span>
                          </div>
                        </div>

                        {/* Legenda Opcional */}
                        {img.caption && (
                          <div className="p-3 border-b border-gray-100">
                            <p className="text-xs text-gray-600 line-clamp-1">{img.caption}</p>
                          </div>
                        )}
                      </div>

                      {/* Barra de Controles Rápidos */}
                      <div className="p-2.5 bg-gray-50/80 flex items-center justify-between gap-1 border-t border-gray-100">
                        {/* Botão de Capa */}
                        {!img.isCover ? (
                          <button
                            onClick={() => handleSetCover(img)}
                            disabled={isLoadingThis}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-700 hover:text-[#FF3B4F] hover:bg-white px-2 py-1 rounded-lg border border-transparent hover:border-gray-200 transition-all"
                            title="Definir esta imagem como capa oficial do local"
                          >
                            <Crown className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-500" />
                            <span>Tornar Capa</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 inline-flex items-center gap-1 px-2 py-1">
                            <Star className="w-3.5 h-3.5 fill-emerald-600" />
                            Capa Atual
                          </span>
                        )}

                        {/* Controles de Reordenação e Exclusão */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMove(idx, 'left')}
                            disabled={isFirst || isLoadingThis}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all disabled:opacity-30 disabled:pointer-events-none"
                            title="Mover para trás"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMove(idx, 'right')}
                            disabled={isLast || isLoadingThis}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all disabled:opacity-30 disabled:pointer-events-none"
                            title="Mover para frente"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, image: img })}
                            disabled={isLoadingThis}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Excluir foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL: Confirmação de Exclusão */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Excluir esta foto?</h3>
            <p className="text-xs text-gray-500 mb-6">
              A imagem será removida permanentemente da galeria do seu estabelecimento.
              {deleteModal.image?.isCover && (
                <span className="block mt-1 text-rose-600 font-semibold">
                  Aviso: Esta é sua foto de capa atual. A próxima foto da galeria será promovida automaticamente.
                </span>
              )}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, image: null })}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
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

