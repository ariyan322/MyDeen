import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Heart,
  Save,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { AppSettings, MuhasabahEntry, CustomQuestion } from '../../types';
import { storage } from '../../services/storage';
import { getDhakaDateString, formatBengaliDate, toBengaliDigits } from '../../utils/dateAndNumerals';

interface ReflectionViewProps {
  settings: AppSettings;
  initialOpenForm?: boolean;
  onResetInitialOpenForm?: () => void;
}

export const ReflectionView: React.FC<ReflectionViewProps> = ({
  settings,
  initialOpenForm,
  onResetInitialOpenForm,
}) => {
  const [entries, setEntries] = useState<MuhasabahEntry[]>(() => storage.getMuhasabahEntries());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MuhasabahEntry | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => getDhakaDateString());
  const [goodDeeds, setGoodDeeds] = useState('');
  const [mistakesMade, setMistakesMade] = useState('');
  const [learnedToday, setLearnedToday] = useState('');
  const [rightsRectification, setRightsRectification] = useState('');
  const [seekForgivenessFor, setSeekForgivenessFor] = useState('');
  const [gratitudeItems, setGratitudeItems] = useState('');
  const [tomorrowImprovements, setTomorrowImprovements] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [formError, setFormError] = useState('');

  const bnNums = settings.useBengaliNumerals;

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchDate = !selectedDateFilter || e.date === selectedDateFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQ =
        !q ||
        e.title.toLowerCase().includes(q) ||
        (e.goodDeeds && e.goodDeeds.toLowerCase().includes(q)) ||
        (e.mistakesMade && e.mistakesMade.toLowerCase().includes(q)) ||
        (e.learnedToday && e.learnedToday.toLowerCase().includes(q)) ||
        (e.rightsRectification && e.rightsRectification.toLowerCase().includes(q)) ||
        (e.seekForgivenessFor && e.seekForgivenessFor.toLowerCase().includes(q)) ||
        (e.gratitudeItems && e.gratitudeItems.toLowerCase().includes(q)) ||
        (e.personalNotes && e.personalNotes.toLowerCase().includes(q));
      return matchDate && matchQ;
    });
  }, [entries, selectedDateFilter, searchQuery]);

  const handleOpenNewForm = () => {
    setEditingEntry(null);
    setTitle(`দৈনিক আত্মপর্যালোচনা - ${formatBengaliDate(getDhakaDateString(), bnNums)}`);
    setDate(getDhakaDateString());
    setGoodDeeds('');
    setMistakesMade('');
    setLearnedToday('');
    setRightsRectification('');
    setSeekForgivenessFor('');
    setGratitudeItems('');
    setTomorrowImprovements('');
    setPersonalNotes('');
    setCustomQuestions([]);
    setNewQuestionText('');
    setFormError('');
    setIsFormOpen(true);
  };

  React.useEffect(() => {
    if (initialOpenForm) {
      handleOpenNewForm();
      if (onResetInitialOpenForm) onResetInitialOpenForm();
    }
  }, [initialOpenForm, onResetInitialOpenForm]);

  const handleEdit = (entry: MuhasabahEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setDate(entry.date);
    setGoodDeeds(entry.goodDeeds || '');
    setMistakesMade(entry.mistakesMade || '');
    setLearnedToday(entry.learnedToday || '');
    setRightsRectification(entry.rightsRectification || '');
    setSeekForgivenessFor(entry.seekForgivenessFor || '');
    setGratitudeItems(entry.gratitudeItems || '');
    setTomorrowImprovements(entry.tomorrowImprovements || '');
    setPersonalNotes(entry.personalNotes || '');
    setCustomQuestions(entry.customQuestions || []);
    setNewQuestionText('');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleDuplicate = (entry: MuhasabahEntry) => {
    const duplicated: MuhasabahEntry = {
      ...entry,
      id: 'muhasabah_' + Date.now(),
      title: `${entry.title} (কপি)`,
      date: getDhakaDateString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storage.saveMuhasabahEntry(duplicated);
    setEntries(storage.getMuhasabahEntries());
    setToastMessage('আত্মপর্যালোচনাটি ডুপ্লিকেট করা হয়েছে');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleDelete = (id: string) => {
    storage.deleteMuhasabahEntry(id);
    setEntries(storage.getMuhasabahEntries());
    setDeleteConfirmId(null);
    setToastMessage('আত্মপর্যালোচনা ট্র্যাশে পাঠানো হয়েছে');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleAddCustomQuestion = () => {
    if (!newQuestionText.trim()) return;
    setCustomQuestions([
      ...customQuestions,
      { id: 'q_' + Date.now(), question: newQuestionText.trim(), answer: '' },
    ]);
    setNewQuestionText('');
  };

  const handleCustomAnswerChange = (qId: string, val: string) => {
    setCustomQuestions(
      customQuestions.map((q) => (q.id === qId ? { ...q, answer: val } : q))
    );
  };

  const handleRemoveCustomQuestion = (qId: string) => {
    setCustomQuestions(customQuestions.filter((q) => q.id !== qId));
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('অনুগ্রহ করে আত্মপর্যালোচনার একটি শিরোনাম দিন');
      return;
    }

    const entryData: MuhasabahEntry = {
      id: editingEntry?.id || 'muhasabah_' + Date.now(),
      title: title.trim(),
      date,
      goodDeeds: goodDeeds.trim() || undefined,
      mistakesMade: mistakesMade.trim() || undefined,
      learnedToday: learnedToday.trim() || undefined,
      rightsRectification: rightsRectification.trim() || undefined,
      seekForgivenessFor: seekForgivenessFor.trim() || undefined,
      gratitudeItems: gratitudeItems.trim() || undefined,
      tomorrowImprovements: tomorrowImprovements.trim() || undefined,
      personalNotes: personalNotes.trim() || undefined,
      customQuestions: customQuestions.length > 0 ? customQuestions : undefined,
      createdAt: editingEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.saveMuhasabahEntry(entryData);
    setEntries(storage.getMuhasabahEntries());
    setIsFormOpen(false);
    setToastMessage('আত্মপর্যালোচনা সফলভাবে সংরক্ষিত হয়েছে, আলহামদুলিল্লাহ');
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              দৈনিক আত্মপর্যালোচনা (Muhasabah)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            হজরত উমর (রা.) বলেন: "তোমাদের হিসাব নেওয়ার পূর্বে তোমরা নিজেদের হিসাব নাও।"
          </p>
        </div>

        <button
          onClick={handleOpenNewForm}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          + নতুন আত্মপর্যালোচনা যোগ করুন
        </button>
      </div>

      {/* Gentle Compassionate Reflection Message */}
      <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-2xl flex items-start gap-3 text-xs text-emerald-950 dark:text-emerald-200">
        <Heart className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 fill-emerald-600/20" />
        <div className="leading-relaxed">
          <p className="font-semibold">
            "নিজেকে সংশোধনের চেষ্টা করুন। ভুল হলে হতাশ না হয়ে আন্তরিক তাওবা করুন এবং আগামীকাল আরও ভালো করার চেষ্টা করুন।"
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            এই হিসাব সম্পূর্ণ গোপন ও ব্যক্তিগত। কোনো ধর্মীয় স্কোর বা তুলনা করা হয় না। উত্তর না জানা বা অপ্রযোজ্য প্রশ্ন খালি রাখা সম্পূর্ণ বৈধ।
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Search and Date Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="পূর্ববর্তী আত্মপর্যালোচনা অনুসন্ধান করুন..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-mono"
          />
          {selectedDateFilter && (
            <button
              onClick={() => setSelectedDateFilter('')}
              className="px-2.5 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            >
              রিসেট
            </button>
          )}
        </div>
      </div>

      {/* Historical Entries Timeline / List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <Sparkles className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-xs">কোনো আত্মপর্যালোচনা পাওয়া যায়নি।</p>
            <button
              onClick={handleOpenNewForm}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
            >
              + নতুন আত্মপর্যালোচনা লিখুন
            </button>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3.5 transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      {formatBengaliDate(entry.date, bnNums)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {entry.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(entry)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                    title="ডুপ্লিকেট"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(entry)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                    title="সম্পাদনা"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(entry.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Delete Confirm */}
              {deleteConfirmId === entry.id && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl space-y-2">
                  <p className="text-xs text-rose-800 dark:text-rose-200 font-medium">
                    আপনি কি নিশ্চিত যে এই আত্মপর্যালোচনাটি ট্র্যাশে পাঠাতে চান?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
                    >
                      হ্যাঁ, মুছে ফেলুন
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs"
                    >
                      বাতিল
                    </button>
                  </div>
                </div>
              )}

              {/* Questions & Answers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {entry.goodDeeds && (
                  <div className="p-3 bg-emerald-50/20 dark:bg-emerald-950/15 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-400 block mb-0.5">
                      আজ আমি কী ভালো কাজ করেছি?
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {entry.goodDeeds}
                    </p>
                  </div>
                )}

                {entry.mistakesMade && (
                  <div className="p-3 bg-amber-50/20 dark:bg-amber-950/15 rounded-xl border border-amber-100/50 dark:border-amber-900/30">
                    <span className="font-semibold text-amber-800 dark:text-amber-400 block mb-0.5">
                      আজ কোন বিষয়ে ভুল করেছি?
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {entry.mistakesMade}
                    </p>
                  </div>
                )}

                {entry.learnedToday && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                      আজ কী শিখেছি?
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {entry.learnedToday}
                    </p>
                  </div>
                )}

                {entry.rightsRectification && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                      কারও অধিকার নষ্ট করলে যেভাবে সংশোধন করব:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {entry.rightsRectification}
                    </p>
                  </div>
                )}

                {entry.seekForgivenessFor && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                      যে বিষয়ে আল্লাহর কাছে ক্ষমা চাইতে চাই:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {entry.seekForgivenessFor}
                    </p>
                  </div>
                )}

                {entry.gratitudeItems && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                      আজকের কৃতজ্ঞতার বিষয় (আলহামদুলিল্লাহ):
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {entry.gratitudeItems}
                    </p>
                  </div>
                )}

                {entry.tomorrowImprovements && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                      আগামীকাল কী উন্নতি করতে চাই?
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {entry.tomorrowImprovements}
                    </p>
                  </div>
                )}

                {/* Custom Questions */}
                {entry.customQuestions?.map((cq) => (
                  <div key={cq.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                      {cq.question}
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {cq.answer || '—'}
                    </p>
                  </div>
                ))}
              </div>

              {entry.personalNotes && (
                <div className="p-3 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">ব্যক্তিগত নোট: </span>
                  {entry.personalNotes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingEntry ? 'আত্মপর্যালোচনা সম্পাদনা করুন' : '+ নতুন আত্মপর্যালোচনা যোগ করুন'}
                </h3>
                <p className="text-xs text-slate-500">
                  দৈনিক আত্মসমালোচনা, কৃতজ্ঞতা ও আত্মশুদ্ধির ভাবনা সংরক্ষণ করুন।
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveForm} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 rounded-xl">
                  {formError}
                </div>
              )}

              {/* Title & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    আত্মপর্যালোচনার শিরোনাম <span className="text-emerald-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="যেমন: আজকের দিনের মূল্যায়ন ও তাওবা"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    তারিখ
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* 1. Good deeds */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ১. আজ আমি কী ভালো কাজ করেছি?
                </label>
                <textarea
                  rows={2}
                  value={goodDeeds}
                  onChange={(e) => setGoodDeeds(e.target.value)}
                  placeholder="যেমন: জামাতে সালাত, পিতা-মাতার খেদমত, কাউকে সাহায্য..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* 2. Mistakes */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ২. আজ কোন বিষয়ে ভুল করেছি?
                </label>
                <textarea
                  rows={2}
                  value={mistakesMade}
                  onChange={(e) => setMistakesMade(e.target.value)}
                  placeholder="যেমন: রাগ সংবরণ করতে না পারা বা সময় অপচয়..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* 3. Learned */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ৩. আজ কী শিখেছি?
                </label>
                <textarea
                  rows={2}
                  value={learnedToday}
                  onChange={(e) => setLearnedToday(e.target.value)}
                  placeholder="যেমন: নতুন কোনো হাদিস বা জীবনের গুরুত্বপূর্ণ শিক্ষা..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* 4. Rights Rectification */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ৪. কারও অধিকার নষ্ট করলে কীভাবে সংশোধন করব?
                </label>
                <textarea
                  rows={2}
                  value={rightsRectification}
                  onChange={(e) => setRightsRectification(e.target.value)}
                  placeholder="যেমন: যার মনে কষ্ট দিয়েছি তার কাছে ক্ষমা চেয়ে নেব..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* 5. Forgiveness */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ৫. কোন বিষয়ে আল্লাহর কাছে ক্ষমা চাইতে চাই?
                </label>
                <textarea
                  rows={2}
                  value={seekForgivenessFor}
                  onChange={(e) => setSeekForgivenessFor(e.target.value)}
                  placeholder="আন্তরিক তাওবা ও অনুশোচনা..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* 6. Gratitude */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ৬. আজকের কৃতজ্ঞতার বিষয় (আলহামদুলিল্লাহ)
                </label>
                <textarea
                  rows={2}
                  value={gratitudeItems}
                  onChange={(e) => setGratitudeItems(e.target.value)}
                  placeholder="যেমন: সুস্থতা, শান্তি ও প্রিয়জনদের সান্নিধ্য..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* 7. Tomorrow Improvements */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ৭. আগামীকাল কী উন্নতি করতে চাই?
                </label>
                <textarea
                  rows={2}
                  value={tomorrowImprovements}
                  onChange={(e) => setTomorrowImprovements(e.target.value)}
                  placeholder="আগামীকালের সুনির্দিষ্ট লক্ষ্য বা পরিবর্তনের সংকল্প..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* 8. Personal Notes */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ৮. ব্যক্তিগত নোট (ঐচ্ছিক)
                </label>
                <textarea
                  rows={2}
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  placeholder="অন্যান্য কোনো প্রাসঙ্গিক ভাবনা..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* Custom Questions Section */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  নিজের কাস্টম প্রশ্ন যোগ করুন
                </div>

                {customQuestions.map((cq) => (
                  <div key={cq.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {cq.question}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomQuestion(cq.id)}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        মুছুন
                      </button>
                    </div>
                    <input
                      type="text"
                      value={cq.answer}
                      onChange={(e) => handleCustomAnswerChange(cq.id, e.target.value)}
                      placeholder="উত্তর লিখুন..."
                      className="w-full text-xs px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                ))}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="যেমন: আজ পরিবারের সঙ্গে কতটা সময় কাটিয়েছি?"
                    className="flex-1 text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomQuestion}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg font-medium whitespace-nowrap"
                  >
                    + প্রশ্ন যোগ করুন
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
