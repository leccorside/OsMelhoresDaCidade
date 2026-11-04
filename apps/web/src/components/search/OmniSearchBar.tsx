'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface OmniSearchBarProps {
  citySlug?: string;
  cityName?: string;
  placeholder?: string;
  className?: string;
}

export const OmniSearchBar: React.FC<OmniSearchBarProps> = ({
  citySlug = 'caldas-novas',
  cityName = 'Caldas Novas',
  placeholder = 'O que você está procurando? (ex: pizza, pousada, show...)',
  className = '',
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [neighborhood, setNeighborhood] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (neighborhood.trim()) params.set('bairro', neighborhood.trim());

    router.push(`/${citySlug}/lugares?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full max-w-4xl bg-white rounded-2xl sm:rounded-full p-2 sm:p-2.5 shadow-hover border border-[#E5E7EB] flex flex-col sm:flex-row items-center gap-2 ${className}`}
    >
      {/* Input de Busca */}
      <div className="flex items-center gap-3 px-4 py-2 w-full sm:flex-1">
        <Search className="w-5 h-5 text-[#FF3B4F] shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full text-sm text-[#171717] bg-transparent focus:outline-none placeholder:text-[#9CA3AF]"
        />
      </div>

      <div className="hidden sm:block h-8 w-px bg-[#E5E7EB]" />

      {/* Input de Bairro / Região */}
      <div className="flex items-center gap-3 px-4 py-2 w-full sm:w-64">
        <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
        <input
          type="text"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          placeholder={`Bairro em ${cityName}`}
          className="w-full text-sm text-[#171717] bg-transparent focus:outline-none placeholder:text-[#9CA3AF]"
        />
      </div>

      {/* Botão de Envio */}
      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full sm:w-auto px-8"
      >
        Buscar
      </Button>
    </form>
  );
};
