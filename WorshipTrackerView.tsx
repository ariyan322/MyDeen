import React, { useState, useMemo } from 'react';
import {
  Check,
  X,
  Minus,
  Plus,
  RotateCcw,
  Edit2,
  Trash2,
  Copy,
  Calendar,
  Sparkles,
  Info,
  Clock,
  BookOpen,
} from 'lucide-react';
import { AppSettings, WorshipItem, WorshipRecord } from '../../types';
import { storage } from '../../services/storage';
import {
  getDhakaDateString,
  formatBengaliDate,
  toBengaliDigits,
} from '../../utils/dateAndNumerals';
import { CustomItemModal, ModalItemType } from '../modals/CustomItemModal';

interface WorshipTrackerViewProps {
  settings: AppSettings;
  onOpenAddItemModal: (type: ModalItemType, item?: any) => void;
}

export const WorshipTrackerView: React.FC<WorshipTrackerViewProps> = ({
  settings,
  onOpenAddItemModal,
}) => {
  const [selectedDate, setSelectedDate] = useState(() => getDhakaDateString());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<WorshipItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTasbihItem, setActiveTasbihItem] = useState<WorshipItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const bnNums = settings.useBengaliNumerals;

  const worshipItems = useMemo(() => {
    return storage.getWorshipItems();
  }, [refreshKey]);

  const worshipRecords = useMemo(() => {
    return storage.getWorshipRecords(selectedDate);
  }, [selectedDate, refreshKey]);

  const categories = [
    { id: 'all', label: 'সবগুলো' },
    { id: 'fard_prayer', label: 'ফরজ সালাত' },
    { id: 'sunnah_nafl', label: 'সুন্নাহ ও নফল' },
    { id: 'quran', label: 'কুরআন তিলাওয়াত' },
    { id: 'dhikr', label: 'জিকির ও তাসবীহ' },
    { id: 'charity_fasting', label: 'দান ও রোজা' },
    { id: 'learning', label: 'দ্বীনি শিক্ষা' },
    { id: 'custom', label: 'ব্যক্তিগত আমল' },
  ];

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return worshipItems;
    return worshipItems.filter((item) => item.category === selectedCategory);
  }, [worshipItems, selectedCategory]);

  const handleSetStatus = (item: WorshipItem, status: 'completed' | 'missed' | 'na') => {
    const existing = worshipRecords[item.id];
    const newRecord: WorshipRecord = {
      date: selectedDate,
      itemId: item.id,
      status,
      count: existing?.count ?? (item.defaultTarget || 1),
      completedAt: status === 'completed' ? new Date().toLocaleTimeString('en-US', { hour12: false }) : undefined,
      notes: existing?.notes,
    };
    storage.saveWorshipRecord(selectedDate, newRecord);
    setRefreshKey((k) => k + 1);
  };

  const handleUpdateCount = (item: WorshipItem, delta: number) => {
    const existing = worshipRecords[item.id];
    const current = existing?.count ?? 0;
    const nextCount = Math.max(0, current + delta);
    const newRecord: WorshipRecord = {
      date: selectedDate,
      itemId: item.id,
      status: nextCount >= (item.defaultTarget || 1) ? 'completed' : existing?.status || 'missed',
      count: nextCount,
      completedAt: nextCount >= (item.defaultTarget || 1) ? new Date().toLocaleTimeString('en-US', { hour12: false }) : existing?.completedAt,
      notes: existing?.notes,
    };
    storage.saveWorshipRecord(selectedDate, newRecord);
    setRefreshKey((k) => k + 1);
  };

  const handleSaveNotes = (item: WorshipItem, notes: string) => {
    const existing = worshipRecords[item.id] || {
      date: selectedDate,
      itemId: item.id,
      status: 'completed',
    };
    storage.saveWorshipRecord(selectedDate, { ...existing, notes });
    setRefreshKey((k) => k + 1);
  };

  const completedCount = useMemo(() => {
    return Object.values(worshipRecords).filter((r) => r.status === 'completed').length;
  }, [worshipRecords]);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            দৈনন্দিন ইবাদত ও আমল
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ফরজ, সুন্নাহ ও নফল আমলসমূহ নিয়মিত ট্র্যাক করুন এবং নিজের জবাবদিহিতা বজায় রাখুন।
          </p>
        </div>

        {/* Date Selector & Add Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
          />
          <button
            onClick={() => setSelectedDate(getDhakaDateString())}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedDate === getDhakaDateString()
                ? 'bg-emerald-600 text-white'
                : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
            }`}
          >
            আজকের দিন
          </button>
          <button
            onClick={() => onOpenAddItemModal('worship')}
            className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            নতুন আমল যোগ
          </button>
        </div>
      </div>

      {/* Progress & Summary Bar */}
      <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-medium">
          <span>তারিখ: {formatBengaliDate(selectedDate, bnNums)}</span>
          <span>·</span>
          <span>মোট সম্পন্ন: {toBengaliDigits(completedCount, bnNums)}/{toBengaliDigits(worshipItems.length, bnNums)}</span>
        </div>
        <div className="text-slate-500 dark:text-slate-400 text-[11px]">
          সবুজ = সম্পন্ন | লাল = বাদ পড়েছে | ধূসর = প্রযোজ্য নয় (N/A)
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Worship Items List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const record = worshipRecords[item.id];
          const status = record?.status;
          const count = record?.count ?? 0;
          const target = item.defaultTarget || 1;

          return (
            <div
              key={item.id}
              className={`p-4 bg-white dark:bg-slate-900 border rounded-2xl transition-all shadow-2xs ${
                status === 'completed'
                  ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : status === 'missed'
                  ? 'border-rose-200 dark:border-rose-900/60'
                  : status === 'na'
                  ? 'border-slate-200 dark:border-slate-800 opacity-60'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Left: Info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      status === 'completed'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.nameBn}
                      </h3>
                      {item.nameAr && (
                        <span className="text-xs font-arabic text-slate-500 dark:text-slate-400">
                          {item.nameAr}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        {item.isObligatory ? 'ফরজ' : 'সুন্নাহ / নফল'}
                      </span>
                      {item.isCustom && (
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                          (ব্যক্তিগত আমল)
                        </span>
                      )}
                    </div>

                    {item.descriptionBn && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.descriptionBn}
                      </p>
                    )}

                    {/* Progress details if target > 1 */}
                    {item.defaultTarget && item.defaultTarget > 1 && (
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                        <span>
                          টার্গেট: {toBengaliDigits(count, bnNums)}/{toBengaliDigits(target, bnNums)} {item.unit || 'বার'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUpdateCount(item, -1)}
                            className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleUpdateCount(item, 1)}
                            className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 flex items-center justify-center hover:bg-emerald-200"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          {item.category === 'dhikr' && (
                            <button
                              onClick={() => setActiveTasbihItem(item)}
                              className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-md text-[11px] font-medium hover:bg-emerald-100"
                            >
                              ডিজিটাল তাসবীহ
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions & Status */}
                <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
                  {/* Status Buttons */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      onClick={() => handleSetStatus(item, 'completed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                        status === 'completed'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      সম্পন্ন
                    </button>
                    <button
                      onClick={() => handleSetStatus(item, 'missed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                        status === 'missed'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      অসম্পূর্ণ
                    </button>
                    <button
                      onClick={() => handleSetStatus(item, 'na')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        status === 'na'
                          ? 'bg-slate-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="আজকের জন্য প্রযোজ্য নয়"
                    >
                      N/A
                    </button>
                  </div>

                  {/* Edit/Duplicate for items */}
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="সম্পাদনা করুন"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Note input toggle */}
              {record?.notes !== undefined && (
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <input
                    type="text"
                    value={record.notes || ''}
                    onChange={(e) => handleSaveNotes(item, e.target.value)}
                    placeholder="ব্যক্তিগত মন্তব্য লিখুন (যেমন: জামাতে আদায় করেছি)..."
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden text-slate-800 dark:text-slate-200"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Digital Tasbih Modal */}
      {activeTasbihItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ডিজিটাল তাসবীহ
              </h3>
              <button
                onClick={() => setActiveTasbihItem(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h4 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                {activeTasbihItem.nameBn}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                টার্গেট: {toBengaliDigits(activeTasbihItem.defaultTarget || 100, bnNums)} বার
              </p>
            </div>

            {/* Huge Clicker Circle */}
            <button
              onClick={() => {
                handleUpdateCount(activeTasbihItem, 1);
                // Vibrate feedback if supported
                if ('vibrate' in navigator) navigator.vibrate(25);
              }}
              className="w-44 h-44 rounded-full mx-auto bg-gradient-to-b from-emerald-600 to-emerald-800 text-white flex flex-col items-center justify-center shadow-xl active:scale-95 transition-transform cursor-pointer select-none"
            >
              <span className="text-4xl font-bold font-mono">
                {toBengaliDigits(worshipRecords[activeTasbihItem.id]?.count ?? 0, bnNums)}
              </span>
              <span className="text-xs uppercase tracking-wider text-emerald-200 mt-1 font-semibold">
                ট্যাপ করুন
              </span>
            </button>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  const item = activeTasbihItem;
                  const rec = worshipRecords[item.id] || { date: selectedDate, itemId: item.id, status: 'missed' };
                  storage.saveWorshipRecord(selectedDate, { ...rec, count: 0 });
                  setRefreshKey((k) => k + 1);
                }}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                রিসেট (০)
              </button>
              <button
                onClick={() => {
                  handleSetStatus(activeTasbihItem, 'completed');
                  setActiveTasbihItem(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              >
                সম্পন্ন হিসেবে মার্ক করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Modal */}
      <CustomItemModal
        isOpen={isModalOpen}
        type="worship"
        item={editingItem}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={(t, data) => {
          storage.saveCustomWorshipItem(data);
          setRefreshKey((k) => k + 1);
        }}
        onDelete={(t, id) => {
          storage.deleteWorshipItem(id);
          setRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
};
