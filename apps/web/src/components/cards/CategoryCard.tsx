import React from 'react';
import Link from 'next/link';
import {
  Utensils,
  Beer,
  Hotel,
  Ticket,
  ShoppingBag,
  Sparkles,
  HeartPulse,
  Dumbbell,
  Scissors,
  Landmark,
  Compass,
} from 'lucide-react';

export interface CategoryCardProps {
  name: string;
  slug: string;
  citySlug: string;
  iconName?: string;
  count?: number;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  restaurantes: <Utensils className="w-6 h-6 text-[#FF3B4F]" />,
  bares: <Beer className="w-6 h-6 text-[#FF3B4F]" />,
  hospedagem: <Hotel className="w-6 h-6 text-[#FF3B4F]" />,
  eventos: <Ticket className="w-6 h-6 text-[#FF3B4F]" />,
  comercio: <ShoppingBag className="w-6 h-6 text-[#FF3B4F]" />,
  saude: <HeartPulse className="w-6 h-6 text-[#FF3B4F]" />,
  fitness: <Dumbbell className="w-6 h-6 text-[#FF3B4F]" />,
  beleza: <Scissors className="w-6 h-6 text-[#FF3B4F]" />,
  cultura: <Landmark className="w-6 h-6 text-[#FF3B4F]" />,
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  name,
  slug,
  citySlug,
  iconName = 'restaurantes',
  count,
}) => {
  const icon = ICON_MAP[slug] || ICON_MAP[iconName] || <Compass className="w-6 h-6 text-[#FF3B4F]" />;

  return (
    <Link
      href={`/${citySlug}/lugares/${slug}`}
      className="group bg-white rounded-2xl p-5 border border-[#E5E7EB] hover:border-[#171717] hover:shadow-hover transition-all duration-300 flex flex-col items-center text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-[#FFF1F2] group-hover:bg-[#FF3B4F] flex items-center justify-center mb-3 transition-colors duration-300">
        <span className="group-hover:text-white transition-colors duration-300 group-hover:[&>svg]:text-white">
          {icon}
        </span>
      </div>
      <h3 className="font-bold text-sm text-[#171717] group-hover:text-[#FF3B4F] transition-colors">
        {name}
      </h3>
      {typeof count === 'number' && (
        <span className="text-xs text-[#777777] mt-1">
          {count} {count === 1 ? 'local' : 'locais'}
        </span>
      )}
    </Link>
  );
};

