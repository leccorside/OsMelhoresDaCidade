import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { constructMetadata } from '@/lib/seo';
import { Search, MapPin, Utensils, Beer, Building2, Calendar, Star, Compass } from 'lucide-react';

interface CityPageProps {
  params: Promise<{
    city: string;
  }>;
}

// Exemplos de cidades válidas para validação SSR
const CITIES_DATA: Record<
  string,
  {
    name: string;
    uf: string;
    intro: string;
    description: string;
    heroImage: string;
  }
> = {
  'caldas-novas': {
    name: 'Caldas Novas',
    uf: 'GO',
    intro: 'A maior estância hidrotermal do mundo com gastronomia vibrante, hotéis de lazer e atrações únicas.',
    description: 'Descubra restaurantes, bares, eventos, comércios, passeios e atrações em Caldas Novas, Goiás.',
    heroImage: '/logo-01.png',
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
    title: `Os Melhores de ${cityData.name} (${cityData.uf}) | Restaurantes, Eventos e Lazer`,
    description: cityData.description,
    cityName: cityData.name,
    canonical: `/${city}`,
  });
}

export const revalidate = 3600; // ISR: Revalidação a cada 1 hora

export default async function MunicipalHomePage({ params }: CityPageProps) {
  const { city } = await params;
  const cityData = CITIES_DATA[city];

  if (!cityData) {
    notFound();
  }

  // Schema.org Breadcrumbs e WebSite municipal
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
      <div className="flex-1 flex flex-col">
        {/* Header da Cidade */}
        <header className="w-full bg-white border-b border-[#E5E7EB] py-4 px-6 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo-01.png"
                  alt="Os Melhores da Cidade"
                  width={150}
                  height={40}
                  className="h-9 w-auto object-contain"
                />
              </Link>
              <div className="hidden md:flex items-center space-x-2 text-sm text-[#777777] bg-[#F5F5F5] px-3 py-1.5 rounded-full">
                <MapPin className="w-3.5 h-3.5 text-[#FF3B4F]" />
                <span className="font-semibold text-[#171717]">{cityData.name} - {cityData.uf}</span>
                <Link href="/" className="text-xs text-[#FF3B4F] hover:underline ml-1">
                  (Trocar)
                </Link>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-[#171717]">
              <Link href={`/${city}`} className="text-[#FF3B4F] font-semibold">
                Início
              </Link>
              <Link href={`/${city}/lugares`} className="hover:text-[#FF3B4F] transition">
                Lugares
              </Link>
              <Link href={`/${city}/eventos`} className="hover:text-[#FF3B4F] transition">
                Eventos
              </Link>
              <Link href={`/${city}/blog`} className="hover:text-[#FF3B4F] transition">
                Blog
              </Link>
              <Link href="/contato" className="hover:text-[#FF3B4F] transition">
                Contatos
              </Link>
            </nav>

            <div className="flex items-center space-x-3">
              <Link
                href="/anuncie"
                className="px-4 py-2 rounded-full bg-[#FF3B4F] text-white text-xs font-semibold hover:bg-[#D91F35] transition shadow-card"
              >
                Anuncie seu negócio
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#171717] to-[#2B2B2B] text-white py-16 px-6">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium uppercase tracking-wider mb-4">
              <Compass className="w-3.5 h-3.5 text-[#FF3B4F]" />
              Guia Completo da Cidade
            </span>
            <h1 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">
              Os Melhores de {cityData.name}
            </h1>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mb-8">
              {cityData.intro}
            </p>

            {/* Omni Search */}
            <div className="w-full max-w-3xl bg-white rounded-full p-2 shadow-floating flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-3 px-4 py-2 w-full sm:flex-1">
                <Search className="w-5 h-5 text-[#FF3B4F]" />
                <input
                  type="text"
                  placeholder="Restaurantes, hotéis, eventos, atrações..."
                  className="w-full text-sm text-[#171717] bg-transparent focus:outline-none placeholder:text-[#9CA3AF]"
                />
              </div>
              <button
                type="button"
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#FF3B4F] hover:bg-[#D91F35] text-white text-sm font-bold transition shadow-card flex items-center justify-center gap-2"
              >
                Buscar
              </button>
            </div>
          </div>
        </section>

        {/* Categories Bar */}
        <section className="bg-white border-b border-[#E5E7EB] py-4 px-6 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center gap-4 min-w-max">
            <Link
              href={`/${city}/lugares/restaurantes`}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E5E7EB] hover:border-[#171717] text-xs font-semibold text-[#171717] transition"
            >
              <Utensils className="w-4 h-4 text-[#FF3B4F]" />
              <span>Restaurantes</span>
            </Link>
            <Link
              href={`/${city}/lugares/bares`}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E5E7EB] hover:border-[#171717] text-xs font-semibold text-[#171717] transition"
            >
              <Beer className="w-4 h-4 text-[#FF3B4F]" />
              <span>Bares & Pubs</span>
            </Link>
            <Link
              href={`/${city}/lugares/hospedagem`}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E5E7EB] hover:border-[#171717] text-xs font-semibold text-[#171717] transition"
            >
              <Building2 className="w-4 h-4 text-[#FF3B4F]" />
              <span>Hotéis & Pousadas</span>
            </Link>
            <Link
              href={`/${city}/eventos`}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E5E7EB] hover:border-[#171717] text-xs font-semibold text-[#171717] transition"
            >
              <Calendar className="w-4 h-4 text-[#FF3B4F]" />
              <span>Eventos & Shows</span>
            </Link>
          </div>
        </section>

        {/* Content Section Placeholder */}
        <section className="max-w-7xl mx-auto py-12 px-6 w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#171717]">Destaques em {cityData.name}</h2>
              <p className="text-sm text-[#777777]">Os estabelecimentos mais bem avaliados e recomendados.</p>
            </div>
            <Link
              href={`/${city}/lugares`}
              className="text-sm font-semibold text-[#FF3B4F] hover:underline"
            >
              Ver todos os lugares &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-card">
              <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-full">
                ABERTO AGORA
              </span>
              <h3 className="text-lg font-bold text-[#171717] mt-3">Restaurante Nonna Mia</h3>
              <p className="text-sm text-[#777777] mt-1">Culinária Italiana e Tradicional Colonial</p>
              <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-[#F59E0B]">
                <Star className="w-4 h-4 fill-current" />
                <span>4.9 (1.240 avaliações)</span>
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-card">
              <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-full">
                ABERTO AGORA
              </span>
              <h3 className="text-lg font-bold text-[#171717] mt-3">diRoma Acqua Park</h3>
              <p className="text-sm text-[#777777] mt-1">Parque Aquático Termal e Entretenimento</p>
              <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-[#F59E0B]">
                <Star className="w-4 h-4 fill-current" />
                <span>4.8 (3.500 avaliações)</span>
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-card">
              <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-full">
                ABERTO AGORA
              </span>
              <h3 className="text-lg font-bold text-[#171717] mt-3">Pousada Termal do Lago</h3>
              <p className="text-sm text-[#777777] mt-1">Hospedagem Termal com Piscinas Privativas</p>
              <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-[#F59E0B]">
                <Star className="w-4 h-4 fill-current" />
                <span>4.9 (890 avaliações)</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

