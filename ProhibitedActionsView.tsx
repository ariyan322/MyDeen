import React, { useState, useMemo } from 'react';
import { ShieldAlert, Check, AlertCircle, HelpCircle, Heart, Plus, Edit2, Info } from 'lucide-react';
import { AppSettings, ProhibitedAction, ProhibitedRecord, ProhibitedActionStatus } from '../../types';
import { storage } from '../../services/storage';
import { getDhakaDateString, formatBengaliDate, toBengaliDigits } from '../../utils/dateAndNumerals';
import { CustomItemModal } from '../modals/CustomItemModal';

interface ProhibitedActionsViewProps {
  settings: AppSettings;
}

export const ProhibitedActionsView: React.FC<ProhibitedActionsViewProps> = ({ settings }) => {
  const [selectedDate, setSelectedDate] = useState(() => getDhakaDateString());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<ProhibitedAction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [compassionModalData, setCompassionModalData] = useState<ProhibitedAction | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const bnNums = settings.useBengaliNumerals;

  const prohibitions = useMemo(() => storage.getProhibitedActions(), [refreshKey]);
  const records = useMemo(() => storage.getProhibitedRecords(selectedDate), [selectedDate, refreshKey]);

  const categories = useMemo(() => {
    const set = new Set(prohibitions.map((p) => p.category));
    return ['all', ...Array.from(set)];
  }, [prohibitions]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return prohibitions;
    return prohibitions.filter((p) => p.category === selectedCategory);
  }, [prohibitions, selectedCategory]);

  const handleSetStatus = (action: ProhibitedAction, status: ProhibitedActionStatus) => {
    const existing = records[action.id];
    const newRecord: ProhibitedRecord = {
      date: selectedDate,
      prohibitionId: action.id,
      status,
      notes: existing?.notes,
    };
    storage.saveProhibitedRecord(selectedDate, newRecord);
    setRefreshKey((k) => k + 1);

    if (status === 'mistake_made') {
      setCompassionModalData(action);
    }
  };

  const handleUpdateNotes = (actionId: string, notes: string) => {
    const existing = records[actionId] || {
      date: selectedDate,
      prohibitionId: actionId,
      status: 'abstained',
    };
    storage.saveProhibitedRecord(selectedDate, { ...existing, notes });
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              আল্লাহ যা নিষেধ করেছেন: নিজেকে যাচাই করি
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            পাপ ও কবিরা গুনাহ থেকে বিরত থাকার ব্যক্তিগত আত্মশুদ্ধি ও তাওবার নিরীক্ষণ।
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
            নতুন ক্ষেত্র যোগ
          </button>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-2xl text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-emerald-900 dark:text-emerald-200">
            গোপনীয়তা ও অনুশোচনার নীতি:
          </p>
          <p className="mt-0.5 text-slate-500 dark:text-slate-400 leading-relaxed">
            এই হিসাব সম্পূর্ণ আপনার ও আল্লাহর মাঝে ব্যক্তিগত। এখানে কোনো র‍্যাঙ্কিং বা স্কোর নেই। ভুল হলে হতাশ না হয়ে একনিষ্ঠ তাওবা ও সংশোধনই মূল উদ্দেশ্য।
          </p>
        </div>
      </div>

      {/* Category Tabs */}
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
            {cat === 'all' ? 'সবগুলো' : cat}
          </button>
        ))}
      </div>

      {/* Prohibitions List */}
      <div className="space-y-4">
        {filteredItems.map((action) => {
          const record = records[action.id];
          const status = record?.status;

          return (
            <div
              key={action.id}
              className={`p-5 bg-white dark:bg-slate-900 border rounded-2xl shadow-xs space-y-3.5 transition-all ${
                status === 'mistake_made'
                  ? 'border-amber-300 dark:border-amber-800/80'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
                      {action.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {action.titleBn}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingItem(action);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quran/Hadith Proof */}
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                {action.quranProof && (
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">কুরআনের দলিল: </span>
                    {action.quranProof}
                  </div>
                )}
                {action.hadithProof && (
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">হাদিসের দলিল: </span>
                    {action.hadithProof}
                  </div>
                )}
                <p className="mt-1 text-slate-500">
                  {action.explanationBn}
                </p>
              </div>

              {/* Gentle Reflection Question */}
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                <span className="text-slate-400">পর্যালোচনা: </span>
                {action.reflectionQuestion}
              </div>

              {/* Status Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {[
                  {
                    id: 'abstained',
                    label: 'এ কাজ থেকে বিরত থাকতে পেরেছি',
                    icon: Check,
                    selectedStyle: 'bg-emerald-600 text-white border-transparent',
                  },
                  {
                    id: 'mistake_made',
                    label: 'এ বিষয়ে ভুল হয়েছে',
                    icon: AlertCircle,
                    selectedStyle: 'bg-amber-600 text-white border-transparent',
                  },
                  {
                    id: 'na',
                    label: 'আমার ক্ষেত্রে প্রযোজ্য নয়',
                    icon: HelpCircle,
                    selectedStyle: 'bg-slate-600 text-white border-transparent',
                  },
                  {
                    id: 'want_to_learn',
                    label: 'বিষয়টি আরও শিখতে চাই',
                    icon: Heart,
                    selectedStyle: 'bg-indigo-600 text-white border-transparent',
                  },
                ].map((opt) => {
                  const isSelected = status === opt.id;
                  const Icon = opt.icon;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSetStatus(action, opt.id as any)}
                      className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? `${opt.selectedStyle} shadow-xs`
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="leading-tight text-[11px]">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Personal Notes */}
              <div className="pt-1">
                <input
                  type="text"
                  value={record?.notes || ''}
                  onChange={(e) => handleUpdateNotes(action.id, e.target.value)}
                  placeholder="আত্মশুদ্ধির ব্যক্তিগত সংকল্প বা নোট..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Compassionate Advice Dialog on Mistake */}
      {compassionModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-3xl w-full max-w-md p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 mx-auto flex items-center justify-center">
              <Heart className="w-6 h-6 fill-amber-500/20" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              ভুল স্বীকার ও তাওবার সুযোগ
            </h3>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-amber-50/60 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200/50">
              "ভুল হয়ে গেলে হতাশ হবেন না। আন্তরিক তাওবা করুন, ভুল সংশোধনের চেষ্টা করুন এবং মানুষের অধিকার নষ্ট হলে তা ফিরিয়ে দেওয়ার ব্যবস্থা করুন।"
            </p>

            {compassionModalData.gentleAdviceBn && (
              <p className="text-xs text-slate-500 italic">
                {compassionModalData.gentleAdviceBn}
              </p>
            )}

            <button
              onClick={() => setCompassionModalData(null)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              আমি বুঝেছি, আলহামদুলিল্লাহ
            </button>
          </div>
        </div>
      )}

      {/* Modal for adding/editing */}
      <CustomItemModal
        isOpen={isModalOpen}
        type="prohibition"
        item={editingItem}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={(t, data) => {
          storage.saveCustomProhibitedAction(data);
          setRefreshKey((k) => k + 1);
        }}
        onDelete={(t, id) => {
          storage.deleteProhibitedAction(id);
          setRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
};
