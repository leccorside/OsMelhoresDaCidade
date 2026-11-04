'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface FooterProps {
  currentCitySlug?: string;
}

export const Footer: React.FC<FooterProps> = ({ currentCitySlug = 'caldas-novas' }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const cityPrefix = currentCitySlug ? `/${currentCitySlug}` : '/caldas-novas';

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="w-full bg-[#313030] text-[#F3F0EF] pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Bloco Superior: Newsletter VIP */}
        <div className="mb-12 pb-12 border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-[18px] font-bold text-white mb-1">Receba novidades e dicas exclusivas</h3>
            <p className="text-[13px] text-[#E5BDBC]">Assine nossa newsletter VIP e fique por dentro do melhor de cada cidade.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto min-w-[320px] max-w-md">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white text-[#1C1B1B] text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF3B4F]"
              placeholder="Seu melhor e-mail"
              type="email"
              required
            />
            <button
              className="bg-[#FF3B4F] hover:bg-[#D91F35] text-white px-6 py-2.5 rounded-xl text-[13px] font-bold transition-colors shrink-0 shadow-sm"
              type="submit"
            >
              {subscribed ? 'Inscrito!' : 'Inscrever-se'}
            </button>
          </form>
        </div>

        {/* Grid de 4 Colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Coluna 1: Marca & Contato */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Image
                alt="Os Melhores da Cidade"
                className="h-10 w-auto object-contain brightness-0 invert"
                src="/logo-01.png"
                width={160}
                height={40}
              />
            </div>
            <p className="text-[13px] text-[#E5BDBC] leading-relaxed">
              O guia digital definitivo para descobrir os melhores estabelecimentos, eventos, serviços e experiências em cada cidade brasileira.
            </p>
            <div className="flex items-center gap-1.5 text-[13px] text-white pt-1">
              <span className="material-symbols-outlined text-[18px] text-[#FF3B4F]">call</span>
              <a href="tel:1140028922" className="hover:text-white transition-colors">
                (11) 4002-8922
              </a>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <a
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-[#313030] border border-gray-600 flex items-center justify-center hover:border-[#FF3B4F] text-white transition-colors"
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
              >
                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              </a>
              <a
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-[#313030] border border-gray-600 flex items-center justify-center hover:border-[#FF3B4F] text-white transition-colors"
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
              >
                <span className="material-symbols-outlined text-[16px]">share</span>
              </a>
              <a
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-[#313030] border border-gray-600 flex items-center justify-center hover:border-[#FF3B4F] text-white transition-colors"
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
              >
                <span className="material-symbols-outlined text-[16px]">smart_display</span>
              </a>
            </div>
          </div>

          {/* Coluna 2: Navegação Rápida */}
          <div className="space-y-3">
            <h3 className="text-[16px] font-bold text-white">Navegação Rápida</h3>
            <ul className="space-y-2 text-[13px] text-[#E5BDBC]">
              <li>
                <Link className="hover:text-white transition-colors" href={cityPrefix}>
                  Início
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href={`${cityPrefix}/lugares`}>
                  Lugares em Destaque
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href={`${cityPrefix}/categorias`}>
                  Categorias
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href={`${cityPrefix}/eventos`}>
                  Agenda de Eventos
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href={`${cityPrefix}/blog`}>
                  Blog & Dicas
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/contato">
                  Contato
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/sobre">
                  Sobre Nós
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Cidades Populares */}
          <div className="space-y-3">
            <h3 className="text-[16px] font-bold text-white">Cidades Populares</h3>
            <ul className="space-y-2 text-[13px] text-[#E5BDBC]">
              <li>
                <Link className="hover:text-white transition-colors font-bold text-white" href="/caldas-novas">
                  Caldas Novas (GO)
                </Link>
              </li>
              <li>
                <span className="text-gray-400">Goiânia (Em breve)</span>
              </li>
              <li>
                <span className="text-gray-400">Brasília (Em breve)</span>
              </li>
              <li>
                <span className="text-gray-400">São Paulo (Em breve)</span>
              </li>
              <li>
                <span className="text-gray-400">Rio de Janeiro (Em breve)</span>
              </li>
              <li>
                <span className="text-gray-400">Florianópolis (Em breve)</span>
              </li>
              <li>
                <span className="text-gray-400">Curitiba (Em breve)</span>
              </li>
              <li>
                <span className="text-gray-400">Salvador (Em breve)</span>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Para Empresas */}
          <div className="space-y-3">
            <h3 className="text-[16px] font-bold text-white">Para Empresas</h3>
            <ul className="space-y-2 text-[13px] text-[#E5BDBC]">
              <li>
                <Link className="hover:text-white transition-colors" href="/anuncie">
                  Anuncie seu Estabelecimento
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/anuncie#planos">
                  Planos de Visibilidade
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/anuncie#depoimentos">
                  Histórias de Sucesso
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/contato">
                  Central de Ajuda
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha Inferior com Copyright e Links Legais */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-[#E5BDBC]">
          <p>© 2025 Os Melhores da Cidade. Todos os direitos reservados.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1">
              <span>🇧🇷</span>
              <span>Português (Brasil)</span>
            </span>
            <Link className="hover:text-white transition-colors" href="/sobre">
              Termos de Uso
            </Link>
            <Link className="hover:text-white transition-colors" href="/sobre">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
