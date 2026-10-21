import {
  UserProfile,
  AppSettings,
  WorshipItem,
  WorshipRecord,
  QuranCommand,
  QuranCommandRecord,
  ProhibitedAction,
  ProhibitedRecord,
  SunnahItem,
  SunnahRecord,
  HalalHaramTopic,
  Task,
  Note,
  Goal,
  DailyReflection,
  ReminderItem,
  TrashItem,
  MuhasabahEntry,
  TadabburEntry,
  QuranStudyNote,
} from '../types';
import {
  DEFAULT_WORSHIP_ITEMS,
  VERIFIED_QURAN_COMMANDS,
  VERIFIED_PROHIBITED_ACTIONS,
  VERIFIED_SUNNAH_ITEMS,
  VERIFIED_HALAL_HARAM_TOPICS,
} from '../data/verifiedContent';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'bn',
  theme: 'light',
  useBengaliNumerals: true,
  arabicFontSize: 24,
  bengaliFontSize: 16,
  prayerCity: 'Dhaka',
  prayerMethod: 'Karachi',
  asrMethod: 'Hanafi',
  hijriOffsetDays: 0,
  notificationEnabled: false,
  visibleDashboardSections: {
    hero: true,
    prayerTimes: true,
    worshipTracker: true,
    tadabbur: true,
    quranProgress: true,
    adhkarQuick: true,
    commandsReflection: true,
    sunnahChecklist: true,
    prohibitedChecklist: true,
    tasks: true,
    goals: true,
    reflection: true,
  },
};

const DEFAULT_PROFILE: UserProfile = {
  id: 'default_user',
  name: 'আমার আমলনামা',
  createdAt: new Date().toISOString(),
};

class StorageService {
  private activeProfileId: string;

  constructor() {
    this.activeProfileId = this.getActiveProfileId();
  }

  // --- Profile Management ---
  getProfiles(): UserProfile[] {
    const raw = localStorage.getItem('mydeen_profiles');
    if (!raw) {
      this.saveProfiles([DEFAULT_PROFILE]);
      return [DEFAULT_PROFILE];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [DEFAULT_PROFILE];
    }
  }

  saveProfiles(profiles: UserProfile[]) {
    localStorage.setItem('mydeen_profiles', JSON.stringify(profiles));
  }

  getActiveProfileId(): string {
    return localStorage.getItem('mydeen_active_profile_id') || 'default_user';
  }

  setActiveProfileId(profileId: string) {
    this.activeProfileId = profileId;
    localStorage.setItem('mydeen_active_profile_id', profileId);
  }

  getCurrentProfile(): UserProfile {
    const profiles = this.getProfiles();
    return profiles.find((p) => p.id === this.activeProfileId) || profiles[0] || DEFAULT_PROFILE;
  }

  createProfile(name: string, pinCode?: string): UserProfile {
    const newProfile: UserProfile = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      name: name.trim() || 'নতুন প্রোফাইল',
      pinCode: pinCode?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    const profiles = this.getProfiles();
    profiles.push(newProfile);
    this.saveProfiles(profiles);
    return newProfile;
  }

  updateProfile(profile: UserProfile) {
    const profiles = this.getProfiles().map((p) => (p.id === profile.id ? profile : p));
    this.saveProfiles(profiles);
  }

  deleteProfile(profileId: string) {
    let profiles = this.getProfiles();
    if (profiles.length <= 1) return; // Prevent deleting the last profile
    profiles = profiles.filter((p) => p.id !== profileId);
    this.saveProfiles(profiles);
    if (this.activeProfileId === profileId) {
      this.setActiveProfileId(profiles[0].id);
    }
  }

  // Helper for isolated user key
  private k(key: string): string {
    return `mydeen_${this.activeProfileId}_${key}`;
  }

  // --- Settings ---
  getSettings(): AppSettings {
    const raw = localStorage.getItem(this.k('settings'));
    if (!raw) return DEFAULT_SETTINGS;
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(settings: AppSettings) {
    localStorage.setItem(this.k('settings'), JSON.stringify(settings));
  }

  // --- Worship Items & Records ---
  getWorshipItems(): WorshipItem[] {
    const customRaw = localStorage.getItem(this.k('worship_items_custom'));
    let custom: WorshipItem[] = [];
    if (customRaw) {
      try {
        custom = JSON.parse(customRaw);
      } catch {
        custom = [];
      }
    }
    // Check if user disabled/edited any defaults
    const overridesRaw = localStorage.getItem(this.k('worship_items_overrides'));
    const overrides: Record<string, Partial<WorshipItem>> = overridesRaw ? JSON.parse(overridesRaw) : {};

    const mergedDefaults = DEFAULT_WORSHIP_ITEMS.map((item) => {
      if (overrides[item.id]) {
        return { ...item, ...overrides[item.id] };
      }
      return item;
    });

    return [...mergedDefaults, ...custom];
  }

  saveCustomWorshipItem(item: WorshipItem) {
    const customItems = this.getCustomWorshipItems();
    const idx = customItems.findIndex((c) => c.id === item.id);
    if (idx >= 0) {
      customItems[idx] = item;
    } else {
      customItems.push(item);
    }
    localStorage.setItem(this.k('worship_items_custom'), JSON.stringify(customItems));
  }

  deleteWorshipItem(id: string) {
    const item = this.getWorshipItems().find((i) => i.id === id);
    if (item) {
      this.moveToTrash(id, 'worship', item, item.nameBn);
    }
    const customItems = this.getCustomWorshipItems().filter((c) => c.id !== id);
    localStorage.setItem(this.k('worship_items_custom'), JSON.stringify(customItems));
  }

  getCustomWorshipItems(): WorshipItem[] {
    const raw = localStorage.getItem(this.k('worship_items_custom'));
    return raw ? JSON.parse(raw) : [];
  }

  getWorshipRecords(date: string): Record<string, WorshipRecord> {
    const raw = localStorage.getItem(this.k(`worship_rec_${date}`));
    return raw ? JSON.parse(raw) : {};
  }

  saveWorshipRecord(date: string, record: WorshipRecord) {
    const records = this.getWorshipRecords(date);
    records[record.itemId] = record;
    localStorage.setItem(this.k(`worship_rec_${date}`), JSON.stringify(records));
  }

  // --- Quran Commands ---
  getQuranCommands(): QuranCommand[] {
    const customRaw = localStorage.getItem(this.k('quran_commands_custom'));
    const custom: QuranCommand[] = customRaw ? JSON.parse(customRaw) : [];
    return [...VERIFIED_QURAN_COMMANDS, ...custom];
  }

  saveCustomQuranCommand(command: QuranCommand) {
    const custom = this.getCustomQuranCommands();
    const idx = custom.findIndex((c) => c.id === command.id);
    if (idx >= 0) custom[idx] = command;
    else custom.push(command);
    localStorage.setItem(this.k('quran_commands_custom'), JSON.stringify(custom));
  }

  deleteQuranCommand(id: string) {
    const cmd = this.getQuranCommands().find((c) => c.id === id);
    if (cmd) this.moveToTrash(id, 'command', cmd, cmd.titleBn);
    const custom = this.getCustomQuranCommands().filter((c) => c.id !== id);
    localStorage.setItem(this.k('quran_commands_custom'), JSON.stringify(custom));
  }

  private getCustomQuranCommands(): QuranCommand[] {
    const raw = localStorage.getItem(this.k('quran_commands_custom'));
    return raw ? JSON.parse(raw) : [];
  }

  getQuranCommandRecords(date: string): Record<string, QuranCommandRecord> {
    const raw = localStorage.getItem(this.k(`quran_cmd_rec_${date}`));
    return raw ? JSON.parse(raw) : {};
  }

  saveQuranCommandRecord(date: string, record: QuranCommandRecord) {
    const records = this.getQuranCommandRecords(date);
    records[record.commandId] = record;
    localStorage.setItem(this.k(`quran_cmd_rec_${date}`), JSON.stringify(records));
  }

  // --- Prohibited Actions ---
  getProhibitedActions(): ProhibitedAction[] {
    const customRaw = localStorage.getItem(this.k('prohibitions_custom'));
    const custom: ProhibitedAction[] = customRaw ? JSON.parse(customRaw) : [];
    return [...VERIFIED_PROHIBITED_ACTIONS, ...custom];
  }

  saveCustomProhibitedAction(action: ProhibitedAction) {
    const custom = this.getCustomProhibitions();
    const idx = custom.findIndex((c) => c.id === action.id);
    if (idx >= 0) custom[idx] = action;
    else custom.push(action);
    localStorage.setItem(this.k('prohibitions_custom'), JSON.stringify(custom));
  }

  deleteProhibitedAction(id: string) {
    const action = this.getProhibitedActions().find((a) => a.id === id);
    if (action) this.moveToTrash(id, 'prohibition', action, action.titleBn);
    const custom = this.getCustomProhibitions().filter((c) => c.id !== id);
    localStorage.setItem(this.k('prohibitions_custom'), JSON.stringify(custom));
  }

  private getCustomProhibitions(): ProhibitedAction[] {
    const raw = localStorage.getItem(this.k('prohibitions_custom'));
    return raw ? JSON.parse(raw) : [];
  }

  getProhibitedRecords(date: string): Record<string, ProhibitedRecord> {
    const raw = localStorage.getItem(this.k(`prohib_rec_${date}`));
    return raw ? JSON.parse(raw) : {};
  }

  saveProhibitedRecord(date: string, record: ProhibitedRecord) {
    const records = this.getProhibitedRecords(date);
    records[record.prohibitionId] = record;
    localStorage.setItem(this.k(`prohib_rec_${date}`), JSON.stringify(records));
  }

  // --- Sunnah Items ---
  getSunnahItems(): SunnahItem[] {
    const customRaw = localStorage.getItem(this.k('sunnah_custom'));
    const custom: SunnahItem[] = customRaw ? JSON.parse(customRaw) : [];
    return [...VERIFIED_SUNNAH_ITEMS, ...custom];
  }

  saveCustomSunnahItem(item: SunnahItem) {
    const custom = this.getCustomSunnahItems();
    const idx = custom.findIndex((c) => c.id === item.id);
    if (idx >= 0) custom[idx] = item;
    else custom.push(item);
    localStorage.setItem(this.k('sunnah_custom'), JSON.stringify(custom));
  }

  deleteSunnahItem(id: string) {
    const item = this.getSunnahItems().find((s) => s.id === id);
    if (item) this.moveToTrash(id, 'sunnah', item, item.titleBn);
    const custom = this.getCustomSunnahItems().filter((c) => c.id !== id);
    localStorage.setItem(this.k('sunnah_custom'), JSON.stringify(custom));
  }

  private getCustomSunnahItems(): SunnahItem[] {
    const raw = localStorage.getItem(this.k('sunnah_custom'));
    return raw ? JSON.parse(raw) : [];
  }

  getSunnahRecords(date: string): Record<string, SunnahRecord> {
    const raw = localStorage.getItem(this.k(`sunnah_rec_${date}`));
    return raw ? JSON.parse(raw) : {};
  }

  saveSunnahRecord(date: string, record: SunnahRecord) {
    const records = this.getSunnahRecords(date);
    records[record.sunnahId] = record;
    localStorage.setItem(this.k(`sunnah_rec_${date}`), JSON.stringify(records));
  }

  // --- Halal / Haram Topics ---
  getHalalHaramTopics(): HalalHaramTopic[] {
    const bookmarks = this.getBookmarkedTopics();
    const userNotes = this.getTopicNotes();
    return VERIFIED_HALAL_HARAM_TOPICS.map((t) => ({
      ...t,
      isBookmarked: !!bookmarks[t.id],
      userNotes: userNotes[t.id] || '',
    }));
  }

  toggleTopicBookmark(id: string) {
    const bookmarks = this.getBookmarkedTopics();
    bookmarks[id] = !bookmarks[id];
    localStorage.setItem(this.k('hh_bookmarks'), JSON.stringify(bookmarks));
  }

  private getBookmarkedTopics(): Record<string, boolean> {
    const raw = localStorage.getItem(this.k('hh_bookmarks'));
    return raw ? JSON.parse(raw) : {};
  }

  saveTopicNote(id: string, note: string) {
    const notes = this.getTopicNotes();
    notes[id] = note;
    localStorage.setItem(this.k('hh_notes'), JSON.stringify(notes));
  }

  private getTopicNotes(): Record<string, string> {
    const raw = localStorage.getItem(this.k('hh_notes'));
    return raw ? JSON.parse(raw) : {};
  }

  // --- Tasks ---
  getTasks(): Task[] {
    const raw = localStorage.getItem(this.k('tasks'));
    if (!raw) {
      // Initial starter task
      const defaultTasks: Task[] = [
        {
          id: 'task_1',
          title: 'সূরা আল-মুলক তিলাওয়াত করা',
          description: 'ঘুমের আগে ৩০টি আয়াত বুঝে পড়ার চেষ্টা',
          category: 'ইবাদত',
          priority: 'high',
          dueDate: new Date().toISOString().split('T')[0],
          dueTime: '21:30',
          isCompleted: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'task_2',
          title: 'পিতামাতাকে ফোন করে কুশল বিনিময়',
          category: 'পরিবার',
          priority: 'medium',
          dueDate: new Date().toISOString().split('T')[0],
          isCompleted: false,
          createdAt: new Date().toISOString(),
        },
      ];
      this.saveTasks(defaultTasks);
      return defaultTasks;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  saveTasks(tasks: Task[]) {
    localStorage.setItem(this.k('tasks'), JSON.stringify(tasks));
  }

  saveTask(task: Task) {
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === task.id);
    if (idx >= 0) tasks[idx] = task;
    else tasks.unshift(task);
    this.saveTasks(tasks);
  }

  deleteTask(id: string) {
    const task = this.getTasks().find((t) => t.id === id);
    if (task) this.moveToTrash(id, 'task', task, task.title);
    const tasks = this.getTasks().filter((t) => t.id !== id);
    this.saveTasks(tasks);
  }

  // --- Notes ---
  getNotes(): Note[] {
    const raw = localStorage.getItem(this.k('notes'));
    if (!raw) {
      const defaultNotes: Note[] = [
        {
          id: 'note_1',
          title: 'দৈনন্দিন জীবনে শোকরিয়া আদায়ের গুরুত্ব',
          content: 'আল্লাহর নিয়ামত অগুণতি। সামান্য সুস্থতা, দুটি চোখের দৃষ্টি এবং একমুঠো অন্নের মূল্য অপরিসীম। প্রতিদিন কমপক্ষে ৩ বার অন্তর থেকে "আলহামদুলিল্লাহ" বলার অভ্যাস গড়ে তোলা দরকার।\n\nকুরআন রেফারেন্স: "যদি তোমরা শোকরিয়া আদায় করো, তবে আমি অবশ্যই তোমাদের নিয়ামত বাড়িয়ে দেব।" (সূরা ইব্রাহিম ১৪:৭)',
          category: 'আত্মপর্যালোচনা',
          tags: ['শোকরিয়া', 'নিয়ামত', 'আত্মশুদ্ধি'],
          isPinned: true,
          isBookmarked: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      this.saveNotes(defaultNotes);
      return defaultNotes;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  saveNotes(notes: Note[]) {
    localStorage.setItem(this.k('notes'), JSON.stringify(notes));
  }

  saveNote(note: Note) {
    const notes = this.getNotes();
    const idx = notes.findIndex((n) => n.id === note.id);
    if (idx >= 0) notes[idx] = note;
    else notes.unshift(note);
    this.saveNotes(notes);
  }

  deleteNote(id: string) {
    const note = this.getNotes().find((n) => n.id === id);
    if (note) this.moveToTrash(id, 'note', note, note.title);
    const notes = this.getNotes().filter((n) => n.id !== id);
    this.saveNotes(notes);
  }

  // --- Goals ---
  getGoals(): Goal[] {
    const raw = localStorage.getItem(this.k('goals'));
    if (!raw) {
      const defaultGoals: Goal[] = [
        {
          id: 'goal_1',
          title: 'কুরআন খতম সম্পূর্ণ করা',
          description: 'প্রতিদিন ৪ পৃষ্ঠা করে তিলাওয়াত করে আগামী ৫ মাসে পূর্ণ কুরআন অধ্যয়ন',
          category: 'কুরআন',
          targetValue: 604,
          currentValue: 48,
          unit: 'পৃষ্ঠা',
          startDate: '2026-10-01',
          targetDate: '2027-02-28',
          isCompleted: false,
        },
        {
          id: 'goal_2',
          title: 'দৈনিক ১০০ বার ইস্তিগফারের অভ্যাস',
          description: 'প্রতিদিন কাজের ফাঁকে ও চলাফেরার সময় আস্তাগফিরুল্লাহ পাঠ',
          category: 'জিকির',
          targetValue: 30,
          currentValue: 18,
          unit: 'দিন',
          startDate: '2026-10-01',
          targetDate: '2026-10-31',
          isCompleted: false,
        },
      ];
      this.saveGoals(defaultGoals);
      return defaultGoals;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  saveGoals(goals: Goal[]) {
    localStorage.setItem(this.k('goals'), JSON.stringify(goals));
  }

  saveGoal(goal: Goal) {
    const goals = this.getGoals();
    const idx = goals.findIndex((g) => g.id === goal.id);
    if (idx >= 0) goals[idx] = goal;
    else goals.unshift(goal);
    this.saveGoals(goals);
  }

  deleteGoal(id: string) {
    const goal = this.getGoals().find((g) => g.id === id);
    if (goal) this.moveToTrash(id, 'goal', goal, goal.title);
    const goals = this.getGoals().filter((g) => g.id !== id);
    this.saveGoals(goals);
  }

  // --- Daily Reflection ---
  getDailyReflection(date: string): DailyReflection {
    const raw = localStorage.getItem(this.k(`reflection_${date}`));
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return {
      date,
      answers: {},
    };
  }

  saveDailyReflection(reflection: DailyReflection) {
    localStorage.setItem(this.k(`reflection_${reflection.date}`), JSON.stringify(reflection));
  }

  // --- Enhanced Daily Muhasabah ---
  getMuhasabahEntries(): MuhasabahEntry[] {
    const raw = localStorage.getItem(this.k('muhasabah_entries'));
    if (!raw) {
      const starter: MuhasabahEntry = {
        id: 'muhasabah_starter',
        date: new Date().toISOString().split('T')[0],
        title: 'দৈনিক আত্মশুদ্ধি ও তাওবা',
        goodDeeds: 'আজ সময়মতো জামাতে সালাত আদায় এবং কুরআন তিলাওয়াত করেছি।',
        mistakesMade: 'কাজের ব্যস্ততায় আসরের পর কিছুক্ষণ অমনোযোগী ছিলাম।',
        learnedToday: 'উত্তম চরিত্র ও সুন্দর ব্যবহারের মর্যাদা অনেক বেশি।',
        rightsRectification: 'কারও অধিকার নষ্ট হয়নি, তবে সবাইকে সালাম দেওয়ার চেষ্টা করব।',
        seekForgivenessFor: 'অনিচ্ছাকৃত সকল ছোটখাটো ত্রুটি ও সময়ের অবহেলা।',
        gratitudeItems: 'সুস্থতা, পরিবারের নিরাপত্তা ও দ্বীনের ওপর অবিচল থাকার তৌফিক।',
        tomorrowImprovements: 'তাহাজ্জুদ আদায়ের চেষ্টা ও আরও ধীরস্থিরভাবে সালাত পড়া।',
        personalNotes: 'প্রতিদিন নিজের হিসাব নিলে অন্তরে তাকওয়া বৃদ্ধি পায়।',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.saveMuhasabahEntries([starter]);
      return [starter];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  saveMuhasabahEntries(entries: MuhasabahEntry[]) {
    localStorage.setItem(this.k('muhasabah_entries'), JSON.stringify(entries));
  }

  saveMuhasabahEntry(entry: MuhasabahEntry) {
    const entries = this.getMuhasabahEntries();
    const idx = entries.findIndex((e) => e.id === entry.id);
    if (idx >= 0) {
      entries[idx] = { ...entry, updatedAt: new Date().toISOString() };
    } else {
      entries.unshift({
        ...entry,
        createdAt: entry.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.saveMuhasabahEntries(entries);
  }

  deleteMuhasabahEntry(id: string) {
    const entry = this.getMuhasabahEntries().find((e) => e.id === id);
    if (entry) this.moveToTrash(id, 'muhasabah', entry, entry.title || 'আত্মপর্যালোচনা');
    const filtered = this.getMuhasabahEntries().filter((e) => e.id !== id);
    this.saveMuhasabahEntries(filtered);
  }

  // --- Quranic Tadabbur ---
  getTadabburEntries(): TadabburEntry[] {
    const raw = localStorage.getItem(this.k('tadabbur_entries'));
    if (!raw) {
      const starters: TadabburEntry[] = [
        {
          id: 'tadabbur_starter_1',
          title: 'কুরআনের সাথে জীবনের সম্পর্ক ও সময়ের মূল্য',
          surahName: 'আল-আসর',
          surahNumber: 103,
          verseNumber: '১-৩',
          arabicVerse: 'وَالْعَصْرِ ﴿١﴾ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ ﴿٢﴾ إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ ﴿٣﴾',
          bengaliTranslation: 'সময়ের শপথ! নিশ্চয়ই মানুষ ক্ষতির মধ্যে নিমজ্জিত। তবে তারা ছাড়া, যারা ঈমান এনেছে, সৎকাজ করেছে এবং পরস্পরকে সত্যের উপদেশ দিয়েছে ও ধৈর্যের উপদেশ দিয়েছে।',
          translationSource: 'মুহিউদ্দীন খান',
          coreLessons: 'সময় অতিবাহিত হয়ে যাচ্ছে। ক্ষতি থেকে বাঁচার জন্য চারটি শর্ত অপরিহার্য: ঈমান, নেক আমল, সত্যের দাওয়াত এবং বিপদে ধৈর্য।',
          personalThoughts: 'প্রতিটি সেকেন্ড আল্লাহর দেওয়া মহা মূল্যবান নিয়ামত। অনর্থক সময় নষ্ট করা মানে নিশ্চিত ক্ষতির দিকে যাওয়া।',
          lifeApplication: 'দিনের কাজের সূচি গুছিয়ে নেওয়া এবং প্রতিদিন অন্তত কিছু সময় দ্বীনি শিক্ষার জন্য বরাদ্দ রাখা।',
          actionItems: 'সোশ্যাল মিডিয়ার অপচয় কমিয়ে কুরআন তিলাওয়াত বাড়ানো।',
          personalDuaIntention: 'হে আল্লাহ! আমাকে সময়ের সদ্ব্যবহারকারী ও ধৈর্যশীলদের অন্তর্ভুক্ত করুন।',
          personalNotes: 'ব্যক্তিগত তাদাব্বুর — এটি আনুষ্ঠানিক তাফসীর নয়।',
          date: new Date().toISOString().split('T')[0],
          tags: ['সময়', 'ঈমান', 'সবর', 'আমল'],
          isBookmarked: true,
          verificationStatus: 'verified',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'tadabbur_starter_2',
          title: 'আল্লাহর মহত্ত্ব, সার্বভৌমত্ব ও আয়াতুল কুরসী থেকে তাদাব্বুর',
          surahName: 'আল-বাক্বারাহ',
          surahNumber: 2,
          verseNumber: '২৫৫',
          arabicVerse: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ',
          bengaliTranslation: 'আল্লাহ, তিনি ছাড়া কোনো সত্য উপাস্য নেই; তিনি চিরঞ্জীব, সর্বসত্তার ধারক। তন্দ্রা বা নিদ্রা তাঁকে স্পর্শ করে না। আসমান ও জমিনে যা কিছু আছে সবই তাঁর।',
          translationSource: 'ইসলামিক ফাউন্ডেশন',
          coreLessons: 'আল্লাহ তাআলা অদ্বিতীয়, চিরঞ্জীব এবং তাঁর কোনো দুর্বলতা বা ক্লান্তি নেই। জগতের প্রতিটি সৃষ্টি তাঁর নিয়ন্ত্রণে ও মুখাপেক্ষী।',
          personalThoughts: 'মানুষ কতটা দুর্বল আর আল্লাহ কত মহান! সকল বিপদ-আপদে কেবল তাঁরই উপর ভরসা করা উচিত। অন্তরে কোনো অপ্রয়োজনীয় ভয় রাখার স্থান নেই।',
          lifeApplication: 'প্রতিটি ফরজ সালাতের পর আয়াতুল কুরসী পাঠ করা এবং ঘুমানোর আগে নিরাপত্তার জন্য তিলাওয়াত করা।',
          actionItems: 'আয়াতুল কুরসীর প্রতিটি শব্দের অর্থ গভীরভাবে বুঝে সালাতে মনোযোগ বাড়ানো।',
          personalDuaIntention: 'হে চিরঞ্জীব, সর্বসত্তার ধারক আল্লাহ! আমাকে একমাত্র আপনারই ওপর তাওয়াক্কুল করার তৌফিক দিন।',
          personalNotes: 'সহিহ হাদিসে আয়াতুল কুরসীকে কুরআনের সর্বশ্রেষ্ঠ আয়াত বলা হয়েছে।',
          date: new Date().toISOString().split('T')[0],
          tags: ['তাওহীদ', 'আয়াতুল কুরসী', 'তাওয়াক্কুল', 'আল্লাহর ক্ষমতা'],
          isBookmarked: true,
          verificationStatus: 'verified',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'tadabbur_starter_3',
          title: 'সূরা আল-ফাতিহা: সিরাতুল মুস্তাকিমের প্রার্থনা ও দাসত্ব',
          surahName: 'আল-ফাতিহা',
          surahNumber: 1,
          verseNumber: '৫-৭',
          arabicVerse: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾',
          bengaliTranslation: 'আমরা কেবল আপনারই ইবাদত করি এবং কেবল আপনারই সাহায্য প্রার্থনা করি। আমাদের সরল পথ প্রদর্শন করুন—তাদের পথ, যাদের আপনি অনুগ্রহ করেছেন; তাদের পথ নয়, যারা ক্রোধের পাত্র হয়েছে কিংবা যারা পথভ্রষ্ট হয়েছে।',
          translationSource: 'মুহিউদ্দীন খান',
          coreLessons: 'ইবাদত ও সাহায্য চাওয়া দুটোই কেবল এক আল্লাহর জন্য। জীবনের সবচেয়ে বড় চাওয়া হলো সঠিক পথের হেদায়েত।',
          personalThoughts: 'আমরা দৈনিক অন্তত ১৭ বার সালাতে এই দোয়া করি। কিন্তু সালাতের বাইরে কি আমি সত্যিই সরল পথে চলার চেষ্টা করছি?',
          lifeApplication: 'সব কাজে নিজের অহংকার বর্জন করে আল্লাহর সাহায্য চাওয়া এবং সৎ ও নেককার মানুষের সান্নিধ্য কামনা করা।',
          actionItems: 'সালাতে সূরা ফাতিহা ধীরেসুস্থে প্রতিটি আয়াতে বিরতি দিয়ে পাঠ করা।',
          personalDuaIntention: 'রাব্বুল আলামীন! আমাকে সত্যের ওপর অবিচল রাখুন এবং পথভ্রষ্টতা থেকে রক্ষা করুন।',
          personalNotes: 'উম্মুল কুরআন—কুরআনের সারমর্ম এই সূরায় নিহিত।',
          date: new Date().toISOString().split('T')[0],
          tags: ['সূরা ফাতিহা', 'হেদায়েত', 'সালাত', 'দোয়া'],
          isBookmarked: false,
          verificationStatus: 'verified',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      this.saveTadabburEntries(starters);
      return starters;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  saveTadabburEntries(entries: TadabburEntry[]) {
    localStorage.setItem(this.k('tadabbur_entries'), JSON.stringify(entries));
  }

  saveTadabburEntry(entry: TadabburEntry) {
    const entries = this.getTadabburEntries();
    const idx = entries.findIndex((e) => e.id === entry.id);
    if (idx >= 0) {
      entries[idx] = { ...entry, updatedAt: new Date().toISOString() };
    } else {
      entries.unshift({
        ...entry,
        createdAt: entry.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.saveTadabburEntries(entries);
  }

  deleteTadabburEntry(id: string) {
    const entry = this.getTadabburEntries().find((e) => e.id === id);
    if (entry) this.moveToTrash(id, 'tadabbur', entry, entry.title || 'তাদাব্বুর নোট');
    const filtered = this.getTadabburEntries().filter((e) => e.id !== id);
    this.saveTadabburEntries(filtered);
  }

  toggleTadabburBookmark(id: string) {
    const entries = this.getTadabburEntries().map((e) =>
      e.id === id ? { ...e, isBookmarked: !e.isBookmarked } : e
    );
    this.saveTadabburEntries(entries);
  }

  // --- Quran Study Notes Linked to Verses ---
  getQuranStudyNotes(): QuranStudyNote[] {
    const raw = localStorage.getItem(this.k('quran_study_notes'));
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  saveQuranStudyNotes(notes: QuranStudyNote[]) {
    localStorage.setItem(this.k('quran_study_notes'), JSON.stringify(notes));
  }

  saveQuranStudyNote(note: QuranStudyNote) {
    const notes = this.getQuranStudyNotes();
    const idx = notes.findIndex((n) => n.id === note.id);
    if (idx >= 0) {
      notes[idx] = { ...note, updatedAt: new Date().toISOString() };
    } else {
      notes.unshift(note);
    }
    this.saveQuranStudyNotes(notes);
  }

  deleteQuranStudyNote(id: string) {
    const note = this.getQuranStudyNotes().find((n) => n.id === id);
    if (note) this.moveToTrash(id, 'quran_note', note, `কুরআন নোট (${note.surahNumber}:${note.ayahNumber})`);
    const filtered = this.getQuranStudyNotes().filter((n) => n.id !== id);
    this.saveQuranStudyNotes(filtered);
  }

  // --- Reminders ---
  getReminders(): ReminderItem[] {
    const raw = localStorage.getItem(this.k('reminders'));
    if (!raw) {
      const defaultReminders: ReminderItem[] = [
        { id: 'rem_1', titleBn: 'ফজর সালাতের রিমাইন্ডার', time: '04:45', days: [0, 1, 2, 3, 4, 5, 6], isEnabled: true, category: 'সালাত' },
        { id: 'rem_2', titleBn: 'সকালের আজকার পাঠ', time: '06:15', days: [0, 1, 2, 3, 4, 5, 6], isEnabled: true, category: 'জিকির' },
        { id: 'rem_3', titleBn: 'সন্ধ্যার আজকার পাঠ', time: '17:15', days: [0, 1, 2, 3, 4, 5, 6], isEnabled: true, category: 'জিকির' },
        { id: 'rem_4', titleBn: 'সূরা আল-কাহফ তিলাওয়াত (জুমা)', time: '10:00', days: [5], isEnabled: true, category: 'কুরআন' },
      ];
      this.saveReminders(defaultReminders);
      return defaultReminders;
    }
    return JSON.parse(raw);
  }

  saveReminders(reminders: ReminderItem[]) {
    localStorage.setItem(this.k('reminders'), JSON.stringify(reminders));
  }

  saveReminder(reminder: ReminderItem) {
    const reminders = this.getReminders();
    const idx = reminders.findIndex((r) => r.id === reminder.id);
    if (idx >= 0) reminders[idx] = reminder;
    else reminders.push(reminder);
    this.saveReminders(reminders);
  }

  deleteReminder(id: string) {
    const reminders = this.getReminders().filter((r) => r.id !== id);
    this.saveReminders(reminders);
  }

  // --- Trash / Soft Delete & Restore ---
  getTrash(): TrashItem[] {
    const raw = localStorage.getItem(this.k('trash'));
    return raw ? JSON.parse(raw) : [];
  }

  private moveToTrash(originalId: string, itemType: TrashItem['itemType'], itemData: any, title: string) {
    const trash = this.getTrash();
    trash.unshift({
      id: 'trash_' + Date.now(),
      originalId,
      itemType,
      itemData,
      title: title || 'নামবিহীন আইটেম',
      deletedAt: new Date().toISOString(),
    });
    localStorage.setItem(this.k('trash'), JSON.stringify(trash.slice(0, 50)));
  }

  restoreFromTrash(trashId: string): boolean {
    const trash = this.getTrash();
    const item = trash.find((t) => t.id === trashId);
    if (!item) return false;

    if (item.itemType === 'worship') {
      this.saveCustomWorshipItem(item.itemData);
    } else if (item.itemType === 'task') {
      this.saveTask(item.itemData);
    } else if (item.itemType === 'note') {
      this.saveNote(item.itemData);
    } else if (item.itemType === 'goal') {
      this.saveGoal(item.itemData);
    } else if (item.itemType === 'command') {
      this.saveCustomQuranCommand(item.itemData);
    } else if (item.itemType === 'sunnah') {
      this.saveCustomSunnahItem(item.itemData);
    } else if (item.itemType === 'prohibition') {
      this.saveCustomProhibitedAction(item.itemData);
    } else if (item.itemType === 'muhasabah') {
      this.saveMuhasabahEntry(item.itemData);
    } else if (item.itemType === 'tadabbur') {
      this.saveTadabburEntry(item.itemData);
    } else if (item.itemType === 'quran_note') {
      this.saveQuranStudyNote(item.itemData);
    }

    const updatedTrash = trash.filter((t) => t.id !== trashId);
    localStorage.setItem(this.k('trash'), JSON.stringify(updatedTrash));
    return true;
  }

  emptyTrash() {
    localStorage.removeItem(this.k('trash'));
  }

  // --- Export and Import ---
  exportAllDataJSON(): string {
    const data: Record<string, any> = {
      version: '1.1',
      exportedAt: new Date().toISOString(),
      profile: this.getCurrentProfile(),
      settings: this.getSettings(),
      tasks: this.getTasks(),
      notes: this.getNotes(),
      goals: this.getGoals(),
      reminders: this.getReminders(),
      customWorship: this.getCustomWorshipItems(),
      customCommands: this.getCustomQuranCommands(),
      customSunnah: this.getCustomSunnahItems(),
      customProhibitions: this.getCustomProhibitions(),
      muhasabahEntries: this.getMuhasabahEntries(),
      tadabburEntries: this.getTadabburEntries(),
      quranStudyNotes: this.getQuranStudyNotes(),
      allDailyData: {},
    };

    // Grab all date-specific entries for active profile
    const prefix = `mydeen_${this.activeProfileId}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const subKey = key.replace(prefix, '');
        data.allDailyData[subKey] = localStorage.getItem(key);
      }
    }

    return JSON.stringify(data, null, 2);
  }

  importAllDataJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object') return false;

      if (data.settings) this.saveSettings(data.settings);
      if (data.tasks) this.saveTasks(data.tasks);
      if (data.notes) this.saveNotes(data.notes);
      if (data.goals) this.saveGoals(data.goals);
      if (data.reminders) this.saveReminders(data.reminders);
      if (data.muhasabahEntries) this.saveMuhasabahEntries(data.muhasabahEntries);
      if (data.tadabburEntries) this.saveTadabburEntries(data.tadabburEntries);
      if (data.quranStudyNotes) this.saveQuranStudyNotes(data.quranStudyNotes);

      if (data.allDailyData && typeof data.allDailyData === 'object') {
        const prefix = `mydeen_${this.activeProfileId}_`;
        for (const [subKey, val] of Object.entries(data.allDailyData)) {
          if (typeof val === 'string') {
            localStorage.setItem(prefix + subKey, val);
          }
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  // Clear all data for current profile
  clearCurrentProfileData() {
    const prefix = `mydeen_${this.activeProfileId}_`;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }
}

export const storage = new StorageService();
