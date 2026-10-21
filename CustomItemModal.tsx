import React, { useState, useEffect } from 'react';
import { X, Trash2, Copy, Check } from 'lucide-react';
import { WorshipItem, Task, Note, Goal, QuranCommand, SunnahItem, ProhibitedAction } from '../../types';

export type ModalItemType = 'worship' | 'task' | 'note' | 'goal' | 'command' | 'sunnah' | 'prohibition';

interface CustomItemModalProps {
  isOpen: boolean;
  type: ModalItemType;
  item?: any; // Existing item if editing
  onClose: () => void;
  onSave: (type: ModalItemType, data: any) => void;
  onDelete?: (type: ModalItemType, id: string) => void;
}

export const CustomItemModal: React.FC<CustomItemModalProps> = ({
  isOpen,
  type,
  item,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('বার');
  const [targetValue, setTargetValue] = useState<number | ''>(1);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [arabicText, setArabicText] = useState('');
  const [reference, setReference] = useState('');
  const [reflectionQuestion, setReflectionQuestion] = useState('');
  const [tags, setTags] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setShowDeleteConfirm(false);
      setError('');
      if (item) {
        setTitle(item.titleBn || item.title || item.nameBn || '');
        setDescription(item.descriptionBn || item.description || item.explanationBn || item.content || '');
        setCategory(item.category || '');
        setUnit(item.unit || 'বার');
        setTargetValue(item.defaultTarget ?? item.targetValue ?? 1);
        setDueDate(item.dueDate || item.targetDate || new Date().toISOString().split('T')[0]);
        setDueTime(item.dueTime || '');
        setPriority(item.priority || 'medium');
        setArabicText(item.nameAr || item.arabicVerse || item.arabicDua || '');
        setReference(item.surahName ? `${item.surahName} ${item.ayahNumber}` : item.hadithSource ? `${item.hadithSource} ${item.hadithNumber || ''}` : item.quranHadithRef || '');
        setReflectionQuestion(item.reflectionQuestion || '');
        setTags(Array.isArray(item.tags) ? item.tags.join(', ') : '');
      } else {
        // Reset defaults for new item
        setTitle('');
        setDescription('');
        setArabicText('');
        setReference('');
        setReflectionQuestion('');
        setTags('');
        setTargetValue(1);
        setDueDate(new Date().toISOString().split('T')[0]);
        setDueTime('');
        setPriority('medium');
        if (type === 'worship') {
          setCategory('custom');
          setUnit('বার');
        } else if (type === 'task') {
          setCategory('ইবাদত');
        } else if (type === 'note') {
          setCategory('কুরআন অধ্যয়ন');
        } else if (type === 'goal') {
          setCategory('কুরআন');
          setTargetValue(30);
          setUnit('দিন');
        } else {
          setCategory('সাধারণ');
        }
      }
    }
  }, [isOpen, item, type]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('অনুগ্রহ করে শিরোনাম বা নামটি লিখুন');
      return;
    }

    const baseId = item?.id || `${type}_custom_${Date.now()}`;

    if (type === 'worship') {
      const worshipData: WorshipItem = {
        id: baseId,
        nameBn: title.trim(),
        nameAr: arabicText.trim() || undefined,
        category: (category as any) || 'custom',
        isObligatory: false,
        isCustom: true,
        unit: unit.trim() || 'বার',
        defaultTarget: typeof targetValue === 'number' ? targetValue : 1,
        descriptionBn: description.trim() || undefined,
        icon: 'Sparkles',
      };
      onSave(type, worshipData);
    } else if (type === 'task') {
      const taskData: Task = {
        id: baseId,
        title: title.trim(),
        description: description.trim() || undefined,
        category: category.trim() || 'ইবাদত',
        priority,
        dueDate,
        dueTime: dueTime || undefined,
        isCompleted: item?.isCompleted || false,
        createdAt: item?.createdAt || new Date().toISOString(),
      };
      onSave(type, taskData);
    } else if (type === 'note') {
      const noteData: Note = {
        id: baseId,
        title: title.trim(),
        content: description.trim(),
        category: category.trim() || 'কুরআন অধ্যয়ন',
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        isPinned: item?.isPinned || false,
        isBookmarked: item?.isBookmarked || false,
        quranHadithRef: reference.trim() || undefined,
        createdAt: item?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onSave(type, noteData);
    } else if (type === 'goal') {
      const goalData: Goal = {
        id: baseId,
        title: title.trim(),
        description: description.trim() || undefined,
        category: category.trim() || 'কুরআন',
        targetValue: typeof targetValue === 'number' ? targetValue : 1,
        currentValue: item?.currentValue || 0,
        unit: unit.trim() || 'দিন',
        startDate: item?.startDate || new Date().toISOString().split('T')[0],
        targetDate: dueDate,
        isCompleted: item?.isCompleted || false,
      };
      onSave(type, goalData);
    } else if (type === 'command') {
      const commandData: QuranCommand = {
        id: baseId,
        titleBn: title.trim(),
        explanationBn: description.trim(),
        category: category.trim() || 'ব্যক্তিগত আমল',
        surahName: reference.trim() || 'ব্যক্তিগত সংযোজন',
        ayahNumber: '',
        arabicVerse: arabicText.trim(),
        bengaliVerse: description.trim(),
        reflectionQuestion: reflectionQuestion.trim() || 'আজ কি এই আদেশ পালনের আন্তরিক চেষ্টা করেছি?',
        isCustom: true,
      };
      onSave(type, commandData);
    } else if (type === 'sunnah') {
      const sunnahData: SunnahItem = {
        id: baseId,
        titleBn: title.trim(),
        category: category.trim() || 'অন্যান্য',
        explanationBn: description.trim(),
        howToPerformBn: description.trim(),
        arabicDua: arabicText.trim() || undefined,
        hadithSource: reference.trim() || 'ব্যক্তিগত নোট',
        isObligatory: false,
        isCustom: true,
      };
      onSave(type, sunnahData);
    } else if (type === 'prohibition') {
      const prohibData: ProhibitedAction = {
        id: baseId,
        titleBn: title.trim(),
        explanationBn: description.trim(),
        category: category.trim() || 'আত্মশুদ্ধি',
        reflectionQuestion: reflectionQuestion.trim() || 'আজ কি এই কাজ থেকে সম্পূর্ণ বিরত ছিলাম?',
        isCustom: true,
      };
      onSave(type, prohibData);
    }

    onClose();
  };

  const handleDuplicate = () => {
    if (!item) return;
    const duplicatedTitle = `${title} (কপি)`;
    const newId = `${type}_custom_${Date.now()}`;
    setTitle(duplicatedTitle);
    const duplicatedItem = { ...item, id: newId, titleBn: duplicatedTitle, title: duplicatedTitle, isCustom: true };
    onSave(type, duplicatedItem);
    onClose();
  };

  const getModalTitle = () => {
    const isEdit = !!item;
    const action = isEdit ? 'সম্পাদনা করুন' : 'যোগ করুন';
    switch (type) {
      case 'worship': return `আমল ${action}`;
      case 'task': return `কাজ ${action}`;
      case 'note': return `নোট ${action}`;
      case 'goal': return `লক্ষ্য ${action}`;
      case 'command': return `কুরআনের নির্দেশিকা ${action}`;
      case 'sunnah': return `সুন্নাহ আমল ${action}`;
      case 'prohibition': return `আত্মপর্যালোচনা আইটেম ${action}`;
      default: return `আইটেম ${action}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {getModalTitle()}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {item?.isCustom === false
                ? 'এটি একটি মৌলিক অন্তর্ভুক্ত বিষয়'
                : 'আপনার সুবিধামতো কাস্টমাইজ করুন'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-xs">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              শিরোনাম বা নাম <span className="text-emerald-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="উদাহরণ: সূরা মূলক তিলাওয়াত বা বিশেষ তাহাজ্জুদ"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-emerald-600 dark:focus:border-emerald-500 text-slate-900 dark:text-white"
              required
            />
          </div>

          {/* Arabic Text (Optional) */}
          {(type === 'worship' || type === 'sunnah' || type === 'command') && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                আরবি দোয়া বা আয়াত (ঐচ্ছিক)
              </label>
              <textarea
                dir="rtl"
                rows={2}
                value={arabicText}
                onChange={(e) => setArabicText(e.target.value)}
                placeholder="আরবি ইবারত লিখুন..."
                className="w-full px-3 py-2 text-base font-arabic bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-emerald-600 dark:focus:border-emerald-500 text-slate-900 dark:text-white"
              />
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              ক্যাটেগরি / বিভাগ
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="যেমন: ইবাদত, জিকির, পরিবার, নফল"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-emerald-600 dark:focus:border-emerald-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Description or Content */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {type === 'note' ? 'নোটের বিস্তারিত বিবরণ' : 'ব্যাখ্যা / বিবরণ / ব্যক্তিগত উদ্দেশ্য'}
            </label>
            <textarea
              rows={type === 'note' ? 5 : 3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="সংক্ষিপ্ত বিবরণ বা করণীয়..."
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-emerald-600 dark:focus:border-emerald-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Quantity and Unit for Worship or Goals */}
          {(type === 'worship' || type === 'goal') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  দৈনিক টার্গেট / পরিমাণ
                </label>
                <input
                  type="number"
                  min="1"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-emerald-600 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  একক (Unit)
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="বার, পৃষ্ঠা, মিনিট, টাকা"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-emerald-600 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Dates & Times for Tasks & Goals */}
          {(type === 'task' || type === 'goal') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {type === 'goal' ? 'টার্গেট তারিখ' : 'শেষ করার তারিখ'}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-emerald-600 text-slate-900 dark:text-white"
                />
              </div>
              {type === 'task' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    সময় (ঐচ্ছিক)
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-emerald-600 text-slate-900 dark:text-white"
                  />
                </div>
              )}
            </div>
          )}

          {/* Priority for Task */}
          {type === 'task' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                অগ্রাধিকার
              </label>
              <div className="flex gap-2">
                {(['high', 'medium', 'low'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      priority === p
                        ? p === 'high'
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700'
                          : p === 'medium'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {p === 'high' ? 'জরুরি (High)' : p === 'medium' ? 'সাধারণ (Medium)' : 'কম গুরুত্বপূর্ণ (Low)'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reference for Notes, Commands, Sunnah */}
          {(type === 'note' || type === 'command' || type === 'sunnah') && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                রেফারেন্স বা সূত্র (কুরআন / হাদিস গ্রন্থ)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="যেমন: সূরা বাকারাহ ২:৪৫ অথবা সহিহ বুখারি ৬১২"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-emerald-600 text-slate-900 dark:text-white"
              />
            </div>
          )}

          {/* Reflection Question for Commands and Prohibitions */}
          {(type === 'command' || type === 'prohibition') && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                দৈনিক আত্মপর্যালোচনার প্রশ্ন
              </label>
              <input
                type="text"
                value={reflectionQuestion}
                onChange={(e) => setReflectionQuestion(e.target.value)}
                placeholder="যেমন: আজ কি আমি এই ভালো কাজটি করতে পেরেছি?"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-emerald-600 text-slate-900 dark:text-white"
              />
            </div>
          )}

          {/* Tags for Notes */}
          {type === 'note' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                ট্যাগ (কমা দিয়ে পৃথক করুন)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="যেমন: আমল, পরিবার, রমজান"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-emerald-600 text-slate-900 dark:text-white"
              />
            </div>
          )}

          {/* Delete confirmation section */}
          {showDeleteConfirm && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl space-y-2">
              <p className="text-xs text-rose-800 dark:text-rose-200 font-medium">
                আপনি কি নিশ্চিত যে এটি ট্র্যাশে পাঠাতে চান? পরবর্তীতে ট্র্যাশ থেকে পুনরুদ্ধার করা যাবে।
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (item && onDelete) {
                      onDelete(type, item.id);
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 transition-colors"
                >
                  হ্যাঁ, ডিলিট করুন
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium"
                >
                  বাতিল
                </button>
              </div>
            </div>
          )}

          {/* Actions Bottom Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 gap-2">
            <div className="flex items-center gap-1">
              {item && onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  title="ডিলিট করুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              {item && (
                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="ডুপ্লিকেট করুন"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
