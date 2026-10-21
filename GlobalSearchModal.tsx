import React, { useState, useMemo } from 'react';
import { Search, X, BookOpen, HeartHandshake, ShieldAlert, Sparkles, CheckSquare, FileText } from 'lucide-react';
import { storage } from '../../services/storage';
import { VERIFIED_DUAS, SURAH_METADATA_LIST } from '../../data/verifiedContent';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, itemId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'quran' | 'sunnah' | 'halal' | 'dua' | 'task' | 'note'>('all');

  const worshipItems = useMemo(() => storage.getWorshipItems(), [isOpen]);
  const commands = useMemo(() => storage.getQuranCommands(), [isOpen]);
  const prohibitions = useMemo(() => storage.getProhibitedActions(), [isOpen]);
  const sunnahItems = useMemo(() => storage.getSunnahItems(), [isOpen]);
  const halalTopics = useMemo(() => storage.getHalalHaramTopics(), [isOpen]);
  const tasks = useMemo(() => storage.getTasks(), [isOpen]);
  const notes = useMemo(() => storage.getNotes(), [isOpen]);
  const tadabburEntries = useMemo(() => storage.getTadabburEntries(), [isOpen]);
  const muhasabahEntries = useMemo(() => storage.getMuhasabahEntries(), [isOpen]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: Array<{
      id: string;
      title: string;
      snippet: string;
      category: string;
      type: 'quran' | 'sunnah' | 'halal' | 'dua' | 'task' | 'note' | 'worship';
      targetView: string;
      icon: any;
    }> = [];

    // Quran Commands & Surahs
    if (selectedFilter === 'all' || selectedFilter === 'quran') {
      SURAH_METADATA_LIST.forEach((s) => {
        if (s.nameBn.toLowerCase().includes(q) || s.nameEn.toLowerCase().includes(q) || s.nameAr.includes(q)) {
          results.push({
            id: `surah_${s.number}`,
            title: `সূরা ${s.nameBn} (${s.nameAr})`,
            snippet: `${s.numberOfAyahs} আয়াত · ${s.revelationType === 'Meccan' ? 'মাক্কী' : 'মাদানী'}`,
            category: 'কুরআন',
            type: 'quran',
            targetView: 'quran',
            icon: BookOpen,
          });
        }
      });

      commands.forEach((c) => {
        if (c.titleBn.toLowerCase().includes(q) || c.explanationBn.toLowerCase().includes(q) || c.surahName.toLowerCase().includes(q)) {
          results.push({
            id: c.id,
            title: c.titleBn,
            snippet: `${c.surahName} (${c.ayahNumber}): ${c.explanationBn.slice(0, 75)}...`,
            category: 'আল্লাহর আদেশ',
            type: 'quran',
            targetView: 'commands',
            icon: BookOpen,
          });
        }
      });
    }

    // Sunnah
    if (selectedFilter === 'all' || selectedFilter === 'sunnah') {
      sunnahItems.forEach((s) => {
        if (s.titleBn.toLowerCase().includes(q) || s.explanationBn.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)) {
          results.push({
            id: s.id,
            title: s.titleBn,
            snippet: `${s.hadithSource}: ${s.explanationBn.slice(0, 75)}...`,
            category: `সুন্নাহ · ${s.category}`,
            type: 'sunnah',
            targetView: 'sunnah',
            icon: Sparkles,
          });
        }
      });
    }

    // Halal / Haram
    if (selectedFilter === 'all' || selectedFilter === 'halal') {
      halalTopics.forEach((h) => {
        if (h.titleBn.toLowerCase().includes(q) || h.situationBn.toLowerCase().includes(q) || h.explanationBn.toLowerCase().includes(q)) {
          results.push({
            id: h.id,
            title: h.titleBn,
            snippet: `${h.verdict === 'halal' ? 'হালাল' : h.verdict === 'haram' ? 'হারাম' : 'সন্দেহযুক্ত'}: ${h.situationBn.slice(0, 75)}...`,
            category: `হালাল-হারাম · ${h.category}`,
            type: 'halal',
            targetView: 'halal_haram',
            icon: ShieldAlert,
          });
        }
      });
    }

    // Duas
    if (selectedFilter === 'all' || selectedFilter === 'dua') {
      VERIFIED_DUAS.forEach((d) => {
        if (d.titleBn.toLowerCase().includes(q) || d.bengaliMeaning.toLowerCase().includes(q) || d.bengaliPronunciation.toLowerCase().includes(q)) {
          results.push({
            id: d.id,
            title: d.titleBn,
            snippet: d.bengaliMeaning.slice(0, 80) + '...',
            category: `দোয়া · ${d.category}`,
            type: 'dua',
            targetView: 'hadith_duas',
            icon: HeartHandshake,
          });
        }
      });
    }

    // Tasks
    if (selectedFilter === 'all' || selectedFilter === 'task') {
      tasks.forEach((t) => {
        if (t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))) {
          results.push({
            id: t.id,
            title: t.title,
            snippet: `মেয়াদ: ${t.dueDate} · ক্যাটেগরি: ${t.category}`,
            category: 'কাজের তালিকা',
            type: 'task',
            targetView: 'tasks',
            icon: CheckSquare,
          });
        }
      });
    }

    // Notes
    if (selectedFilter === 'all' || selectedFilter === 'note') {
      notes.forEach((n) => {
        if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
          results.push({
            id: n.id,
            title: n.title,
            snippet: n.content.slice(0, 80) + '...',
            category: `নোট · ${n.category}`,
            type: 'note',
            targetView: 'notes',
            icon: FileText,
          });
        }
      });
    }

    // Tadabbur
    if (selectedFilter === 'all' || selectedFilter === 'quran') {
      tadabburEntries.forEach((t) => {
        if (
          t.title.toLowerCase().includes(q) ||
          t.surahName.toLowerCase().includes(q) ||
          (t.coreLessons && t.coreLessons.toLowerCase().includes(q)) ||
          (t.bengaliTranslation && t.bengaliTranslation.toLowerCase().includes(q))
        ) {
          results.push({
            id: t.id,
            title: `তাদাব্বুর: ${t.title}`,
            snippet: `সূরা ${t.surahName} (${t.verseNumber}) · ${t.coreLessons ? t.coreLessons.slice(0, 75) + '...' : ''}`,
            category: 'কুরআনিক তাদাব্বুর',
            type: 'quran',
            targetView: 'tadabbur',
            icon: BookOpen,
          });
        }
      });
    }

    // Muhasabah Reflections
    if (selectedFilter === 'all' || selectedFilter === 'note') {
      muhasabahEntries.forEach((m) => {
        if (
          m.title.toLowerCase().includes(q) ||
          (m.goodDeeds && m.goodDeeds.toLowerCase().includes(q)) ||
          (m.gratitudeItems && m.gratitudeItems.toLowerCase().includes(q))
        ) {
          results.push({
            id: m.id,
            title: m.title,
            snippet: `${m.date} · ${m.goodDeeds ? m.goodDeeds.slice(0, 75) + '...' : ''}`,
            category: 'আত্মপর্যালোচনা',
            type: 'note',
            targetView: 'reflection',
            icon: Sparkles,
          });
        }
      });
    }

    return results;
  }, [query, selectedFilter, commands, sunnahItems, halalTopics, tasks, notes, tadabburEntries, muhasabahEntries]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="কুরআন, হাদিস, সুন্নাহ, দোয়া, হালাল-হারাম বা ব্যক্তিগত নোট খুঁজুন..."
            className="w-full text-sm bg-transparent border-0 focus:outline-hidden text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
            >
              মুছুন
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'সবগুলো' },
            { id: 'quran', label: 'কুরআন ও নির্দেশ' },
            { id: 'sunnah', label: 'সুন্নাহ' },
            { id: 'halal', label: 'হালাল-হারাম' },
            { id: 'dua', label: 'হাদিস ও দোয়া' },
            { id: 'task', label: 'কাজ' },
            { id: 'note', label: 'নোট' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`px-3 py-1 font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedFilter === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {!query.trim() ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              অনুসন্ধান করতে কোনো শব্দ লিখুন (যেমন: সুন্নাহ, সালাত, গীবত, সূরা মূলক, রোজা)
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              কোনো ফলাফল পাওয়া যায়নি। অন্য শব্দ দিয়ে অনুসন্ধান করুন।
            </div>
          ) : (
            searchResults.map((res) => {
              const Icon = res.icon;
              return (
                <button
                  key={res.id}
                  onClick={() => {
                    onNavigate(res.targetView, res.id);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex items-start gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {res.title}
                      </h4>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {res.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {res.snippet}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
