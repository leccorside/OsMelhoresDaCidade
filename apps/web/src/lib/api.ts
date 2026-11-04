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

export async function createOrUpdateListing(payload: any) {
  const url = `${getApiBaseUrl()}/listings`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
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
    badge: baseMock?.badge || (apiItem.isFeatured ? 'DESTAQUE OURO' : 'VERIFICADO'),
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
    reviews: baseMock?.reviews || [],
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
  };

  return result;
}
