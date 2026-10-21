import React from 'react';
import { Search, Sun, Moon, Bell, User, CheckCircle2 } from 'lucide-react';
import { AppSettings, UserProfile } from '../../types';

interface NavbarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onOpenSearch: () => void;
  settings: AppSettings;
  onToggleTheme: () => void;
  currentProfile: UserProfile;
  profiles: UserProfile[];
  onSelectProfile: (profileId: string) => void;
  onNewProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  onOpenSearch,
  settings,
  onToggleTheme,
  currentProfile,
  profiles,
  onSelectProfile,
  onNewProfile,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark (Single element) */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 group focus:outline-hidden"
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-emerald-950 flex items-center justify-center border border-emerald-700/50 shadow-xs">
            <img
              src="/src/assets/images/mydeen_app_logo_1792555757106.jpg"
              alt="My Deen Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // styled fallback container
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              মাই দ্বীন <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400 font-sans-ui">My Deen</span>
            </span>
          </div>
        </button>

        {/* Zone 2: Concise Single-Line Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`whitespace-nowrap transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
              activeView === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
            }`}
          >
            হোম
          </button>
          <button
            onClick={() => onNavigate('worship')}
            className={`whitespace-nowrap transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
              activeView === 'worship' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
            }`}
          >
            দৈনন্দিন আমল
          </button>
          <button
            onClick={() => onNavigate('quran')}
            className={`whitespace-nowrap transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
              activeView === 'quran' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
            }`}
          >
            কুরআন মাজিদ
          </button>
          <button
            onClick={() => onNavigate('tadabbur')}
            className={`whitespace-nowrap transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
              activeView === 'tadabbur' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
            }`}
          >
            তাদাব্বুর
          </button>
          <button
            onClick={() => onNavigate('reflection')}
            className={`whitespace-nowrap transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
              activeView === 'reflection' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
            }`}
          >
            আত্মপর্যালোচনা
          </button>
          <button
            onClick={() => onNavigate('sunnah')}
            className={`whitespace-nowrap transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
              activeView === 'sunnah' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
            }`}
          >
            সুন্নাহ
          </button>
          <button
            onClick={() => onNavigate('commands')}
            className={`whitespace-nowrap transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
              activeView === 'commands' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
            }`}
          >
            কুরআনের নির্দেশ
          </button>
          <button
            onClick={() => onNavigate('prohibitions')}
            className={`whitespace-nowrap transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
              activeView === 'prohibitions' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
            }`}
          >
            আত্মশুদ্ধি
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className={`whitespace-nowrap transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
              activeView === 'reports' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
            }`}
          >
            অগ্রগতি রিপোর্ট
          </button>
        </nav>

        {/* Zone 3: Actions (Search, Theme, Profile) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Global Search Button */}
          <button
            onClick={onOpenSearch}
            className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-2 text-xs transition-colors"
            title="অনুসন্ধান করুন"
          >
            <Search className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">খুঁজুন...</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={settings.theme === 'dark' ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন'}
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User Profile Switcher */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="h-9 px-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
              title="ব্যবহারকারী প্রোফাইল"
            >
              <User className="w-3.5 h-3.5" />
              <span className="max-w-[80px] sm:max-w-[120px] truncate">{currentProfile.name}</span>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 text-xs">
                <div className="px-3 py-1.5 text-[11px] text-slate-400 font-medium border-b border-slate-100 dark:border-slate-800">
                  বর্তমান প্রোফাইল
                </div>
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProfile(p.id);
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <span className="truncate">{p.name}</span>
                    {p.id === currentProfile.id && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </button>
                ))}
                <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNewProfile();
                    }}
                    className="w-full text-left px-3 py-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-medium"
                  >
                    + নতুন প্রোফাইল তৈরি করুন
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onNavigate('settings');
                    }}
                    className="w-full text-left px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    প্রোফাইল ও সেটিংস
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
