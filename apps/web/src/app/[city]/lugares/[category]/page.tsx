import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { constructMetadata } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ListingCard } from '@/components/cards/ListingCard';
import { fetchListings } from '@/services/listings';

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
    description: `Descubra as melhores opções de ${categoryTitle.toLowerCase()} em ${cityName}. Avaliações autênticas, horários, fotos e contatos.`,
    cityName,
    categoryName: categoryTitle,
    canonical: `/${city}/lugares/${category}`,
  });
}

export const revalidate = 3600;

export default async function CategoryListingPage({ params }: CategoryPageProps) {
  const { city, category } = await params;
  const cityName = city === 'caldas-novas' ? 'Caldas Novas' : city;
  const categoryTitle = CATEGORY_NAMES[category] || category;

  const listingsData = await fetchListings({
    citySlug: city,
    categorySlug: category,
  });

  return (
    <>
      <Header currentCitySlug={city} currentCityName={cityName} />

      <main className="flex-1 flex flex-col bg-[#FCF9F8] pb-16 sm:pb-0">
        <section className="w-full bg-white border-b border-[#E5E7EB] py-6 px-4 sm:px-6 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <Breadcrumbs
              items={[
                { label: cityName, href: `/${city}` },
                { label: 'Lugares', href: `/${city}/lugares` },
                { label: categoryTitle },
              ]}
              className="mb-3"
            />
            <h1 className="text-2xl sm:text-4xl font-black text-[#171717] tracking-tight">
              {categoryTitle} em {cityName}
            </h1>
            <p className="text-xs sm:text-sm text-[#777777] max-w-2xl mt-1">
              Guia oficial com os melhores e mais bem avaliados estabelecimentos de {cityName}.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 w-full">
          {listingsData.items.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E5E7EB]">
              <h3 className="text-lg font-bold text-[#171717] mb-2">Nenhum local cadastrado nesta categoria</h3>
              <p className="text-xs text-[#777777] mb-6">Em breve novos estabelecimentos credenciados.</p>
              <Link
                href={`/${city}/lugares`}
                className="px-6 py-2.5 rounded-full bg-[#FF3B4F] text-white text-xs font-bold"
              >
                Ver todos os lugares
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listingsData.items.map((item) => (
                <ListingCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  slug={item.slug}
                  citySlug={city}
                  neighborhood={item.neighborhood?.name}
                  categoryName={item.category.name}
                  priceTier={item.priceTier}
                  ratingAverage={item.ratingAverage}
                  ratingCount={item.ratingCount}
                  isFeatured={item.isFeatured}
                  coverUrl={item.images?.[0]?.url}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer currentCitySlug={city} />
      <MobileNav currentCitySlug={city} />
    </>
  );
}

