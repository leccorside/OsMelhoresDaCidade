import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Os Melhores da Cidade',
    short_name: 'Melhores da Cidade',
    description: 'Guia oficial e diretório das melhores cidades do Brasil',
    start_url: '/',
    display: 'standalone',
    background_color: '#FCF9F8',
    theme_color: '#FF3B4F',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

