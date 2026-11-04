'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  Calendar,
  Image as ImageIcon,
  UtensilsCrossed,
  Star,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Ticket,
  Bell,
  QrCode,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { clearAuthCookies } from '@/services/auth';
import { MerchantNotificationsBell } from '@/components/merchant/MerchantNotificationsBell';

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Checagem reativa de autenticação no cliente
    const hasToken =
      document.cookie.includes('auth_token=') ||
      Boolean(localStorage.getItem('os-melhores-auth-storage'));

    if (!hasToken) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else {
      setCheckingAuth(false);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    clearAuthCookies();
    clearAuth();
    router.push('/login');
  };

  const menuItems = [
    { label: 'Dashboard', href: '/comerciante', icon: LayoutDashboard },
    { label: 'Meus Estabelecimentos', href: '/comerciante/estabelecimentos', icon: Store },
    { label: 'Promoções & Cupons', href: '/comerciante/cupons', icon: Ticket },
    { label: 'Validar Vouchers', href: '/comerciante/validar-voucher', icon: QrCode },
    { label: 'Eventos & Shows', href: '/comerciante/eventos', icon: Calendar },
    { label: 'Cardápio & Serviços', href: '/comerciante/servicos', icon: UtensilsCrossed },
    { label: 'Galeria de Fotos', href: '/comerciante/galeria', icon: ImageIcon },
    { label: 'Avaliações', href: '/comerciante/avaliacoes', icon: Star },
    { label: 'Estatísticas', href: '/comerciante/estatisticas', icon: BarChart3 },
    { label: 'Configurações', href: '/comerciante/configuracoes', icon: Settings },
  ];

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#171717] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-[#FF3B4F] animate-spin mb-3" />
        <span className="text-xs font-semibold text-gray-400">
          Autenticando sessão do comerciante...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <header className="md:hidden bg-[#171717] text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/comerciante">
          <Image
            src="/logo-02.png"
            alt="Os Melhores da Cidade"
            width={140}
            height={36}
            className="h-8 w-auto brightness-0 invert"
          />
        </Link>
        <div className="flex items-center gap-2">
          <MerchantNotificationsBell />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-white/10"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar Desktop */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-40 w-64 bg-[#171717] text-white flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Logo */}
          <div className="p-6 border-b border-white/10 hidden md:block">
            <Link href="/" target="_blank" className="block">
              <Image
                src="/logo-02.png"
                alt="Os Melhores da Cidade"
                width={150}
                height={40}
                className="h-8 w-auto brightness-0 invert"
              />
            </Link>
            <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#FF3B4F] text-white">
              Painel Comerciante
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#FF3B4F] text-white shadow-card'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar: User Profile & Logout */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <Link
            href="/caldas-novas"
            target="_blank"
            className="flex items-center justify-between text-xs text-gray-400 hover:text-white px-2 py-1 transition"
          >
            <span>Ver Portal Público</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="truncate mr-2">
              <span className="block text-xs font-bold text-white truncate">
                {user?.name || 'Comerciante'}
              </span>
              <span className="block text-[10px] text-gray-400 truncate">
                {user?.email || 'comerciante@email.com'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Sair da conta"
              className="p-2 rounded-lg bg-white/10 hover:bg-red-600/80 text-gray-300 hover:text-white transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Topbar */}
        <header className="hidden md:flex bg-white border-b border-gray-200/80 px-8 py-3.5 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <span>Painel do Comerciante Parceiro</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-semibold text-gray-600 hover:text-[#FF3B4F] flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Guia da Cidade</span>
            </Link>

            <div className="h-4 w-px bg-gray-200" />

            <div className="bg-[#1C1B1B] rounded-xl p-0.5">
              <MerchantNotificationsBell />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

