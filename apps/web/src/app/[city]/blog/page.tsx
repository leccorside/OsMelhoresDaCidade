import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { constructMetadata } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Calendar, User, ArrowRight, Sparkles } from 'lucide-react';

interface BlogPageProps {
  params: Promise<{
    city: string;
  }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { city } = await params;
  const cityName = city === 'caldas-novas' ? 'Caldas Novas' : city;

  return constructMetadata({
    title: `Blog & Roteiros de Viagem em ${cityName} | Dicas Exclusivas`,
    description: `Descubra o que fazer em ${cityName}. Roteiros completos, melhores restaurantes, dicas de águas termais e história local.`,
    cityName,
    canonical: `/${city}/blog`,
  });
}

export default async function BlogIndexPage({ params }: BlogPageProps) {
  const { city } = await params;
  const cityName = city === 'caldas-novas' ? 'Caldas Novas' : city;

  const posts = [
    {
      id: '1',
      title: 'Guia Definitivo das Águas Quentes: O que fazer em Caldas Novas',
      slug: 'guia-definitivo-aguas-quentes-o-que-fazer-em-caldas-novas',
      excerpt:
        'Tudo o que você precisa saber para planejar a viagem perfeita: melhores parques termais, onde jantar à noite e atrações ecológicas secretas.',
      author: 'Equipe Editorial',
      date: '02 de Novembro de 2025',
      category: 'Roteiros de Viagem',
      coverUrl: '/logo-01.png',
    },
    {
      id: '2',
      title: 'Top 5 Restaurantes Tradicionais que Você Deve Conhecer em Caldas',
      slug: 'top-5-restaurantes-tradicionais-caldas-novas',
      excerpt:
        'De rodízios coloniais italianos à autêntica comida típica goiana com galinhada e pequi, explore os sabores consagrados.',
      author: 'Crítica Gastronômica',
      date: '28 de Outubro de 2025',
      category: 'Gastronomia',
      coverUrl: '/logo-01.png',
    },
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
                { label: 'Blog & Roteiros' },
              ]}
              className="mb-3"
            />
            <h1 className="text-2xl sm:text-4xl font-black text-[#171717] tracking-tight">
              Blog & Roteiros de {cityName}
            </h1>
            <p className="text-xs sm:text-sm text-[#777777] max-w-2xl mt-1">
              Dicas de moradores, matérias especiais de viagem e seleção gastronômica.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group bg-white rounded-3xl overflow-hidden border border-[#E5E7EB] hover:shadow-hover transition duration-300 flex flex-col"
              >
                <div className="h-52 bg-gradient-to-r from-red-900 to-stone-900 relative flex items-end p-6">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-[#FF3B4F] text-white px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-[#777777] mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {post.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {post.author}
                      </span>
                    </div>

                    <Link href={`/${city}/blog/${post.slug}`} className="block group-hover:text-[#FF3B4F] transition">
                      <h2 className="text-xl font-bold text-[#171717] tracking-tight mb-2">
                        {post.title}
                      </h2>
                    </Link>

                    <p className="text-xs sm:text-sm text-[#777777] leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 mt-6 border-t border-gray-100 flex items-center justify-end">
                    <Link
                      href={`/${city}/blog/${post.slug}`}
                      className="text-xs font-bold text-[#FF3B4F] hover:underline flex items-center gap-1"
                    >
                      Ler matéria completa &rarr;
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer currentCitySlug={city} />
      <MobileNav currentCitySlug={city} />
    </>
  );
}

