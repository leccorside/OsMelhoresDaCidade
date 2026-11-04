const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1';

export interface EventItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  programDetails?: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  address?: string;
  isFree: boolean;
  priceInfo?: string;
  ticketUrl?: string;
  isFeatured: boolean;
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
  images?: Array<{
    id: string;
    url: string;
    isCover: boolean;
  }>;
}

export interface EventListResponse {
  items: EventItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function fetchEvents(params: {
  citySlug?: string;
  categorySlug?: string;
  search?: string;
  isFree?: boolean;
  page?: number;
  limit?: number;
}): Promise<EventListResponse> {
  const query = new URLSearchParams();
  if (params.citySlug) query.set('citySlug', params.citySlug);
  if (params.categorySlug) query.set('categorySlug', params.categorySlug);
  if (params.search) query.set('search', params.search);
  if (params.isFree !== undefined) query.set('isFree', String(params.isFree));
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  try {
    const res = await fetch(`${API_URL}/events?${query.toString()}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) throw new Error('Falha ao carregar eventos da API');
    return await res.json();
  } catch {
    const mockEvents: EventItem[] = [
      {
        id: 'evt-1',
        name: 'Caldas Country Festival 2025',
        slug: 'caldas-country-festival-2025',
        description: 'O maior festival de música sertaneja do Brasil reúne os maiores nomes do gênero durante dois dias de folia inesquecível em Caldas Novas.',
        programDetails: 'Abertura dos portões às 18:00 com camarotes open bar e atrações nacionais.',
        startDate: '2025-11-14T19:00:00Z',
        startTime: '19:00',
        address: 'Arena Caldas Music, Caldas Novas - GO',
        isFree: false,
        priceInfo: 'A partir de R$ 180,00',
        ticketUrl: 'https://caldascountryfestival.com.br',
        isFeatured: true,
        category: { id: 'c1', name: 'Festival & Shows', slug: 'shows' },
        city: { id: 'city1', name: 'Caldas Novas', slug: 'caldas-novas' },
      },
      {
        id: 'evt-2',
        name: 'Festival Gastronômico das Águas Quentes',
        slug: 'festival-gastronomico-aguas-quentes',
        description: 'Feira gastronômica com chefs renomados, pratos típicos com pequi e frutos do cerrado, cervejarias artesanais e shows acústicos.',
        programDetails: 'Workshops gastronômicos e degustação de vinhos e cachaças locais.',
        startDate: '2025-12-05T18:00:00Z',
        startTime: '18:00',
        address: 'Praça Mestre Orlando, Centro, Caldas Novas - GO',
        isFree: true,
        priceInfo: 'Entrada Gratuita',
        isFeatured: true,
        category: { id: 'c2', name: 'Gastronomia & Cultura', slug: 'gastronomia' },
        city: { id: 'city1', name: 'Caldas Novas', slug: 'caldas-novas' },
      },
    ];

    return {
      items: mockEvents,
      total: mockEvents.length,
      page: params.page || 1,
      limit: params.limit || 12,
      totalPages: 1,
    };
  }
}

