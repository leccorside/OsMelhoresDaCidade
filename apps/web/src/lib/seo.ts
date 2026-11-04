import type { Metadata } from 'next';

export const SITE_NAME = 'Os Melhores da Cidade';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://osmelhoresdacidade.com.br';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo-01.png`;

interface MetadataProps {
  title?: string;
  description?: string;
  cityName?: string;
  categoryName?: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export function constructMetadata({
  title,
  description = 'Descubra os melhores restaurantes, bares, hospedagens, eventos e comércios da sua cidade.',
  cityName,
  categoryName,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
}: MetadataProps = {}): Metadata {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : cityName
    ? `Os Melhores de ${cityName} | Guia Comercial, Gastronomia e Eventos`
    : `${SITE_NAME} | O Seu Guia Completo de Cidades no Brasil`;

  const finalCanonical = canonical ? `${SITE_URL}${canonical}` : SITE_URL;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: finalCanonical,
      languages: {
        'pt-BR': finalCanonical,
        'en-US': `${SITE_URL}/en${canonical || ''}`,
        'es-ES': `${SITE_URL}/es${canonical || ''}`,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: finalCanonical,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: 'pt_BR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: '/icon.png',
      apple: '/icon.png',
    },
  };
}

export function generateLocalBusinessSchema(business: {
  name: string;
  description?: string;
  image?: string;
  telephone?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  url?: string;
  priceRange?: string;
  rating?: {
    ratingValue: number;
    reviewCount: number;
  };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description,
    image: business.image || DEFAULT_OG_IMAGE,
    telephone: business.telephone,
    url: business.url,
    priceRange: business.priceRange || '$$',
    ...(business.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: business.address.streetAddress,
        addressLocality: business.address.addressLocality,
        addressRegion: business.address.addressRegion,
        postalCode: business.address.postalCode,
        addressCountry: business.address.addressCountry || 'BR',
      },
    }),
    ...(business.geo && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: business.geo.latitude,
        longitude: business.geo.longitude,
      },
    }),
    ...(business.rating && business.rating.reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: business.rating.ratingValue,
        reviewCount: business.rating.reviewCount,
      },
    }),
  };
}
