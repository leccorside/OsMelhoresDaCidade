'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CityState {
  currentCitySlug: string;
  currentCityName: string;
  currentCityUf: string;
  setCity: (slug: string, name: string, uf: string) => void;
}

export const useCityStore = create<CityState>()(
  persist(
    (set) => ({
      currentCitySlug: 'caldas-novas',
      currentCityName: 'Caldas Novas',
      currentCityUf: 'GO',
      setCity: (slug, name, uf) =>
        set({
          currentCitySlug: slug,
          currentCityName: name,
          currentCityUf: uf,
        }),
    }),
    {
      name: 'os-melhores-da-cidade-pref',
    },
  ),
);

