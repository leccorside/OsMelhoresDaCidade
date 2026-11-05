import {
  PlaceDetailData,
  PlaceCategoryType,
  MOCK_PLACES_DETAILS,
  getPlaceDetailData,
} from '@/data/mockPlaceDetails';

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4102/api/v1';

export function getApiBaseUrl(): string {
  // Se estiver rodando no navegador, use a URL pública da API
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4102/api/v1';
  }
  // No servidor (SSR / Server Component):
  // Se estiver no container Docker, INTERNAL_API_URL aponta para http://nestjs:3333/api/v1
  return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4102/api/v1';
}

export function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('os-melhores-auth-storage');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state?.accessToken) {
        return { Authorization: `Bearer ${parsed.state.accessToken}` };
      }
    }
    const cookies = document.cookie.split(';');
    for (const c of cookies) {
      const [k, v] = c.trim().split('=');
      if (k === 'auth_token' && v) {
        return { Authorization: `Bearer ${decodeURIComponent(v)}` };
      }
    }
  } catch (err) {
    // ignore
  }
  return {};
}

export async function createOrUpdateListing(payload: any) {
  const url = `${getApiBaseUrl()}/listings`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Erro ao salvar anúncio: HTTP ${res.status}`);
  }

  return res.json();
}

export async function fetchAdminListings(filters?: {
  search?: string;
  categorySlug?: string;
  status?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.categorySlug && filters.categorySlug !== 'todos') {
    params.append('categorySlug', filters.categorySlug);
  }
  if (filters?.status && filters.status !== 'todos') {
    params.append('status', filters.status);
  }

  const url = `${getApiBaseUrl()}/listings/admin/all?${params.toString()}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Falha ao buscar listagem: HTTP ${res.status}`);
  }

  return res.json();
}

export async function deleteListingApi(id: string) {
  const url = `${getApiBaseUrl()}/listings/${id}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error(`Erro ao excluir anúncio: HTTP ${res.status}`);
  }

  return res.json();
}

export async function fetchAdminListingDetail(idOrSlug: string) {
  const url = `${getApiBaseUrl()}/listings/admin/get/${idOrSlug}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Falha ao carregar detalhes do estabelecimento: HTTP ${res.status}`);
  }

  return res.json();
}

export async function fetchPlaceDetail(citySlug: string, slug: string): Promise<PlaceDetailData | null> {
  const url = `${getApiBaseUrl()}/listings/${citySlug}/${slug}`;
  let apiItem: any = null;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      apiItem = await res.json();
    }
  } catch (err) {
    console.warn(`[fetchPlaceDetail] Falha ao consultar API (${url}):`, err);
  }

  // Se a API não respondeu ou não encontrou, recorre ao mock
  if (!apiItem) {
    return getPlaceDetailData(slug);
  }

  const baseMock = getPlaceDetailData(slug);

  // Mapeia categoria e tipo
  const catSlug = apiItem.category?.slug || '';
  let placeType: PlaceCategoryType = 'general';
  if (catSlug === 'atracoes') placeType = 'attraction';
  else if (catSlug === 'hospedagem') placeType = 'accommodation';
  else if (catSlug === 'restaurantes' || catSlug === 'bares') placeType = 'restaurant';
  else if (baseMock?.placeType) placeType = baseMock.placeType;

  // Formata fotos da galeria
  let gallery = baseMock?.gallery ? [...baseMock.gallery] : [];
  if (Array.isArray(apiItem.images) && apiItem.images.length > 0) {
    gallery = apiItem.images.map((img: any, idx: number) => ({
      url: img.url,
      title: img.caption || `${apiItem.name} - Imagem ${idx + 1}`,
      subtitle: idx === 0 ? 'Destaque Oficial' : undefined,
      isHero: img.isCover || idx === 0,
    }));
  }

  // Assegura pelo menos 5 fotos para o mosaico elegante do design
  if (gallery.length < 5 && baseMock?.gallery) {
    for (let i = gallery.length; i < 5; i++) {
      if (baseMock.gallery[i]) {
        gallery.push(baseMock.gallery[i]);
      }
    }
  }

  // Comodidades
  let amenities = baseMock?.amenities || [];
  if (Array.isArray(apiItem.amenities) && apiItem.amenities.length > 0) {
    amenities = apiItem.amenities
      .map((a: any) => a.amenity?.name || a.name)
      .filter(Boolean);
  }

  // Horários de funcionamento
  let operatingHours = baseMock?.operatingHours || [];
  if (Array.isArray(apiItem.openingHours) && apiItem.openingHours.length > 0) {
    operatingHours = apiItem.openingHours.map((oh: any) => {
      const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      const dayName = days[oh.dayOfWeek] || `Dia ${oh.dayOfWeek}`;
      return {
        label: dayName,
        time: oh.isClosed ? 'Fechado' : `${oh.openTime} às ${oh.closeTime}`,
      };
    });
  }

  // Mapeamento de Itens por Categoria
  const allServiceItems = apiItem.serviceCategories?.flatMap((cat: any) =>
    (cat.items || []).map((item: any) => ({ ...item, categoryName: cat.name }))
  ) || [];

  let ticketTiers = baseMock?.ticketTiers;
  let rooms = baseMock?.rooms;
  let menuHighlights = baseMock?.menuHighlights;

  if (placeType === 'attraction' && allServiceItems.length > 0) {
    ticketTiers = allServiceItems.map((item: any, idx: number) => ({
      id: item.id,
      name: item.name,
      badge: idx === 0 ? 'MAIS VENDIDO' : undefined,
      price: parseFloat(item.price) || 0,
      originalPrice: Math.round((parseFloat(item.price) || 0) * 1.25),
      description: item.description || '',
      features: ['Acesso a todas as atrações', 'Piscinas termais inclusas', 'Válido para o dia todo'],
      rules: 'Cancelamento gratuito até 24h antes.',
    }));
  } else if (placeType === 'accommodation' && allServiceItems.length > 0) {
    rooms = allServiceItems.map((item: any, idx: number) => ({
      id: item.id,
      name: item.name,
      badge: idx === 0 ? 'RECOMENDADO' : undefined,
      sizeM2: 32 + idx * 8,
      capacity: 'Até 4 pessoas',
      bed: idx % 2 === 0 ? '1 Cama King + 1 Sofá Cama' : '2 Camas Queen',
      nightRate: parseFloat(item.price) || 350,
      image: item.imageUrl || gallery[idx % gallery.length]?.url || 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      amenities: ['Ar-condicionado', 'TV Smart', 'Wi-Fi gratuito', 'Frigobar'],
      description: item.description || 'Acomodação confortável e equipada.',
    }));
  } else if (placeType === 'restaurant' && allServiceItems.length > 0) {
    menuHighlights = allServiceItems.map((item: any, idx: number) => ({
      id: item.id,
      name: item.name,
      badge: idx === 0 ? 'CHEF SPECIAL' : undefined,
      price: typeof item.price === 'number' ? `R$ ${item.price.toFixed(2).replace('.', ',')}` : (String(item.price).startsWith('R$') ? String(item.price) : `R$ ${item.price}`),
      category: item.categoryName || 'Pratos Principais',
      description: item.description || '',
      image: item.imageUrl || gallery[idx % gallery.length]?.url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    }));
  }

  // Preço e Faixa
  const priceTier = apiItem.priceTier || baseMock?.priceTier || '$$';
  let priceRange = 'Moderado • R$ 50 - R$ 120';
  if (priceTier === '$') priceRange = 'Econômico • Até R$ 50';
  else if (priceTier === '$$$') priceRange = 'Moderado a Alto • R$ 120 - R$ 250';
  else if (priceTier === '$$$$') priceRange = 'Luxo • Acima de R$ 250';

  // Descrição completa
  let fullDescription: string[] = baseMock?.fullDescription || [];
  if (Array.isArray(apiItem.fullDescription)) {
    fullDescription = apiItem.fullDescription;
  } else if (typeof apiItem.fullDescription === 'string' && apiItem.fullDescription.trim().length > 0) {
    fullDescription = [apiItem.fullDescription.trim()];
  }

  const result: PlaceDetailData = {
    id: apiItem.id,
    slug: apiItem.slug,
    name: apiItem.name,
    placeType,
    category: apiItem.category?.name || baseMock?.category || 'Geral',
    categorySlug: apiItem.category?.slug || baseMock?.categorySlug || 'geral',
    subCategory: apiItem.subcategory?.name || baseMock?.subCategory || apiItem.category?.name || 'Geral',
    badge:
      apiItem.featuredPlan === 'OURO_MASTER'
        ? 'OURO MASTER VIP'
        : apiItem.featuredPlan === 'PRATA_REGIONAL'
        ? 'PRATA REGIONAL'
        : baseMock?.badge || (apiItem.isFeatured ? 'DESTAQUE OFICIAL' : 'VERIFICADO'),
    statusBadge: apiItem.status === 'PUBLISHED' ? 'Aberto Hoje' : 'Pendente',
    awardBadge: baseMock?.awardBadge || (apiItem.isFeatured ? 'Eleito Escolha dos Viajantes 2025' : undefined),
    priceRange,
    priceTier,
    ratingAverage: apiItem.ratingAverage > 0 ? apiItem.ratingAverage : (baseMock?.ratingAverage || 5.0),
    ratingCount: apiItem.ratingCount > 0 ? apiItem.ratingCount : (baseMock?.ratingCount || 120),
    address: [apiItem.street, apiItem.number].filter(Boolean).join(', ') || baseMock?.address || `${apiItem.city?.name || 'Caldas Novas'}, GO`,
    neighborhood: apiItem.neighborhood?.name || baseMock?.neighborhood || 'Centro',
    city: apiItem.city?.name || baseMock?.city || 'Caldas Novas',
    uf: 'GO',
    phone: apiItem.phone || baseMock?.phone || '(64) 3455-0000',
    whatsapp: apiItem.whatsapp || baseMock?.whatsapp || '556434550000',
    website: apiItem.website || baseMock?.website || '',
    lat: apiItem.latitude ? Number(apiItem.latitude) : (baseMock?.lat || -17.74),
    lng: apiItem.longitude ? Number(apiItem.longitude) : (baseMock?.lng || -48.62),
    isOpen: apiItem.status === 'PUBLISHED',
    isFeatured: !!apiItem.isFeatured,
    featuredPlan: apiItem.featuredPlan || (apiItem.isFeatured ? 'BRONZE_DESTAQUE' : null),
    shortDescription: apiItem.shortDescription || baseMock?.shortDescription || `${apiItem.name} em Caldas Novas.`,
    fullDescription,
    guideTip: baseMock?.guideTip || `Aproveite ao máximo sua visita a ${apiItem.name}. Recomendamos reservar com antecedência em fins de semana e feriados.`,
    gallery,
    fastHighlights: baseMock?.fastHighlights || [
      { icon: 'verified', title: 'Verificado', subtitle: 'Guia Oficial' },
      { icon: 'star', title: 'Alta Avaliação', subtitle: 'Recomendado' },
      { icon: 'location_on', title: 'Localização', subtitle: apiItem.neighborhood?.name || 'Centro' },
      { icon: 'schedule', title: 'Atendimento', subtitle: 'Horário comercial' },
    ],
    amenities,
    operatingHours,
    locationInfo: baseMock?.locationInfo || {
      address: [apiItem.street, apiItem.number].filter(Boolean).join(', ') || `${apiItem.city?.name || 'Caldas Novas'}, GO`,
      neighborhood: apiItem.neighborhood?.name || 'Centro',
      directionsTip: 'Fácil acesso pelas principais avenidas da cidade com sinalização turística.',
    },
    ratingBreakdown: baseMock?.ratingBreakdown || {
      score: apiItem.ratingAverage > 0 ? apiItem.ratingAverage : 4.9,
      total: apiItem.ratingCount > 0 ? apiItem.ratingCount : 120,
      categories: [
        { name: 'Limpeza & Higiene', score: 4.9 },
        { name: 'Atendimento & Recepção', score: 4.8 },
        { name: 'Qualidade & Estrutura', score: 4.9 },
        { name: 'Custo-benefício', score: 4.7 },
      ],
    },
    reviews: (() => {
      const realReviews = Array.isArray(apiItem.reviews) && apiItem.reviews.length > 0
        ? apiItem.reviews.map((r: any) => ({
            id: r.id,
            author: r.user?.name || 'Cliente Verificado',
            avatar: r.user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            location: `${apiItem.city?.name || 'Caldas Novas'}, GO`,
            date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : 'Recente',
            title: r.rating >= 4 ? 'Experiência Excelente!' : 'Avaliação do Cliente',
            text: r.comment || '',
            rating: Number(r.rating) || 5,
            stayDetails: 'Visita verificada',
            reply: r.reply ? {
              id: r.reply.id,
              reply: r.reply.reply,
              authorName: `Resposta de ${apiItem.title || apiItem.name}`,
              createdAt: r.reply.createdAt ? new Date(r.reply.createdAt).toLocaleDateString('pt-BR') : undefined,
            } : null,
          }))
        : [];
      return realReviews.length > 0
        ? [...realReviews, ...(baseMock?.reviews || [])]
        : (baseMock?.reviews || []);
    })(),
    faq: baseMock?.faq || [
      {
        question: `Como funciona o atendimento de ${apiItem.name}?`,
        answer: `O estabelecimento opera em horário regular com atendimento presencial e suporte via canais oficiais.`,
      },
      {
        question: `Quais são as principais comodidades disponíveis?`,
        answer: `Oferecemos estrutura completa para receber visitantes, incluindo ${amenities.slice(0, 3).join(', ') || 'serviços de qualidade'}.`,
      },
    ],
    ticketTiers,
    partnerHotelNotice: baseMock?.partnerHotelNotice,
    rooms,
    bookingPolicies: baseMock?.bookingPolicies,
    menuHighlights,
    wineCellar: baseMock?.wineCellar,
    serviceCategories: Array.isArray(apiItem.serviceCategories) && apiItem.serviceCategories.length > 0
      ? apiItem.serviceCategories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          items: (cat.items || []).map((it: any) => ({
            id: it.id,
            name: it.name,
            description: it.description,
            price: it.price !== null && it.price !== undefined ? parseFloat(it.price) : null,
            imageUrl: it.imageUrl,
            isAvailable: it.isAvailable !== false,
          })),
        }))
      : undefined,
    upcomingEvents: Array.isArray(apiItem.events) && apiItem.events.length > 0
      ? apiItem.events.map((evt: any) => ({
          id: evt.id,
          name: evt.name,
          slug: evt.slug,
          description: evt.description,
          startDate: evt.startDate,
          startTime: evt.startTime,
          isFree: !!evt.isFree,
          priceInfo: evt.priceInfo,
          ticketUrl: evt.ticketUrl,
          imageUrl: evt.images?.find((i: any) => i.isCover)?.url || evt.images?.[0]?.url,
          categoryName: evt.category?.name,
        }))
      : undefined,
    coupons: Array.isArray(apiItem.coupons) && apiItem.coupons.length > 0
      ? apiItem.coupons.map((c: any) => ({
          id: c.id,
          code: c.code,
          title: c.title,
          description: c.description,
          discountType: c.discountType,
          discountValue: c.discountValue ? Number(c.discountValue) : undefined,
          discountUnit: c.discountUnit,
          minSpend: c.minSpend ? Number(c.minSpend) : undefined,
          rules: c.rules,
          endDate: c.endDate,
        }))
      : (baseMock?.coupons || []),
  };

  return result;
}

export interface PublicListingsParams {
  citySlug?: string;
  categorySlug?: string;
  neighborhoodSlug?: string;
  search?: string;
  priceTier?: string;
  sortBy?: 'melhores' | 'populares' | 'menor_preco' | 'recentes';
  page?: number;
  limit?: number;
}

export async function fetchPublicListings(params: PublicListingsParams = {}) {
  const query = new URLSearchParams();
  if (params.citySlug) query.append('citySlug', params.citySlug);
  if (params.categorySlug && params.categorySlug !== 'todos') {
    query.append('categorySlug', params.categorySlug);
  }
  if (params.neighborhoodSlug) query.append('neighborhoodSlug', params.neighborhoodSlug);
  if (params.search) query.append('search', params.search);
  if (params.priceTier) query.append('priceTier', params.priceTier);
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));

  const url = `${getApiBaseUrl()}/listings?${query.toString()}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`[fetchPublicListings] Erro ao consultar API (${url}):`, err);
  }

  return { items: [], total: 0, page: 1, limit: 12, totalPages: 1 };
}

export function mapListingToMapPlaceItem(item: any) {
  let priceStr = 'R$ 60 - R$ 120';
  if (item.priceTier === '$') priceStr = 'Até R$ 50';
  else if (item.priceTier === '$$$') priceStr = 'R$ 110 - R$ 160';
  else if (item.priceTier === '$$$$') priceStr = 'R$ 200+';

  const defaultImg =
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80';
  const coverImg =
    item.images?.find((img: any) => img.isCover)?.url || item.images?.[0]?.url || defaultImg;

  const lat = item.latitude ? Number(item.latitude) : -17.7315;
  const lng = item.longitude ? Number(item.longitude) : -48.632;

  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    category: item.category?.name || 'Geral',
    price: priceStr,
    rating: item.ratingAverage > 0 ? Number(item.ratingAverage) : 4.9,
    reviewsCount: item.ratingCount > 0 ? Number(item.ratingCount) : 120,
    lat,
    lng,
    neighborhood: item.neighborhood?.name || 'Centro',
    image: coverImg,
    isOpen: item.status === 'PUBLISHED',
    isFeatured: item.isFeatured ?? false,
    featuredPlan: item.featuredPlan || (item.isFeatured ? 'BRONZE_DESTAQUE' : null),
  };
}

export function resolveImageUrl(url: string | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/uploads')) {
    const apiBase =
      typeof window !== 'undefined'
        ? process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4102'
        : 'http://localhost:4102';
    return `${apiBase}${url}`;
  }
  return url;
}

export async function uploadImage(file: File, folder = 'places'): Promise<{ url: string; size: number }> {
  const formData = new FormData();
  formData.append('file', file);

  const url = `${getApiBaseUrl()}/upload/image?folder=${encodeURIComponent(folder)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao fazer upload da imagem: HTTP ${res.status}`);
  }

  return res.json();
}

export async function uploadMultipleImages(
  files: File[],
  folder = 'places'
): Promise<{ files: Array<{ url: string; size: number }> }> {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));

  const url = `${getApiBaseUrl()}/upload/images?folder=${encodeURIComponent(folder)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao enviar imagens em lote: HTTP ${res.status}`);
  }

  return res.json();
}

export interface CepData {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge?: string;
}

export interface GeocodeData {
  lat: number;
  lng: number;
  displayName: string;
  source: string;
}

export async function lookupCepApi(cep: string): Promise<CepData> {
  const clean = cep.replace(/\D/g, '');
  const url = `${getApiBaseUrl()}/geography/cep/${clean}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'CEP não encontrado');
  }
  return res.json();
}

export async function geocodeAddressApi(params: {
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  query?: string;
}): Promise<GeocodeData> {
  const queryParams = new URLSearchParams();
  if (params.address) queryParams.append('address', params.address);
  if (params.neighborhood) queryParams.append('neighborhood', params.neighborhood);
  if (params.city) queryParams.append('city', params.city);
  if (params.state) queryParams.append('state', params.state);
  if (params.query) queryParams.append('query', params.query);

  const url = `${getApiBaseUrl()}/geography/geocode?${queryParams.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Falha ao buscar coordenadas');
  }
  return res.json();
}

// --- ÁREA DO COMERCIANTE ---

export interface MerchantTimelinePoint {
  date: string;
  label: string;
  views: number;
  whatsapp: number;
  directions: number;
  vouchers: number;
}

export interface MerchantListingStatItem {
  id: string;
  name: string;
  slug: string;
  coverUrl?: string | null;
  views: number;
  whatsapp: number;
  directions: number;
  phone: number;
  rating: number;
  reviewsCount: number;
  vouchersCount: number;
}

export interface MerchantStats {
  period?: string;
  totalListings: number;
  totalViews: number;
  totalWhatsappClicks: number;
  totalDirectionsClicks: number;
  totalPhoneClicks: number;
  overallRating: string;
  publishedListings: number;
  pendingListings: number;
  metrics?: {
    totalListings: number;
    totalViews: number;
    totalWhatsappClicks: number;
    totalDirectionsClicks: number;
    totalPhoneClicks: number;
    totalVouchersRedeemed: number;
    overallRating: string;
    totalRatingReviews: number;
    publishedListings: number;
    pendingListings: number;
  };
  timeline?: MerchantTimelinePoint[];
  listings?: MerchantListingStatItem[];
}

export async function fetchMerchantStats(period: '7d' | '30d' | '90d' = '30d'): Promise<MerchantStats> {
  const url = `${getApiBaseUrl()}/listings/merchant/stats?period=${period}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao obter estatísticas: HTTP ${res.status}`);
  }

  return res.json();
}

export interface MerchantListing {
  id: string;
  title: string;
  slug: string;
  coverUrl?: string;
  [key: string]: any;
}

export async function fetchMerchantListings(): Promise<MerchantListing[]> {
  const url = `${getApiBaseUrl()}/listings/merchant/mine`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao obter estabelecimentos: HTTP ${res.status}`);
  }

  return res.json();
}

export async function createMerchantListing(payload: any) {
  return createOrUpdateListing(payload);
}

// --- ÁREA DE MODERAÇÃO ADMINISTRATIVA ---

export interface AdminDashboardStats {
  totalUsers: number;
  totalMerchants: number;
  totalListings: number;
  pendingListings: number;
  totalEvents: number;
  totalReviews: number;
  activeCities: number;
}

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  const url = `${getApiBaseUrl()}/admin/dashboard/stats`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao obter estatísticas do painel admin: HTTP ${res.status}`);
  }

  return res.json();
}

export async function fetchAdminModerationStats(): Promise<{
  pendingCount: number;
  publishedCount: number;
  rejectedCount: number;
}> {
  const url = `${getApiBaseUrl()}/admin/moderation/stats`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao obter estatísticas de moderação: HTTP ${res.status}`);
  }

  return res.json();
}

export async function fetchAdminPendingListings(): Promise<any[]> {
  const url = `${getApiBaseUrl()}/admin/listings/pending`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao obter lista de pendentes: HTTP ${res.status}`);
  }

  return res.json();
}

export async function updateAdminListingStatus(
  id: string,
  status: 'PUBLISHED' | 'REJECTED' | 'SUSPENDED' | 'PENDING',
  notes?: string
) {
  const url = `${getApiBaseUrl()}/admin/listings/${id}/status`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status, notes }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao atualizar status do anúncio: HTTP ${res.status}`);
  }

  return res.json();
}


// --- CARDÁPIO & SERVIÇOS DO COMERCIANTE ---

export interface MerchantServiceItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  price?: number | null;
  imageUrl?: string | null;
  isAvailable: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantServiceCategory {
  id: string;
  listingId: string;
  name: string;
  description?: string | null;
  order: number;
  items: MerchantServiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface MerchantListingServicesData {
  listing: {
    id: string;
    title: string;
    slug: string;
    primaryCity: {
      name: string;
      state: string;
    };
  };
  categories: MerchantServiceCategory[];
}

export async function fetchMerchantServices(listingIdOrSlug: string): Promise<MerchantListingServicesData> {
  const url = `${getApiBaseUrl()}/listings/merchant/services/${encodeURIComponent(listingIdOrSlug)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao carregar cardápio e serviços: HTTP ${res.status}`);
  }

  return res.json();
}

export async function createServiceCategoryApi(
  listingIdOrSlug: string,
  payload: { name: string; description?: string; order?: number }
): Promise<MerchantServiceCategory> {
  const url = `${getApiBaseUrl()}/listings/merchant/services/${encodeURIComponent(listingIdOrSlug)}/category`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao criar categoria/seção: HTTP ${res.status}`);
  }

  return res.json();
}

export async function updateServiceCategoryApi(
  categoryId: string,
  payload: { name?: string; description?: string; order?: number }
): Promise<MerchantServiceCategory> {
  const url = `${getApiBaseUrl()}/listings/merchant/services/category/${encodeURIComponent(categoryId)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao atualizar categoria: HTTP ${res.status}`);
  }

  return res.json();
}

export async function deleteServiceCategoryApi(categoryId: string): Promise<{ success: boolean }> {
  const url = `${getApiBaseUrl()}/listings/merchant/services/category/${encodeURIComponent(categoryId)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao excluir categoria: HTTP ${res.status}`);
  }

  return res.json();
}

export async function createServiceItemApi(
  categoryId: string,
  payload: {
    name: string;
    description?: string;
    price?: number;
    imageUrl?: string;
    isAvailable?: boolean;
    order?: number;
  }
): Promise<MerchantServiceItem> {
  const url = `${getApiBaseUrl()}/listings/merchant/services/category/${encodeURIComponent(categoryId)}/item`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao criar item do cardápio: HTTP ${res.status}`);
  }

  return res.json();
}

export async function updateServiceItemApi(
  itemId: string,
  payload: {
    name?: string;
    description?: string;
    price?: number;
    imageUrl?: string;
    isAvailable?: boolean;
    order?: number;
  }
): Promise<MerchantServiceItem> {
  const url = `${getApiBaseUrl()}/listings/merchant/services/item/${encodeURIComponent(itemId)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao atualizar item: HTTP ${res.status}`);
  }

  return res.json();
}

export async function toggleServiceItemAvailabilityApi(
  itemId: string,
  isAvailable?: boolean
): Promise<MerchantServiceItem> {
  const url = `${getApiBaseUrl()}/listings/merchant/services/item/${encodeURIComponent(itemId)}/toggle`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(typeof isAvailable === 'boolean' ? { isAvailable } : {}),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao alternar disponibilidade: HTTP ${res.status}`);
  }

  return res.json();
}

export async function deleteServiceItemApi(itemId: string): Promise<{ success: boolean }> {
  const url = `${getApiBaseUrl()}/listings/merchant/services/item/${encodeURIComponent(itemId)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao excluir item: HTTP ${res.status}`);
  }

  return res.json();
}


// --- GESTÃO DE EVENTOS & SHOWS DO COMERCIANTE ---

export interface EventCategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
}

export interface MerchantEventItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  programDetails?: string | null;
  categoryId: string;
  category?: EventCategoryItem;
  cityId: string;
  city?: { id: string; name: string; slug: string };
  listingId?: string | null;
  listing?: { id: string; name: string; slug: string } | null;
  address?: string | null;
  startDate: string;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  isFree: boolean;
  priceInfo?: string | null;
  ticketUrl?: string | null;
  status: 'PENDING' | 'PUBLISHED' | 'CANCELLED' | 'REJECTED';
  isFeatured: boolean;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  images: Array<{ id: string; url: string; isCover: boolean; caption?: string }>;
}

export interface CreateMerchantEventPayload {
  name: string;
  description?: string;
  programDetails?: string;
  categoryId: string;
  listingId?: string;
  cityId?: string;
  address?: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  isFree?: boolean;
  priceInfo?: string;
  ticketUrl?: string;
  imageUrl?: string;
}

export async function fetchEventCategories(): Promise<EventCategoryItem[]> {
  const url = `${getApiBaseUrl()}/events/categories`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erro ao carregar categorias de eventos');
  }

  return res.json();
}

export async function fetchMerchantEvents(): Promise<MerchantEventItem[]> {
  const url = `${getApiBaseUrl()}/events/merchant/mine`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao carregar eventos: HTTP ${res.status}`);
  }

  return res.json();
}

export async function createMerchantEventApi(payload: CreateMerchantEventPayload): Promise<MerchantEventItem> {
  const url = `${getApiBaseUrl()}/events/merchant`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao cadastrar evento: HTTP ${res.status}`);
  }

  return res.json();
}

export async function updateMerchantEventApi(
  id: string,
  payload: Partial<CreateMerchantEventPayload>
): Promise<MerchantEventItem> {
  const url = `${getApiBaseUrl()}/events/merchant/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao atualizar evento: HTTP ${res.status}`);
  }

  return res.json();
}

export async function deleteMerchantEventApi(id: string): Promise<{ success: boolean }> {
  const url = `${getApiBaseUrl()}/events/merchant/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao excluir evento: HTTP ${res.status}`);
  }

  return res.json();
}


// --- GESTÃO DA GALERIA DE FOTOS DO COMERCIANTE ---

export interface MerchantGalleryImage {
  id: string;
  listingId: string;
  url: string;
  caption?: string | null;
  order: number;
  isCover: boolean;
  createdAt: string;
}

export interface MerchantGalleryData {
  listing: {
    id: string;
    name: string;
    slug: string;
    coverUrl?: string | null;
  };
  images: MerchantGalleryImage[];
}

export async function fetchMerchantGallery(listingIdOrSlug: string): Promise<MerchantGalleryData> {
  const url = `${getApiBaseUrl()}/listings/merchant/gallery/${encodeURIComponent(listingIdOrSlug)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao obter fotos da galeria: HTTP ${res.status}`);
  }

  return res.json();
}

export async function addMerchantGalleryImagesApi(
  listingIdOrSlug: string,
  images: Array<{ url: string; caption?: string; isCover?: boolean; order?: number }>
): Promise<MerchantGalleryImage[]> {
  const url = `${getApiBaseUrl()}/listings/merchant/gallery/${encodeURIComponent(listingIdOrSlug)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ images }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao adicionar fotos: HTTP ${res.status}`);
  }

  return res.json();
}

export async function setMerchantGalleryCoverApi(imageId: string): Promise<MerchantGalleryImage> {
  const url = `${getApiBaseUrl()}/listings/merchant/gallery/${encodeURIComponent(imageId)}/cover`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao definir foto de capa: HTTP ${res.status}`);
  }

  return res.json();
}

export async function reorderMerchantGalleryImagesApi(
  listingIdOrSlug: string,
  imageIds: string[]
): Promise<MerchantGalleryImage[]> {
  const url = `${getApiBaseUrl()}/listings/merchant/gallery/${encodeURIComponent(listingIdOrSlug)}/reorder`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ imageIds }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao reordenar galeria: HTTP ${res.status}`);
  }

  return res.json();
}

export async function deleteMerchantGalleryImageApi(imageId: string): Promise<{ success: boolean; deletedId: string }> {
  const url = `${getApiBaseUrl()}/listings/merchant/gallery/${encodeURIComponent(imageId)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao remover foto: HTTP ${res.status}`);
  }

  return res.json();
}


// --- PAINEL DE AVALIAÇÕES E RESPOSTAS DO COMERCIANTE ---

export interface MerchantReviewItem {
  id: string;
  listingId: string;
  listing: {
    id: string;
    name: string;
    slug: string;
  };
  userId: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    email: string;
  };
  rating: number;
  comment?: string | null;
  status: string;
  createdAt: string;
  reply?: {
    id: string;
    reply: string;
    createdAt: string;
    updatedAt: string;
  } | null;
}

export interface MerchantReviewsMetrics {
  totalReviews: number;
  averageRating: number;
  answeredCount: number;
  unansweredCount: number;
  distribution: Record<number, number>;
}

export interface MerchantReviewsData {
  metrics: MerchantReviewsMetrics;
  reviews: MerchantReviewItem[];
  listings: Array<{ id: string; name: string; slug: string }>;
}

export async function fetchMerchantReviews(params?: {
  listingId?: string;
  rating?: number;
  answered?: boolean;
}): Promise<MerchantReviewsData> {
  const query = new URLSearchParams();
  if (params?.listingId && params.listingId !== 'all') query.append('listingId', params.listingId);
  if (params?.rating) query.append('rating', String(params.rating));
  if (params?.answered !== undefined) query.append('answered', String(params.answered));

  const url = `${getApiBaseUrl()}/reviews/merchant/mine${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao obter avaliações: HTTP ${res.status}`);
  }

  return res.json();
}

export async function replyMerchantReviewApi(reviewId: string, reply: string) {
  const url = `${getApiBaseUrl()}/reviews/${encodeURIComponent(reviewId)}/reply`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ reply }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao enviar resposta: HTTP ${res.status}`);
  }

  return res.json();
}

export async function deleteMerchantReviewReplyApi(replyId: string): Promise<{ success: boolean }> {
  const url = `${getApiBaseUrl()}/reviews/reply/${encodeURIComponent(replyId)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao excluir resposta: HTTP ${res.status}`);
  }

  return res.json();
}

// ==========================================
// CUPONS E PROMOÇÕES DO COMERCIANTE
// ==========================================

export interface MerchantCouponClaim {
  id: string;
  claimCode: string;
  customerName?: string | null;
  customerPhone?: string | null;
  createdAt: string;
  usedAt?: string | null;
}

export interface MerchantCouponItem {
  id: string;
  listingId: string;
  code: string;
  title: string;
  description?: string | null;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREEBIE' | 'CUSTOM';
  discountValue?: number | null;
  discountUnit?: string | null;
  minSpend?: number | null;
  maxUses?: number | null;
  usedCount: number;
  startDate?: string | null;
  endDate?: string | null;
  rules?: string | null;
  status: 'ACTIVE' | 'PAUSED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
  listing: {
    id: string;
    title?: string;
    name?: string;
    slug: string;
    coverUrl?: string | null;
  };
  claims?: MerchantCouponClaim[];
}

export interface MerchantCouponsMetrics {
  totalCoupons: number;
  activeCoupons: number;
  totalClaims: number;
  estimatedSavings: number;
}

export interface MerchantCouponsData {
  metrics: MerchantCouponsMetrics;
  coupons: MerchantCouponItem[];
}

export async function fetchMerchantCoupons(params?: {
  listingId?: string;
  status?: string;
  search?: string;
}): Promise<MerchantCouponsData> {
  const query = new URLSearchParams();
  if (params?.listingId) query.append('listingId', params.listingId);
  if (params?.status && params.status !== 'ALL') query.append('status', params.status);
  if (params?.search) query.append('search', params.search);

  const url = `${getApiBaseUrl()}/coupons/merchant/mine${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Erro ao buscar cupons: HTTP ${res.status}`);
  }

  return res.json();
}

export async function createMerchantCouponApi(data: {
  listingId: string;
  code: string;
  title: string;
  description?: string;
  discountType?: string;
  discountValue?: number;
  discountUnit?: string;
  minSpend?: number;
  maxUses?: number;
  startDate?: string;
  endDate?: string;
  rules?: string;
}): Promise<MerchantCouponItem> {
  const url = `${getApiBaseUrl()}/coupons/merchant`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao cadastrar cupom: HTTP ${res.status}`);
  }

  return res.json();
}

export async function updateMerchantCouponApi(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    discountType: string;
    discountValue: number;
    discountUnit: string;
    minSpend: number;
    maxUses: number;
    startDate: string;
    endDate: string;
    rules: string;
    status: string;
  }>
): Promise<MerchantCouponItem> {
  const url = `${getApiBaseUrl()}/coupons/merchant/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao atualizar cupom: HTTP ${res.status}`);
  }

  return res.json();
}

export async function toggleMerchantCouponStatusApi(id: string): Promise<MerchantCouponItem> {
  const url = `${getApiBaseUrl()}/coupons/merchant/${encodeURIComponent(id)}/toggle`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao alternar status do cupom: HTTP ${res.status}`);
  }

  return res.json();
}

export async function deleteMerchantCouponApi(id: string): Promise<{ success: boolean; message: string }> {
  const url = `${getApiBaseUrl()}/coupons/merchant/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao excluir cupom: HTTP ${res.status}`);
  }

  return res.json();
}

export interface VoucherValidationResult {
  isValid: boolean;
  status: 'VALID' | 'ALREADY_USED' | 'EXPIRED' | 'INACTIVE';
  statusMessage: string;
  claim: {
    id: string;
    claimCode: string;
    customerName?: string | null;
    customerPhone?: string | null;
    customerEmail?: string | null;
    createdAt: string;
    usedAt?: string | null;
  };
  coupon: {
    id: string;
    code: string;
    title: string;
    description?: string | null;
    discountType: string;
    discountValue?: number | null;
    discountUnit?: string | null;
    minSpend?: number | null;
    rules?: string | null;
    endDate?: string | null;
    listing: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export async function validateVoucherApi(claimCode: string): Promise<VoucherValidationResult> {
  const url = `${getApiBaseUrl()}/coupons/merchant/validate-voucher`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ claimCode }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao validar voucher: HTTP ${res.status}`);
  }

  return res.json();
}

export async function redeemVoucherApi(claimCode: string): Promise<{
  success: boolean;
  message: string;
  claimCode: string;
  usedAt: string;
  coupon: any;
  customerName?: string;
}> {
  const url = `${getApiBaseUrl()}/coupons/merchant/redeem-voucher`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ claimCode }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao dar baixa no voucher: HTTP ${res.status}`);
  }

  return res.json();
}

export async function fetchPublicListingCoupons(listingId: string): Promise<any[]> {
  const url = `${getApiBaseUrl()}/coupons/public/listing/${encodeURIComponent(listingId)}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function claimPublicCouponApi(
  couponId: string,
  data: { customerName?: string; customerPhone?: string; customerEmail?: string }
): Promise<{ success: boolean; claimCode: string; coupon: any; claimedAt: string }> {
  const url = `${getApiBaseUrl()}/coupons/public/${encodeURIComponent(couponId)}/claim`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao resgatar cupom: HTTP ${res.status}`);
  }

  return res.json();
}

// ==========================================
// NOTIFICAÇÕES EM TEMPO REAL
// ==========================================

export interface MerchantNotificationItem {
  id: string;
  userId: string;
  type: 'NEW_REVIEW' | 'REVIEW_REPLIED' | 'CONTACT_MESSAGE' | 'COUPON_CLAIMED' | 'EVENT_RSVP' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  linkUrl?: string | null;
  isRead: boolean;
  readAt?: string | null;
  metadata?: any;
  createdAt: string;
}

export interface MerchantNotificationsData {
  unreadCount: number;
  notifications: MerchantNotificationItem[];
}

export async function fetchMerchantNotifications(limit = 20): Promise<MerchantNotificationsData> {
  const url = `${getApiBaseUrl()}/notifications/mine?limit=${limit}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    return { unreadCount: 0, notifications: [] };
  }

  return res.json();
}

export async function markNotificationAsReadApi(id: string): Promise<MerchantNotificationItem> {
  const url = `${getApiBaseUrl()}/notifications/${encodeURIComponent(id)}/read`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error(`Erro ao marcar notificação: HTTP ${res.status}`);
  }

  return res.json();
}

export async function markAllNotificationsAsReadApi(): Promise<{ success: boolean }> {
  const url = `${getApiBaseUrl()}/notifications/read-all`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error(`Erro ao marcar todas notificações: HTTP ${res.status}`);
  }

  return res.json();
}

export async function deleteNotificationApi(id: string): Promise<{ success: boolean }> {
  const url = `${getApiBaseUrl()}/notifications/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error(`Erro ao excluir notificação: HTTP ${res.status}`);
  }

  return res.json();
}

// ==========================================
// DADOS DA CONTA E PERFIL DO COMERCIANTE
// ==========================================

export interface MerchantProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatarUrl?: string | null;
    role: string;
    createdAt: string;
  };
  merchantProfile: {
    id: string;
    userId: string;
    companyName: string;
    legalName?: string | null;
    cnpj?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    pixKey?: string | null;
    pixKeyType?: string | null;
    bankName?: string | null;
    bankAgency?: string | null;
    bankAccount?: string | null;
    address?: string | null;
    isApproved: boolean;
    approvedAt?: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export async function fetchMerchantProfileApi(): Promise<MerchantProfileData> {
  const url = `${getApiBaseUrl()}/auth/merchant-profile`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao carregar perfil: HTTP ${res.status}`);
  }

  return res.json();
}

export async function updateMerchantProfileApi(data: {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  companyName?: string;
  legalName?: string;
  cnpj?: string;
  whatsapp?: string;
  pixKey?: string;
  pixKeyType?: string;
  bankName?: string;
  bankAgency?: string;
  bankAccount?: string;
  address?: string;
}): Promise<MerchantProfileData> {
  const url = `${getApiBaseUrl()}/auth/merchant-profile`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao salvar perfil: HTTP ${res.status}`);
  }

  return res.json();
}

export async function changeMerchantPasswordApi(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> {
  const url = `${getApiBaseUrl()}/auth/change-password`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao trocar senha: HTTP ${res.status}`);
  }

  return res.json();
}

// ==========================================
// ADMIN: MODERAÇÃO DE CUPONS E COMUNICADOS
// ==========================================

export async function fetchAdminCoupons(params?: {
  status?: string;
  search?: string;
}): Promise<{
  metrics: {
    totalCoupons: number;
    activeCoupons: number;
    totalClaims: number;
  };
  coupons: any[];
}> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== 'ALL') query.append('status', params.status);
  if (params?.search) query.append('search', params.search);

  const url = `${getApiBaseUrl()}/admin/coupons${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Erro ao buscar cupons de admin: HTTP ${res.status}`);
  }

  return res.json();
}

export async function updateAdminCouponStatusApi(id: string, status: string): Promise<any> {
  const url = `${getApiBaseUrl()}/admin/coupons/${encodeURIComponent(id)}/status`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao atualizar status: HTTP ${res.status}`);
  }

  return res.json();
}

export async function broadcastNotificationApi(data: {
  title: string;
  message: string;
  linkUrl?: string;
  targetRole?: string;
}): Promise<{ success: boolean; count: number; message: string }> {
  const url = `${getApiBaseUrl()}/admin/notifications/broadcast`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao disparar comunicado: HTTP ${res.status}`);
  }

  return res.json();
}

// --- FATURAMENTO & PLANOS DE DESTAQUE ---

export interface BillingPlan {
  id: 'BRONZE_DESTAQUE' | 'PRATA_REGIONAL' | 'OURO_MASTER';
  name: string;
  badge: string;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  features: string[];
  recommended?: boolean;
}

export interface MerchantSubscriptionItem {
  id: string;
  plan: 'BRONZE_DESTAQUE' | 'PRATA_REGIONAL' | 'OURO_MASTER';
  status: 'PENDING' | 'PAID' | 'CANCELED' | 'REFUNDED';
  price: number;
  billingCycle: string;
  pixQrCode?: string;
  gatewayInvoiceUrl?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  listing?: {
    id: string;
    name: string;
    slug: string;
    coverUrl?: string | null;
  };
  payments?: Array<{
    id: string;
    amount: number;
    method: string;
    status: string;
    paidAt?: string;
  }>;
}

export async function fetchBillingPlansApi(): Promise<BillingPlan[]> {
  const url = `${getApiBaseUrl()}/billing/plans`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Erro ao carregar planos: HTTP ${res.status}`);
  }

  return res.json();
}

export async function fetchMerchantSubscriptionsApi(): Promise<MerchantSubscriptionItem[]> {
  const url = `${getApiBaseUrl()}/billing/merchant/subscriptions`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error(`Erro ao carregar assinaturas: HTTP ${res.status}`);
  }

  return res.json();
}

export async function createCheckoutApi(data: {
  listingId: string;
  plan: string;
  billingCycle?: 'MONTHLY' | 'YEARLY';
  paymentMethod?: string;
  couponCode?: string;
}): Promise<{
  success: boolean;
  subscriptionId: string;
  plan: BillingPlan;
  basePrice?: number;
  discountAmount?: number;
  couponCode?: string | null;
  price: number;
  billingCycle: string;
  pixQrCode: string;
  gatewayInvoiceUrl: string;
  listing: { id: string; name: string; slug: string };
  expiresAt: string;
}> {
  const url = `${getApiBaseUrl()}/billing/checkout`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao gerar checkout: HTTP ${res.status}`);
  }

  return res.json();
}

export async function confirmSubscriptionPaymentApi(subscriptionId: string): Promise<{
  success: boolean;
  message: string;
  subscription: MerchantSubscriptionItem;
}> {
  const url = `${getApiBaseUrl()}/billing/confirm/${subscriptionId}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao confirmar pagamento: HTTP ${res.status}`);
  }

  return res.json();
}

export interface FinancialOverviewData {
  metrics: {
    totalRevenue: number;
    currentMonthRevenue: number;
    activeSubscriptionsCount: number;
    pendingInvoicesCount: number;
    planDistribution: {
      BRONZE_DESTAQUE: number;
      PRATA_REGIONAL: number;
      OURO_MASTER: number;
    };
  };
  timeline: Array<{
    label: string;
    revenue: number;
  }>;
  transactions: Array<{
    id: string;
    plan: string;
    status: string;
    price: number;
    billingCycle: string;
    createdAt: string;
    startDate?: string;
    endDate?: string;
    listing?: { id: string; name: string; slug: string };
    merchantProfile?: {
      id: string;
      companyName: string;
      user?: { id: string; name: string; email: string };
    };
    payments?: Array<{
      id: string;
      amount: number;
      method: string;
      status: string;
      paidAt?: string;
    }>;
  }>;
}

export async function fetchAdminFinancialOverviewApi(): Promise<FinancialOverviewData> {
  const url = `${getApiBaseUrl()}/billing/admin/financial-overview`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error(`Erro ao carregar dados financeiros: HTTP ${res.status}`);
  }

  return res.json();
}

export interface InvoiceData {
  invoiceNumber: string;
  verificationCode: string;
  status: string;
  statusLabel: string;
  issueDate: string;
  paidAt: string | null;
  provider: {
    name: string;
    tradeName: string;
    cnpj: string;
    email: string;
    website: string;
    address: string;
  };
  customer: {
    tradeName: string;
    companyName: string;
    document: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
  };
  service: {
    subscriptionId: string;
    plan: string;
    planName: string;
    listingName: string;
    billingCycle: string;
    periodStart: string;
    periodEnd: string | null;
    description: string;
    grossAmount: number;
    discountAmount: number;
    couponCode?: string | null;
    netAmount: number;
    paymentMethod: string;
    gatewayPaymentId: string | null;
    gatewayInvoiceUrl: string | null;
  };
}

export async function fetchInvoiceDetailsApi(subscriptionId: string): Promise<InvoiceData> {
  const url = `${getApiBaseUrl()}/billing/merchant/invoice/${subscriptionId}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Erro ao carregar fatura / recibo: HTTP ${res.status}`);
  }

  return res.json();
}

export interface CouponValidationResult {
  valid: boolean;
  couponId: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  basePrice: number;
  discountAmount: number;
  finalPrice: number;
}

export async function validateSubscriptionCouponApi(data: {
  code: string;
  plan: string;
  billingCycle: string;
}): Promise<CouponValidationResult> {
  const url = `${getApiBaseUrl()}/billing/validate-coupon`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Cupom inválido ou expirado.');
  }

  return res.json();
}

export interface SubscriptionCouponItem {
  id: string;
  code: string;
  description?: string | null;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  maxUses?: number | null;
  usedCount: number;
  validUntil?: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { subscriptions: number };
}

export async function fetchAdminSubscriptionCouponsApi(): Promise<SubscriptionCouponItem[]> {
  const url = `${getApiBaseUrl()}/billing/admin/coupons`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error('Erro ao buscar cupons de assinatura.');
  }

  return res.json();
}

export async function toggleAdminSubscriptionCouponApi(id: string): Promise<SubscriptionCouponItem> {
  const url = `${getApiBaseUrl()}/billing/admin/coupons/${id}/toggle`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error('Erro ao alterar status do cupom.');
  }

  return res.json();
}

export interface PlanChangeCalculation {
  subscriptionId: string;
  listingId: string;
  listingName: string;
  currentPlan: {
    id: string;
    name: string;
    price: number;
    billingCycle: string;
    endDate: string;
    daysRemaining: number;
  };
  newPlan: {
    id: string;
    name: string;
    price: number;
    billingCycle: string;
  };
  unusedCredit: number;
  amountToPay: number;
  isUpgrade: boolean;
}

export async function calculatePlanChangeApi(data: {
  subscriptionId: string;
  newPlan: string;
  newBillingCycle?: string;
}): Promise<PlanChangeCalculation> {
  const url = `${getApiBaseUrl()}/billing/change-plan/calculate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erro ao calcular migração de plano.');
  }

  return res.json();
}

export async function createPlanChangeCheckoutApi(data: {
  subscriptionId: string;
  newPlan: string;
  newBillingCycle?: string;
  couponCode?: string;
}): Promise<any> {
  const url = `${getApiBaseUrl()}/billing/change-plan/checkout`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erro ao gerar checkout de upgrade.');
  }

  return res.json();
}

export interface MerchantRoiPerformanceData {
  hasActivePlan: boolean;
  activePlan: {
    id: string;
    name: string;
    badge: string;
    price: number;
    billingCycle: string;
    listingName?: string;
    endDate?: string;
  } | null;
  totals: {
    views: number;
    whatsapp: number;
    phone: number;
    directions: number;
    website: number;
    totalLeads: number;
  };
  benchmarks: {
    averageFreeViews: number;
    averageFreeLeads: number;
    viewsIncreasePercentage: number;
    leadsIncreasePercentage: number;
    viewsMultiplier: number;
    leadsMultiplier: number;
  };
  financialRoi: {
    investmentAmount: number;
    costPerLead: number;
    estimatedConversions: number;
    estimatedReturns: number;
    roiPercentage: number;
  };
}

export async function fetchMerchantRoiPerformanceApi(): Promise<MerchantRoiPerformanceData> {
  const url = `${getApiBaseUrl()}/billing/merchant/roi-performance`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error('Erro ao carregar dados de desempenho e ROI.');
  }

  return res.json();
}

export interface CitySplitItem {
  id: string;
  name: string;
  slug: string;
  ibgeCode: number;
  isPublished: boolean;
  franchiseName?: string | null;
  franchiseCnpj?: string | null;
  franchisePixKey?: string | null;
  franchisePixType?: string | null;
  franchiseWalletId?: string | null;
  platformFeePercent: number;
  franchiseFeePercent: number;
  splitEnabled: boolean;
  state?: { uf: string; name: string };
  _count?: { listings: number };
}

export async function fetchAdminCitySplitsApi(): Promise<CitySplitItem[]> {
  const url = `${getApiBaseUrl()}/billing/admin/city-splits`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error('Erro ao buscar configurações de split de cidades.');
  }

  return res.json();
}

export async function updateAdminCitySplitApi(cityId: string, data: Partial<CitySplitItem>): Promise<CitySplitItem> {
  const url = `${getApiBaseUrl()}/billing/admin/city-splits/${cityId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erro ao atualizar split da cidade.');
  }

  return res.json();
}

export interface ExpiringSubscriptionItem {
  id: string;
  listingId: string | null;
  listingName: string;
  merchantName: string;
  merchantEmail: string | null;
  merchantPhone: string;
  cityName: string;
  plan: string;
  planName: string;
  billingCycle: string;
  price: number;
  endDate: string;
  daysRemaining: number;
  statusDescription: string;
  renewUrl: string;
  whatsAppLink: string | null;
  whatsAppMessage: string;
}

export interface ProcessRenewalsResult {
  success: boolean;
  totalExpiring: number;
  emailsSent: number;
  notificationsCreated: number;
  items: ExpiringSubscriptionItem[];
}

export async function fetchExpiringSubscriptionsApi(days = 7): Promise<ExpiringSubscriptionItem[]> {
  const url = `${getApiBaseUrl()}/billing/admin/expiring-subscriptions?days=${days}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error('Erro ao buscar assinaturas a vencer.');
  }

  return res.json();
}

export async function processSubscriptionRenewalsApi(): Promise<ProcessRenewalsResult> {
  const url = `${getApiBaseUrl()}/billing/admin/process-renewals`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erro ao processar notificações de renovação.');
  }

  return res.json();
}

// -----------------------------------------------------------------------------
// FRANQUIA REGIONAL & GESTÃO DA CIDADE
// -----------------------------------------------------------------------------

export interface FranchiseOverviewData {
  city: {
    id: string;
    name: string;
    slug: string;
    uf: string;
    franchiseName: string;
    franchiseCnpj: string | null;
    franchisePixKey: string | null;
    franchisePixType: string | null;
    franchiseFeePercent: number;
    platformFeePercent: number;
    splitEnabled: boolean;
  };
  stats: {
    totalListings: number;
    publishedListings: number;
    pendingListings: number;
    activeVipCount: number;
    monthlyRevenue: number;
    franchiseCommission: number;
    platformCommission: number;
    vipPlansBreakdown: {
      bronze: number;
      prata: number;
      ouro: number;
    };
  };
}

export interface FranchiseMerchantItem {
  id: string;
  name: string;
  slug: string;
  status: string;
  categoryName: string;
  address: string;
  phone: string;
  ownerName: string;
  ownerEmail: string | null;
  isVip: boolean;
  currentPlan: string;
  planExpiresAt: string | null;
  whatsAppLink: string | null;
}

export interface FranchiseSubscriptionItem {
  id: string;
  listingName: string;
  merchantName: string;
  plan: string;
  status: string;
  billingCycle: string;
  grossAmount: number;
  franchiseCut: number;
  platformCut: number;
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

export async function fetchFranchiseOverviewApi(cityId?: string): Promise<FranchiseOverviewData> {
  const query = cityId ? `?cityId=${cityId}` : '';
  const url = `${getApiBaseUrl()}/franchise/overview${query}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erro ao carregar dados da franquia.');
  }

  return res.json();
}

export async function fetchFranchiseMerchantsApi(params?: {
  search?: string;
  status?: string;
  cityId?: string;
}): Promise<FranchiseMerchantItem[]> {
  const q = new URLSearchParams();
  if (params?.search) q.append('search', params.search);
  if (params?.status) q.append('status', params.status);
  if (params?.cityId) q.append('cityId', params.cityId);

  const url = `${getApiBaseUrl()}/franchise/merchants?${q.toString()}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erro ao buscar lojistas da franquia.');
  }

  return res.json();
}

export async function fetchFranchiseSubscriptionsApi(cityId?: string): Promise<FranchiseSubscriptionItem[]> {
  const query = cityId ? `?cityId=${cityId}` : '';
  const url = `${getApiBaseUrl()}/franchise/subscriptions${query}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erro ao buscar assinaturas da cidade.');
  }

  return res.json();
}







