import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  Search,
  Bookmark,
  Play,
  Pause,
  Volume2,
  Type,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Check,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { AppSettings, AyahItem, SurahMeta } from '../../types';
import { SURAH_METADATA_LIST, PRELOADED_SURAH_AYAHS } from '../../data/verifiedContent';
import { toBengaliDigits } from '../../utils/dateAndNumerals';

interface QuranReaderViewProps {
  settings: AppSettings;
  onOpenTadabbur?: (verseData: {
    surahNumber: number;
    surahName: string;
    ayahNumber: number | string;
    textAr?: string;
    textBn?: string;
  }) => void;
}

export const QuranReaderView: React.FC<QuranReaderViewProps> = ({ settings, onOpenTadabbur }) => {
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [arabicFontSize, setArabicFontSize] = useState<number>(settings.arabicFontSize || 26);
  const [bengaliFontSize, setBengaliFontSize] = useState<number>(settings.bengaliFontSize || 15);
  const [showSettings, setShowSettings] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [bookmarkedAyah, setBookmarkedAyah] = useState<{ surah: number; ayah: number } | null>(() => {
    const raw = localStorage.getItem('mydeen_quran_bookmark');
    return raw ? JSON.parse(raw) : { surah: 1, ayah: 1 };
  });

  const [surahAyahs, setSurahAyahs] = useState<AyahItem[]>([]);
  const [isLoadingAyahs, setIsLoadingAyahs] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bnNums = settings.useBengaliNumerals;

  const currentSurahMeta = useMemo(() => {
    return SURAH_METADATA_LIST.find((s) => s.number === selectedSurahNumber) || SURAH_METADATA_LIST[0];
  }, [selectedSurahNumber]);

  // Load Ayahs: Preloaded or fetch from verified Al-Quran Cloud API
  useEffect(() => {
    let isMounted = true;
    if (PRELOADED_SURAH_AYAHS[selectedSurahNumber]) {
      setSurahAyahs(PRELOADED_SURAH_AYAHS[selectedSurahNumber]);
      setIsLoadingAyahs(false);
      setFetchError(null);
      return;
    }

    // Fetch from Al-Quran Cloud API
    setIsLoadingAyahs(true);
    setFetchError(null);

    const cacheKey = `quran_surah_cache_${selectedSurahNumber}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setSurahAyahs(JSON.parse(cached));
        setIsLoadingAyahs(false);
        return;
      } catch {}
    }

    fetch(`https://api.alquran.cloud/v1/surah/${selectedSurahNumber}/editions/quran-uthmani,bn.bengali,en.sahih`)
      .then((res) => {
        if (!res.ok) throw new Error('কুরআনের তথ্য লোড করা যায়নি');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (data.data && Array.isArray(data.data) && data.data.length >= 2) {
          const arEdition = data.data[0].ayahs;
          const bnEdition = data.data[1].ayahs;
          const enEdition = data.data[2]?.ayahs || [];

          const items: AyahItem[] = arEdition.map((ayah: any, index: number) => ({
            number: ayah.number,
            numberInSurah: ayah.numberInSurah,
            textAr: ayah.text,
            textBn: bnEdition[index]?.text || '',
            textEn: enEdition[index]?.text || '',
          }));

          setSurahAyahs(items);
          localStorage.setItem(cacheKey, JSON.stringify(items));
        }
        setIsLoadingAyahs(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setIsLoadingAyahs(false);
        setFetchError('ইন্টারনেট সংযোগ না থাকায় বা সার্ভার ব্যস্ত থাকায় এই সূরাটি লোড করা যায়নি।');
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSurahNumber]);

  // Audio Playback
  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      audioRef.current?.pause();
      setIsPlayingAudio(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      setAudioLoading(true);
      // Mishary Rashid Alafasy recitation by surah
      const paddedSurah = String(selectedSurahNumber).padStart(3, '0');
      audioRef.current.src = `https://server8.mp3quran.net/afs/${paddedSurah}.mp3`;
      audioRef.current.play()
        .then(() => {
          setIsPlayingAudio(true);
          setAudioLoading(false);
        })
        .catch(() => {
          setAudioLoading(false);
          setIsPlayingAudio(false);
        });

      audioRef.current.onended = () => {
        setIsPlayingAudio(false);
      };
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [selectedSurahNumber]);

  const handleBookmark = (surahNum: number, ayahNum: number) => {
    const bm = { surah: surahNum, ayah: ayahNum };
    setBookmarkedAyah(bm);
    localStorage.setItem('mydeen_quran_bookmark', JSON.stringify(bm));
  };

  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return SURAH_METADATA_LIST;
    const q = searchQuery.toLowerCase();
    return SURAH_METADATA_LIST.filter(
      (s) =>
        s.nameBn.toLowerCase().includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        s.nameAr.includes(q) ||
        String(s.number).includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6 pb-20">
      {/* Quran Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              আল-কুরআনুল কারিম
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            আরবি মূল পাঠ, নির্ভরযোগ্য বাংলা অনুবাদ ও অডিও তিলাওয়াত।
          </p>
        </div>

        {/* Audio Recitation & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleToggleAudio}
            disabled={audioLoading}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
              isPlayingAudio
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {audioLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : isPlayingAudio ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>{isPlayingAudio ? 'তিলাওয়াত থামান' : 'অডিও শুনুন (আলাফাসী)'}</span>
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="ফন্ট সাইজ পরিবর্তন"
          >
            <Type className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Font Size & Settings Modal/Strip */}
      {showSettings && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3 text-xs">
          <div className="font-semibold text-slate-900 dark:text-white">
            তিলাওয়াত ফন্ট সাইজ নিয়ন্ত্রণ
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 mb-1">
                আরবি ফন্ট সাইজ: {toBengaliDigits(arabicFontSize, bnNums)}px
              </label>
              <input
                type="range"
                min="20"
                max="40"
                value={arabicFontSize}
                onChange={(e) => setArabicFontSize(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">
                বাংলা ফন্ট সাইজ: {toBengaliDigits(bengaliFontSize, bnNums)}px
              </label>
              <input
                type="range"
                min="13"
                max="22"
                value={bengaliFontSize}
                onChange={(e) => setBengaliFontSize(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Surah Selector & Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Surah List Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="সূরা খুঁজুন (যেমন: ইয়াসিন, মুলক)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 max-h-[600px] overflow-y-auto space-y-1 shadow-xs">
            {filteredSurahs.map((surah) => {
              const isSelected = surah.number === selectedSurahNumber;
              return (
                <button
                  key={surah.number}
                  onClick={() => setSelectedSurahNumber(surah.number)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-mono shrink-0 ${
                        isSelected
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {toBengaliDigits(surah.number, bnNums)}
                    </span>
                    <div className="truncate">
                      <div className="text-xs truncate">{surah.nameBn}</div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {surah.nameEn}
                      </div>
                    </div>
                  </div>

                  <span className={`text-xs font-arabic shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                    {surah.nameAr}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reader Display Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Surah Title Banner */}
          <div className="p-6 bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-2xl shadow-md text-center relative overflow-hidden">
            <div className="text-xs uppercase tracking-widest text-emerald-300 font-semibold mb-1">
              {currentSurahMeta.revelationType === 'Meccan' ? 'মাক্কী সূরা' : 'মাদানী সূরা'} · {toBengaliDigits(currentSurahMeta.numberOfAyahs, bnNums)}টি আয়াত
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-arabic mb-1">
              سُورَةُ {currentSurahMeta.nameAr}
            </h2>
            <div className="text-base sm:text-lg font-bold text-white">
              সূরা {currentSurahMeta.nameBn} ({currentSurahMeta.nameEn})
            </div>
            <div className="text-xs text-emerald-200 mt-1">
              অর্থ: {currentSurahMeta.englishMeaning}
            </div>

            {/* Bismillah (except for Surah At-Tawbah #9) */}
            {selectedSurahNumber !== 9 && selectedSurahNumber !== 1 && (
              <div className="mt-4 pt-4 border-t border-emerald-800/80 text-xl font-arabic text-emerald-100">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
            )}
          </div>

          {/* Ayahs Stream */}
          {isLoadingAyahs ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
              <p className="text-xs">সূরা লোড হচ্ছে...</p>
            </div>
          ) : fetchError ? (
            <div className="p-8 text-center text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/40 space-y-3">
              <p className="text-xs">{fetchError}</p>
              <button
                onClick={() => setSelectedSurahNumber(1)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
              >
                সূরা ফাতিহায় ফিরে যান
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {surahAyahs.map((ayah) => {
                const isBookmarked =
                  bookmarkedAyah?.surah === selectedSurahNumber &&
                  bookmarkedAyah?.ayah === ayah.numberInSurah;

                return (
                  <div
                    key={ayah.number}
                    className={`p-5 bg-white dark:bg-slate-900 border rounded-2xl shadow-2xs space-y-3 transition-colors ${
                      isBookmarked
                        ? 'border-amber-400 dark:border-amber-600 bg-amber-50/10'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Top verse number and bookmark */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold flex items-center justify-center">
                          {toBengaliDigits(ayah.numberInSurah, bnNums)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          আয়াত {toBengaliDigits(ayah.numberInSurah, bnNums)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {onOpenTadabbur && (
                          <button
                            onClick={() =>
                              onOpenTadabbur({
                                surahNumber: selectedSurahNumber,
                                surahName: currentSurahMeta.nameBn,
                                ayahNumber: ayah.numberInSurah,
                                textAr: ayah.textAr,
                                textBn: ayah.textBn,
                              })
                            }
                            className="px-2 py-1 text-[11px] font-medium rounded-lg text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 flex items-center gap-1 transition-colors"
                            title="এই আয়াত নিয়ে তাদাব্বুর করুন"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>তাদাব্বুর</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleBookmark(selectedSurahNumber, ayah.numberInSurah)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isBookmarked
                              ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title="এই আয়াতে বুকমার্ক রাখুন"
                        >
                          <Bookmark className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </div>

                    {/* Arabic Text (Right to Left with custom adjustable size) */}
                    <div
                      className="text-right font-arabic leading-loose text-slate-900 dark:text-white font-normal"
                      style={{ fontSize: `${arabicFontSize}px`, lineHeight: 2.2 }}
                      dir="rtl"
                    >
                      {ayah.textAr} ﴿{toBengaliDigits(ayah.numberInSurah, bnNums)}﴾
                    </div>

                    {/* Bengali Translation */}
                    <div
                      className="text-slate-700 dark:text-slate-300 leading-relaxed font-bengali pt-2 border-t border-slate-100 dark:border-slate-800"
                      style={{ fontSize: `${bengaliFontSize}px` }}
                    >
                      {ayah.textBn}
                    </div>

                    {/* Optional English */}
                    {ayah.textEn && (
                      <div className="text-[11px] text-slate-400 italic">
                        {ayah.textEn}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Surah Navigation (Previous / Next) */}
          <div className="flex items-center justify-between pt-4">
            <button
              disabled={selectedSurahNumber <= 1}
              onClick={() => setSelectedSurahNumber((n) => Math.max(1, n - 1))}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              পূর্ববর্তী সূরা
            </button>

            <button
              disabled={selectedSurahNumber >= 114}
              onClick={() => setSelectedSurahNumber((n) => Math.min(114, n + 1))}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1.5"
            >
              পরবর্তী সূরা
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
