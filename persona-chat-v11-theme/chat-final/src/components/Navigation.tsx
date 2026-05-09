import React from 'react';
import { Home, Wallet, Bookmark, User, MessageCircle } from 'lucide-react';
import { View } from '../types';
import { T, POINT } from '../lib/theme';
import type { Theme } from '../lib/theme';

interface NavigationProps {
  activeView: View;
  onViewChange: (view: View) => void;
  theme: Theme;
}

export default function Navigation({ activeView, onViewChange, theme }: NavigationProps) {
  const tk = T[theme];
  const tabs: { id: string; icon: React.ElementType; isMain?: boolean }[] = [
    { id: 'home', icon: Home },
    { id: 'credit', icon: Wallet },
    { id: 'select', icon: MessageCircle, isMain: true },
    { id: 'scrap', icon: Bookmark },
    { id: 'profile', icon: User },
  ];

  return (
    <nav className={`flex justify-around items-center h-20 px-4 pb-2 ${tk.navBg}`}>
      {tabs.map((tab) => {
        const isActive = activeView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id as View)}
            className={`flex items-center justify-center transition-all ${tab.isMain ? 'w-20' : 'w-12'} ${isActive ? tk.navActive : tk.navInactive} hover:opacity-80`}
          >
            <div className={`${
              tab.isMain
                ? `p-3 rounded-2xl border-2 transition-all duration-300 ${
                    isActive
                      ? theme === 'light'
                        ? 'border-transparent text-white'
                        : 'border-white bg-white text-black'
                      : theme === 'light'
                        ? 'border-gray-200 bg-gray-50 text-gray-400'
                        : 'border-white/10 bg-white/5 text-white'
                  }`
                : 'p-2'
            }`}
              style={tab.isMain && isActive && theme === 'light' ? { backgroundColor: POINT } : undefined}
            >
              <tab.icon size={tab.isMain ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
          </button>
        );
      })}
    </nav>
  );
}
