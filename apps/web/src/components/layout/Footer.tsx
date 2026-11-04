import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export interface FooterProps {
  currentCitySlug?: string;
}

export const Footer: React.FC<FooterProps> = ({ currentCitySlug = 'caldas-novas' }) => {
  return (
    <footer className="w-full bg-[#171717] text-white pt-14 pb-10 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Coluna 1: Marca & Propósito */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/logo-02.png"
                alt="Os Melhores da Cidade"
                width={170}
                height={45}
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              O portal oficial para descobrir e celebrar o melhor em gastronomia, turismo, entretenimento e serviços locais nas principais cidades brasileiras.
            </p>
            <div className="flex items-center space-x-3 pt-2 text-gray-300">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#FF3B4F] flex items-center justify-center transition"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#FF3B4F] flex items-center justify-center transition"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#FF3B4F] flex items-center justify-center transition"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Coluna 2: Navegação & Categorias */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
              Categorias Populares
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href={`/${currentCitySlug}/lugares/restaurantes`} className="hover:text-white transition">
                  Restaurantes & Gastronomia
                </Link>
              </li>
              <li>
                <Link href={`/${currentCitySlug}/lugares/bares`} className="hover:text-white transition">
                  Bares, Pubs & Vida Noturna
                </Link>
              </li>
              <li>
                <Link href={`/${currentCitySlug}/lugares/hospedagem`} className="hover:text-white transition">
                  Hotéis, Pousadas & Resorts
                </Link>
              </li>
              <li>
                <Link href={`/${currentCitySlug}/eventos`} className="hover:text-white transition">
                  Shows, Festivais & Eventos
                </Link>
              </li>
              <li>
                <Link href={`/${currentCitySlug}/lugares/atracoes`} className="hover:text-white transition">
                  Parques Aquáticos & Lazer
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Institucional */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
              Institucional
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/sobre" className="hover:text-white transition">
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link href="/anuncie" className="hover:text-white transition">
                  Anuncie seu Negócio
                </Link>
              </li>
              <li>
                <Link href={`/${currentCitySlug}/blog`} className="hover:text-white transition">
                  Blog & Roteiros
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-white transition">
                  Fale Conosco
                </Link>
              </li>
              <li>
                <Link href="/termos" className="hover:text-white transition">
                  Termos de Uso & Privacidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Cidades & Suporte */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
              Expansão Nacional
            </h4>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              Iniciando por Caldas Novas (GO) e expandindo para todo o Brasil. Deseja levar o portal para sua cidade?
            </p>
            <Link
              href="/contato?interesse=expansao"
              className="inline-block text-xs font-bold text-[#FF3B4F] hover:underline"
            >
              Seja um franqueado ou parceiro &rarr;
            </Link>
          </div>
        </div>

        {/* Linha Inferior */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Os Melhores da Cidade. Todos os direitos reservados.</p>
          <p>Feito para valorizar o comércio e o turismo brasileiro.</p>
        </div>
      </div>
    </footer>
  );
};
