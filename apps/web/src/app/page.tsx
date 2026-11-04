import { constructMetadata } from '@/lib/seo';
import { CaldasNovasHomePage } from '@/components/home/CaldasNovasHomePage';

export const metadata = constructMetadata({
  title: 'Os Melhores de Caldas Novas (GO) | Guia Oficial de Gastronomia, Lazer e Termas',
  description: 'O guia definitivo da maior estância hidrotermal do mundo. Descubra os melhores lugares, parques aquáticos, restaurantes e eventos em Caldas Novas.',
  cityName: 'Caldas Novas',
  canonical: '/',
});

export const revalidate = 3600;

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Os Melhores da Cidade - Caldas Novas',
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
      <CaldasNovasHomePage />
    </>
  );
}
