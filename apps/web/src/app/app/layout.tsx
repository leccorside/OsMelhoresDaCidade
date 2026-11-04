'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  User,
  Heart,
  Star,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Compass,
  LayoutDashboard,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function UserAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const navItems = [
    { label: 'Meu Painel', href: '/app', icon: LayoutDashboard },
    { label: 'Lugares Favoritos', href: '/app/favoritos', icon: Heart },
    { label: 'Minhas Avaliações', href: '/app/avaliacoes', icon: Star },
    { label: 'Eventos Salvos', href: '/app/eventos', icon: Calendar },
    { label: 'Configurações de Conta', href: '/app/perfil', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FCF9F8] flex flex-col md:flex-row">
      {/* Top Header Mobile */}
      <header className="md:hidden bg-white border-b border-[#E5E7EB] p-4 flex items-center justify-between sticky top-0 z-40">
        <Link href="/">
          <Image
            src="/logo-01.png"
            alt="Os Melhores da Cidade"
            width={140}
            height={36}
            className="h-8 w-auto object-contain"
          />
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-gray-100"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Desktop */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-[#E5E7EB] flex flex-col justify-between transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          <div className="p-6 border-b border-gray-100 hidden md:block">
            <Link href="/" className="block">
              <Image
                src="/logo-01.png"
                alt="Os Melhores da Cidade"
                width={150}
                height={40}
                className="h-8 w-auto object-contain"
              />
            </Link>
            <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gray-100 text-[#171717]">
              Painel do Usuário
            </span>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#FFF1F2] text-[#FF3B4F]'
                      : 'text-[#777777] hover:text-[#171717] hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100 space-y-3">
          <Link
            href="/caldas-novas"
            className="flex items-center justify-between text-xs text-[#777777] hover:text-[#FF3B4F] px-2 py-1 transition"
          >
            <span>Explorar Caldas Novas</span>
            <Compass className="w-3.5 h-3.5 text-[#FF3B4F]" />
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="truncate mr-2">
              <span className="block text-xs font-bold text-[#171717] truncate">
                {user?.name || 'Visitante'}
              </span>
              <span className="block text-[10px] text-[#777777] truncate">
                {user?.email || 'usuario@email.com'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Sair da conta"
              className="p-2 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-6xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}

