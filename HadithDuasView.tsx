import React, { useState, useMemo } from 'react';
import { HeartHandshake, Search, Volume2, Copy, Check, RotateCcw, Plus, Sparkles, BookOpen } from 'lucide-react';
import { AppSettings, DuaItem } from '../../types';
import { VERIFIED_DUAS } from '../../data/verifiedContent';
import { toBengaliDigits } from '../../utils/dateAndNumerals';

interface HadithDuasViewProps {
  settings: AppSettings;
}

export const HadithDuasView: React.FC<HadithDuasViewProps> = ({ settings }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [duaCounts, setDuaCounts] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const bnNums = settings.useBengaliNumerals;

  const categories = useMemo(() => {
    const set = new Set(VERIFIED_DUAS.map((d) => d.category));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredDuas = useMemo(() => {
    return VERIFIED_DUAS.filter((d) => {
      const matchCat = selectedCategory === 'all' || d.category === selectedCategory;
      const matchQ =
        !searchQuery.trim() ||
        d.titleBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.bengaliMeaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.bengaliPronunciation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQ;
    });
  }, [selectedCategory, searchQuery]);

  const handleIncrement = (duaId: string) => {
    setDuaCounts((prev) => ({
      ...prev,
      [duaId]: (prev[duaId] || 0) + 1,
    }));
    if ('vibrate' in navigator) navigator.vibrate(20);
  };

  const handleReset = (duaId: string) => {
    setDuaCounts((prev) => ({
      ...prev,
      [duaId]: 0,
    }));
  };

  const handleCopy = (dua: DuaItem) => {
    const text = `${dua.titleBn}\n\n${dua.arabicText}\n\nউচ্চারণ: ${dua.bengaliPronunciation}\n\nঅর্থ: ${dua.bengaliMeaning}\n\nসূত্র: ${dua.source}`;
    navigator.clipboard.writeText(text);
    setCopiedId(dua.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-emerald-600" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            হাদিস ও দৈনন্দিন মাসনুন দোয়া
          </h1>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          সহিহ হাদিসে বর্ণিত সকাল-সন্ধ্যা, বিপদ-আপদ ও প্রাত্যহিক জীবনের প্রয়োজনীয় দোয়া ও তাসবীহ।
        </p>
      </div>

      {/* Search & Categories */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="দোয়া অনুসন্ধান করুন (যেমন: সাইয়েদুল ইস্তিগফার, নিরাপত্তা, আয়াতুল কুরসি)..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'সকল দোয়া' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Duas List */}
      <div className="space-y-4">
        {filteredDuas.map((dua) => {
          const currentCount = duaCounts[dua.id] || 0;
          const target = dua.targetCount || 1;
          const isFinished = currentCount >= target && target > 1;

          return (
            <div
              key={dua.id}
              className={`p-5 bg-white dark:bg-slate-900 border rounded-2xl shadow-xs space-y-4 transition-all ${
                isFinished
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/15'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                      {dua.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {dua.titleBn}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    উৎস: {dua.source}
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(dua)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="কপি করুন"
                >
                  {copiedId === dua.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Arabic Text */}
              <div
                dir="rtl"
                className="p-4 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-xl border border-emerald-100/60 dark:border-emerald-900/40 text-right font-arabic text-lg sm:text-xl text-emerald-950 dark:text-emerald-200 leading-loose"
              >
                {dua.arabicText}
              </div>

              {/* Bengali Pronunciation */}
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">উচ্চারণ: </span>
                  {dua.bengaliPronunciation}
                </div>
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">অর্থ: </span>
                  {dua.bengaliMeaning}
                </div>
              </div>

              {/* Virtue / Fazilat */}
              {dua.virtueBn && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-500 leading-relaxed border border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300">ফজিলত: </span>
                  {dua.virtueBn}
                </div>
              )}

              {/* Interactive Tasbih Counter */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    টার্গেট: {toBengaliDigits(target, bnNums)} বার
                  </span>
                  {currentCount > 0 && (
                    <button
                      onClick={() => handleReset(dua.id)}
                      className="p-1 text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1"
                      title="পুনরায় শুরু"
                    >
                      <RotateCcw className="w-3 h-3" />
                      রিসেট
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleIncrement(dua.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs active:scale-95 transition-all ${
                    isFinished
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-emerald-700 text-white hover:bg-emerald-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>পাঠ গণনা ({toBengaliDigits(currentCount, bnNums)})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
