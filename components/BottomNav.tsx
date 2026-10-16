'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, Activity, BookOpen, AlertOctagon } from 'lucide-react';
import { useEWS } from '@/lib/EWSContext';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { isDangerCondition } = useEWS();

  const navItems = [
    {
      name: 'Beranda',
      href: '/',
      icon: Home,
    },
    {
      name: 'Peta',
      href: '/peta',
      icon: Map,
    },
    {
      name: 'Riwayat',
      href: '/riwayat',
      icon: Activity,
    },
    {
      name: 'Edukasi',
      href: '/edukasi',
      icon: BookOpen,
    },
    {
      name: 'Darurat',
      href: '/darurat',
      icon: AlertOctagon,
      badge: isDangerCondition,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 py-1.5 shadow-lg safe-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-blue-600 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-ping" />
                )}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
                )}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
