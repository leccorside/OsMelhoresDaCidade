'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  Briefcase,
  Store,
  Layers,
  MapPin,
  Calendar,
  Star,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  BarChart,
  Search,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  CheckSquare,
  Ticket,
  Send,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, user, pathname, router]);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Usuários', href: '/admin/usuarios', icon: Users },
    { label: 'Comerciantes', href: '/admin/comerciantes', icon: Briefcase },
    { label: 'Estabelecimentos', href: '/admin/estabelecimentos', icon: Store },
    { label: 'Moderação de Anúncios', href: '/admin/moderacao', icon: CheckSquare },
    { label: 'Cupons & Promoções', href: '/admin/cupons', icon: Ticket },
    { label: 'Avisos & Comunicados', href: '/admin/comunicados', icon: Send },
    { label: 'Categorias', href: '/admin/categorias', icon: Layers },
    { label: 'Estados & Cidades', href: '/admin/cidades', icon: MapPin },
    { label: 'Eventos', href: '/admin/eventos', icon: Calendar },
    { label: 'Moderação de Avaliações', href: '/admin/avaliacoes', icon: Star },
    { label: 'CMS Blog', href: '/admin/blog', icon: FileText },
    { label: 'Banners', href: '/admin/banners', icon: ImageIcon },
    { label: 'Mensagens / Contatos', href: '/admin/contatos', icon: MessageSquare },
    { label: 'SEO Global & Local', href: '/admin/seo', icon: Search },
    { label: 'Configurações do Sistema', href: '/admin/configuracoes', icon: Settings },
  ];

  if (mounted && (!isAuthenticated || user?.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-[#FF3B4F] mb-4 shadow-lg shadow-red-500/10">
          <ShieldAlert className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-lg font-bold text-white mb-1">Acesso Restrito ao Administrador</h2>
        <p className="text-xs text-gray-400 mb-4 max-w-sm">
          Redirecionando para a tela de autenticação segura...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-gray-200 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <header className="md:hidden bg-black text-white p-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-800">
        <Link href="/admin">
          <Image
            src="/logo-02.png"
            alt="Os Melhores da Cidade"
            width={140}
            height={36}
            className="h-8 w-auto brightness-0 invert"
          />
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg bg-gray-800"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Desktop */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-40 w-64 bg-black border-r border-gray-800 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Header */}
          <div className="p-6 border-b border-gray-800 hidden md:block">
            <Link href="/" target="_blank" className="block">
              <Image
                src="/logo-02.png"
                alt="Os Melhores da Cidade"
                width={150}
                height={40}
                className="h-8 w-auto brightness-0 invert"
              />
            </Link>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 text-[10px] font-black uppercase tracking-wider">
              <ShieldAlert className="w-3 h-3" />
              Admin Master
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-0.5 max-h-[calc(100vh-190px)] overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#FF3B4F] text-white shadow-card font-bold'
                      : 'text-gray-400 hover:text-white hover:bg-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 flex items-center justify-between">
          <div className="truncate mr-2">
            <span className="block text-xs font-bold text-white truncate">
              {user?.name || 'Administrador'}
            </span>
            <span className="block text-[10px] text-gray-500 truncate">
              Permissão Master
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Sair do painel"
            className="p-2 rounded-lg bg-gray-900 hover:bg-red-900/50 text-gray-400 hover:text-white transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl w-full mx-auto bg-[#171717]">
        {children}
      </main>
    </div>
  );
}

