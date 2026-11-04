import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { constructMetadata, generateLocalBusinessSchema } from '@/lib/seo';
import { fetchPlaceDetail } from '@/lib/api';
import { PlaceDetailView } from '@/components/place/PlaceDetailView';

interface LugarPageProps {
  params: Promise<{
    city: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: LugarPageProps): Promise<Metadata> {
  const { city, slug } = await params;
  const cityName = city === 'caldas-novas' ? 'Caldas Novas' : city;
  const place = await fetchPlaceDetail(city, slug);

  if (!place) {
    return constructMetadata({
      title: 'Estabelecimento não encontrado',
      noIndex: true,
    });
  }

  return constructMetadata({
    title: `${place.name} em ${cityName} | Avaliações, Horários e Preços`,
    description: `${place.shortDescription} Descubra fotos, valores, comodidades e localização de ${place.name} em ${cityName}.`,
    cityName,
    canonical: `/${city}/lugar/${slug}`,
  });
}

export const revalidate = 60;

export default async function ListingDetailPage({ params }: LugarPageProps) {
  const { city, slug } = await params;
  const cityName = city === 'caldas-novas' ? 'Caldas Novas' : city;
  const place = await fetchPlaceDetail(city, slug);

  if (!place) {
    notFound();
  }

  const jsonLd = generateLocalBusinessSchema({
    name: place.name,
    description: place.shortDescription,
    telephone: place.phone,
    priceRange: place.priceTier,
    address: {
      streetAddress: place.address,
      addressLocality: cityName,
      addressRegion: place.uf,
    },
    rating: {
      ratingValue: place.ratingAverage,
      reviewCount: place.ratingCount,
    },
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header Unificado idêntico ao da cidade */}
      <Header currentCitySlug={city} currentCityName={cityName} currentCityUf={place.uf} />

      <main className="min-h-screen pt-[120px] bg-[#FCF9F8]">
        <PlaceDetailView place={place} citySlug={city} cityName={cityName} />
      </main>

      {/* Footer Unificado idêntico ao da cidade */}
      <Footer currentCitySlug={city} />
      <MobileNav currentCitySlug={city} />
    </>
  );
}
