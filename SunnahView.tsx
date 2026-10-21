import React, { useState, useMemo } from 'react';
import { Sparkles, Check, X, BookOpen, Plus, Edit2, Trash2, Copy, Search } from 'lucide-react';
import { AppSettings, SunnahItem, SunnahRecord } from '../../types';
import { storage } from '../../services/storage';
import { getDhakaDateString, formatBengaliDate, toBengaliDigits } from '../../utils/dateAndNumerals';
import { CustomItemModal } from '../modals/CustomItemModal';

interface SunnahViewProps {
  settings: AppSettings;
}

export const SunnahView: React.FC<SunnahViewProps> = ({ settings }) => {
  const [selectedDate, setSelectedDate] = useState(() => getDhakaDateString());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<SunnahItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const bnNums = settings.useBengaliNumerals;

  const sunnahItems = useMemo(() => storage.getSunnahItems(), [refreshKey]);
  const records = useMemo(() => storage.getSunnahRecords(selectedDate), [selectedDate, refreshKey]);

  const categories = useMemo(() => {
    const set = new Set(sunnahItems.map((s) => s.category));
    return ['all', ...Array.from(set)];
  }, [sunnahItems]);

  const filteredItems = useMemo(() => {
    return sunnahItems.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchQ =
        !searchQuery.trim() ||
        item.titleBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.explanationBn.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQ;
    });
  }, [sunnahItems, selectedCategory, searchQuery]);

  const handleSetStatus = (sunnahId: string, status: 'completed' | 'missed' | 'na') => {
    const existing = records[sunnahId];
    const newRecord: SunnahRecord = {
      date: selectedDate,
      sunnahId,
      status,
      notes: existing?.notes,
    };
    storage.saveSunnahRecord(selectedDate, newRecord);
    setRefreshKey((k) => k + 1);
  };

  const handleUpdateNotes = (sunnahId: string, notes: string) => {
    const existing = records[sunnahId] || {
      date: selectedDate,
      sunnahId,
      status: 'completed',
    };
    storage.saveSunnahRecord(selectedDate, { ...existing, notes });
    setRefreshKey((k) => k + 1);
  };

  const completedCount = useMemo(() => {
    return Object.values(records).filter((r) => r.status === 'completed').length;
  }, [records]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              রাসূলুল্লাহ ﷺ-এর সুন্নাহ ও দৈনন্দিন জীবন
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            সহিহ হাদিস দ্বারা প্রমাণিত প্রাত্যহিক সুন্নাতসমূহ জানা এবং দৈনন্দিন জীবনে বাস্তবায়ন।
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            নতুন সুন্নাহ বা নোট যোগ
          </button>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="flex items-center justify-between p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-950 dark:text-emerald-200">
        <div>
          আজকের সুন্নাহ আমল সম্পন্ন: <span className="font-bold">{toBengaliDigits(completedCount, bnNums)}</span>/{toBengaliDigits(sunnahItems.length, bnNums)}
        </div>
        <div className="text-slate-500 dark:text-slate-400 text-[11px]">
          তারিখ: {formatBengaliDate(selectedDate, bnNums)}
        </div>
      </div>

      {/* Search & Categories */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="সুন্নাহ আমল অনুসন্ধান করুন (যেমন: মেসওয়াক, খাবার, জুমা)..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
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
              {cat === 'all' ? 'সকল বিভাগ' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sunnah Cards List */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const record = records[item.id];
          const status = record?.status;

          return (
            <div
              key={item.id}
              className={`p-5 bg-white dark:bg-slate-900 border rounded-2xl shadow-xs space-y-3 transition-all ${
                status === 'completed'
                  ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {item.titleBn}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-400">
                    উৎস: {item.hadithSource} {item.hadithNumber && `(হাদিস: ${toBengaliDigits(item.hadithNumber, bnNums)})`}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingItem(item);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Arabic Dua & Bengali Meaning */}
              {item.arabicDua && (
                <div className="p-3 bg-emerald-50/30 dark:bg-emerald-950/15 rounded-xl border border-emerald-100/60 dark:border-emerald-900/30 space-y-2">
                  <p className="text-right font-arabic text-base sm:text-lg text-emerald-950 dark:text-emerald-200 leading-loose">
                    {item.arabicDua}
                  </p>
                  {item.bengaliMeaning && (
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white">অর্থ: </span>
                      {item.bengaliMeaning}
                    </p>
                  )}
                </div>
              )}

              {/* How to perform */}
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">ব্যাখ্যা: </span>
                  {item.explanationBn}
                </div>
                {item.howToPerformBn && (
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">আমলের নিয়ম: </span>
                    {item.howToPerformBn}
                  </div>
                )}
              </div>

              {/* Checklist Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-2">
                <span className="text-xs text-slate-500">
                  আজকের সুন্নাহ আমল স্ট্যাটাস:
                </span>

                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => handleSetStatus(item.id, 'completed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      status === 'completed'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    পালন করেছি
                  </button>
                  <button
                    onClick={() => handleSetStatus(item.id, 'missed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      status === 'missed'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    পারিনি
                  </button>
                  <button
                    onClick={() => handleSetStatus(item.id, 'na')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      status === 'na'
                        ? 'bg-slate-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    N/A
                  </button>
                </div>
              </div>

              {/* Notes */}
              <input
                type="text"
                value={record?.notes || ''}
                onChange={(e) => handleUpdateNotes(item.id, e.target.value)}
                placeholder="ব্যক্তিগত অভিজ্ঞতা বা শিক্ষা লিখুন..."
                className="w-full text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
              />
            </div>
          );
        })}
      </div>

      {/* Modal for adding/editing */}
      <CustomItemModal
        isOpen={isModalOpen}
        type="sunnah"
        item={editingItem}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={(t, data) => {
          storage.saveCustomSunnahItem(data);
          setRefreshKey((k) => k + 1);
        }}
        onDelete={(t, id) => {
          storage.deleteSunnahItem(id);
          setRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
};
