import { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { EventCard } from '@/components/cards/EventCard';
import { fetchEvents } from '@/services/events';
import { Calendar, Ticket, Sparkles, Filter, Search } from 'lucide-react';

interface EventosPageProps {
  params: Promise<{
    city: string;
  }>;
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    gratis?: string;
  }>;
}

export async function generateMetadata({ params }: EventosPageProps): Promise<Metadata> {
  const { city } = await params;
  const cityName = city === 'caldas-novas' ? 'Caldas Novas' : city;

  return constructMetadata({
    title: `Agenda Cultural e Eventos em ${cityName} | Guia Completo`,
    description: `Confira os shows, festivais sertanejos, feiras e eventos imperdíveis em ${cityName}. Programação completa e ingressos.`,
    cityName,
    canonical: `/${city}/eventos`,
  });
}

export default async function EventosAgendaPage({ params, searchParams }: EventosPageProps) {
  const { city } = await params;
  const search = await searchParams;

  const cityName = city === 'caldas-novas' ? 'Caldas Novas' : city;
  const cityUf = city === 'caldas-novas' ? 'GO' : 'BR';

  const eventsData = await fetchEvents({
    citySlug: city,
    categorySlug: search.categoria,
    search: search.q,
    isFree: search.gratis === 'true',
  });

  return (
    <>
      <Header currentCitySlug={city} currentCityName={cityName} currentCityUf={cityUf} />

      <main className="flex-1 flex flex-col bg-[#FCF9F8] pb-16 sm:pb-0">
        {/* Sub-Header */}
        <section className="w-full bg-white border-b border-[#E5E7EB] py-6 px-4 sm:px-6 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <Breadcrumbs
              items={[
                { label: cityName, href: `/${city}` },
                { label: 'Agenda Cultural e Eventos' },
              ]}
              className="mb-3"
            />
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF1F2] text-[#FF3B4F] text-xs font-bold tracking-wide uppercase mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Agenda Oficial
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-[#171717] tracking-tight">
                  Shows e Eventos em {cityName}
                </h1>
                <p className="text-xs sm:text-sm text-[#777777] max-w-2xl mt-1">
                  Festivais de música, grandes apresentações, feiras gastronômicas e programação cultural.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/${city}/eventos?gratis=true`}
                  className="px-4 py-2 rounded-full border border-gray-200 text-xs font-bold text-[#171717] hover:bg-gray-50 transition"
                >
                  Eventos Gratuitos
                </Link>
                <Link
                  href="/anuncie?tipo=evento"
                  className="px-4 py-2 rounded-full bg-[#171717] text-white text-xs font-bold hover:bg-black transition shadow-card"
                >
                  Divulgar um Evento
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 w-full">
          {eventsData.items.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E5E7EB]">
              <h3 className="text-lg font-bold text-[#171717] mb-2">Nenhum evento encontrado</h3>
              <p className="text-xs text-[#777777] mb-6">Fique atento para as próximas datas divulgadas.</p>
              <Link
                href={`/${city}/eventos`}
                className="px-6 py-2.5 rounded-full bg-[#FF3B4F] text-white text-xs font-bold"
              >
                Ver todos os eventos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventsData.items.map((evt) => (
                <EventCard
                  key={evt.id}
                  id={evt.id}
                  name={evt.name}
                  slug={evt.slug}
                  citySlug={city}
                  categoryName={evt.category.name}
                  startDate={evt.startDate}
                  startTime={evt.startTime}
                  address={evt.address}
                  isFree={evt.isFree}
                  priceInfo={evt.priceInfo}
                  coverUrl={evt.images?.[0]?.url}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer currentCitySlug={city} />
      <MobileNav currentCitySlug={city} />
    </>
  );
}

