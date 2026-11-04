import { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ListingCard } from '@/components/cards/ListingCard';
import { fetchListings } from '@/services/listings';
import {
  Search,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  MapPin,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

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
    description: `Encontre restaurantes, bares, hotéis, parques termais e atrações em ${cityName}. Avaliações verificadas e contatos diretos.`,
    cityName,
    canonical: `/${city}/lugares`,
  });
}

export default async function LugaresPage({ params, searchParams }: LugaresPageProps) {
  const { city } = await params;
  const search = await searchParams;

  const cityName = city === 'caldas-novas' ? 'Caldas Novas' : city;
  const cityUf = city === 'caldas-novas' ? 'GO' : 'BR';

  const listingsData = await fetchListings({
    citySlug: city,
    categorySlug: search.categoria,
    neighborhoodSlug: search.bairro,
    search: search.q,
    priceTier: search.preco,
    sortBy: search.ordem,
  });

  const categories = [
    { label: 'Todos', slug: '' },
    { label: 'Restaurantes', slug: 'restaurantes' },
    { label: 'Bares & Pubs', slug: 'bares' },
    { label: 'Hotéis & Pousadas', slug: 'hospedagem' },
    { label: 'Parques & Lazer', slug: 'atracoes' },
    { label: 'Comércio & Serviços', slug: 'comercio' },
  ];

  return (
    <>
      <Header currentCitySlug={city} currentCityName={cityName} currentCityUf={cityUf} />

      <main className="flex-1 flex flex-col bg-[#FCF9F8] pb-16 sm:pb-0">
        {/* Sub-Header / Breadcrumb & Hero Meta */}
        <section className="w-full bg-white border-b border-[#E5E7EB] py-5 px-4 sm:px-6 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <Breadcrumbs
              items={[
                { label: cityName, href: `/${city}` },
                { label: 'Todos os Lugares' },
              ]}
              className="mb-3"
            />
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF1F2] text-[#FF3B4F] text-xs font-bold tracking-wide uppercase mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF3B4F] animate-pulse" />
                  Guia Comercial & Turístico
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-[#171717] tracking-tight">
                  Lugares e Estabelecimentos em {cityName}
                </h1>
                <p className="text-xs sm:text-sm text-[#777777] max-w-3xl mt-1">
                  Explore restaurantes, parques aquáticos termais, resorts, cervejarias e comércios selecionados.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F5F5] text-xs font-semibold text-[#171717]">
                  <CheckCircle2 className="w-4 h-4 text-[#FF3B4F]" />
                  <span>Verificados</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F5F5] text-xs font-semibold text-[#171717]">
                  <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                  <span>Polo Oficial</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Filter Bar & View Controls */}
        <section className="w-full bg-white border-b border-[#E5E7EB] py-3.5 px-4 sm:px-6 lg:px-10 sticky top-[69px] z-30 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Quick Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {categories.map((cat) => {
                const isSelected = (!search.categoria && !cat.slug) || search.categoria === cat.slug;
                return (
                  <Link
                    key={cat.slug}
                    href={cat.slug ? `/${city}/lugares?categoria=${cat.slug}` : `/${city}/lugares`}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#171717] text-white shadow-sm'
                        : 'bg-[#F5F5F5] text-[#171717] hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </Link>
                );
              })}
            </div>

            {/* Results count & Sort */}
            <div className="flex items-center justify-between w-full md:w-auto gap-4 shrink-0">
              <span className="text-xs text-[#777777]">
                <strong className="text-[#171717] font-bold">{listingsData.total}</strong> locais encontrados
              </span>

              <div className="flex items-center gap-2">
                <select
                  defaultValue={search.ordem || 'melhores'}
                  className="px-3 py-1.5 rounded-xl bg-[#F5F5F5] text-xs font-semibold text-[#171717] border border-[#E5E7EB] focus:outline-none focus:ring-1 focus:ring-[#FF3B4F]"
                >
                  <option value="melhores">Mais bem avaliados</option>
                  <option value="populares">Mais populares</option>
                  <option value="menor_preco">Menor preço</option>
                  <option value="recentes">Mais recentes</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Main Split Layout: Sidebar Filters + Cards Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar de Filtros */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-card sticky top-36 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#FF3B4F]" />
                  <h3 className="text-sm font-bold text-[#171717]">Filtros Refinados</h3>
                </div>
                <Link href={`/${city}/lugares`} className="text-xs text-[#FF3B4F] hover:underline">
                  Limpar
                </Link>
              </div>

              {/* Status Toggles */}
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer text-xs font-medium text-[#171717]">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    Aberto Agora
                  </span>
                  <input type="checkbox" defaultChecked className="accent-[#FF3B4F] rounded" />
                </label>
                <label className="flex items-center justify-between cursor-pointer text-xs font-medium text-[#171717]">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                    Destaques da Redação
                  </span>
                  <input type="checkbox" defaultChecked className="accent-[#FF3B4F] rounded" />
                </label>
              </div>

              {/* Faixa de Preço */}
              <div className="border-t border-gray-100 pt-4">
                <span className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-2.5">
                  Faixa de Preço
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {['$', '$$', '$$$', '$$$$'].map((tier) => (
                    <Link
                      key={tier}
                      href={`/${city}/lugares?preco=${tier}`}
                      className={`text-center py-2 text-xs font-bold rounded-xl border transition ${
                        search.preco === tier
                          ? 'bg-[#171717] text-white border-[#171717]'
                          : 'bg-white text-[#171717] border-gray-200 hover:border-black'
                      }`}
                    >
                      {tier}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Bairros Populares */}
              <div className="border-t border-gray-100 pt-4">
                <span className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-2.5">
                  Bairros
                </span>
                <div className="space-y-2 text-xs">
                  {['Centro', 'Solar de Caldas', 'Privé das Caldas', 'Lago Corumbá', 'Itanhangá'].map(
                    (b) => (
                      <Link
                        key={b}
                        href={`/${city}/lugares?bairro=${b.toLowerCase()}`}
                        className="block text-[#777777] hover:text-[#FF3B4F] transition"
                      >
                        {b}
                      </Link>
                    ),
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Cards Grid */}
          <div className="lg:col-span-9">
            {listingsData.items.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#E5E7EB]">
                <h3 className="text-xl font-bold text-[#171717] mb-2">Nenhum estabelecimento encontrado</h3>
                <p className="text-xs sm:text-sm text-[#777777] max-w-md mx-auto mb-6">
                  Tente ajustar ou limpar os filtros de busca para visualizar mais estabelecimentos em {cityName}.
                </p>
                <Link
                  href={`/${city}/lugares`}
                  className="px-6 py-2.5 rounded-full bg-[#FF3B4F] text-white text-xs font-bold hover:bg-[#D91F35] transition"
                >
                  Ver todos os locais
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
          </div>
        </div>
      </main>

      <Footer currentCitySlug={city} />
      <MobileNav currentCitySlug={city} />
    </>
  );
}

