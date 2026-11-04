import { constructMetadata } from '@/lib/seo';
import { NationalHomePage } from '@/components/home/NationalHomePage';

export const metadata = constructMetadata({
  title: 'Os Melhores da Cidade | O Guia Definitivo dos Municípios Brasileiros',
  description: 'Descubra os melhores lugares da sua cidade. Encontre restaurantes premiados, bares autênticos, eventos imperdíveis e comércios locais avaliados por moradores reais.',
  canonical: '/',
});

export const revalidate = 3600;

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Os Melhores da Cidade',
    url: 'https://osmelhoresdacidade.com.br',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://osmelhoresdacidade.com.br/caldas-novas/lugares?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NationalHomePage />
    </>
  );
}
