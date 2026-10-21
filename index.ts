export type ThemeMode = 'light' | 'dark';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatarIcon?: string;
  pinCode?: string; // Optional 4-digit PIN for private local storage
  createdAt: string;
}

export interface AppSettings {
  language: 'bn' | 'en';
  theme: ThemeMode;
  useBengaliNumerals: boolean;
  arabicFontSize: number; // e.g. 24
  bengaliFontSize: number; // e.g. 16
  prayerCity: string; // 'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh'
  prayerMethod: 'Karachi' | 'IslamicFoundation' | 'MuslimWorldLeague' | 'Makkah';
  asrMethod: 'Hanafi' | 'Standard';
  hijriOffsetDays: number; // e.g. 0, +1, -1 for moonsighting
  notificationEnabled: boolean;
  visibleDashboardSections: {
    hero: boolean;
    prayerTimes: boolean;
    worshipTracker: boolean;
    tadabbur: boolean;
    quranProgress: boolean;
    adhkarQuick: boolean;
    commandsReflection: boolean;
    sunnahChecklist: boolean;
    prohibitedChecklist: boolean;
    tasks: boolean;
    goals: boolean;
    reflection: boolean;
  };
}

export type WorshipStatus = 'completed' | 'missed' | 'na';

export interface WorshipItem {
  id: string;
  nameBn: string;
  nameAr?: string;
  nameEn?: string;
  category: 'fard_prayer' | 'sunnah_nafl' | 'quran' | 'dhikr' | 'charity_fasting' | 'learning' | 'custom';
  isObligatory: boolean;
  isCustom: boolean;
  defaultTarget?: number;
  unit?: string; // 'ওয়াক্ত', 'পৃষ্ঠা', 'বার', 'মিনিট', 'টাকা'
  icon?: string;
  reminderTime?: string;
  descriptionBn?: string;
}

export interface WorshipRecord {
  date: string; // YYYY-MM-DD
  itemId: string;
  status: WorshipStatus;
  count?: number;
  completedAt?: string;
  notes?: string;
}

export type QuranCommandStatus = 'tried_or_fulfilled' | 'failed' | 'na' | 'review_later';

export interface QuranCommand {
  id: string;
  titleBn: string;
  explanationBn: string;
  category: string;
  surahName: string;
  ayahNumber: string;
  arabicVerse: string;
  bengaliVerse: string;
  reflectionQuestion: string;
  isCustom?: boolean;
}

export interface QuranCommandRecord {
  date: string;
  commandId: string;
  status: QuranCommandStatus;
  notes?: string;
}

export type ProhibitedActionStatus = 'abstained' | 'mistake_made' | 'na' | 'want_to_learn';

export interface ProhibitedAction {
  id: string;
  titleBn: string;
  explanationBn: string;
  category: string;
  quranProof?: string;
  hadithProof?: string;
  reflectionQuestion: string;
  gentleAdviceBn?: string;
  isCustom?: boolean;
}

export interface ProhibitedRecord {
  date: string;
  prohibitionId: string;
  status: ProhibitedActionStatus;
  notes?: string;
}

export interface SunnahItem {
  id: string;
  titleBn: string;
  category: string; // 'ঘুম থেকে উঠা', 'ঘর ও মসজিদ', 'খাবার ও পানীয়', 'সালাম ও শিষ্টাচার', 'পরিবার ও সমাজ', 'জুমার দিন', 'অন্যান্য'
  explanationBn: string;
  howToPerformBn: string;
  arabicDua?: string;
  bengaliMeaning?: string;
  hadithSource: string;
  hadithNumber?: string;
  isObligatory: boolean;
  isCustom?: boolean;
}

export interface SunnahRecord {
  date: string;
  sunnahId: string;
  status: 'completed' | 'missed' | 'na';
  notes?: string;
}

export interface HalalHaramTopic {
  id: string;
  titleBn: string;
  situationBn: string;
  explanationBn: string;
  category: string;
  verdict: 'halal' | 'haram' | 'doubtful_conditional';
  quranEvidence?: string;
  hadithEvidence?: string;
  scholarlyConsensus?: string;
  conditionsAndExceptions?: string;
  isBookmarked?: boolean;
  userNotes?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: 'ইবাদত' | 'পড়াশোনা' | 'কাজ' | 'পরিবার' | 'স্বাস্থ্য' | 'ব্যক্তিগত' | 'অন্যান্য' | string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string; // YYYY-MM-DD
  dueTime?: string;
  isCompleted: boolean;
  completedAt?: string;
  isRecurring?: boolean;
  notes?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'কুরআন অধ্যয়ন' | 'হাদিস অধ্যয়ন' | 'ইসলামিক আলোচনা' | 'আত্মপর্যালোচনা' | 'দ্বীনি পরিকল্পনা' | 'আলেমদের জিজ্ঞাসা' | 'অন্যান্য' | string;
  tags: string[];
  isPinned: boolean;
  isBookmarked: boolean;
  quranHadithRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  targetDate: string;
  isCompleted: boolean;
  notes?: string;
}

export interface CustomQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface MuhasabahEntry {
  id: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  title: string;
  goodDeeds?: string;
  mistakesMade?: string;
  learnedToday?: string;
  rightsRectification?: string;
  seekForgivenessFor?: string;
  gratitudeItems?: string;
  tomorrowImprovements?: string;
  personalNotes?: string;
  customQuestions?: CustomQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface DailyReflection {
  date: string;
  answers: {
    fivePrayers?: string;
    quranRecitation?: string;
    behaviorWithOthers?: string;
    rectifiedMistake?: string;
    violatedRights?: string;
    newLearnings?: string;
    improvementTarget?: string;
    [customKey: string]: string | undefined;
  };
  notes?: string;
}

export interface TadabburEntry {
  id: string;
  userId?: string;
  title: string;
  surahName: string;
  surahNumber: number;
  verseNumber: string; // e.g. "255" or "1-5"
  arabicVerse?: string;
  bengaliTranslation?: string;
  translationSource?: string;
  coreLessons?: string;
  personalThoughts?: string;
  lifeApplication?: string;
  actionItems?: string;
  personalDuaIntention?: string;
  personalNotes?: string;
  date: string; // YYYY-MM-DD
  tags: string[];
  isBookmarked?: boolean;
  verificationStatus: 'verified' | 'unverified';
  createdAt: string;
  updatedAt: string;
}

export interface TafsirSourceMeta {
  id: string;
  titleBn: string;
  titleEn: string;
  authorBn: string;
  authorEn: string;
  language: string;
  sourceUrl?: string;
  licenseOrTerms?: string;
  availabilityStatus: 'included' | 'sample_available' | 'requires_external_license';
  verificationMetadata?: string;
  descriptionBn: string;
}

export interface QuranStudyNote {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  selectedTranslation?: string;
  selectedTafsirId?: string;
  noteText: string;
  isBookmarked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderItem {
  id: string;
  titleBn: string;
  time: string; // HH:mm
  days: number[]; // 0-6
  isEnabled: boolean;
  category: string;
}

export interface TrashItem {
  id: string;
  originalId: string;
  itemType: 'worship' | 'task' | 'note' | 'goal' | 'command' | 'sunnah' | 'prohibition' | 'muhasabah' | 'tadabbur' | 'quran_note';
  itemData: any;
  deletedAt: string;
  title: string;
}

export interface SurahMeta {
  number: number;
  nameAr: string;
  nameBn: string;
  nameEn: string;
  englishMeaning: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface AyahItem {
  number: number;
  numberInSurah: number;
  textAr: string;
  textBn: string;
  textEn?: string;
}

export interface DuaItem {
  id: string;
  titleBn: string;
  category: 'সকাল-সন্ধ্যা' | 'ঘুম' | 'খাবার' | 'নামাজ' | 'মসজিদ ও ঘর' | 'সফর' | 'তাওবা ও ইস্তিগফার' | 'বিপদ ও নিরাপত্তা';
  arabicText: string;
  bengaliPronunciation: string;
  bengaliMeaning: string;
  source: string;
  virtueBn?: string;
  targetCount?: number;
}
