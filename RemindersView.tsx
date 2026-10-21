import React, { useState, useMemo } from 'react';
import { Bell, Plus, Check, Trash2, Clock, Volume2, ShieldCheck, Info } from 'lucide-react';
import { AppSettings, ReminderItem } from '../../types';
import { storage } from '../../services/storage';
import { toBengaliDigits } from '../../utils/dateAndNumerals';

interface RemindersViewProps {
  settings: AppSettings;
}

export const RemindersView: React.FC<RemindersViewProps> = ({ settings }) => {
  const [reminders, setReminders] = useState<ReminderItem[]>(() => storage.getReminders());
  const [notificationPermission, setNotificationPermission] = useState<string>(() => {
    return typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
  });
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('06:00');
  const [newCategory, setNewCategory] = useState('জিকির');
  const [showAddForm, setShowAddForm] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  const bnNums = settings.useBengaliNumerals;

  const handleRequestPermission = async () => {
    if (typeof Notification !== 'undefined') {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
      } catch {
        setNotificationPermission('denied');
      }
    }
  };

  const handleSendTestNotification = () => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('মাই দ্বীন (My Deen) রিমাইন্ডার', {
        body: 'আসসালামু আলাইকুম! এটি একটি পরীক্ষামূলক রিমাইন্ডার।',
        icon: '/src/assets/images/mydeen_app_logo_1792555757106.jpg',
      });
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 3000);
    } else {
      handleRequestPermission();
    }
  };

  const handleToggleReminder = (id: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, isEnabled: !r.isEnabled } : r));
    setReminders(updated);
    storage.saveReminders(updated);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    storage.saveReminders(updated);
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRem: ReminderItem = {
      id: 'rem_' + Date.now(),
      titleBn: newTitle.trim(),
      time: newTime,
      days: [0, 1, 2, 3, 4, 5, 6],
      isEnabled: true,
      category: newCategory,
    };

    const updated = [...reminders, newRem];
    setReminders(updated);
    storage.saveReminders(updated);
    setNewTitle('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              রিমাইন্ডার ও নোটিফিকেশন
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            সালাত, সকাল-সন্ধ্যার আজকার ও সাপ্তাহিক বিশেষ আমলের সময়মতো সতর্কতা।
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          নতুন রিমাইন্ডার তৈরি
        </button>
      </div>

      {/* Web Notification Permission Card */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                ডিভাইস নোটিফিকেশন পারমিশন
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              বর্তমান স্ট্যাটাস: {notificationPermission === 'granted' ? 'অনুমোদিত (সক্রিয় ✓)' : notificationPermission === 'denied' ? 'ব্লক করা হয়েছে' : 'অনুমোদন প্রয়োজন'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {notificationPermission !== 'granted' ? (
              <button
                onClick={handleRequestPermission}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 shadow-xs"
              >
                নোটিফিকেশন চালু করুন
              </button>
            ) : (
              <button
                onClick={handleSendTestNotification}
                className="px-3.5 py-1.5 border border-emerald-600 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              >
                {testNotificationSent ? 'টেস্ট পাঠানো হয়েছে!' : 'টেস্ট নোটিফিকেশন পাঠান'}
              </button>
            )}
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-[11px] text-slate-500 leading-relaxed flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p>
            ব্রাউজার ও পিডব্লিউএ (PWA) স্ট্যান্ডার্ড অনুযায়ী ডিভাইস নোটিফিকেশন পেতে ব্রাউজার ট্যাবে সালাত অ্যালার্টের অনুমতি দিন।
          </p>
        </div>
      </div>

      {/* Add New Reminder Form */}
      {showAddForm && (
        <form onSubmit={handleAddReminder} className="p-5 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-2xl shadow-md space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            নতুন রিমাইন্ডার নির্ধারণ করুন
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                রিমাইন্ডারের নাম
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="যেমন: সূরা মুলক পড়ার সময়..."
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                সময়
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      )}

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.map((rem) => (
          <div
            key={rem.id}
            className={`p-4 bg-white dark:bg-slate-900 border rounded-2xl flex items-center justify-between gap-3 transition-colors ${
              rem.isEnabled
                ? 'border-slate-200 dark:border-slate-800'
                : 'border-slate-200 dark:border-slate-800 opacity-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  rem.isEnabled
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                <Clock className="w-4 h-4" />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {rem.titleBn}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {toBengaliDigits(rem.time, bnNums)}
                  </span>
                  <span>·</span>
                  <span>প্রতিদিন</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleReminder(rem.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  rem.isEnabled
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {rem.isEnabled ? 'চালু' : 'বন্ধ'}
              </button>

              <button
                onClick={() => handleDeleteReminder(rem.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                title="মুছে ফেলুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
