'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Calendar, Heart, User } from 'lucide-react';

export interface MobileNavProps {
  currentCitySlug?: string;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentCitySlug = 'caldas-novas' }) => {
  const pathname = usePathname();
  const cityPrefix = currentCitySlug ? `/${currentCitySlug}` : '';

  const navItems = [
    { label: 'Início', href: cityPrefix || '/', icon: Home },
    { label: 'Explorar', href: `${cityPrefix}/lugares`, icon: Compass },
    { label: 'Eventos', href: `${cityPrefix}/eventos`, icon: Calendar },
    { label: 'Favoritos', href: '/app/favoritos', icon: Heart },
    { label: 'Perfil', href: '/app', icon: User },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] py-2 px-3 shadow-floating">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
                isActive ? 'text-[#FF3B4F]' : 'text-[#777777] hover:text-[#171717]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className={`text-[10px] mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
