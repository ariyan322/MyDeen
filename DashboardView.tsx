import React, { useState, useMemo } from 'react';
import {
  Sun,
  Moon,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  BookOpen,
  Calendar,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Settings2,
  FileEdit,
  Bell,
  SlidersHorizontal,
  Bookmark,
  Check,
  Heart,
} from 'lucide-react';
import { AppSettings, UserProfile, WorshipItem, WorshipRecord } from '../../types';
import { storage } from '../../services/storage';
import {
  getDhakaDateString,
  formatBengaliDate,
  getHijriDate,
  calculatePrayerTimes,
  toBengaliDigits,
} from '../../utils/dateAndNumerals';
import { ModalItemType } from '../modals/CustomItemModal';

interface DashboardViewProps {
  settings: AppSettings;
  currentProfile: UserProfile;
  onNavigate: (view: string, id?: string) => void;
  onOpenAddItemModal: (type: ModalItemType) => void;
  onUpdateSettings: (settings: AppSettings) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  settings,
  currentProfile,
  onNavigate,
  onOpenAddItemModal,
  onUpdateSettings,
}) => {
  const [selectedDate, setSelectedDate] = useState(() => getDhakaDateString());
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const bnNums = settings.useBengaliNumerals;

  // Prayer times
  const prayerTimes = useMemo(() => {
    return calculatePrayerTimes(selectedDate, settings.prayerCity, settings.asrMethod);
  }, [selectedDate, settings.prayerCity, settings.asrMethod]);

  // Hijri date
  const hijri = useMemo(() => {
    return getHijriDate(selectedDate, settings.hijriOffsetDays);
  }, [selectedDate, settings.hijriOffsetDays]);

  // Worship items & records
  const worshipItems = useMemo(() => {
    return storage.getWorshipItems();
  }, [refreshKey]);

  const worshipRecords = useMemo(() => {
    return storage.getWorshipRecords(selectedDate);
  }, [selectedDate, refreshKey]);

  // Tasks & Goals
  const tasks = useMemo(() => storage.getTasks(), [refreshKey]);
  const goals = useMemo(() => storage.getGoals(), [refreshKey]);
  const commands = useMemo(() => storage.getQuranCommands(), [refreshKey]);
  const cmdRecords = useMemo(() => storage.getQuranCommandRecords(selectedDate), [selectedDate, refreshKey]);
  const sunnahItems = useMemo(() => storage.getSunnahItems(), [refreshKey]);
  const sunnahRecords = useMemo(() => storage.getSunnahRecords(selectedDate), [selectedDate, refreshKey]);
  const tadabburEntries = useMemo(() => storage.getTadabburEntries(), [refreshKey]);
  const muhasabahEntries = useMemo(() => storage.getMuhasabahEntries(), [refreshKey]);
  const todayMuhasabah = useMemo(() => {
    return muhasabahEntries.find((m) => m.date === selectedDate) || muhasabahEntries[0] || null;
  }, [muhasabahEntries, selectedDate]);

  // Completion stats for daily worship
  const completedCount = useMemo(() => {
    return Object.values(worshipRecords).filter((r) => r.status === 'completed').length;
  }, [worshipRecords]);

  const totalWorshipItems = worshipItems.length;
  const progressPercent = totalWorshipItems > 0 ? Math.round((completedCount / totalWorshipItems) * 100) : 0;

  const handleToggleWorship = (item: WorshipItem) => {
    const existing = worshipRecords[item.id];
    let nextStatus: WorshipRecord['status'] = 'completed';

    if (existing?.status === 'completed') {
      nextStatus = 'missed';
    } else if (existing?.status === 'missed') {
      nextStatus = 'na';
    } else if (existing?.status === 'na') {
      nextStatus = 'completed';
    }

    const newRecord: WorshipRecord = {
      date: selectedDate,
      itemId: item.id,
      status: nextStatus,
      completedAt: nextStatus === 'completed' ? new Date().toLocaleTimeString('en-US', { hour12: false }) : undefined,
      count: item.defaultTarget || 1,
    };

    storage.saveWorshipRecord(selectedDate, newRecord);
    setRefreshKey((k) => k + 1);
  };

  const handleToggleTask = (task: any) => {
    const updated = {
      ...task,
      isCompleted: !task.isCompleted,
      completedAt: !task.isCompleted ? new Date().toISOString() : undefined,
    };
    storage.saveTask(updated);
    setRefreshKey((k) => k + 1);
  };

  const handleDateChange = (daysOffset: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + daysOffset);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Date & Location Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-400 font-medium">
            <span>{toBengaliDigits(hijri.day, bnNums)} {hijri.monthNameBn} {toBengaliDigits(hijri.year, bnNums)} হিজরি</span>
            <span>·</span>
            <span>{settings.prayerCity} (বাংলাদেশ)</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {formatBengaliDate(selectedDate, bnNums)}
          </h2>
        </div>

        {/* Date Controls */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => handleDateChange(-1)}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            ← আগের দিন
          </button>
          <button
            onClick={() => setSelectedDate(getDhakaDateString())}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedDate === getDhakaDateString()
                ? 'bg-emerald-600 text-white'
                : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            আজ
          </button>
          <button
            onClick={() => handleDateChange(1)}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            পরের দিন →
          </button>
        </div>
      </div>

      {/* Hero Welcome Banner */}
      {settings.visibleDashboardSections.hero && (
        <div className="relative rounded-2xl overflow-hidden border border-emerald-900/20 dark:border-emerald-700/30 shadow-md">
          <div className="h-44 sm:h-52 w-full relative">
            <img
              src="/src/assets/images/hero_islamic_dawn_1792555756583.jpg"
              alt="Islamic Courtyard at Dawn"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {/* Scrim for contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-950/75 to-transparent flex flex-col justify-center px-6 sm:px-8 text-white">
              <span className="text-xs font-medium tracking-wide text-emerald-300 uppercase">
                দৈনন্দিন দ্বীনি জীবন
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1 max-w-lg">
                আসসালামু আলাইকুম!
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-md mt-1.5 leading-relaxed">
                আজকের দিনটি কুরআন ও সুন্নাহর আলোকে সুন্দরভাবে কাটানোর চেষ্টা করুন।
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => onNavigate('worship')}
                  className="px-3.5 py-1.5 text-xs font-medium bg-white text-emerald-900 rounded-lg shadow-sm hover:bg-emerald-50 transition-colors"
                >
                  আজকের আমল পূরণ করুন
                </button>
                <button
                  onClick={() => onNavigate('quran')}
                  className="px-3.5 py-1.5 text-xs font-medium bg-emerald-900/80 text-white border border-emerald-500/30 rounded-lg hover:bg-emerald-800 transition-colors"
                >
                  কুরআন তিলাওয়াত
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {[
          { label: 'নতুন আমল যোগ', action: () => onOpenAddItemModal('worship'), icon: Plus },
          { label: 'নতুন তাদাব্বুর', action: () => onNavigate('tadabbur_new'), icon: BookOpen },
          { label: 'আত্মপর্যালোচনা', action: () => onNavigate('reflection_new'), icon: Sparkles },
          { label: 'নতুন কাজ যোগ', action: () => onOpenAddItemModal('task'), icon: Plus },
          { label: 'নতুন নোট লিখুন', action: () => onOpenAddItemModal('note'), icon: FileEdit },
          { label: 'নিজের হিসাব দেখুন', action: () => onNavigate('reports'), icon: TrendingUp },
        ].map((btn, i) => {
          const Icon = btn.icon;
          return (
            <button
              key={i}
              onClick={btn.action}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl text-left transition-all group flex items-center gap-2.5 shadow-2xs hover:shadow-xs"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                {btn.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Prayer Times Strip */}
      {settings.visibleDashboardSections.prayerTimes && (
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                আজকের সালাতের সময়সূচি ({settings.prayerCity})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('settings')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              স্থান বা পদ্ধতি পরিবর্তন
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { name: 'ফজর', time: prayerTimes.fajr, icon: Sun },
              { name: 'সূর্যোদয়', time: prayerTimes.sunrise, icon: Sun },
              { name: 'যোহর', time: prayerTimes.dhuhr, icon: Sun },
              { name: 'আসর', time: prayerTimes.asr, icon: Sun },
              { name: 'মাগরিব', time: prayerTimes.maghrib, icon: Moon },
              { name: 'ইশা', time: prayerTimes.isha, icon: Moon },
            ].map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center"
                >
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {p.name}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
                    {toBengaliDigits(p.time, bnNums)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Worship Checklist & Quick Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Daily Worship Tracker & Commands */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Worship Quick Checklist */}
          {settings.visibleDashboardSections.worshipTracker && (
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    দৈনন্দিন ইবাদত ও আমল
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{toBengaliDigits(completedCount, bnNums)}/{toBengaliDigits(totalWorshipItems, bnNums)} সম্পন্ন</span>
                    <span>·</span>
                    <span>{toBengaliDigits(progressPercent, bnNums)}% অগ্রগতি</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenAddItemModal('worship')}
                    className="p-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>নতুন আমল</span>
                  </button>
                  <button
                    onClick={() => onNavigate('worship')}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="সম্পূর্ণ পেইজ দেখুন"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Quick Tap Rows (Top 8 items) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {worshipItems.slice(0, 8).map((item) => {
                  const record = worshipRecords[item.id];
                  const isCompleted = record?.status === 'completed';
                  const isNa = record?.status === 'na';

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleWorship(item)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                          : isNa
                          ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                          : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : isNa
                              ? 'bg-slate-300 dark:bg-slate-700 text-slate-600'
                              : 'border border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                          }`}
                        >
                          {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : isNa ? '—' : null}
                        </button>
                        <div className="min-w-0">
                          <div className={`text-xs font-semibold truncate ${
                            isCompleted ? 'text-emerald-950 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-200'
                          }`}>
                            {item.nameBn}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {item.isObligatory ? 'ফরজ' : 'সুন্নাহ / নফল'} · {toBengaliDigits(item.defaultTarget || 1, bnNums)} {item.unit || 'বার'}
                          </div>
                        </div>
                      </div>

                      {record?.completedAt && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                          {toBengaliDigits(record.completedAt.slice(0, 5), bnNums)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => onNavigate('worship')}
                  className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  সকল {toBengaliDigits(worshipItems.length, bnNums)}টি আমল এবং ডিজিটাল তাসবীহ দেখুন →
                </button>
              </div>
            </div>
          )}

          {/* Quranic Commands Tracker Highlight */}
          {settings.visibleDashboardSections.commandsReflection && (
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    আল্লাহর আদেশ: আমি কতটা পালন করছি?
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('commands')}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  সবগুলো দেখুন
                </button>
              </div>

              {commands.slice(0, 2).map((cmd) => {
                const rec = cmdRecords[cmd.id];
                return (
                  <div
                    key={cmd.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {cmd.titleBn}
                      </h4>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        {cmd.surahName} ({cmd.ayahNumber})
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      "{cmd.bengaliVerse}"
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500 italic">
                        {cmd.reflectionQuestion}
                      </span>
                      <button
                        onClick={() => onNavigate('commands', cmd.id)}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                      >
                        {rec?.status === 'tried_or_fulfilled' ? 'পালিত ✓' : 'যাচাই করুন'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Prohibitions Card */}
          {settings.visibleDashboardSections.prohibitedChecklist && (
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    আল্লাহ যা নিষেধ করেছেন: নিজেকে যাচাই করি
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('prohibitions')}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  আত্মশুদ্ধি পেইজ
                </button>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                শিরক, মিথ্যা, গীবত, অপবাদ, সুদ ও অহংকার পরিহার করে নিজের অন্তরকে পরিচ্ছন্ন রাখুন।
              </p>
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                <span className="text-xs text-amber-900 dark:text-amber-200 font-medium">
                  আজকের আত্মশুদ্ধি ও তাওবার হিসাব সম্পূর্ণ করেছেন?
                </span>
                <button
                  onClick={() => onNavigate('prohibitions')}
                  className="px-3 py-1.5 text-xs font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  যাচাই শুরু করুন
                </button>
              </div>
            </div>
          )}

          {/* Quranic Verse Tadabbur Card */}
          {settings.visibleDashboardSections.tadabbur && (
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      📖 কুরআনের আয়াত নিয়ে তাদাব্বুর
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    আয়াত পড়ি, অর্থ বুঝি, চিন্তা করি এবং শিক্ষা লিখে রাখি।
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('tadabbur_new')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  + নতুন তাদাব্বুর যোগ করুন
                </button>
              </div>

              {/* Gentle clarification */}
              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/60 dark:border-emerald-900/40 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
                <Heart className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-emerald-950 dark:text-emerald-200">
                    ব্যক্তিগত তাদাব্বুর — এটি আনুষ্ঠানিক তাফসীর নয়।
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    কুরআনের সাথে ব্যক্তিগত সম্পর্ক গড়া, আত্মসমালোচনা ও জীবনে আমল করার সংকল্প।
                  </p>
                </div>
              </div>

              {/* Recent Tadabbur items */}
              {tadabburEntries.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  এখনও কোনো তাদাব্বুর এন্ট্রি যোগ করা হয়নি।
                </div>
              ) : (
                <div className="space-y-3">
                  {tadabburEntries.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onNavigate('tadabbur')}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 cursor-pointer hover:border-emerald-500/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </span>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium shrink-0">
                          সূরা {item.surahName} ({toBengaliDigits(item.verseNumber, bnNums)})
                        </span>
                      </div>

                      {item.arabicVerse && (
                        <p dir="rtl" className="text-right font-arabic text-sm text-slate-800 dark:text-slate-200 line-clamp-1">
                          {item.arabicVerse}
                        </p>
                      )}

                      {item.bengaliTranslation && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2">
                          "{item.bengaliTranslation}"
                        </p>
                      )}

                      {item.coreLessons && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          <strong className="text-emerald-800 dark:text-emerald-300 font-semibold">মূল শিক্ষা:</strong> {item.coreLessons}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-200/60 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                          বিস্তারিত পড়ুন →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-center pt-1">
                <button
                  onClick={() => onNavigate('tadabbur')}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  সকল তাদাব্বুর অধ্যয়ন ও নোট দেখুন ({toBengaliDigits(tadabburEntries.length, bnNums)}) →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Tasks, Goals & Daily Reflection */}
        <div className="space-y-6">
          {/* Today's Tasks */}
          {settings.visibleDashboardSections.tasks && (
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    আজকের কাজের তালিকা
                  </h3>
                </div>
                <button
                  onClick={() => onOpenAddItemModal('task')}
                  className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-md"
                  title="নতুন কাজ"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {tasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  আজ কোনো কাজ নেই। নতুন কাজ যোগ করতে "+" চাপুন।
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task)}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                        task.isCompleted
                          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                      }`}
                    >
                      <button
                        type="button"
                        className={`w-4 h-4 rounded-sm flex items-center justify-center shrink-0 mt-0.5 ${
                          task.isCompleted ? 'bg-emerald-600 text-white' : 'border border-slate-400'
                        }`}
                      >
                        {task.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium truncate ${
                          task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                        }`}>
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{task.category}</span>
                          {task.dueTime && <span>· {toBengaliDigits(task.dueTime, bnNums)}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-center pt-1">
                <button
                  onClick={() => onNavigate('tasks')}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  সকল কাজ পরিচালনা করুন →
                </button>
              </div>
            </div>
          )}

          {/* Active Goals */}
          {settings.visibleDashboardSections.goals && (
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  দ্বীনি লক্ষ্য (Goals)
                </h3>
                <button
                  onClick={() => onNavigate('goals')}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  বিস্তারিত
                </button>
              </div>

              {goals.slice(0, 2).map((goal) => {
                const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                return (
                  <div
                    key={goal.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        {goal.title}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-600">
                        {toBengaliDigits(goal.currentValue, bnNums)}/{toBengaliDigits(goal.targetValue, bnNums)} {goal.unit}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Enhanced Daily Muhasabah Section */}
          {settings.visibleDashboardSections.reflection && (
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    দৈনিক আত্মপর্যালোচনা (Muhasabah)
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('reflection_new')}
                  className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shrink-0"
                >
                  + নতুন আত্মপর্যালোচনা যোগ করুন
                </button>
              </div>

              {/* Gentle Message */}
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/25 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-950 dark:text-emerald-200 space-y-1">
                <p className="font-semibold leading-relaxed">
                  "নিজেকে সংশোধনের চেষ্টা করুন। ভুল হলে হতাশ না হয়ে আন্তরিক তাওবা করুন এবং আগামীকাল আরও ভালো করার চেষ্টা করুন।"
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  ব্যক্তিগত ও গোপন হিসাব · কোনো ধর্মীয় স্কোর বা তুলনা করা হয় না
                </p>
              </div>

              {/* Today's or recent reflection preview */}
              {todayMuhasabah ? (
                <div
                  onClick={() => onNavigate('reflection')}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 cursor-pointer hover:border-emerald-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {todayMuhasabah.title}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatBengaliDate(todayMuhasabah.date, bnNums)}
                    </span>
                  </div>

                  {todayMuhasabah.goodDeeds && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      <span className="font-medium text-emerald-700 dark:text-emerald-300">আজকের ভালো কাজ: </span>
                      {todayMuhasabah.goodDeeds}
                    </div>
                  )}

                  {todayMuhasabah.gratitudeItems && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                      <span className="font-medium text-amber-700 dark:text-amber-300">আজকের কৃতজ্ঞতা: </span>
                      {todayMuhasabah.gratitudeItems}
                    </div>
                  )}

                  {todayMuhasabah.tomorrowImprovements && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                      <span className="font-medium text-emerald-700 dark:text-emerald-300">আগামীকাল যা উন্নতি করতে চাই: </span>
                      {todayMuhasabah.tomorrowImprovements}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">ইতিমধ্যেই সংরক্ষিত</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">সম্পাদনা / বিস্তারিত →</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2.5">
                  <p className="text-xs text-slate-500">
                    আজকের আত্মপর্যালোচনা এখনও লেখা হয়নি। দিনের শেষে ৫ মিনিট নিজের হিসাব নিন।
                  </p>
                  <button
                    onClick={() => onNavigate('reflection_new')}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                  >
                    + আজকের আত্মপর্যালোচনা লিখুন
                  </button>
                </div>
              )}

              <div className="text-center pt-1">
                <button
                  onClick={() => onNavigate('reflection')}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  পূর্ববর্তী সকল আত্মপর্যালোচনা ও ইতিহাস দেখুন ({toBengaliDigits(muhasabahEntries.length, bnNums)}) →
                </button>
              </div>
            </div>
          )}

          {/* Customize Dashboard Button */}
          <div className="text-center pt-2">
            <button
              onClick={() => setShowCustomizeModal(true)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 flex items-center justify-center gap-1.5 mx-auto"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              ড্যাশবোর্ডের সেকশন কাস্টমাইজ করুন
            </button>
          </div>
        </div>
      </div>

      {/* Customize Sections Modal */}
      {showCustomizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              ড্যাশবোর্ড সেকশন প্রদর্শন সেটিংস
            </h3>
            <p className="text-xs text-slate-500">
              যে সেকশনগুলো হোমস্ক্রিনে দেখতে চান সেগুলো চালু রাখুন।
            </p>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
              {[
                { key: 'hero', label: 'স্বাগতম ব্যানার ও দোয়া' },
                { key: 'prayerTimes', label: 'সালাতের সময়সূচি বার' },
                { key: 'worshipTracker', label: 'দৈনন্দিন ইবাদত ট্র্যাকার' },
                { key: 'tadabbur', label: '📖 কুরআনের আয়াত নিয়ে তাদাব্বুর' },
                { key: 'commandsReflection', label: 'আল্লাহর আদেশ সেকশন' },
                { key: 'prohibitedChecklist', label: 'নিষিদ্ধ কাজ ও আত্মশুদ্ধি' },
                { key: 'tasks', label: 'কাজের তালিকা' },
                { key: 'goals', label: 'দ্বীনি লক্ষ্য (Goals)' },
                { key: 'reflection', label: 'দৈনিক আত্মপর্যালোচনা কার্ড' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                >
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    {item.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={(settings.visibleDashboardSections as any)[item.key]}
                    onChange={(e) => {
                      const updated = {
                        ...settings,
                        visibleDashboardSections: {
                          ...settings.visibleDashboardSections,
                          [item.key]: e.target.checked,
                        },
                      };
                      onUpdateSettings(updated);
                      storage.saveSettings(updated);
                    }}
                    className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                  />
                </label>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
              >
                সম্পন্ন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
