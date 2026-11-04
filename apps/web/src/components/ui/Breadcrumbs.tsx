import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-[#777777] ${className}`}>
      <ol className="flex items-center space-x-1.5 flex-wrap">
        <li>
          <Link href="/" className="hover:text-[#FF3B4F] flex items-center transition">
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">Início</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center space-x-1.5">
              <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
              {isLast || !item.href ? (
                <span className="font-semibold text-[#171717] truncate max-w-[200px]" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-[#FF3B4F] transition truncate max-w-[150px]">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

