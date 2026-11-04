import Link from 'next/link';
import Image from 'next/image';
import { constructMetadata } from '@/lib/seo';
import { Search, MapPin, Sparkles, Compass } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'Guia Oficial de Cidades Brasileiras',
  description: 'Encontre os melhores restaurantes, eventos, hospedagens e atrações em cidades do Brasil.',
});

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-[#E5E7EB] py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo-01.png"
              alt="Os Melhores da Cidade"
              width={160}
              height={44}
              priority
              className="h-10 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/caldas-novas"
              className="text-sm font-medium text-[#171717] hover:text-[#FF3B4F] flex items-center gap-1.5 transition"
            >
              <MapPin className="w-4 h-4 text-[#FF3B4F]" />
              <span>Caldas Novas (GO)</span>
            </Link>
            <Link
              href="/anuncie"
              className="hidden sm:inline-flex px-5 py-2 rounded-full bg-[#171717] text-white text-sm font-medium hover:bg-[#333] transition"
            >
              Anuncie seu negócio
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 bg-gradient-to-b from-[#FCF9F8] to-[#F5F5F5] flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF1F2] text-[#FF3B4F] text-xs font-semibold tracking-wide uppercase mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Plataforma Multicidades
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#171717] max-w-4xl tracking-tight leading-tight mb-6">
          Descubra o melhor de cada cidade no Brasil
        </h1>
        <p className="text-lg sm:text-xl text-[#777777] max-w-2xl mb-10">
          Cultura, gastronomia, lazer e negócios locais selecionados com precisão editorial e avaliações autênticas.
        </p>

        {/* Quick City Selector Box */}
        <div className="w-full max-w-2xl bg-white p-3 rounded-2xl shadow-hover border border-[#E5E7EB] flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-3 px-3 w-full sm:w-1/2">
            <MapPin className="w-5 h-5 text-[#FF3B4F]" />
            <select
              defaultValue="caldas-novas"
              className="w-full bg-transparent border-none text-[#171717] font-medium focus:outline-none"
            >
              <option value="caldas-novas">Caldas Novas - GO</option>
              <option value="goiania" disabled>Goiânia - GO (Em breve)</option>
              <option value="brasilia" disabled>Brasília - DF (Em breve)</option>
              <option value="uberlandia" disabled>Uberlândia - MG (Em breve)</option>
            </select>
          </div>
          <div className="h-px sm:h-8 w-full sm:w-px bg-[#E5E7EB]" />
          <Link
            href="/caldas-novas"
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#FF3B4F] hover:bg-[#D91F35] text-white font-semibold text-center transition flex items-center justify-center gap-2 shadow-card"
          >
            <Compass className="w-4 h-4" />
            Explorar Portal
          </Link>
        </div>
      </section>

      {/* Featured Cities Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-[#171717] mb-8">Cidades em Destaque</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/caldas-novas"
            className="group block bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] hover:shadow-hover transition duration-300"
          >
            <div className="h-48 bg-gradient-to-r from-red-600 to-amber-500 relative flex items-end p-6">
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition" />
              <div className="relative z-10 text-white">
                <span className="text-xs uppercase tracking-wider font-semibold bg-[#FF3B4F] px-2.5 py-1 rounded-full">
                  Cidade Ativa
                </span>
                <h3 className="text-2xl font-bold mt-2">Caldas Novas</h3>
                <p className="text-sm text-gray-200">Goiás • Águas Termais e Gastronomia</p>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between text-sm text-[#777777]">
              <span>Restaurantes, Eventos, Hotéis</span>
              <span className="font-semibold text-[#FF3B4F] group-hover:translate-x-1 transition-transform inline-flex items-center">
                Acessar &rarr;
              </span>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}

