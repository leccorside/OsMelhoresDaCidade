const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1';

export interface CityData {
  id: string;
  name: string;
  slug: string;
  ibgeCode: number;
  isPublished: boolean;
  isFeatured: boolean;
  heroImage?: string;
  coverImage?: string;
  introText?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  state: {
    id: string;
    name: string;
    uf: string;
  };
  neighborhoods?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  _count?: {
    listings: number;
    events: number;
  };
}

export async function fetchCities(): Promise<CityData[]> {
  try {
    const res = await fetch(`${API_URL}/geography/cities`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('Falha ao carregar cidades da API');
    return await res.json();
  } catch {
    // Fallback estático caso a API esteja offline durante o build
    return [
      {
        id: '1',
        name: 'Caldas Novas',
        slug: 'caldas-novas',
        ibgeCode: 5204508,
        isPublished: true,
        isFeatured: true,
        introText: 'A maior estância hidrotermal do mundo.',
        state: { id: 'go', name: 'Goiás', uf: 'GO' },
      },
    ];
  }
}

export async function fetchCityBySlug(slug: string): Promise<CityData | null> {
  try {
    const res = await fetch(`${API_URL}/geography/cities/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    if (slug === 'caldas-novas') {
      return {
        id: '1',
        name: 'Caldas Novas',
        slug: 'caldas-novas',
        ibgeCode: 5204508,
        isPublished: true,
        isFeatured: true,
        introText: 'A maior estância hidrotermal do planeta.',
        description: 'Descubra restaurantes, bares, hotéis e atrações em Caldas Novas, Goiás.',
        state: { id: 'go', name: 'Goiás', uf: 'GO' },
        neighborhoods: [
          { id: '1', name: 'Centro', slug: 'centro' },
          { id: '2', name: 'Privé das Caldas', slug: 'prive-das-caldas' },
          { id: '3', name: 'Solar de Caldas', slug: 'solar-de-caldas' },
          { id: '4', name: 'Lago Corumbá', slug: 'lago-corumba' },
        ],
      } as CityData;
    }
    return null;
  }
}

