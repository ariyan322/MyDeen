import React from 'react';
import {
  X,
  BookCheck,
  ShieldAlert,
  HelpCircle,
  HeartHandshake,
  CheckSquare,
  FileText,
  Target,
  BarChart3,
  Bell,
  Settings,
  Trash2,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
} from 'lucide-react';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  onNavigate: (view: string) => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  activeView,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const menuSections = [
    {
      groupTitle: 'দ্বীনি শিক্ষা ও আত্মশুদ্ধি',
      items: [
        { id: 'tadabbur', label: '📖 কুরআনের তাদাব্বুর', sublabel: 'আয়াত নিয়ে চিন্তা ও শিক্ষা নোট', icon: BookOpen },
        { id: 'commands', label: 'আল্লাহর আদেশ', sublabel: 'কুরআনের নির্দেশ কতটা পালন করছি', icon: BookCheck },
        { id: 'prohibitions', label: 'আল্লাহ যা নিষেধ করেছেন', sublabel: 'নিজেকে যাচাই ও আত্মশুদ্ধি', icon: ShieldAlert },
        { id: 'halal_haram', label: 'হালাল-হারাম জ্ঞান', sublabel: 'দৈনন্দিন জীবনে সঠিক অনুধাবন', icon: HelpCircle },
        { id: 'hadith_duas', label: 'হাদিস ও দৈনন্দিন দোয়া', sublabel: 'মাসনুন দোয়া ও তাসবীহ', icon: HeartHandshake },
      ],
    },
    {
      groupTitle: 'ব্যক্তিগত ব্যবস্থাপনা',
      items: [
        { id: 'tasks', label: 'কাজের তালিকা', sublabel: 'দৈনন্দিন দায়িত্ব ও কাজ', icon: CheckSquare },
        { id: 'notes', label: 'ব্যক্তিগত নোট ও ডায়েরি', sublabel: 'দ্বীনি ভাবনা ও আলোচনা সংরক্ষণ', icon: FileText },
        { id: 'goals', label: 'ব্যক্তিগত লক্ষ্য', sublabel: 'দ্বীনি লক্ষ্য নির্ধারণ ও অগ্রগতি', icon: Target },
        { id: 'reflection', label: 'দৈনিক আত্মপর্যালোচনা', sublabel: 'দিনের শেষে নিজের হিসাব', icon: Calendar },
        { id: 'reports', label: 'অগ্রগতি রিপোর্ট', sublabel: 'সাপ্তাহিক ও মাসিক পরিসংখ্যান', icon: BarChart3 },
      ],
    },
    {
      groupTitle: 'সিস্টেম ও নিরাপত্তা',
      items: [
        { id: 'reminders', label: 'রিমাইন্ডার ও নোটিফিকেশন', sublabel: 'সালাত ও আজকার সতর্কবার্তা', icon: Bell },
        { id: 'trash', label: 'ট্র্যাশ ও পুনরুদ্ধার', sublabel: 'মুছে ফেলা আইটেম ফিরিয়ে আনুন', icon: Trash2 },
        { id: 'settings', label: 'সেটিংস ও প্রোফাইল', sublabel: 'ভাষা, থিম, হিসাব পদ্ধতি ও ব্যাকআপ', icon: Settings },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-sm h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              সকল মেনু ও ফিচার
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase px-2">
                {section.groupTitle}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate leading-tight">{item.label}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {item.sublabel}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Quick Info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-center">
          <p className="text-xs text-slate-500">
            কুরআন ও সুন্নাহর আলোকে প্রতিদিনের জীবন
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            মাই দ্বীন (My Deen) v1.0
          </p>
        </div>
      </div>
    </div>
  );
};
