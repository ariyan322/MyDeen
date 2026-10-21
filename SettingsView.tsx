import React, { useState } from 'react';
import {
  Settings,
  User,
  Moon,
  Sun,
  Download,
  Upload,
  RotateCcw,
  Shield,
  HelpCircle,
  MapPin,
  Lock,
  Plus,
  Check,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { AppSettings, UserProfile } from '../../types';
import { storage } from '../../services/storage';
import { BANGLADESH_CITIES, toBengaliDigits } from '../../utils/dateAndNumerals';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  currentProfile: UserProfile;
  profiles: UserProfile[];
  onSelectProfile: (profileId: string) => void;
  onRefreshProfiles: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  currentProfile,
  profiles,
  onSelectProfile,
  onRefreshProfiles,
}) => {
  const [profileName, setProfileName] = useState(currentProfile.name);
  const [pinCode, setPinCode] = useState(currentProfile.pinCode || '');
  const [newProfileName, setNewProfileName] = useState('');
  const [showNewProfileModal, setShowNewProfileModal] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const bnNums = settings.useBengaliNumerals;

  const handleUpdate = (partial: Partial<AppSettings>) => {
    const updated = { ...settings, ...partial };
    onUpdateSettings(updated);
    storage.saveSettings(updated);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentProfile,
      name: profileName.trim() || 'আমলনামা',
      pinCode: pinCode.trim() || undefined,
    };
    storage.updateProfile(updated);
    onRefreshProfiles();
    setExportNotice('প্রোফাইল তথ্য আপডেট হয়েছে!');
    setTimeout(() => setExportNotice(null), 2500);
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    const p = storage.createProfile(newProfileName.trim());
    storage.setActiveProfileId(p.id);
    onSelectProfile(p.id);
    onRefreshProfiles();
    setNewProfileName('');
    setShowNewProfileModal(false);
  };

  const handleExportJSON = () => {
    const jsonStr = storage.exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mydeen_backup_${currentProfile.id}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice('আপনার ব্যাকআপ ফাইলটি ডাউনলোড হয়েছে!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storage.importAllDataJSON(content);
      if (success) {
        setImportStatus('ডাটা সফলভাবে পুনরুদ্ধার করা হয়েছে! পেজ রিফ্রেশ করুন।');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setImportStatus('ফাইলটি সঠিক My Deen ব্যাকআপ নয়। দয়া করে যাচাই করুন।');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    storage.clearCurrentProfileData();
    setShowClearConfirm(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            সেটিংস ও প্রোফাইল ব্যবস্থাপনা
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          ভাষা, থিম, সালাতের সময় নির্ধারণ পদ্ধতি, সংখ্যা ও ব্যক্তিগত তথ্যের ব্যাকআপ।
        </p>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          {exportNotice}
        </div>
      )}

      {importStatus && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs rounded-xl flex items-center gap-2">
          <Info className="w-4 h-4" />
          {importStatus}
        </div>
      )}

      {/* Profile & PIN Management */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              ব্যবহারকারী প্রোফাইল ও নিরাপত্তা
            </h3>
          </div>
          <button
            onClick={() => setShowNewProfileModal(true)}
            className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
          >
            + নতুন প্রোফাইল
          </button>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                প্রোফাইলের নাম
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                পিন কোড (ঐচ্ছিক গোপনীয়তার জন্য)
              </label>
              <input
                type="password"
                maxLength={4}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="যেমন: 1234"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              প্রোফাইল আপডেট করুন
            </button>
          </div>
        </form>

        {/* Existing Profiles Switcher */}
        {profiles.length > 1 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-500">
              সংরক্ষিত প্রোফাইলসমূহ পরিবর্তন করুন:
            </span>
            <div className="flex gap-2 flex-wrap">
              {profiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectProfile(p.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    p.id === currentProfile.id
                      ? 'bg-emerald-600 text-white border-transparent'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Display & Language Settings */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          প্রদর্শন ও ভাষা পছন্দ
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Theme */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">
                অ্যাপের থিম
              </span>
              <span className="text-slate-500">
                {settings.theme === 'dark' ? 'ডার্ক মোড চালু' : 'লাইট মোড চালু'}
              </span>
            </div>
            <button
              onClick={() => handleUpdate({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>

          {/* Bengali Numerals */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">
                বাংলা সংখ্যা প্রদর্শন (০-৯)
              </span>
              <span className="text-slate-500">
                {settings.useBengaliNumerals ? 'বাংলা সংখ্যা সক্রিয় (যেমন: ১২৩৪)' : 'ইংরেজি সংখ্যা সক্রিয় (1234)'}
              </span>
            </div>
            <button
              onClick={() => handleUpdate({ useBengaliNumerals: !settings.useBengaliNumerals })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                settings.useBengaliNumerals
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {settings.useBengaliNumerals ? 'বাংলা' : 'English'}
            </button>
          </div>
        </div>
      </div>

      {/* Prayer & Location Calculation */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            সালাত ও হিজরি তারিখ নির্ধারণ পদ্ধতি
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              বাংলাদেশের বিভাগ / জেলা
            </label>
            <select
              value={settings.prayerCity}
              onChange={(e) => handleUpdate({ prayerCity: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              {Object.keys(BANGLADESH_CITIES).map((city) => (
                <option key={city} value={city}>
                  {BANGLADESH_CITIES[city].nameBn} ({city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              আসর সালাতের পদ্ধতি
            </label>
            <select
              value={settings.asrMethod}
              onChange={(e) => handleUpdate({ asrMethod: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="Hanafi">হানাফি (ছায়া দ্বিগুণ - বাংলাদেশ মান)</option>
              <option value="Standard">শাফেয়ী / মালেকী / হাম্বলী (ছায়া একগুণ)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              চাঁদ দেখার হিজরি তারিখ সমন্বয়
            </label>
            <select
              value={settings.hijriOffsetDays}
              onChange={(e) => handleUpdate({ hijriOffsetDays: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value={-1}>-১ দিন (দেরিতে চাঁদ দর্শন)</option>
              <option value={0}>স্বাভাবিক হিসাব (০ দিন)</option>
              <option value={1}>+১ দিন (আগে চাঁদ দর্শন)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Backup, Restore & Data Isolation */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          ডাটা ব্যাকআপ, রিস্টোর ও গোপনীয়তা
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          আপনার সমস্ত আমলনামা, ব্যক্তিগত নোট ও কাজের তালিকা সম্পূর্ণ স্থানীয়ভাবে ডিভাইসে সংরক্ষিত। ক্লাউড পরিবর্তন বা নতুন ফোনে নেওয়ার জন্য JSON ফাইল ব্যাকআপ রাখুন।
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleExportJSON}
            className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
          >
            <Download className="w-4 h-4" />
            ব্যাকআপ ফাইল ডাউনলোড করুন (JSON)
          </button>

          <label className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-100 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            ব্যাকআপ ফাইল রিস্টোর করুন
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>

        {/* Clear Data Danger Zone */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              এই প্রোফাইলের সকল ডাটা মুছে পুনরায় শুরু করুন
            </button>
          ) : (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl space-y-2">
              <p className="text-xs font-bold text-rose-800 dark:text-rose-200">
                আপনি কি নিশ্চিত? এতে সকল আমল ও ব্যক্তিগত নোট মুছে যাবে।
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleClearAllData}
                  className="px-3.5 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
                >
                  হ্যাঁ, ডাটা মুছে ফেলুন
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3.5 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium"
                >
                  বাতিল
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Profile Modal */}
      {showNewProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleCreateProfile} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              নতুন ব্যবহারকারী প্রোফাইল
            </h3>
            <p className="text-xs text-slate-500">
              পরিবারের অন্য সদস্যদের জন্য পৃথক আমলনামা প্রোফাইল তৈরি করতে পারেন।
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                নাম
              </label>
              <input
                type="text"
                autoFocus
                required
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="যেমন: ফাতেমা / আব্দুল্লাহ"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewProfileModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
              >
                প্রোফাইল তৈরি করুন
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
