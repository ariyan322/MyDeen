import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Bookmark,
  Edit2,
  Trash2,
  Copy,
  Check,
  Tag,
  Calendar,
  AlertTriangle,
  Info,
  Sparkles,
  ChevronDown,
  Download,
  Share2,
} from 'lucide-react';
import { AppSettings, TadabburEntry } from '../../types';
import { storage } from '../../services/storage';
import { ALL_114_SURAHS } from '../../data/tafsirAndSurahs';
import { PRELOADED_SURAH_AYAHS } from '../../data/verifiedContent';
import { getDhakaDateString, formatBengaliDate, toBengaliDigits } from '../../utils/dateAndNumerals';

interface TadabburViewProps {
  settings: AppSettings;
  prefilledVerse?: {
    surahNumber: number;
    surahName: string;
    ayahNumber: number | string;
    textAr?: string;
    textBn?: string;
  } | null;
  onClearPrefill?: () => void;
  initialOpenForm?: boolean;
  onResetInitialOpenForm?: () => void;
}

export const TadabburView: React.FC<TadabburViewProps> = ({
  settings,
  prefilledVerse,
  onClearPrefill,
  initialOpenForm,
  onResetInitialOpenForm,
}) => {
  const [entries, setEntries] = useState<TadabburEntry[]>(() => storage.getTadabburEntries());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurahFilter, setSelectedSurahFilter] = useState<number | 'all'>('all');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [editingEntry, setEditingEntry] = useState<TadabburEntry | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [surahNumber, setSurahNumber] = useState<number>(1);
  const [verseNumber, setVerseNumber] = useState('');
  const [arabicVerse, setArabicVerse] = useState('');
  const [bengaliTranslation, setBengaliTranslation] = useState('');
  const [translationSource, setTranslationSource] = useState('মুহিউদ্দীন খান');
  const [coreLessons, setCoreLessons] = useState('');
  const [personalThoughts, setPersonalThoughts] = useState('');
  const [lifeApplication, setLifeApplication] = useState('');
  const [actionItems, setActionItems] = useState('');
  const [personalDuaIntention, setPersonalDuaIntention] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');
  const [date, setDate] = useState(() => getDhakaDateString());
  const [tagsInput, setTagsInput] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [formError, setFormError] = useState('');

  const bnNums = settings.useBengaliNumerals;

  // Handle prefilled verse from Quran reader
  useEffect(() => {
    if (prefilledVerse) {
      setSurahNumber(prefilledVerse.surahNumber);
      setVerseNumber(String(prefilledVerse.ayahNumber));
      setArabicVerse(prefilledVerse.textAr || '');
      setBengaliTranslation(prefilledVerse.textBn || '');
      setTitle(`সূরা ${prefilledVerse.surahName} (${toBengaliDigits(prefilledVerse.ayahNumber, bnNums)}) নিয়ে তাদাব্বুর`);
      setDate(getDhakaDateString());
      setIsFormOpen(true);
      if (onClearPrefill) onClearPrefill();
    }
  }, [prefilledVerse, bnNums, onClearPrefill]);

  useEffect(() => {
    if (initialOpenForm) {
      handleOpenNewForm();
      if (onResetInitialOpenForm) onResetInitialOpenForm();
    }
  }, [initialOpenForm, onResetInitialOpenForm]);

  // All tags collected
  const allTags = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => e.tags.forEach((t) => set.add(t)));
    return ['all', ...Array.from(set)];
  }, [entries]);

  // Filtered Entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchSurah = selectedSurahFilter === 'all' || e.surahNumber === selectedSurahFilter;
      const matchBookmark = !showBookmarksOnly || e.isBookmarked;
      const matchTag = selectedTag === 'all' || e.tags.includes(selectedTag);
      const q = searchQuery.toLowerCase().trim();
      const matchQ =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.surahName.toLowerCase().includes(q) ||
        String(e.verseNumber).includes(q) ||
        (e.coreLessons && e.coreLessons.toLowerCase().includes(q)) ||
        (e.personalThoughts && e.personalThoughts.toLowerCase().includes(q)) ||
        (e.bengaliTranslation && e.bengaliTranslation.toLowerCase().includes(q)) ||
        e.tags.some((t) => t.toLowerCase().includes(q));
      return matchSurah && matchBookmark && matchTag && matchQ;
    });
  }, [entries, selectedSurahFilter, showBookmarksOnly, selectedTag, searchQuery]);

  const handleOpenNewForm = () => {
    setEditingEntry(null);
    setTitle('');
    setSurahNumber(1);
    setVerseNumber('১');
    setArabicVerse('');
    setBengaliTranslation('');
    setTranslationSource('মুহিউদ্দীন খান');
    setCoreLessons('');
    setPersonalThoughts('');
    setLifeApplication('');
    setActionItems('');
    setPersonalDuaIntention('');
    setPersonalNotes('');
    setDate(getDhakaDateString());
    setTagsInput('');
    setIsBookmarked(false);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleEdit = (entry: TadabburEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setSurahNumber(entry.surahNumber);
    setVerseNumber(entry.verseNumber);
    setArabicVerse(entry.arabicVerse || '');
    setBengaliTranslation(entry.bengaliTranslation || '');
    setTranslationSource(entry.translationSource || 'মুহিউদ্দীন খান');
    setCoreLessons(entry.coreLessons || '');
    setPersonalThoughts(entry.personalThoughts || '');
    setLifeApplication(entry.lifeApplication || '');
    setActionItems(entry.actionItems || '');
    setPersonalDuaIntention(entry.personalDuaIntention || '');
    setPersonalNotes(entry.personalNotes || '');
    setDate(entry.date);
    setTagsInput(entry.tags.join(', '));
    setIsBookmarked(entry.isBookmarked || false);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleDuplicate = (entry: TadabburEntry) => {
    const duplicated: TadabburEntry = {
      ...entry,
      id: 'tadabbur_' + Date.now(),
      title: `${entry.title} (কপি)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storage.saveTadabburEntry(duplicated);
    setEntries(storage.getTadabburEntries());
  };

  const handleDelete = (id: string) => {
    storage.deleteTadabburEntry(id);
    setEntries(storage.getTadabburEntries());
    setDeleteConfirmId(null);
  };

  const handleToggleBookmark = (id: string) => {
    storage.toggleTadabburBookmark(id);
    setEntries(storage.getTadabburEntries());
  };

  // Helper when changing surah in form to auto-fill verse if in preloaded
  const handleSurahSelectChange = (surahNum: number) => {
    setSurahNumber(surahNum);
    const surahMeta = ALL_114_SURAHS.find((s) => s.number === surahNum);
    if (!title) {
      setTitle(`সূরা ${surahMeta?.nameBn || ''} নিয়ে তাদাব্বুর`);
    }
    const preloaded = PRELOADED_SURAH_AYAHS[surahNum];
    if (preloaded && preloaded[0]) {
      setVerseNumber('১');
      setArabicVerse(preloaded[0].textAr);
      setBengaliTranslation(preloaded[0].textBn);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('অনুগ্রহ করে তাদাব্বুরের শিরোনাম লিখুন');
      return;
    }

    const surahMeta = ALL_114_SURAHS.find((s) => s.number === surahNumber);
    const entryData: TadabburEntry = {
      id: editingEntry?.id || 'tadabbur_' + Date.now(),
      title: title.trim(),
      surahName: surahMeta?.nameBn || 'আল-কুরআন',
      surahNumber,
      verseNumber: verseNumber.trim() || '১',
      arabicVerse: arabicVerse.trim() || undefined,
      bengaliTranslation: bengaliTranslation.trim() || undefined,
      translationSource: translationSource.trim() || undefined,
      coreLessons: coreLessons.trim() || undefined,
      personalThoughts: personalThoughts.trim() || undefined,
      lifeApplication: lifeApplication.trim() || undefined,
      actionItems: actionItems.trim() || undefined,
      personalDuaIntention: personalDuaIntention.trim() || undefined,
      personalNotes: personalNotes.trim() || undefined,
      date,
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      isBookmarked,
      verificationStatus: arabicVerse.trim() ? 'verified' : 'unverified',
      createdAt: editingEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.saveTadabburEntry(entryData);
    setEntries(storage.getTadabburEntries());
    setIsFormOpen(false);
  };

  const handleCopy = (entry: TadabburEntry) => {
    const text = `📖 কুরআনের আয়াত নিয়ে তাদাব্বুর: ${entry.title}\nসূরা ${entry.surahName} (${entry.verseNumber})\n\n${entry.arabicVerse ? entry.arabicVerse + '\n\n' : ''}অনুবাদ: ${entry.bengaliTranslation || ''}\n\nমূল শিক্ষা: ${entry.coreLessons || ''}\n\nআমার চিন্তা ও প্রয়োগ: ${entry.personalThoughts || ''}\n\n[ব্যক্তিগত তাদাব্বুর — এটি আনুষ্ঠানিক তাফসীর নয়]`;
    navigator.clipboard.writeText(text);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              📖 কুরআনের আয়াত নিয়ে তাদাব্বুর
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            "আয়াত পড়ি, অর্থ বুঝি, চিন্তা করি এবং শিক্ষা লিখে রাখি।"
          </p>
        </div>

        <button
          onClick={handleOpenNewForm}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          + নতুন তাদাব্বুর যোগ করুন
        </button>
      </div>

      {/* Critical Religious Distinction Banner */}
      <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-2xl flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <p className="font-semibold text-emerald-950 dark:text-emerald-200">
            ব্যক্তিগত তাদাব্বুর — এটি আনুষ্ঠানিক তাফসীর নয়।
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-[11px]">
            কুরআনের তাদাব্বুর হলো আয়াত নিয়ে ব্যক্তিগত ভাবাবেগ, আত্মসমালোচনা ও জীবনে আমলের সংকল্প। কোনো শরীয়তি হুকুম বা ধর্মীয় ফতোয়া দেওয়ার জন্য বিজ্ঞ উলামায়ে কেরামের রচিত নির্ভরযোগ্য তাফসীরই একমাত্র প্রামাণ্য মাধ্যম।
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="সূরা, আয়াত, বিষয়বস্তু বা কীওয়ার্ড দিয়ে তাদাব্বুর খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600 shadow-2xs"
          />
        </div>

        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Surah dropdown filter */}
            <select
              value={selectedSurahFilter}
              onChange={(e) =>
                setSelectedSurahFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-medium focus:outline-hidden"
            >
              <option value="all">সকল সূরা</option>
              {ALL_114_SURAHS.map((s) => (
                <option key={s.number} value={s.number}>
                  {toBengaliDigits(s.number, bnNums)}. সূরা {s.nameBn}
                </option>
              ))}
            </select>

            {/* Tags filters */}
            {allTags.slice(0, 6).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedTag === t
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {t === 'all' ? 'সকল ট্যাগ' : `#${t}`}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center gap-1.5 border transition-colors ${
              showBookmarksOnly
                ? 'bg-amber-500 text-white border-transparent'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            বুকমার্ক করা ({toBengaliDigits(entries.filter((e) => e.isBookmarked).length, bnNums)})
          </button>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <BookOpen className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-xs">কোনো তাদাব্বুর এন্ট্রি খুঁজে পাওয়া যায়নি।</p>
            <button
              onClick={handleOpenNewForm}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
            >
              + প্রথম তাদাব্বুর লিখুন
            </button>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4 transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                      সূরা {entry.surahName} ({toBengaliDigits(entry.verseNumber, bnNums)})
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatBengaliDate(entry.date, bnNums)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {entry.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleBookmark(entry.id)}
                    className={`p-1.5 rounded-md transition-colors ${
                      entry.isBookmarked
                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="বুকমার্ক"
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>

                  <button
                    onClick={() => handleCopy(entry)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                    title="কপি করুন"
                  >
                    {copiedId === entry.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDuplicate(entry)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                    title="ডুপ্লিকেট"
                  >
                    <Share2 className="w-4 h-4" />
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
                    title="ডিলিট"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Delete confirmation */}
              {deleteConfirmId === entry.id && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl space-y-2">
                  <p className="text-xs text-rose-800 dark:text-rose-200 font-medium">
                    আপনি কি নিশ্চিত যে এই তাদাব্বুর এন্ট্রিটি ট্র্যাশে পাঠাতে চান?
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

              {/* Arabic verse and Bengali translation */}
              {(entry.arabicVerse || entry.bengaliTranslation) && (
                <div className="p-4 bg-emerald-50/20 dark:bg-emerald-950/15 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30 space-y-2">
                  {entry.arabicVerse && (
                    <p
                      dir="rtl"
                      className="text-right font-arabic text-base sm:text-lg text-emerald-950 dark:text-emerald-200 leading-loose"
                    >
                      {entry.arabicVerse}
                    </p>
                  )}
                  {entry.bengaliTranslation && (
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic border-t border-emerald-100/40 dark:border-emerald-900/20 pt-2">
                      "{entry.bengaliTranslation}"
                    </p>
                  )}
                </div>
              )}

              {/* 4 Reflection Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {entry.coreLessons && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-400 block mb-0.5">
                      আয়াতের মূল শিক্ষা:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {entry.coreLessons}
                    </p>
                  </div>
                )}

                {entry.personalThoughts && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-400 block mb-0.5">
                      আয়াতটি নিয়ে আমার চিন্তা:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {entry.personalThoughts}
                    </p>
                  </div>
                )}

                {entry.lifeApplication && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-400 block mb-0.5">
                      আমার জীবনে প্রয়োগ:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {entry.lifeApplication}
                    </p>
                  </div>
                )}

                {entry.actionItems && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-400 block mb-0.5">
                      এই আয়াত থেকে আমার করণীয়:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {entry.actionItems}
                    </p>
                  </div>
                )}
              </div>

              {/* Personal Dua / Intention */}
              {entry.personalDuaIntention && (
                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/50 text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-semibold">ব্যক্তিগত দোয়া বা সংকল্প: </span>
                  {entry.personalDuaIntention}
                </div>
              )}

              {/* Tags and footer */}
              {entry.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-slate-400">
                  <Tag className="w-3 h-3 text-slate-400" />
                  {entry.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
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
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingEntry ? 'তাদাব্বুর সম্পাদনা করুন' : '+ নতুন কুরআনিক তাদাব্বুর যোগ করুন'}
                </h3>
                <p className="text-xs text-slate-500">
                  আয়াত তিলাওয়াত করুন, মর্ম চিন্তা করুন এবং জীবনের শিক্ষা লিখে রাখুন।
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 rounded-xl">
                  {formError}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ১. তাদাব্বুরের শিরোনাম <span className="text-emerald-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: সূরা মুলক থেকে মৃত্যুর ও জীবনের উদ্দেশ্য অনুধাবন"
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* Surah & Verse Reference Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ২. সূরার নাম ও নম্বর
                  </label>
                  <select
                    value={surahNumber}
                    onChange={(e) => handleSurahSelectChange(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                  >
                    {ALL_114_SURAHS.map((s) => (
                      <option key={s.number} value={s.number}>
                        {s.number}. সূরা {s.nameBn} ({s.nameAr}) — {s.numberOfAyahs} আয়াত
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ৩. আয়াত নম্বর / সীমা
                  </label>
                  <input
                    type="text"
                    value={verseNumber}
                    onChange={(e) => setVerseNumber(e.target.value)}
                    placeholder="যেমন: ১ অথবা ১-৫"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Arabic Verse */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ৪. আরবি আয়াত (ঐচ্ছিক / কুরআন থেকে কপি)
                </label>
                <textarea
                  dir="rtl"
                  rows={2}
                  value={arabicVerse}
                  onChange={(e) => setArabicVerse(e.target.value)}
                  placeholder="আরবি আয়াতের পাঠ..."
                  className="w-full text-sm font-arabic px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* Bengali Translation */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ৫. বাংলা অনুবাদ ও উৎস
                </label>
                <textarea
                  rows={2}
                  value={bengaliTranslation}
                  onChange={(e) => setBengaliTranslation(e.target.value)}
                  placeholder="আয়াতের বিশুদ্ধ বাংলা অনুবাদ..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              {/* 4 Core Pillars of Tadabbur */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                  তাদাব্বুর ও জীবনঘনিষ্ঠ উপলব্ধি
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    ৬. আয়াতের মূল শিক্ষা
                  </label>
                  <textarea
                    rows={2}
                    value={coreLessons}
                    onChange={(e) => setCoreLessons(e.target.value)}
                    placeholder="এই আয়াত থেকে আল্লাহ আমাদের কী মৌলিক শিক্ষা দিচ্ছেন?"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    ৭. আয়াতটি নিয়ে আমার চিন্তা ও হৃদয়ের অনুভূতি
                  </label>
                  <textarea
                    rows={2}
                    value={personalThoughts}
                    onChange={(e) => setPersonalThoughts(e.target.value)}
                    placeholder="আয়াতটি পাঠ করে আপনার অন্তরে কী অনুভূতি ও চিন্তা জাগ্রত হলো?"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      ৮. আমার জীবনে এই আয়াতের প্রয়োগ
                    </label>
                    <textarea
                      rows={2}
                      value={lifeApplication}
                      onChange={(e) => setLifeApplication(e.target.value)}
                      placeholder="পরিবার, কর্মক্ষেত্র বা সমাজে কীভাবে পালন করব?"
                      className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      ৯. এই আয়াত থেকে আমার করণীয় (Action Items)
                    </label>
                    <textarea
                      rows={2}
                      value={actionItems}
                      onChange={(e) => setActionItems(e.target.value)}
                      placeholder="আজ বা এই সপ্তাহে কী বাস্তব আমল করব?"
                      className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    ১০. ব্যক্তিগত দোয়া বা সংকল্প
                  </label>
                  <input
                    type="text"
                    value={personalDuaIntention}
                    onChange={(e) => setPersonalDuaIntention(e.target.value)}
                    placeholder="হে আল্লাহ! আমাকে এই আয়াতের ওপর অবিচল থাকার তৌফিক দিন..."
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Date & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    ১১. তারিখ
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    ১২. ট্যাগ বা বিষয়বস্তু (কমা দিয়ে পৃথক করুন)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="যেমন: তাওহিদ, ধৈর্য, রিজিক, পিতা-মাতা"
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Bookmark Toggle */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isBookmarked}
                  onChange={(e) => setIsBookmarked(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  গুরুত্বপূর্ণ তাদাব্বুর হিসেবে বুকমার্ক করে রাখুন
                </span>
              </label>

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
                  <Check className="w-4 h-4" />
                  তাদাব্বুর সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
