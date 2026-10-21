import React, { useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { storage } from '../../services/storage';
import { TrashItem } from '../../types';
import { formatBengaliDate } from '../../utils/dateAndNumerals';

export const TrashView: React.FC = () => {
  const [trashItems, setTrashItems] = useState<TrashItem[]>(() => storage.getTrash());
  const [showConfirmEmpty, setShowConfirmEmpty] = useState(false);
  const [restoredMsg, setRestoredMsg] = useState<string | null>(null);

  const handleRestore = (trashId: string) => {
    const success = storage.restoreFromTrash(trashId);
    if (success) {
      setTrashItems(storage.getTrash());
      setRestoredMsg('আইটেমটি সফলভাবে পুনরুদ্ধার করা হয়েছে!');
      setTimeout(() => setRestoredMsg(null), 2500);
    }
  };

  const handleEmptyTrash = () => {
    storage.emptyTrash();
    setTrashItems([]);
    setShowConfirmEmpty(false);
  };

  const typeLabels: Record<string, string> = {
    worship: 'আমল',
    task: 'কাজ',
    note: 'নোট',
    goal: 'লক্ষ্য',
    command: 'কুরআনের নির্দেশ',
    sunnah: 'সুন্নাহ',
    prohibition: 'আত্মশুদ্ধি',
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              ট্র্যাশ ও আইটেম পুনরুদ্ধার (Trash & Recycle Bin)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ভুলবশত মুছে ফেলা আমল, কাজ, নোট বা লক্ষ্যসমূহ এখান থেকে ফিরিয়ে আনতে পারেন।
          </p>
        </div>

        {trashItems.length > 0 && (
          <button
            onClick={() => setShowConfirmEmpty(true)}
            className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold hover:bg-rose-100 transition-colors self-start sm:self-auto"
          >
            ট্র্যাশ সম্পূর্ণ খালি করুন
          </button>
        )}
      </div>

      {restoredMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {restoredMsg}
        </div>
      )}

      {showConfirmEmpty && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 text-xs font-bold">
            <AlertTriangle className="w-4 h-4" />
            আপনি কি নিশ্চিত যে ট্র্যাশ খালি করতে চান?
          </div>
          <p className="text-xs text-rose-700 dark:text-rose-300">
            ট্র্যাশ খালি করলে মুছে ফেলা তথ্যগুলো স্থায়ীভাবে অপসারিত হবে এবং পুনরুদ্ধার করা যাবে না।
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleEmptyTrash}
              className="px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
            >
              স্থায়ীভাবে মুছে ফেলুন
            </button>
            <button
              onClick={() => setShowConfirmEmpty(false)}
              className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium"
            >
              বাতিল
            </button>
          </div>
        </div>
      )}

      {/* Trash Items List */}
      <div className="space-y-3">
        {trashItems.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
            <Trash2 className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-xs">ট্র্যাশে কোনো আইটেম নেই।</p>
          </div>
        ) : (
          trashItems.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {typeLabels[item.itemType] || item.itemType}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </h4>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  মুছে ফেলার তারিখ: {formatBengaliDate(item.deletedAt.split('T')[0])}
                </div>
              </div>

              <button
                onClick={() => handleRestore(item.id)}
                className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                পুনরুদ্ধার
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
