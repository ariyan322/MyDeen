import React, { useState, useMemo } from 'react';
import { BookOpen, Check, X, Clock, HelpCircle, Plus, Edit2, Trash2, Copy, Filter } from 'lucide-react';
import { AppSettings, QuranCommand, QuranCommandRecord, QuranCommandStatus } from '../../types';
import { storage } from '../../services/storage';
import { getDhakaDateString, formatBengaliDate, toBengaliDigits } from '../../utils/dateAndNumerals';
import { CustomItemModal } from '../modals/CustomItemModal';

interface QuranCommandsViewProps {
  settings: AppSettings;
}

export const QuranCommandsView: React.FC<QuranCommandsViewProps> = ({ settings }) => {
  const [selectedDate, setSelectedDate] = useState(() => getDhakaDateString());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<QuranCommand | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const bnNums = settings.useBengaliNumerals;

  const commands = useMemo(() => storage.getQuranCommands(), [refreshKey]);
  const records = useMemo(() => storage.getQuranCommandRecords(selectedDate), [selectedDate, refreshKey]);

  const categories = useMemo(() => {
    const set = new Set(commands.map((c) => c.category));
    return ['all', ...Array.from(set)];
  }, [commands]);

  const filteredCommands = useMemo(() => {
    if (selectedCategory === 'all') return commands;
    return commands.filter((c) => c.category === selectedCategory);
  }, [commands, selectedCategory]);

  const handleSetStatus = (cmdId: string, status: QuranCommandStatus) => {
    const existing = records[cmdId];
    const newRecord: QuranCommandRecord = {
      date: selectedDate,
      commandId: cmdId,
      status,
      notes: existing?.notes,
    };
    storage.saveQuranCommandRecord(selectedDate, newRecord);
    setRefreshKey((k) => k + 1);
  };

  const handleUpdateNotes = (cmdId: string, notes: string) => {
    const existing = records[cmdId] || {
      date: selectedDate,
      commandId: cmdId,
      status: 'tried_or_fulfilled',
    };
    storage.saveQuranCommandRecord(selectedDate, { ...existing, notes });
    setRefreshKey((k) => k + 1);
  };

  const statusConfigs: Record<QuranCommandStatus, { label: string; bg: string; text: string; icon: any }> = {
    tried_or_fulfilled: {
      label: 'চেষ্টা করেছি / পালন করেছি',
      bg: 'bg-emerald-600 text-white',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: Check,
    },
    failed: {
      label: 'পালন করতে পারিনি',
      bg: 'bg-rose-600 text-white',
      text: 'text-rose-700 dark:text-rose-300',
      icon: X,
    },
    na: {
      label: 'প্রযোজ্য নয়',
      bg: 'bg-slate-600 text-white',
      text: 'text-slate-600 dark:text-slate-300',
      icon: MinusSign,
    },
    review_later: {
      label: 'পরে পর্যালোচনা করব',
      bg: 'bg-amber-600 text-white',
      text: 'text-amber-700 dark:text-amber-300',
      icon: Clock,
    },
  };

  function MinusSign(props: any) {
    return <span {...props}>—</span>;
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              আল্লাহর আদেশ: আমি কতটা পালন করছি?
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            কুরআনুল কারিমের মৌলিক আদেশসমূহ প্রতিদিনের জীবনে বাস্তবায়নের আত্মপর্যালোচনা।
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
            নতুন নির্দেশিকা যোগ
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? 'সকল ক্যাটেগরি' : cat}
          </button>
        ))}
      </div>

      {/* Commands List */}
      <div className="space-y-4">
        {filteredCommands.map((cmd) => {
          const record = records[cmd.id];
          const currentStatus = record?.status;

          return (
            <div
              key={cmd.id}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3.5"
            >
              {/* Header Info */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                      {cmd.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {cmd.titleBn}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-400">
                    সূরা {cmd.surahName} {cmd.ayahNumber && `(${cmd.ayahNumber})`}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingItem(cmd);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100"
                    title="সম্পাদনা"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Arabic Verse & Translation */}
              {cmd.arabicVerse && (
                <div className="p-3 bg-emerald-50/30 dark:bg-emerald-950/15 rounded-xl border border-emerald-100/60 dark:border-emerald-900/30 space-y-2">
                  <p className="text-right font-arabic text-base sm:text-lg text-emerald-950 dark:text-emerald-200 leading-loose">
                    {cmd.arabicVerse}
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                    "{cmd.bengaliVerse}"
                  </p>
                </div>
              )}

              {/* Simple Bengali Explanation */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {cmd.explanationBn}
              </p>

              {/* Reflection Question */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  দৈনিক আত্মপর্যালোচনার প্রশ্ন:
                </div>
                <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  {cmd.reflectionQuestion}
                </div>
              </div>

              {/* Status Selector Options */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {(['tried_or_fulfilled', 'failed', 'na', 'review_later'] as QuranCommandStatus[]).map((st) => {
                  const cfg = statusConfigs[st];
                  const isSelected = currentStatus === st;
                  const Icon = cfg.icon;

                  return (
                    <button
                      key={st}
                      onClick={() => handleSetStatus(cmd.id, st)}
                      className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? `${cfg.bg} border-transparent shadow-xs`
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="leading-tight text-[11px]">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Personal Notes */}
              <div className="pt-1">
                <input
                  type="text"
                  value={record?.notes || ''}
                  onChange={(e) => handleUpdateNotes(cmd.id, e.target.value)}
                  placeholder="আজকের ব্যক্তিগত মন্তব্য বা উপলব্ধি লিখুন..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <CustomItemModal
        isOpen={isModalOpen}
        type="command"
        item={editingItem}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={(t, data) => {
          storage.saveCustomQuranCommand(data);
          setRefreshKey((k) => k + 1);
        }}
        onDelete={(t, id) => {
          storage.deleteQuranCommand(id);
          setRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
};
