import React, { useState, useMemo } from 'react';
import { HelpCircle, Search, Bookmark, BookmarkCheck, AlertTriangle, CheckCircle, AlertCircle, Info, BookOpen } from 'lucide-react';
import { AppSettings, HalalHaramTopic } from '../../types';
import { storage } from '../../services/storage';

interface HalalHaramViewProps {
  settings: AppSettings;
}

export const HalalHaramView: React.FC<HalalHaramViewProps> = ({ settings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const topics = useMemo(() => storage.getHalalHaramTopics(), [refreshKey]);

  const categories = useMemo(() => {
    const set = new Set(topics.map((t) => t.category));
    return ['all', ...Array.from(set)];
  }, [topics]);

  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
      const matchBookmark = !showBookmarksOnly || t.isBookmarked;
      const matchQ =
        !searchQuery.trim() ||
        t.titleBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.situationBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.explanationBn.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchBookmark && matchQ;
    });
  }, [topics, selectedCategory, showBookmarksOnly, searchQuery]);

  const handleToggleBookmark = (id: string) => {
    storage.toggleTopicBookmark(id);
    setRefreshKey((k) => k + 1);
  };

  const handleSaveNote = (id: string, note: string) => {
    storage.saveTopicNote(id, note);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-600" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            হালাল-হারাম: সঠিকভাবে জানি
          </h1>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          কুরআন, সুন্নাহ ও উলামায়ে কেরামের সর্বসম্মত মতামতের ভিত্তিতে প্রতিদিনের হালাল-হারাম বিধান ও সতর্কতা।
        </p>

        {/* Scholarly Advisory Note */}
        <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong>সতর্কতা:</strong> এটি একটি নির্ভরযোগ্য শিক্ষামূলক গাইড। ব্যক্তিগত জটিল কোনো ফিকহি বিষয় বা পারিবারিক বিবাদে বিশ্বস্ত স্থানীয় মুফতি বা অভিজ্ঞ আলেমের সরাসরি পরামর্শ গ্রহণ করুন।
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="কোনো কাজ হালাল নাকি হারাম জানতে চান? অনুসন্ধান করুন..."
          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600 shadow-2xs"
        />
      </div>

      {/* Filter Tabs & Bookmark Toggle */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
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
              {cat === 'all' ? 'সকল বিষয়' : cat}
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
          বুকমার্ক
        </button>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {filteredTopics.map((topic) => {
          const isHalal = topic.verdict === 'halal';
          const isHaram = topic.verdict === 'haram';

          return (
            <div
              key={topic.id}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 ${
                        isHalal
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : isHaram
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {isHalal ? <CheckCircle className="w-3.5 h-3.5" /> : isHaram ? <AlertCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      {isHalal ? 'হালাল (বৈধ)' : isHaram ? 'হারাম (নিষিদ্ধ)' : 'সন্দেহযুক্ত / শর্তসাপেক্ষ'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {topic.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {topic.titleBn}
                  </h3>
                </div>

                <button
                  onClick={() => handleToggleBookmark(topic.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    topic.isBookmarked
                      ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="বুকমার্ক করুন"
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                </button>
              </div>

              {/* Question / Situation */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200">
                <span className="text-slate-400">পরিস্থিতি বা প্রশ্ন: </span>
                {topic.situationBn}
              </div>

              {/* Bengali Explanation */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {topic.explanationBn}
              </p>

              {/* Quran & Hadith Evidence */}
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-emerald-50/20 dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-100/40 dark:border-emerald-900/20">
                {topic.quranEvidence && (
                  <div>
                    <span className="font-semibold text-emerald-900 dark:text-emerald-300">কুরআনের প্রমাণ: </span>
                    {topic.quranEvidence}
                  </div>
                )}
                {topic.hadithEvidence && (
                  <div>
                    <span className="font-semibold text-emerald-900 dark:text-emerald-300">হাদিসের প্রমাণ: </span>
                    {topic.hadithEvidence}
                  </div>
                )}
                {topic.scholarlyConsensus && (
                  <div className="text-[11px] text-slate-500 pt-0.5">
                    <span className="font-semibold">উলামায়ে কেরামের সিদ্ধান্ত: </span>
                    {topic.scholarlyConsensus}
                  </div>
                )}
                {topic.conditionsAndExceptions && (
                  <div className="text-[11px] text-amber-700 dark:text-amber-400 pt-0.5">
                    <span className="font-semibold">শর্ত বা ব্যতিক্রম: </span>
                    {topic.conditionsAndExceptions}
                  </div>
                )}
              </div>

              {/* User Personal Notes */}
              <div className="pt-1">
                <input
                  type="text"
                  value={topic.userNotes || ''}
                  onChange={(e) => handleSaveNote(topic.id, e.target.value)}
                  placeholder="এই বিষয়ে আপনার ব্যক্তিগত নোট বা ফতোয়ার রেফারেন্স সংরক্ষণ করুন..."
                  className="w-full text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
