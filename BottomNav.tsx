import React from 'react';
import { LayoutDashboard, CheckCircle, BookOpen, Sparkles, Menu } from 'lucide-react';

interface BottomNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onOpenMenuDrawer: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeView,
  onNavigate,
  onOpenMenuDrawer,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'হোম', icon: LayoutDashboard },
    { id: 'worship', label: 'আমল', icon: CheckCircle },
    { id: 'quran', label: 'কুরআন', icon: BookOpen },
    { id: 'sunnah', label: 'সুন্নাহ', icon: Sparkles },
    { id: 'menu', label: 'মেনু', icon: Menu, isMenuTrigger: true },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]">
      <nav className="grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.isMenuTrigger) {
                  onOpenMenuDrawer();
                } else {
                  onNavigate(tab.id);
                }
              }}
              className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition-colors relative ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              <span className="text-[11px] leading-tight mt-1 truncate">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute top-1 w-1 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
