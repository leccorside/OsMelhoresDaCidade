import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { constructMetadata } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Share2,
  Heart,
  ExternalLink,
  Sparkles,
  Info,
} from 'lucide-react';

interface EventDetailPageProps {
  params: Promise<{
    city: string;
    slug: string;
  }>;
}

const MOCK_EVENTS: Record<string, any> = {
  'caldas-country-festival-2025': {
    name: 'Caldas Country Festival 2025',
    category: 'Festival Sertanejo',
    startDate: '2025-11-14T19:00:00Z',
    dateLabel: '14 e 15 de Novembro de 2025',
    timeLabel: 'Abertura dos portões às 18:00',
    address: 'Arena Caldas Music - Av. Santo Amaro, Caldas Novas - GO',
    priceInfo: 'A partir de R$ 180,00',
    ticketUrl: 'https://caldascountryfestival.com.br',
    isFree: false,
    shortDescription: 'A 18ª edição do maior festival de música e cultura sertaneja do Brasil reúne os principais astros nacionais em Caldas Novas.',
    fullDescription:
      'Consagrado como o principal encontro da música sertaneja no Brasil, o Caldas Country Festival reúne mais de 50 mil pessoas em dois dias de pura celebração e energia.\n\nCom uma megaestrutura montada na Arena Caldas Music, o festival oferece camarotes open bar e open food, frontstage exclusivo, praça de alimentação completa e tirolesa sobre a pista.',
    lineup: [
      { day: 'Sexta-feira (14/11)', artists: ['Jorge & Mateus', 'Gusttavo Lima', 'Luan Santana', 'Ana Castela'] },
      { day: 'Sábado (15/11)', artists: ['Henrique & Juliano', 'Zé Neto & Cristiano', 'Dennis DJ', 'Alok'] },
    ],
  },
  'festival-gastronomico-aguas-quentes': {
    name: 'Festival Gastronômico das Águas Quentes',
    category: 'Gastronomia & Cultura',
    startDate: '2025-12-05T18:00:00Z',
    dateLabel: '05 a 07 de Dezembro de 2025',
    timeLabel: 'Das 18:00 às 23:30',
    address: 'Praça Mestre Orlando, Centro, Caldas Novas - GO',
    priceInfo: 'Entrada Gratuita',
    ticketUrl: '',
    isFree: true,
    shortDescription: 'Celebrando os sabores do cerrado goiano, alta gastronomia, cervejas artesanais e atrações culturais.',
    fullDescription:
      'O Festival Gastronômico reúne renomados chefs de cozinha de Goiás e do Brasil para criar pratos exclusivos valorizando ingredientes típicos como pequi, baru e frutos locais.\n\nCom stands gastronômicos acessíveis, workshops de culinária e shows acústicos gratuitos todas as noites.',
    lineup: [
      { day: 'Todos os dias', artists: ['Aulas-show com Chefs convidados', 'Feira de Produtores Locais', 'Shows de MPB e Chorinho'] },
    ],
  },
};

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { city, slug } = await params;
  const cityName = city === 'caldas-novas' ? 'Caldas Novas' : city;
  const evt = MOCK_EVENTS[slug];

  if (!evt) {
    return constructMetadata({
      title: 'Evento não encontrado',
      noIndex: true,
    });
  }

  return constructMetadata({
    title: `${evt.name} em ${cityName} | Ingressos e Programação`,
    description: `${evt.shortDescription} Confira data, local, atrações e como comprar ingressos em ${cityName}.`,
    cityName,
    canonical: `/${city}/eventos/${slug}`,
  });
}

export const revalidate = 3600;

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { city, slug } = await params;
  const cityName = city === 'caldas-novas' ? 'Caldas Novas' : city;
  const evt = MOCK_EVENTS[slug];

  if (!evt) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: evt.name,
    description: evt.shortDescription,
    startDate: evt.startDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'Arena Caldas Music',
      address: {
        '@type': 'PostalAddress',
        streetAddress: evt.address,
        addressLocality: cityName,
        addressRegion: 'GO',
        addressCountry: 'BR',
      },
    },
    offers: {
      '@type': 'Offer',
      price: evt.isFree ? '0' : '180.00',
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      url: evt.ticketUrl || `https://osmelhoresdacidade.com.br/${city}/eventos/${slug}`,
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
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Breadcrumbs
              items={[
                { label: cityName, href: `/${city}` },
                { label: 'Eventos', href: `/${city}/eventos` },
                { label: evt.name },
              ]}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition flex items-center gap-1.5 text-xs font-semibold"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Compartilhar</span>
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition flex items-center gap-1.5 text-xs font-semibold"
              >
                <Heart className="w-4 h-4 text-[#FF3B4F]" />
                <span className="hidden sm:inline">Salvar Evento</span>
              </button>
            </div>
          </div>
        </section>

        {/* Hero do Evento */}
        <section className="w-full bg-white border-b border-[#E5E7EB] py-8 px-4 sm:px-6 lg:px-10">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={evt.isFree ? 'open' : 'price'}>
                  {evt.isFree ? 'Gratuito' : evt.priceInfo}
                </Badge>
                <Badge variant="category">{evt.category}</Badge>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-[#171717] tracking-tight mb-4">
                {evt.name}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#171717] mb-6">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#FF3B4F]" />
                  <span className="font-semibold">{evt.dateLabel}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#FF3B4F]" />
                  <span>{evt.timeLabel}</span>
                </div>
                <div className="flex items-center gap-2.5 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-[#FF3B4F] shrink-0" />
                  <span>{evt.address}</span>
                </div>
              </div>

              <p className="text-sm sm:text-base text-[#777777] leading-relaxed max-w-3xl">
                {evt.shortDescription}
              </p>
            </div>

            {/* Ingressos Box */}
            <div className="w-full lg:w-auto bg-[#171717] text-white rounded-3xl p-6 flex flex-col gap-4 sm:w-80 shrink-0 shadow-modal">
              <div>
                <span className="text-xs uppercase tracking-wider text-gray-400 font-bold block">
                  Ingressos & Acesso
                </span>
                <span className="text-2xl font-black text-white mt-1 block">
                  {evt.isFree ? 'Entrada Livre' : evt.priceInfo}
                </span>
              </div>

              {evt.ticketUrl ? (
                <a
                  href={evt.ticketUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 rounded-full bg-[#FF3B4F] hover:bg-[#D91F35] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-card transition"
                >
                  <Ticket className="w-4 h-4" />
                  Comprar Ingressos Oficiais
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <div className="p-3 rounded-xl bg-white/10 text-xs text-gray-300">
                  Evento gratuito aberto à comunidade e turistas.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Informações detalhadas */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card">
              <h2 className="text-xl font-bold text-[#171717] mb-4">Sobre o Evento</h2>
              <p className="text-sm text-[#777777] leading-relaxed whitespace-pre-line">
                {evt.fullDescription}
              </p>
            </div>

            {/* Lineup / Atrações */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card">
              <h2 className="text-xl font-bold text-[#171717] mb-6">Programação & Atrações</h2>
              <div className="space-y-6">
                {evt.lineup.map((item: any, idx: number) => (
                  <div key={idx} className="border-b border-gray-100 pb-5 last:border-b-0 last:pb-0">
                    <span className="font-bold text-sm text-[#FF3B4F] uppercase tracking-wide block mb-2">
                      {item.day}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {item.artists.map((artist: string, aIdx: number) => (
                        <span
                          key={aIdx}
                          className="px-3.5 py-1.5 rounded-full bg-[#F5F5F5] text-xs font-semibold text-[#171717]"
                        >
                          {artist}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer currentCitySlug={city} />
      <MobileNav currentCitySlug={city} />
    </>
  );
}

