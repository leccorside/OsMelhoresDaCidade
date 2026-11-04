import { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CategoryCard } from '@/components/cards/CategoryCard';

interface CategoriasPageProps {
  params: Promise<{
    city: string;
  }>;
}

export async function generateMetadata({ params }: CategoriasPageProps): Promise<Metadata> {
  const { city } = await params;
  const cityName = city === 'caldas-novas' ? 'Caldas Novas' : city;

  return constructMetadata({
    title: `Categorias e Setores Comerciais em ${cityName} | Guia Oficial`,
    description: `Navegue pelas principais categorias comerciais, gastronômicas e turísticas em ${cityName}.`,
    cityName,
    canonical: `/${city}/categorias`,
  });
}

export default async function CategoriasPage({ params }: CategoriasPageProps) {
  const { city } = await params;
  const cityName = city === 'caldas-novas' ? 'Caldas Novas' : city;

  const categories = [
    { name: 'Restaurantes', slug: 'restaurantes', count: 48 },
    { name: 'Bares & Chopperias', slug: 'bares', count: 26 },
    { name: 'Hotéis & Pousadas', slug: 'hospedagem', count: 62 },
    { name: 'Parques Aquáticos & Lazer', slug: 'atracoes', count: 14 },
    { name: 'Shows & Festivais', slug: 'eventos', count: 9 },
    { name: 'Comércio & Lojas', slug: 'comercio', count: 85 },
  ];

  return (
    <>
      <Header currentCitySlug={city} currentCityName={cityName} />

      <main className="flex-1 flex flex-col bg-[#FCF9F8] pb-16 sm:pb-0">
        <section className="w-full bg-white border-b border-[#E5E7EB] py-6 px-4 sm:px-6 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <Breadcrumbs
              items={[
                { label: cityName, href: `/${city}` },
                { label: 'Categorias Gerais' },
              ]}
              className="mb-3"
            />
            <h1 className="text-2xl sm:text-4xl font-black text-[#171717] tracking-tight">
              Categorias Comerciais em {cityName}
            </h1>
            <p className="text-xs sm:text-sm text-[#777777] max-w-2xl mt-1">
              Encontre estabelecimentos e serviços organizados por segmentos.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
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
      </main>

      <Footer currentCitySlug={city} />
      <MobileNav currentCitySlug={city} />
    </>
  );
}

