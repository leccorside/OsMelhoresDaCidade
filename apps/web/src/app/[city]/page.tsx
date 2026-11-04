import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { constructMetadata } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { OmniSearchBar } from '@/components/search/OmniSearchBar';
import { CategoryCard } from '@/components/cards/CategoryCard';
import { ListingCard } from '@/components/cards/ListingCard';
import { EventCard } from '@/components/cards/EventCard';
import { Sparkles, Calendar, Compass, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

interface CityPageProps {
  params: Promise<{
    city: string;
  }>;
}

const CITIES_DATA: Record<
  string,
  {
    name: string;
    uf: string;
    intro: string;
    description: string;
  }
> = {
  'caldas-novas': {
    name: 'Caldas Novas',
    uf: 'GO',
    intro: 'A maior estância hidrotermal do mundo com culinária vibrante, parques termais exclusivos e hotelaria de alto padrão.',
    description: 'Descubra os melhores restaurantes, bares, hotéis, parques termais e eventos em Caldas Novas, Goiás.',
  },
};

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city } = await params;
  const cityData = CITIES_DATA[city];

  if (!cityData) {
    return constructMetadata({
      title: 'Cidade não encontrada',
      noIndex: true,
    });
  }

  return constructMetadata({
    title: `Os Melhores de ${cityData.name} (${cityData.uf}) | Gastronomia, Lazer e Eventos`,
    description: cityData.description,
    cityName: cityData.name,
    canonical: `/${city}`,
  });
}

export const revalidate = 3600;

export default async function MunicipalHomePage({ params }: CityPageProps) {
  const { city } = await params;
  const cityData = CITIES_DATA[city];

  if (!cityData) {
    notFound();
  }

  // Exemplos reais de categorias
  const categories = [
    { name: 'Restaurantes', slug: 'restaurantes', count: 48 },
    { name: 'Bares & Pubs', slug: 'bares', count: 26 },
    { name: 'Hotéis & Pousadas', slug: 'hospedagem', count: 62 },
    { name: 'Parques & Lazer', slug: 'atracoes', count: 14 },
    { name: 'Shows & Festivais', slug: 'eventos', count: 9 },
    { name: 'Comércio & Serviços', slug: 'comercio', count: 85 },
  ];

  // Exemplos reais de estabelecimentos extraídos dos protótipos Stitch
  const featuredListings = [
    {
      id: '1',
      name: 'Restaurante Nonna Mia',
      slug: 'restaurante-nonna-mia',
      categoryName: 'Culinária Italiana & Colonial',
      neighborhood: 'Centro',
      priceTier: '$$$',
      ratingAverage: 4.9,
      ratingCount: 1240,
      isOpen: true,
      isFeatured: true,
    },
    {
      id: '2',
      name: 'diRoma Acqua Park',
      slug: 'diroma-acqua-park',
      categoryName: 'Parque Aquático Termal',
      neighborhood: 'Solar de Caldas',
      priceTier: '$$$$',
      ratingAverage: 4.8,
      ratingCount: 3500,
      isOpen: true,
      isFeatured: true,
    },
    {
      id: '3',
      name: 'Pousada Termal do Lago',
      slug: 'pousada-termal-do-lago',
      categoryName: 'Hospedagem & Charme',
      neighborhood: 'Lago Corumbá',
      priceTier: '$$$',
      ratingAverage: 4.9,
      ratingCount: 890,
      isOpen: true,
      isFeatured: true,
    },
  ];

  // Exemplo de evento dos protótipos Stitch
  const upcomingEvents = [
    {
      id: 'evt-1',
      name: 'Caldas Country Festival 2025',
      slug: 'caldas-country-festival-2025',
      categoryName: 'Festival Sertanejo',
      startDate: '2025-11-14T19:00:00Z',
      startTime: '20:00',
      address: 'Arena Caldas Music, Caldas Novas',
      isFree: false,
      priceInfo: 'A partir de R$ 180',
    },
    {
      id: 'evt-2',
      name: 'Festival Gastronômico das Águas Quentes',
      slug: 'festival-gastronomico-aguas-quentes',
      categoryName: 'Gastronomia & Cultura',
      startDate: '2025-12-05T18:00:00Z',
      startTime: '18:00',
      address: 'Praça Mestre Orlando, Centro',
      isFree: true,
      priceInfo: 'Entrada Gratuita',
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Os Melhores de ${cityData.name}`,
    description: cityData.description,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Brasil',
          item: 'https://osmelhoresdacidade.com.br',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: cityData.name,
          item: `https://osmelhoresdacidade.com.br/${city}`,
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header
        currentCitySlug={city}
        currentCityName={cityData.name}
        currentCityUf={cityData.uf}
      />

      <main className="flex-1 flex flex-col pb-16 sm:pb-0">
        {/* Hero Municipal */}
        <section className="relative py-16 lg:py-24 px-6 bg-gradient-to-r from-[#171717] via-[#241F1F] to-[#171717] text-white flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wider mb-5">
            <Compass className="w-3.5 h-3.5 text-[#FF3B4F]" />
            Guia Municipal Exclusivo
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
            Os Melhores de {cityData.name}
          </h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mb-10 leading-relaxed">
            {cityData.intro}
          </p>

          <OmniSearchBar
            citySlug={city}
            cityName={cityData.name}
            placeholder={`O que você quer fazer hoje em ${cityData.name}?`}
          />
        </section>

        {/* Categorias Principais */}
        <section className="py-14 px-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold text-[#FF3B4F] uppercase tracking-wider block mb-1">
                Explore por Setor
              </span>
              <h2 className="text-2xl font-bold text-[#171717]">Categorias em Alta</h2>
            </div>
            <Link
              href={`/${city}/lugares`}
              className="text-xs sm:text-sm font-semibold text-[#FF3B4F] hover:underline flex items-center gap-1"
            >
              Todas as categorias &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.slug}
                name={cat.name}
                slug={cat.slug}
                citySlug={city}
                count={cat.count}
              />
            ))}
          </div>
        </section>

        {/* Destaques da Cidade */}
        <section className="py-14 px-6 bg-[#F8F9FA] border-y border-[#E5E7EB] w-full">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF1F2] flex items-center justify-center">
                  <Flame className="w-5 h-5 text-[#FF3B4F]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#171717]">Destaques em {cityData.name}</h2>
                  <p className="text-xs text-[#777777]">Os estabelecimentos mais recomendados da cidade.</p>
                </div>
              </div>
              <Link
                href={`/${city}/lugares`}
                className="text-xs sm:text-sm font-semibold text-[#FF3B4F] hover:underline"
              >
                Ver todos os lugares &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  name={listing.name}
                  slug={listing.slug}
                  citySlug={city}
                  neighborhood={listing.neighborhood}
                  categoryName={listing.categoryName}
                  priceTier={listing.priceTier}
                  ratingAverage={listing.ratingAverage}
                  ratingCount={listing.ratingCount}
                  isOpen={listing.isOpen}
                  isFeatured={listing.isFeatured}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Agenda Cultural e Eventos */}
        <section className="py-16 px-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF1F2] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#FF3B4F]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#171717]">Agenda & Eventos</h2>
                <p className="text-xs text-[#777777]">Os principais shows, festivais e feiras na cidade.</p>
              </div>
            </div>
            <Link
              href={`/${city}/eventos`}
              className="text-xs sm:text-sm font-semibold text-[#FF3B4F] hover:underline"
            >
              Ver agenda completa &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingEvents.map((evt) => (
              <EventCard
                key={evt.id}
                id={evt.id}
                name={evt.name}
                slug={evt.slug}
                citySlug={city}
                categoryName={evt.categoryName}
                startDate={evt.startDate}
                startTime={evt.startTime}
                address={evt.address}
                isFree={evt.isFree}
                priceInfo={evt.priceInfo}
              />
            ))}
          </div>
        </section>

        {/* Banner Anuncie Seu Negócio */}
        <section className="py-12 px-6 bg-gradient-to-r from-[#FF3B4F] to-[#D91F35] text-white my-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                Área Comercial
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-2">
                É empresário ou comerciante em {cityData.name}?
              </h2>
              <p className="text-sm text-red-100 max-w-xl mt-1">
                Coloque sua empresa em evidência para milhares de moradores e turistas que consultam nosso guia todos os dias.
              </p>
            </div>
            <Link
              href="/anuncie"
              className="px-8 py-3.5 rounded-full bg-white text-[#171717] font-bold text-sm hover:bg-gray-100 transition shadow-modal shrink-0"
            >
              Anunciar meu negócio agora
            </Link>
          </div>
        </section>
      </main>

      <Footer currentCitySlug={city} />
      <MobileNav currentCitySlug={city} />
    </>
  );
}
