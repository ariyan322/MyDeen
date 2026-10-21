/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { AppSettings, UserProfile } from './types';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { MenuDrawer } from './components/layout/MenuDrawer';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { CustomItemModal, ModalItemType } from './components/modals/CustomItemModal';

// Views
import { DashboardView } from './components/views/DashboardView';
import { WorshipTrackerView } from './components/views/WorshipTrackerView';
import { QuranCommandsView } from './components/views/QuranCommandsView';
import { ProhibitedActionsView } from './components/views/ProhibitedActionsView';
import { SunnahView } from './components/views/SunnahView';
import { HalalHaramView } from './components/views/HalalHaramView';
import { QuranReaderView } from './components/views/QuranReaderView';
import { HadithDuasView } from './components/views/HadithDuasView';
import { TaskManagerView } from './components/views/TaskManagerView';
import { NotesView } from './components/views/NotesView';
import { ReflectionView } from './components/views/ReflectionView';
import { TadabburView } from './components/views/TadabburView';
import { ReportsView } from './components/views/ReportsView';
import { GoalsView } from './components/views/GoalsView';
import { RemindersView } from './components/views/RemindersView';
import { TrashView } from './components/views/TrashView';
import { SettingsView } from './components/views/SettingsView';
import { Lock, Unlock } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings());
  const [profiles, setProfiles] = useState<UserProfile[]>(() => storage.getProfiles());
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(() => storage.getCurrentProfile());
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [tadabburPrefill, setTadabburPrefill] = useState<any>(null);
  const [tadabburOpenNew, setTadabburOpenNew] = useState<boolean>(false);
  const [reflectionOpenNew, setReflectionOpenNew] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);

  // Global Add/Edit Modal
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customModalType, setCustomModalType] = useState<ModalItemType>('worship');
  const [customModalItem, setCustomModalItem] = useState<any>(null);

  // PIN Lock check
  const [isPinLocked, setIsPinLocked] = useState<boolean>(() => {
    const prof = storage.getCurrentProfile();
    return !!prof.pinCode;
  });
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Apply Dark mode class to document
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const handleToggleTheme = () => {
    const nextTheme: AppSettings['theme'] = settings.theme === 'dark' ? 'light' : 'dark';
    const updated: AppSettings = { ...settings, theme: nextTheme };
    setSettings(updated);
    storage.saveSettings(updated);
  };

  const handleSelectProfile = (profileId: string) => {
    storage.setActiveProfileId(profileId);
    const prof = storage.getCurrentProfile();
    setCurrentProfile(prof);
    setSettings(storage.getSettings());
    if (prof.pinCode) {
      setIsPinLocked(true);
      setEnteredPin('');
    } else {
      setIsPinLocked(false);
    }
  };

  const handleRefreshProfiles = () => {
    setProfiles(storage.getProfiles());
    setCurrentProfile(storage.getCurrentProfile());
  };

  const handleOpenAddItemModal = (type: ModalItemType, item?: any) => {
    setCustomModalType(type);
    setCustomModalItem(item || null);
    setIsCustomModalOpen(true);
  };

  const handleUnlockPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === currentProfile.pinCode) {
      setIsPinLocked(false);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleNavigate = (view: string, extra?: any) => {
    if (view === 'reflection_new') {
      setReflectionOpenNew(true);
      setActiveView('reflection');
      return;
    }
    if (view === 'tadabbur_new') {
      setTadabburOpenNew(true);
      setActiveView('tadabbur');
      return;
    }
    if (view === 'tadabbur' && extra) {
      setTadabburPrefill(extra);
    }
    setActiveView(view);
  };

  // Render content according to activeView
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView
            settings={settings}
            currentProfile={currentProfile}
            onNavigate={handleNavigate}
            onOpenAddItemModal={handleOpenAddItemModal}
            onUpdateSettings={setSettings}
          />
        );
      case 'worship':
        return (
          <WorshipTrackerView
            settings={settings}
            onOpenAddItemModal={handleOpenAddItemModal}
          />
        );
      case 'commands':
        return <QuranCommandsView settings={settings} />;
      case 'prohibitions':
        return <ProhibitedActionsView settings={settings} />;
      case 'sunnah':
        return <SunnahView settings={settings} />;
      case 'halal_haram':
        return <HalalHaramView settings={settings} />;
      case 'quran':
        return (
          <QuranReaderView
            settings={settings}
            onOpenTadabbur={(verse) => {
              setTadabburPrefill(verse);
              setActiveView('tadabbur');
            }}
          />
        );
      case 'tadabbur':
        return (
          <TadabburView
            settings={settings}
            prefilledVerse={tadabburPrefill}
            onClearPrefill={() => setTadabburPrefill(null)}
            initialOpenForm={tadabburOpenNew}
            onResetInitialOpenForm={() => setTadabburOpenNew(false)}
          />
        );
      case 'hadith_duas':
        return <HadithDuasView settings={settings} />;
      case 'tasks':
        return <TaskManagerView settings={settings} />;
      case 'notes':
        return <NotesView settings={settings} />;
      case 'reflection':
        return (
          <ReflectionView
            settings={settings}
            initialOpenForm={reflectionOpenNew}
            onResetInitialOpenForm={() => setReflectionOpenNew(false)}
          />
        );
      case 'reports':
        return <ReportsView settings={settings} />;
      case 'goals':
        return <GoalsView settings={settings} />;
      case 'reminders':
        return <RemindersView settings={settings} />;
      case 'trash':
        return <TrashView />;
      case 'settings':
        return (
          <SettingsView
            settings={settings}
            onUpdateSettings={setSettings}
            currentProfile={currentProfile}
            profiles={profiles}
            onSelectProfile={handleSelectProfile}
            onRefreshProfiles={handleRefreshProfiles}
          />
        );
      default:
        return (
          <DashboardView
            settings={settings}
            currentProfile={currentProfile}
            onNavigate={handleNavigate}
            onOpenAddItemModal={handleOpenAddItemModal}
            onUpdateSettings={setSettings}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-bengali selection:bg-emerald-500 selection:text-white">
      {/* Top Bar Contract (Single line brand wordmark, nav links, actions) */}
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        settings={settings}
        onToggleTheme={handleToggleTheme}
        currentProfile={currentProfile}
        profiles={profiles}
        onSelectProfile={handleSelectProfile}
        onNewProfile={() => {
          setActiveView('settings');
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 pb-20">
        {isPinLocked ? (
          <div className="max-w-sm mx-auto my-16 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              প্রোফাইল পিন লক
            </h3>
            <p className="text-xs text-slate-500">
              "{currentProfile.name}" প্রোফাইলের গোপনীয়তা রক্ষার্থে ৪ ডিজিটের পিন কোড দিন।
            </p>

            <form onSubmit={handleUnlockPin} className="space-y-3">
              <input
                type="password"
                maxLength={4}
                autoFocus
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value);
                  setPinError(false);
                }}
                placeholder="••••"
                className="w-full text-center tracking-widest text-xl py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-emerald-600 font-mono"
              />

              {pinError && (
                <div className="text-xs text-rose-600 dark:text-rose-400">
                  ভুল পিন কোড! আবার চেষ্টা করুন।
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                আনলক করুন
              </button>
            </form>
          </div>
        ) : (
          renderActiveView()
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenMenuDrawer={() => setIsMenuDrawerOpen(false || true)}
      />

      {/* Mobile Menu Drawer */}
      <MenuDrawer
        isOpen={isMenuDrawerOpen}
        onClose={() => setIsMenuDrawerOpen(false)}
        activeView={activeView}
        onNavigate={handleNavigate}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Custom Item Add/Edit Modal */}
      <CustomItemModal
        isOpen={isCustomModalOpen}
        type={customModalType}
        item={customModalItem}
        onClose={() => {
          setIsCustomModalOpen(false);
          setCustomModalItem(null);
        }}
        onSave={(type, data) => {
          if (type === 'worship') storage.saveCustomWorshipItem(data);
          else if (type === 'task') storage.saveTask(data);
          else if (type === 'note') storage.saveNote(data);
          else if (type === 'goal') storage.saveGoal(data);
          else if (type === 'command') storage.saveCustomQuranCommand(data);
          else if (type === 'sunnah') storage.saveCustomSunnahItem(data);
          else if (type === 'prohibition') storage.saveCustomProhibitedAction(data);
          setIsCustomModalOpen(false);
        }}
      />
    </div>
  );
}
