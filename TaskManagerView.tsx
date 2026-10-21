import React, { useState, useMemo } from 'react';
import { CheckSquare, Plus, Search, Filter, Calendar, Clock, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';
import { AppSettings, Task } from '../../types';
import { storage } from '../../services/storage';
import { toBengaliDigits, getDhakaDateString } from '../../utils/dateAndNumerals';
import { CustomItemModal } from '../modals/CustomItemModal';

interface TaskManagerViewProps {
  settings: AppSettings;
}

export const TaskManagerView: React.FC<TaskManagerViewProps> = ({ settings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const bnNums = settings.useBengaliNumerals;
  const todayStr = getDhakaDateString();

  const tasks = useMemo(() => storage.getTasks(), [refreshKey]);

  const categories = useMemo(() => {
    const set = new Set(tasks.map((t) => t.category));
    return ['all', ...Array.from(set)];
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Status filter
      if (selectedStatusFilter === 'active' && t.isCompleted) return false;
      if (selectedStatusFilter === 'completed' && !t.isCompleted) return false;
      if (selectedStatusFilter === 'overdue' && (t.isCompleted || t.dueDate >= todayStr)) return false;

      // Category filter
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

      // Search query
      if (
        searchQuery.trim() &&
        !t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
      ) {
        return false;
      }

      return true;
    });
  }, [tasks, selectedStatusFilter, selectedCategory, searchQuery, todayStr]);

  const handleToggleTask = (task: Task) => {
    const updated: Task = {
      ...task,
      isCompleted: !task.isCompleted,
      completedAt: !task.isCompleted ? new Date().toISOString() : undefined,
    };
    storage.saveTask(updated);
    setRefreshKey((k) => k + 1);
  };

  const priorityStyles = {
    high: 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
    medium: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    low: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
  };

  const priorityLabels = {
    high: 'জরুরি',
    medium: 'সাধারণ',
    low: 'কম গুরুত্বপূর্ণ',
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              দৈনন্দিন কাজের তালিকা (Task Manager)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ইবাদত, পড়াশোনা, চাকরি ও পারিবারিক দায়িত্বসমূহ সংগঠিত রাখুন।
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          নতুন কাজ যোগ করুন
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="কাজের শিরোনাম বা বিবরণ অনুসন্ধান করুন..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-600"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: `সব কাজ (${toBengaliDigits(tasks.length, bnNums)})` },
              { id: 'active', label: 'চলমান' },
              { id: 'completed', label: 'সম্পন্ন' },
              { id: 'overdue', label: 'মেয়াদোত্তীর্ণ' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedStatusFilter === tab.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-xs focus:outline-hidden"
          >
            <option value="all">সকল ক্যাটেগরি</option>
            {categories.filter((c) => c !== 'all').map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Task Items List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <CheckSquare className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
            <p className="text-xs">কোনো কাজ খুঁজে পাওয়া যায়নি।</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isOverdue = !task.isCompleted && task.dueDate < todayStr;

            return (
              <div
                key={task.id}
                className={`p-4 bg-white dark:bg-slate-900 border rounded-2xl transition-all shadow-2xs flex items-start gap-3.5 ${
                  task.isCompleted
                    ? 'opacity-60 border-slate-200 dark:border-slate-800'
                    : isOverdue
                    ? 'border-rose-300 dark:border-rose-900/60'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {/* Complete Checkbox */}
                <button
                  onClick={() => handleToggleTask(task)}
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    task.isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                  }`}
                >
                  {task.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {task.category}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                        priorityStyles[task.priority]
                      }`}
                    >
                      {priorityLabels[task.priority]}
                    </span>
                    {isOverdue && (
                      <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                        <AlertCircle className="w-3 h-3" />
                        মেয়াদ শেষ
                      </span>
                    )}
                  </div>

                  <h3
                    className={`text-sm font-semibold ${
                      task.isCompleted
                        ? 'line-through text-slate-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {toBengaliDigits(task.dueDate, bnNums)}
                    </span>
                    {task.dueTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {toBengaliDigits(task.dueTime, bnNums)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => {
                    setEditingTask(task);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <CustomItemModal
        isOpen={isModalOpen}
        type="task"
        item={editingTask}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={(t, data) => {
          storage.saveTask(data);
          setRefreshKey((k) => k + 1);
        }}
        onDelete={(t, id) => {
          storage.deleteTask(id);
          setRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
};
