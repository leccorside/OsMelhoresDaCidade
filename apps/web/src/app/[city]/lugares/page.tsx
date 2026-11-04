import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DirectoryPlacesClient } from '@/components/directory/DirectoryPlacesClient';

interface LugaresPageProps {
  params: Promise<{
    city: string;
  }>;
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    bairro?: string;
    preco?: string;
    ordem?: string;
  }>;
}

export async function generateMetadata({ params }: LugaresPageProps): Promise<Metadata> {
  const { city } = await params;
  const cityName = city === 'caldas-novas' ? 'Caldas Novas' : city;

  return constructMetadata({
    title: `Melhores Lugares e Estabelecimentos em ${cityName} | Guia Completo`,
    description: `Encontre restaurantes, bares, hotéis, parques termais e atrações em ${cityName}. Avaliações verificadas, filtros refinados e mapa interativo.`,
    cityName,
    canonical: `/${city}/lugares`,
  });
}

export default async function LugaresPage({ params, searchParams }: LugaresPageProps) {
  const { city } = await params;
  const search = await searchParams;

  const cityName = city === 'caldas-novas' ? 'Caldas Novas' : city;
  const cityUf = city === 'caldas-novas' ? 'GO' : 'BR';

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
        initialCategory={search.categoria || ''}
        initialSearch={search.q || ''}
      />

      <Footer currentCitySlug={city} />
    </>
  );
}
