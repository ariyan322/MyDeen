import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Calendar, CheckCircle, Clock, BookOpen, Sparkles, AlertCircle, Info } from 'lucide-react';
import { AppSettings, WorshipItem } from '../../types';
import { storage } from '../../services/storage';
import { getDhakaDateString, toBengaliDigits, formatBengaliDate } from '../../utils/dateAndNumerals';

interface ReportsViewProps {
  settings: AppSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ settings }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const bnNums = settings.useBengaliNumerals;
  const todayStr = getDhakaDateString();

  // Generate list of dates for the range
  const dates = useMemo(() => {
    const list: string[] = [];
    const count = timeRange === 'week' ? 7 : 30;
    const [y, m, d] = todayStr.split('-').map(Number);
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(y, m - 1, d);
      date.setDate(date.getDate() - i);
      list.push(date.toISOString().split('T')[0]);
    }
    return list;
  }, [timeRange, todayStr]);

  // Aggregate data for each day
  const reportsData = useMemo(() => {
    const worshipItems = storage.getWorshipItems();
    const fardPrayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

    let totalCompletedPrayers = 0;
    let totalPossiblePrayers = dates.length * 5;
    let totalDhikrCount = 0;
    let daysWithQuran = 0;

    const dailyBreakdowns = dates.map((dateStr) => {
      const records = storage.getWorshipRecords(dateStr);
      let completedFard = 0;
      let dayDhikr = 0;
      let readQuran = false;

      fardPrayers.forEach((pId) => {
        if (records[pId]?.status === 'completed') {
          completedFard++;
        }
      });

      Object.values(records).forEach((r) => {
        if (r.itemId === 'quran_recitation' && r.status === 'completed') {
          readQuran = true;
        }
        if (['istighfar', 'salawat', 'morning_adhkar', 'evening_adhkar'].includes(r.itemId)) {
          dayDhikr += r.count || (r.status === 'completed' ? 100 : 0);
        }
      });

      totalCompletedPrayers += completedFard;
      totalDhikrCount += dayDhikr;
      if (readQuran) daysWithQuran++;

      const [, , dayNum] = dateStr.split('-');
      return {
        date: dateStr,
        dayLabel: toBengaliDigits(dayNum, bnNums),
        completedFard,
        readQuran,
        dayDhikr,
      };
    });

    const tasks = storage.getTasks();
    const completedTasks = tasks.filter((t) => t.isCompleted).length;

    return {
      dailyBreakdowns,
      totalCompletedPrayers,
      totalPossiblePrayers,
      prayerPercentage: totalPossiblePrayers > 0 ? Math.round((totalCompletedPrayers / totalPossiblePrayers) * 100) : 0,
      totalDhikrCount,
      daysWithQuran,
      completedTasks,
      totalTasks: tasks.length,
    };
  }, [dates, bnNums]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              অগ্রগতি রিপোর্ট ও আমলনামা
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            সালাত, কুরআন, জিকির ও সুন্নাহর ধারাবাহিকতা পর্যবেক্ষণের ব্যক্তিগত চিত্র।
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeRange === 'week'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            বিগত ৭ দিন
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeRange === 'month'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            বিগত ৩০ দিন
          </button>
        </div>
      </div>

      {/* Non-judgmental Notice */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>উদ্দেশ্য:</strong> এই পরিসংখ্যান কোনো ধর্মীয় মান বা তাকওয়ার পরিমাপক নয়। এটি কেবল আপনাকে আরও ধারাবাহিক হতে ও নিজের ঘাটতিগুলো কাটিয়ে উঠতে সাহায্য করবে।
        </p>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-500">ফরজ সালাত ধারাবাহিকতা</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {toBengaliDigits(reportsData.prayerPercentage, bnNums)}%
          </div>
          <div className="text-[10px] text-slate-400">
            {toBengaliDigits(reportsData.totalCompletedPrayers, bnNums)}/{toBengaliDigits(reportsData.totalPossiblePrayers, bnNums)} ওয়াক্ত
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-500">কুরআন তিলাওয়াত দিবস</div>
          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 font-mono">
            {toBengaliDigits(reportsData.daysWithQuran, bnNums)} দিন
          </div>
          <div className="text-[10px] text-slate-400">
            {timeRange === 'week' ? '৭ দিনের মধ্যে' : '৩০ দিনের মধ্যে'}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-500">মোট জিকির ও তাসবীহ</div>
          <div className="text-xl font-bold text-amber-600 font-mono">
            {toBengaliDigits(reportsData.totalDhikrCount, bnNums)}
          </div>
          <div className="text-[10px] text-slate-400">বার পাঠ</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-500">সম্পন্ন কাজের সংখ্যা</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
            {toBengaliDigits(reportsData.completedTasks, bnNums)}/{toBengaliDigits(reportsData.totalTasks, bnNums)}
          </div>
          <div className="text-[10px] text-slate-400">কাজ শেষ হয়েছে</div>
        </div>
      </div>

      {/* 5 Daily Prayers Consistency Chart */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            পাঁচ ওয়াক্ত ফরজ সালাতের হিসাব (প্রতিদিন সর্বোচ্চ ৫ ওয়াক্ত)
          </h3>
          <span className="text-xs text-slate-400">
            সবুজ বার = সম্পন্ন ওয়াক্ত
          </span>
        </div>

        <div className="h-44 flex items-end justify-between gap-1 sm:gap-3 pt-6 border-b border-slate-100 dark:border-slate-800 px-2">
          {reportsData.dailyBreakdowns.map((d) => {
            const heightPercent = (d.completedFard / 5) * 100;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {toBengaliDigits(d.completedFard, bnNums)}
                </div>
                <div className="w-full max-w-[28px] bg-slate-100 dark:bg-slate-800 rounded-t-md h-full flex items-end overflow-hidden">
                  <div
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      d.completedFard === 5
                        ? 'bg-emerald-600'
                        : d.completedFard >= 3
                        ? 'bg-emerald-500'
                        : d.completedFard > 0
                        ? 'bg-amber-500'
                        : 'bg-transparent'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {d.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
