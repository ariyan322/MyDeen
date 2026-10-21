import React, { useState, useMemo } from 'react';
import { FileText, Plus, Search, Pin, Bookmark, Edit2, Trash2, Copy, Check, Tag } from 'lucide-react';
import { AppSettings, Note } from '../../types';
import { storage } from '../../services/storage';
import { formatBengaliDate, toBengaliDigits } from '../../utils/dateAndNumerals';
import { CustomItemModal } from '../modals/CustomItemModal';

interface NotesViewProps {
  settings: AppSettings;
}

export const NotesView: React.FC<NotesViewProps> = ({ settings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const bnNums = settings.useBengaliNumerals;
  const notes = useMemo(() => storage.getNotes(), [refreshKey]);

  const categories = useMemo(() => {
    const set = new Set(notes.map((n) => n.category));
    return ['all', ...Array.from(set)];
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchCat = selectedCategory === 'all' || n.category === selectedCategory;
      const matchQ =
        !searchQuery.trim() ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQ;
    });
  }, [notes, selectedCategory, searchQuery]);

  const handleTogglePin = (note: Note) => {
    storage.saveNote({ ...note, isPinned: !note.isPinned, updatedAt: new Date().toISOString() });
    setRefreshKey((k) => k + 1);
  };

  const handleCopyNote = (note: Note) => {
    const text = `${note.title}\n\n${note.content}${note.quranHadithRef ? `\n\nরেফারেন্স: ${note.quranHadithRef}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              ব্যক্তিগত নোট ও ইসলামিক ডায়েরি
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            কুরআন-হাদিসের শিক্ষা, দ্বীনি আলোচনা, ফতোয়ার নোট এবং ব্যক্তিগত আত্মশুদ্ধির ভাবনা।
          </p>
        </div>

        <button
          onClick={() => {
            setEditingNote(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          নতুন নোট লিখুন
        </button>
      </div>

      {/* Search & Category Tabs */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নোটের শিরোনাম, বিষয় বা ট্যাগ অনুসন্ধান করুন..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
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
              {cat === 'all' ? 'সকল নোট' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Masonry/Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
            <p className="text-xs">কোনো নোট খুঁজে পাওয়া যায়নি।</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`p-5 bg-white dark:bg-slate-900 border rounded-2xl shadow-xs space-y-3 flex flex-col justify-between transition-all ${
                note.isPinned
                  ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/10'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="space-y-2">
                {/* Category & Pin */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                    {note.category}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePin(note)}
                      className={`p-1.5 rounded-md transition-colors ${
                        note.isPinned
                          ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title="পিন করে রাখুন"
                    >
                      <Pin className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      onClick={() => handleCopyNote(note)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="কপি করুন"
                    >
                      {copiedId === note.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingNote(note);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="সম্পাদনা"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {note.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {note.content}
                </p>

                {note.quranHadithRef && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300 border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold">সূত্র: </span>
                    {note.quranHadithRef}
                  </div>
                )}
              </div>

              {/* Tags and date */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {note.tags.map((tag, i) => (
                    <span key={i} className="text-slate-500">
                      #{tag}
                    </span>
                  ))}
                </div>
                <span>
                  {formatBengaliDate(note.createdAt.split('T')[0], bnNums)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <CustomItemModal
        isOpen={isModalOpen}
        type="note"
        item={editingNote}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNote(null);
        }}
        onSave={(t, data) => {
          storage.saveNote(data);
          setRefreshKey((k) => k + 1);
        }}
        onDelete={(t, id) => {
          storage.deleteNote(id);
          setRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
};
