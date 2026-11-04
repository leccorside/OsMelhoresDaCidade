import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { constructMetadata, generateLocalBusinessSchema } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';
import {
  MapPin,
  Phone,
  MessageCircle,
  Globe,
  Clock,
  Check,
  Star,
  Share2,
  Heart,
  Navigation,
  Sparkles,
} from 'lucide-react';

interface LugarPageProps {
  params: Promise<{
    city: string;
    slug: string;
  }>;
}

// Exemplos dos protótipos Stitch
const MOCK_ESTABLISHMENTS: Record<string, any> = {
  'restaurante-nonna-mia': {
    name: 'Restaurante Nonna Mia',
    category: 'Restaurantes & Gastronomia',
    categorySlug: 'restaurantes',
    neighborhood: 'Centro',
    address: 'Av. Orcalino Santos, 95 - Centro, Caldas Novas - GO',
    phone: '(64) 3453-1234',
    whatsapp: '5564999991234',
    priceTier: '$$$',
    ratingAverage: 4.9,
    ratingCount: 1240,
    isOpen: true,
    isFeatured: true,
    shortDescription: 'Tradicional rodízio de galeto colonial, massas frescas e sopa de capeletti.',
    fullDescription:
      'Com mais de 30 anos de história em Caldas Novas, o Restaurante Nonna Mia traz o autêntico sabor das colônias italianas para o Centro-Oeste. Servido em sistema de rodízio contínuo à mesa, inclui polenta brustolada, sopa de capeletti de entrada, massas artesanais recheadas e o famoso galeto al primo canto com tempero secreto.',
    amenities: [
      'Estacionamento próprio',
      'Ar-condicionado central',
      'Wi-Fi gratuito',
      'Acessibilidade para cadeirantes',
      'Espaço kids monitorado',
      'Carta de vinhos selecionados',
    ],
    hours: [
      { days: 'Segunda a Sexta', hours: '11:30 às 15:30 • 19:00 às 23:30' },
      { days: 'Sábado e Domingo', hours: '11:30 às 16:30 • 19:00 às 23:30' },
    ],
    menu: [
      { name: 'Rodízio Colonial Completo', desc: 'Galeto al primo canto, 6 tipos de massas, polenta frita e salada radicci.', price: 'R$ 89,90' },
      { name: 'Sopa de Capeletti da Nonna', desc: 'Caldo caseiro cozido lentamente com capeletti artesanal de carne.', price: 'Incluso no rodízio' },
      { name: 'Tortei de Abóbora com Molho de Nozes', desc: 'Massa artesanal recheada com abóbora cabotiá e molho cremoso.', price: 'Incluso no rodízio' },
    ],
  },
  'diroma-acqua-park': {
    name: 'diRoma Acqua Park',
    category: 'Parques Aquáticos & Lazer',
    categorySlug: 'atracoes',
    neighborhood: 'Solar de Caldas',
    address: 'Rua São Cristóvão, 805 - Solar de Caldas, Caldas Novas - GO',
    phone: '(64) 3455-9000',
    whatsapp: '5564999999000',
    priceTier: '$$$$',
    ratingAverage: 4.8,
    ratingCount: 3500,
    isOpen: true,
    isFeatured: true,
    shortDescription: 'O maior parque aquático hidrotermal urbano com toboáguas radicais e piscina de ondas.',
    fullDescription:
      'O diRoma Acqua Park é referência nacional em diversão termal. Conta com o Vulcão com toboáguas em tubo, piscina de ondas gigantesca, navio pirata infantil, corredeiras e áreas de descanso com águas naturalmente aquecidas entre 37°C e 42°C.',
    amenities: [
      'Piscinas de águas termais naturais',
      'Piscina de ondas',
      'Toboáguas radicais',
      'Restaurantes e lanchonetes',
      'Armários para locação',
      'Posto médico no local',
    ],
    hours: [
      { days: 'Quinta a Terça', hours: '08:00 às 18:00 (Fechado às quartas para manutenção)' },
    ],
    menu: [
      { name: 'Passaporte Adulto Diário', desc: 'Acesso completo a todas as atrações e piscinas termais.', price: 'R$ 130,00' },
      { name: 'Passaporte Infantil (7 a 11 anos)', desc: 'Acesso às atrações acompanhado de responsável.', price: 'R$ 85,00' },
    ],
  },
  'pousada-termal-do-lago': {
    name: 'Pousada Termal do Lago',
    category: 'Hotéis & Pousadas',
    categorySlug: 'hospedagem',
    neighborhood: 'Lago Corumbá',
    address: 'Estrada do Lago, Km 4 - Lago Corumbá, Caldas Novas - GO',
    phone: '(64) 3454-5678',
    whatsapp: '5564999995678',
    priceTier: '$$$',
    ratingAverage: 4.9,
    ratingCount: 890,
    isOpen: true,
    isFeatured: true,
    shortDescription: 'Charme, requinte e piscinas termais privativas às margens do Lago de Corumbá.',
    fullDescription:
      'Exclusiva pousada boutique desenhada para quem busca descanso absoluto e imersão na natureza. Com decks panorâmicos sobre o lago, gastronomia contemporânea e suítes com banheiras de imersão abastecidas com água termal.',
    amenities: [
      'Piscinas termais 24h',
      'Vista panorâmica para o lago',
      'Café da manhã colonial incluso',
      'Estacionamento privativo',
      'Passeios de lancha privativos',
      'Pet friendly',
    ],
    hours: [
      { days: 'Recepção', hours: 'Atendimento 24 Horas' },
    ],
    menu: [
      { name: 'Diária Suíte Master Termal', desc: 'Com hidromassagem privativa e varanda com vista lago.', price: 'Consulte' },
      { name: 'Diária Chalé Familiar', desc: 'Acomoda até 4 adultos com total conforto e privacidade.', price: 'Consulte' },
    ],
  },
};

export async function generateMetadata({ params }: LugarPageProps): Promise<Metadata> {
  const { city, slug } = await params;
  const cityName = city === 'caldas-novas' ? 'Caldas Novas' : city;
  const item = MOCK_ESTABLISHMENTS[slug];

  if (!item) {
    return constructMetadata({
      title: 'Estabelecimento não encontrado',
      noIndex: true,
    });
  }

  return constructMetadata({
    title: `${item.name} em ${cityName} | Avaliações, Horários e Contato`,
    description: `${item.shortDescription} Conheça horários, endereço, cardápio e avaliações de ${item.name} em ${cityName}.`,
    cityName,
    canonical: `/${city}/lugar/${slug}`,
  });
}

export const revalidate = 3600;

export default async function ListingDetailPage({ params }: LugarPageProps) {
  const { city, slug } = await params;
  const cityName = city === 'caldas-novas' ? 'Caldas Novas' : city;
  const item = MOCK_ESTABLISHMENTS[slug];

  if (!item) {
    notFound();
  }

  const jsonLd = generateLocalBusinessSchema({
    name: item.name,
    description: item.shortDescription,
    telephone: item.phone,
    priceRange: item.priceTier,
    address: {
      streetAddress: item.address,
      addressLocality: cityName,
      addressRegion: 'GO',
    },
    rating: {
      ratingValue: item.ratingAverage,
      reviewCount: item.ratingCount,
    },
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header currentCitySlug={city} currentCityName={cityName} />

      <main className="flex-1 flex flex-col bg-[#FCF9F8] pb-16 sm:pb-0">
        {/* Breadcrumb Header */}
        <section className="w-full bg-white border-b border-[#E5E7EB] py-4 px-4 sm:px-6 lg:px-10">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Breadcrumbs
              items={[
                { label: cityName, href: `/${city}` },
                { label: item.category, href: `/${city}/lugares/${item.categorySlug}` },
                { label: item.name },
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
                <span className="hidden sm:inline">Salvar</span>
              </button>
            </div>
          </div>
        </section>

        {/* Hero do Estabelecimento */}
        <section className="w-full bg-white border-b border-[#E5E7EB] py-8 px-4 sm:px-6 lg:px-10">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={item.isOpen ? 'open' : 'closed'} />
                {item.isFeatured && <Badge variant="featured">Destaque Verificado</Badge>}
                <Badge variant="category">{item.category}</Badge>
                <Badge variant="price">{item.priceTier}</Badge>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-[#171717] tracking-tight mb-3">
                {item.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#777777] mb-4">
                <StarRating rating={item.ratingAverage} count={item.ratingCount} size="md" />
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-[#FF3B4F]" />
                  {item.address}
                </span>
              </div>

              <p className="text-sm sm:text-base text-[#171717] leading-relaxed max-w-3xl">
                {item.shortDescription}
              </p>
            </div>

            {/* Quick Contact Buttons */}
            <div className="w-full lg:w-auto bg-[#F8F9FA] rounded-2xl p-5 border border-[#E5E7EB] flex flex-col gap-3 shrink-0">
              <a
                href={`https://wa.me/${item.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-64 px-6 py-3.5 rounded-full bg-[#10B981] hover:bg-[#059669] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-card transition"
              >
                <MessageCircle className="w-5 h-5" />
                Falar no WhatsApp
              </a>

              <a
                href={`tel:${item.phone.replace(/\D/g, '')}`}
                className="w-full sm:w-64 px-6 py-3 rounded-full bg-white hover:bg-gray-50 text-[#171717] font-semibold text-sm flex items-center justify-center gap-2 border border-[#E5E7EB] transition"
              >
                <Phone className="w-4 h-4 text-[#FF3B4F]" />
                {item.phone}
              </a>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + item.address)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-64 px-6 py-2.5 rounded-full bg-transparent hover:bg-black/5 text-[#777777] font-medium text-xs flex items-center justify-center gap-1.5 transition text-center"
              >
                <Navigation className="w-3.5 h-3.5" />
                Como Chegar no Google Maps
              </a>
            </div>
          </div>
        </section>

        {/* Content Tabs / Details Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            {/* Sobre o Local */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card">
              <h2 className="text-xl font-bold text-[#171717] mb-4">Sobre o Estabelecimento</h2>
              <p className="text-sm text-[#777777] leading-relaxed whitespace-pre-line">
                {item.fullDescription}
              </p>
            </div>

            {/* Comodidades e Diferenciais */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card">
              <h2 className="text-xl font-bold text-[#171717] mb-5">Comodidades & Estrutura</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {item.amenities.map((am: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-[#171717]">
                    <div className="w-5 h-5 rounded-full bg-[#10B981]/15 flex items-center justify-center text-[#10B981] shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>{am}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cardápio & Serviços em Destaque */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card">
              <h2 className="text-xl font-bold text-[#171717] mb-5">Destaques do Cardápio / Serviços</h2>
              <div className="divide-y divide-gray-100">
                {item.menu.map((menuItem: any, idx: number) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-sm text-[#171717]">{menuItem.name}</h3>
                      <p className="text-xs text-[#777777] mt-1">{menuItem.desc}</p>
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-[#FF3B4F] shrink-0">
                      {menuItem.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna Lateral: Horários & Endereço */}
          <div className="lg:col-span-4 space-y-6">
            {/* Horários de Funcionamento */}
            <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-card">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <Clock className="w-4 h-4 text-[#FF3B4F]" />
                <h3 className="font-bold text-sm text-[#171717]">Horário de Funcionamento</h3>
              </div>
              <div className="space-y-3 text-xs">
                {item.hours.map((h: any, idx: number) => (
                  <div key={idx} className="flex flex-col gap-0.5">
                    <span className="font-bold text-[#171717]">{h.days}</span>
                    <span className="text-[#777777]">{h.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Avaliações do Local */}
            <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-card">
              <h3 className="font-bold text-sm text-[#171717] mb-3">Avaliação Geral</h3>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl font-black text-[#171717]">{item.ratingAverage}</span>
                <div>
                  <StarRating rating={item.ratingAverage} showText={false} size="sm" />
                  <span className="text-xs text-[#777777] block mt-0.5">
                    {item.ratingCount} avaliações verificadas
                  </span>
                </div>
              </div>
              <Link
                href="/login"
                className="w-full py-2.5 rounded-full bg-[#171717] text-white text-xs font-semibold text-center block hover:bg-[#333] transition"
              >
                Escrever uma avaliação
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer currentCitySlug={city} />
      <MobileNav currentCitySlug={city} />
    </>
  );
}

