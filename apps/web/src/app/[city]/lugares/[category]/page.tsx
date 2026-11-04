import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DirectoryPlacesClient } from '@/components/directory/DirectoryPlacesClient';
import { fetchPublicListings, mapListingToMapPlaceItem } from '@/lib/api';

interface CategoryPageProps {
  params: Promise<{
    city: string;
    category: string;
  }>;
}

const CATEGORY_NAMES: Record<string, string> = {
  restaurantes: 'Restaurantes & Gastronomia',
  bares: 'Bares & Vida Noturna',
  hospedagem: 'Hotéis, Pousadas & Resorts',
  atracoes: 'Parques Aquáticos & Lazer',
  eventos: 'Shows & Eventos',
  comercio: 'Comércio & Serviços',
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { city, category } = await params;
  const cityName = city === 'caldas-novas' ? 'Caldas Novas' : city;
  const categoryTitle = CATEGORY_NAMES[category] || category;

  return constructMetadata({
    title: `Melhores ${categoryTitle} em ${cityName} | Guia Completo`,
    description: `Descubra as melhores opções de ${categoryTitle.toLowerCase()} em ${cityName}. Avaliações autênticas, horários, fotos, filtros e mapa ao vivo.`,
    cityName,
    categoryName: categoryTitle,
    canonical: `/${city}/lugares/${category}`,
  });
}

export const revalidate = 60;

export default async function CategoryListingPage({ params }: CategoryPageProps) {
  const { city, category } = await params;
  const cityName = city === 'caldas-novas' ? 'Caldas Novas' : city;
  const cityUf = city === 'caldas-novas' ? 'GO' : 'BR';

  // Busca inicial SSR dos estabelecimentos cadastrados no PostgreSQL
  const listingsRes = await fetchPublicListings({
    citySlug: city,
    categorySlug: category,
    limit: 50,
  });

  const serverPlaces = listingsRes.items.map(mapListingToMapPlaceItem);

  return (
    <>
      <Header
        currentCitySlug={city}
        currentCityName={cityName}
        currentCityUf={cityUf}
        showCityPill={true}
      />

      <DirectoryPlacesClient
        citySlug={city}
        cityName={cityName}
        initialCategory={category}
        serverPlaces={serverPlaces}
      />

      <Footer currentCitySlug={city} />
    </>
  );
}
