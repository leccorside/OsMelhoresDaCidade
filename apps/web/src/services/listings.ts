const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1';

export interface ListingItem {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  fullDescription?: string;
  priceTier: string;
  ratingAverage: number;
  ratingCount: number;
  isFeatured: boolean;
  phone?: string;
  whatsapp?: string;
  website?: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  city: {
    id: string;
    name: string;
    slug: string;
  };
  neighborhood?: {
    id: string;
    name: string;
    slug: string;
  };
  images?: Array<{
    id: string;
    url: string;
    isCover: boolean;
  }>;
}

export interface ListingListResponse {
  items: ListingItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function fetchListings(params: {
  citySlug?: string;
  categorySlug?: string;
  neighborhoodSlug?: string;
  search?: string;
  priceTier?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}): Promise<ListingListResponse> {
  const query = new URLSearchParams();
  if (params.citySlug) query.set('citySlug', params.citySlug);
  if (params.categorySlug) query.set('categorySlug', params.categorySlug);
  if (params.neighborhoodSlug) query.set('neighborhoodSlug', params.neighborhoodSlug);
  if (params.search) query.set('search', params.search);
  if (params.priceTier) query.set('priceTier', params.priceTier);
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  try {
    const res = await fetch(`${API_URL}/listings?${query.toString()}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) throw new Error('Falha ao carregar listagem da API');
    return await res.json();
  } catch {
    // Fallback com dados padrão dos protótipos Stitch
    const mockListings: ListingItem[] = [
      {
        id: '1',
        name: 'Restaurante Nonna Mia',
        slug: 'restaurante-nonna-mia',
        shortDescription: 'Tradicional galeto colonial, massas artesanais e rodízio típico italiano.',
        fullDescription: 'Fundado em Caldas Novas com receita de família, o Nonna Mia oferece rodízio colonial de massas e galeto.',
        priceTier: '$$$',
        ratingAverage: 4.9,
        ratingCount: 1240,
        isFeatured: true,
        phone: '(64) 3453-1234',
        whatsapp: '5564999991234',
        website: 'https://nonnamia.com.br',
        category: { id: 'c1', name: 'Restaurantes & Gastronomia', slug: 'restaurantes' },
        city: { id: 'city1', name: 'Caldas Novas', slug: 'caldas-novas' },
        neighborhood: { id: 'n1', name: 'Centro', slug: 'centro' },
      },
      {
        id: '2',
        name: 'diRoma Acqua Park',
        slug: 'diroma-acqua-park',
        shortDescription: 'O mais famoso parque aquático hidrotermal de Caldas Novas com toboáguas radicais.',
        fullDescription: 'Complexo termal completo com piscina de ondas, vulcão, corredeiras e rio lento.',
        priceTier: '$$$$',
        ratingAverage: 4.8,
        ratingCount: 3500,
        isFeatured: true,
        phone: '(64) 3455-9000',
        whatsapp: '5564999999000',
        category: { id: 'c2', name: 'Parques & Lazer', slug: 'atracoes' },
        city: { id: 'city1', name: 'Caldas Novas', slug: 'caldas-novas' },
        neighborhood: { id: 'n2', name: 'Solar de Caldas', slug: 'solar-de-caldas' },
      },
      {
        id: '3',
        name: 'Pousada Termal do Lago',
        slug: 'pousada-termal-do-lago',
        shortDescription: 'Refúgio de charme às margens do Lago Corumbá com piscinas termais privativas.',
        fullDescription: 'Ambiente aconchegante, café da manhã colonial e contato direto com a natureza de Goiás.',
        priceTier: '$$$',
        ratingAverage: 4.9,
        ratingCount: 890,
        isFeatured: true,
        phone: '(64) 3454-5678',
        whatsapp: '5564999995678',
        category: { id: 'c3', name: 'Hotéis & Pousadas', slug: 'hospedagem' },
        city: { id: 'city1', name: 'Caldas Novas', slug: 'caldas-novas' },
        neighborhood: { id: 'n3', name: 'Lago Corumbá', slug: 'lago-corumba' },
      },
    ];

    let filtered = mockListings;
    if (params.categorySlug) {
      filtered = filtered.filter((i) => i.category.slug === params.categorySlug);
    }
    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter((i) => i.name.toLowerCase().includes(s));
    }

    return {
      items: filtered,
      total: filtered.length,
      page: params.page || 1,
      limit: params.limit || 12,
      totalPages: 1,
    };
  }
}

