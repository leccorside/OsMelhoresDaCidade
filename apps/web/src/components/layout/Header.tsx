'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MapPin, User, Menu, X, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface HeaderProps {
  currentCitySlug?: string;
  currentCityName?: string;
  currentCityUf?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentCitySlug = 'caldas-novas',
  currentCityName = 'Caldas Novas',
  currentCityUf = 'GO',
}) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);

  const cityPrefix = currentCitySlug ? `/${currentCitySlug}` : '';

  const navLinks = [
    { label: 'Início', href: cityPrefix || '/' },
    { label: 'Lugares', href: `${cityPrefix}/lugares` },
    { label: 'Eventos', href: `${cityPrefix}/eventos` },
    { label: 'Blog', href: `${cityPrefix}/blog` },
    { label: 'Contatos', href: '/contato' },
  ];

  return (
    <>
      <header className="w-full bg-white border-b border-[#E5E7EB] py-3.5 px-4 sm:px-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & City Selector */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <Link href={cityPrefix || '/'} className="flex items-center">
              <Image
                src="/logo-01.png"
                alt="Os Melhores da Cidade"
                width={150}
                height={38}
                priority
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>

            {/* City Selector Pill */}
            <button
              onClick={() => setCityModalOpen(true)}
              className="flex items-center space-x-1.5 text-xs sm:text-sm text-[#171717] bg-[#F5F5F5] hover:bg-[#EAEAEA] px-3 py-1.5 rounded-full transition"
            >
              <MapPin className="w-3.5 h-3.5 text-[#FF3B4F]" />
              <span className="font-semibold">{currentCityName} ({currentCityUf})</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-semibold text-[#171717]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors py-1 ${
                    isActive ? 'text-[#FF3B4F] border-b-2 border-[#FF3B4F]' : 'hover:text-[#FF3B4F]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Anuncie + Account + Mobile Menu Toggle */}
          <div className="flex items-center space-x-3">
            <Link
              href="/anuncie"
              className="hidden sm:inline-flex px-4 py-2 rounded-full bg-[#171717] text-white text-xs font-bold hover:bg-[#333] transition shadow-card"
            >
              Anuncie seu negócio
            </Link>

            <Link
              href="/login"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#171717] transition"
              title="Entrar ou criar conta"
            >
              <User className="w-4 h-4" />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#171717] rounded-lg hover:bg-gray-100"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-[#171717]" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[#E5E7EB] mt-3 pt-3 pb-4 px-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-semibold text-[#171717] hover:text-[#FF3B4F]"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <Link
                href="/anuncie"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-full bg-[#FF3B4F] text-white text-sm font-bold"
              >
                Anuncie seu negócio
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* City Change Modal */}
      {cityModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-modal border border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#171717]">Escolha a Cidade</h3>
              <button
                onClick={() => setCityModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#777777] mb-4">
              Selecione o portal municipal para ver estabelecimentos, eventos e roteiros da região.
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <Link
                href="/caldas-novas"
                onClick={() => setCityModalOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-[#FFF1F2] border border-[#FF3B4F]/30 text-[#171717] font-semibold hover:bg-[#FFE4E6] transition"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF3B4F]" />
                  <span>Caldas Novas</span>
                </div>
                <span className="text-xs font-bold text-[#FF3B4F] uppercase">Ativo</span>
              </Link>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 font-medium flex items-center justify-between">
                <span>Goiânia (GO)</span>
                <span className="text-xs">Em breve</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 font-medium flex items-center justify-between">
                <span>Brasília (DF)</span>
                <span className="text-xs">Em breve</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 font-medium flex items-center justify-between">
                <span>Uberlândia (MG)</span>
                <span className="text-xs">Em breve</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

