import Link from 'next/link';
import Image from 'next/image';
import { constructMetadata } from '@/lib/seo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { OmniSearchBar } from '@/components/search/OmniSearchBar';
import { Sparkles, MapPin, Award, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Guia Oficial de Cidades Brasileiras',
  description: 'Descubra e explore os melhores restaurantes, eventos, hospedagens e atrações turísticas em cidades do Brasil.',
});

export default function HomePage() {
  return (
    <>
      <Header currentCitySlug="" currentCityName="Brasil" currentCityUf="BR" />

      <main className="flex-1 flex flex-col pb-16 sm:pb-0">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 px-6 bg-gradient-to-b from-[#FCF9F8] via-[#F8F9FA] to-white flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF1F2] text-[#FF3B4F] text-xs font-bold tracking-wide uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Portal Nacional Multicidades
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#171717] max-w-4xl tracking-tight leading-tight mb-6">
            O melhor de cada cidade, <br className="hidden sm:inline" />
            <span className="text-[#FF3B4F]">selecionado para você</span>
          </h1>
          <p className="text-base sm:text-xl text-[#777777] max-w-2xl mb-10 leading-relaxed">
            Gastronomia consagrada, agenda de shows, hospedagens premiadas e serviços de excelência. Seleção editorial e avaliações 100% verificadas.
          </p>

          {/* Omni Search Bar */}
          <OmniSearchBar
            citySlug="caldas-novas"
            cityName="Caldas Novas"
            placeholder="O que você procura em Caldas Novas ou no Brasil?"
          />
        </section>

        {/* Cidades em Destaque */}
        <section className="py-16 px-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-[#FF3B4F] uppercase tracking-wider block mb-1">
                Destinos Ativos
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#171717]">
                Portais Municipais Disponíveis
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#777777] mt-2 sm:mt-0">
              Escolha uma cidade para acessar o guia completo com estabelecimentos locais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Caldas Novas Card */}
            <Link
              href="/caldas-novas"
              className="group block bg-white rounded-3xl overflow-hidden border border-[#E5E7EB] hover:shadow-modal transition-all duration-300"
            >
              <div className="h-56 bg-gradient-to-br from-[#171717] via-red-950 to-[#D91F35] relative flex items-end p-6">
                <div className="relative z-10 text-white">
                  <span className="text-[11px] uppercase tracking-wider font-extrabold bg-[#FF3B4F] px-3 py-1 rounded-full">
                    Cidade Oficial
                  </span>
                  <h3 className="text-2xl font-black mt-3">Caldas Novas</h3>
                  <p className="text-xs text-gray-200 mt-1">Goiás • Maior Estância Hidrotermal do Mundo</p>
                </div>
              </div>
              <div className="p-6 flex items-center justify-between text-sm text-[#777777]">
                <div>
                  <span className="font-bold text-[#171717] block">Centenas de Locais</span>
                  <span className="text-xs">Hotéis, restaurantes, parques e shows</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#FFF1F2] group-hover:bg-[#FF3B4F] flex items-center justify-center transition-colors">
                  <ArrowRight className="w-4 h-4 text-[#FF3B4F] group-hover:text-white transition-colors" />
                </div>
              </div>
            </Link>

            {/* Próximos Lançamentos */}
            <div className="bg-[#F8F9FA] rounded-3xl p-6 border border-dashed border-gray-300 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Em Breve
                </span>
                <h3 className="text-xl font-bold text-gray-700 mt-2">Goiânia & Brasília</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Em fase de credenciamento dos melhores restaurantes, bares e casas de shows da capital goiana e do Distrito Federal.
                </p>
              </div>
              <Link
                href="/anuncie"
                className="mt-6 text-xs font-bold text-[#FF3B4F] hover:underline flex items-center gap-1"
              >
                Cadastre seu negócio para o pré-lançamento &rarr;
              </Link>
            </div>

            <div className="bg-[#F8F9FA] rounded-3xl p-6 border border-dashed border-gray-300 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Expansão
                </span>
                <h3 className="text-xl font-bold text-gray-700 mt-2">Sua Cidade no Portal</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Leve o guia oficial <strong>Os Melhores da Cidade</strong> para seu município e lidere o mercado de divulgação comercial e turística da região.
                </p>
              </div>
              <Link
                href="/contato?interesse=expansao"
                className="mt-6 text-xs font-bold text-[#171717] hover:underline flex items-center gap-1"
              >
                Fale com a nossa equipe de expansão &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* Pilares da Plataforma */}
        <section className="bg-white py-16 px-6 border-t border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] flex items-center justify-center shrink-0">
                <Award className="w-6 h-6 text-[#FF3B4F]" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#171717] mb-1">Critério Editorial Rigoroso</h3>
                <p className="text-xs text-[#777777] leading-relaxed">
                  Apenas estabelecimentos que cumprem padrões de qualidade, higiene e excelente atendimento ao cliente.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-[#FF3B4F]" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#171717] mb-1">Avaliações 100% Reais</h3>
                <p className="text-xs text-[#777777] leading-relaxed">
                  Sistema com controle anti-fraude onde cada usuário pode emitir apenas uma avaliação autêntica por local.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-[#FF3B4F]" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#171717] mb-1">Hiperlocal e Integrado</h3>
                <p className="text-xs text-[#777777] leading-relaxed">
                  Filtre por bairros, rotas instantâneas no mapa e contato direto no WhatsApp com os proprietários.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer currentCitySlug="caldas-novas" />
      <MobileNav currentCitySlug="caldas-novas" />
    </>
  );
}
