import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { constructMetadata } from '@/lib/seo';
import { CaldasNovasHomePage } from '@/components/home/CaldasNovasHomePage';

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
    title: `Os Melhores de ${cityData.name} (${cityData.uf}) | Guia Oficial de Gastronomia, Lazer e Termas`,
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
      <CaldasNovasHomePage />
    </>
  );
}
