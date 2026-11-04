import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { constructMetadata } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Calendar, User, Clock, Share2, Bookmark, CheckCircle2 } from 'lucide-react';

interface ArticlePageProps {
  params: Promise<{
    city: string;
    slug: string;
  }>;
}

const MOCK_ARTICLES: Record<string, any> = {
  'guia-definitivo-aguas-quentes-o-que-fazer-em-caldas-novas': {
    title: 'Guia Definitivo das Águas Quentes: O que fazer em Caldas Novas',
    category: 'Roteiros de Viagem',
    author: 'Redação Editorial',
    publishedAt: '2025-11-02T10:00:00Z',
    dateLabel: '02 de Novembro de 2025',
    readTime: '6 min de leitura',
    excerpt:
      'Tudo o que você precisa saber para planejar a viagem perfeita: melhores parques termais, onde jantar à noite e atrações ecológicas secretas.',
    content: `Caldas Novas, no sul de Goiás, abriga o maior manancial hidrotermal do mundo, onde as águas brotam naturalmente do solo com temperaturas que variam entre 37°C e 58°C. Mas além dos famosos parques aquáticos, a cidade reúne um circuito gastronômico de excelência, turismo náutico no Lago de Corumbá e passeios ecológicos na Serra de Caldas.\n\n### 1. Parques Aquáticos e Relaxamento Termal\nO diRoma Acqua Park e o Hot Park (no vizinho município de Rio Quente) são paradas obrigatórias. Para quem viaja em família com crianças pequenas, os complexos oferecem segurança exemplar e piscinas aquecidas que garantem diversão mesmo nas noites amenas do cerrado.\n\n### 2. Gastronomia Tradicional & Alta Culinária\nA gastronomia de Caldas Novas surpreende pela variedade. O Restaurante Nonna Mia é um clássico que serve o tradicional galeto colonial com massas frescas à vontade. Não deixe de provar também os pratos com pequi, peixe na telha e doces de leite artesanais da região.\n\n### 3. Lago de Corumbá e Pôr do Sol\nPara fugir do agito dos parques centrais, o Lago de Corumbá oferece passeios de lancha, pesca esportiva e bares flutuantes com paisagens deslumbrantes.\n\n### Dica de Ouro\nReserve seus ingressos com antecedência em feriados prolongados para evitar filas nas bilheterias e aproveite ao máximo as noites no centro da cidade.`,
  },
  'top-5-restaurantes-tradicionais-caldas-novas': {
    title: 'Top 5 Restaurantes Tradicionais que Você Deve Conhecer em Caldas',
    category: 'Gastronomia',
    author: 'Crítica Gastronômica',
    publishedAt: '2025-10-28T14:00:00Z',
    dateLabel: '28 de Outubro de 2025',
    readTime: '4 min de leitura',
    excerpt:
      'De rodízios coloniais italianos à autêntica comida típica goiana com galinhada e pequi, explore os sabores consagrados.',
    content: `Uma viagem a Caldas Novas não estaria completa sem mergulhar na gastronomia goiana e nas tradições culinárias mantidas por famílias locais há décadas.\n\nConfira nossa seleção editorial com os 5 endereços obrigatórios para o seu paladar.`,
  },
};

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { city, slug } = await params;
  const cityName = city === 'caldas-novas' ? 'Caldas Novas' : city;
  const article = MOCK_ARTICLES[slug];

  if (!article) {
    return constructMetadata({
      title: 'Artigo não encontrado',
      noIndex: true,
    });
  }

  return constructMetadata({
    title: `${article.title} | Blog ${cityName}`,
    description: article.excerpt,
    cityName,
    canonical: `/${city}/blog/${slug}`,
  });
}

export const revalidate = 3600;

export default async function BlogPostDetailPage({ params }: ArticlePageProps) {
  const { city, slug } = await params;
  const cityName = city === 'caldas-novas' ? 'Caldas Novas' : city;
  const article = MOCK_ARTICLES[slug];

  if (!article) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    author: {
      '@type': 'Organization',
      name: 'Os Melhores da Cidade',
    },
    datePublished: article.publishedAt,
    publisher: {
      '@type': 'Organization',
      name: 'Os Melhores da Cidade',
      logo: {
        '@type': 'ImageObject',
        url: 'https://osmelhoresdacidade.com.br/logo-01.png',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header currentCitySlug={city} currentCityName={cityName} />

      <main className="flex-1 flex flex-col bg-[#FCF9F8] pb-16 sm:pb-0">
        <section className="w-full bg-white border-b border-[#E5E7EB] py-4 px-4 sm:px-6 lg:px-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Breadcrumbs
              items={[
                { label: cityName, href: `/${city}` },
                { label: 'Blog', href: `/${city}/blog` },
                { label: article.title },
              ]}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition"
                title="Compartilhar"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Article Body */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF3B4F] bg-[#FFF1F2] px-3 py-1 rounded-full">
              {article.category}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-[#171717] tracking-tight mt-3 mb-4 leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-[#777777] pb-6 border-b border-gray-200">
              <span className="font-semibold text-[#171717]">{article.author}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {article.dateLabel}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.readTime}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E7EB] shadow-card">
            <p className="text-base sm:text-lg font-medium text-[#171717] leading-relaxed mb-8 italic border-l-4 border-[#FF3B4F] pl-4">
              "{article.excerpt}"
            </p>

            <div className="prose prose-stone max-w-none text-sm sm:text-base text-[#171717] leading-relaxed whitespace-pre-line space-y-4">
              {article.content}
            </div>
          </div>
        </article>
      </main>

      <Footer currentCitySlug={city} />
      <MobileNav currentCitySlug={city} />
    </>
  );
}

