import React, { useState, useMemo } from 'react';
import { Target, Plus, CheckCircle, Clock, Calendar, Edit2, Trash2, ArrowUpRight } from 'lucide-react';
import { AppSettings, Goal } from '../../types';
import { storage } from '../../services/storage';
import { toBengaliDigits, formatBengaliDate } from '../../utils/dateAndNumerals';
import { CustomItemModal } from '../modals/CustomItemModal';

interface GoalsViewProps {
  settings: AppSettings;
}

export const GoalsView: React.FC<GoalsViewProps> = ({ settings }) => {
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const bnNums = settings.useBengaliNumerals;
  const goals = useMemo(() => storage.getGoals(), [refreshKey]);

  const handleUpdateProgress = (goal: Goal, delta: number) => {
    const nextVal = Math.max(0, Math.min(goal.targetValue, goal.currentValue + delta));
    const isCompleted = nextVal >= goal.targetValue;
    storage.saveGoal({
      ...goal,
      currentValue: nextVal,
      isCompleted,
    });
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              ব্যক্তিগত দ্বীনি লক্ষ্য (Goals)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            কুরআন খতম, হাদিস শিক্ষা ও অভ্যাস গঠনের দীর্ঘমেয়াদী লক্ষ্য নির্ধারণ ও অগ্রগতি।
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGoal(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          নতুন লক্ষ্য তৈরি করুন
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));

          return (
            <div
              key={goal.id}
              className={`p-5 bg-white dark:bg-slate-900 border rounded-2xl shadow-xs space-y-4 flex flex-col justify-between transition-all ${
                goal.isCompleted
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/15'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                    {goal.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingGoal(goal);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {goal.title}
                </h3>

                {goal.description && (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {goal.description}
                  </p>
                )}
              </div>

              {/* Progress Bar & Counter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-300">
                    অগ্রগতি: {toBengaliDigits(goal.currentValue, bnNums)} / {toBengaliDigits(goal.targetValue, bnNums)} {goal.unit}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                    {toBengaliDigits(percent, bnNums)}%
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Progress Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleUpdateProgress(goal, -1)}
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      -১
                    </button>
                    <button
                      onClick={() => handleUpdateProgress(goal, 1)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                    >
                      +১
                    </button>
                    <button
                      onClick={() => handleUpdateProgress(goal, 5)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                    >
                      +৫
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    টার্গেট: {toBengaliDigits(goal.targetDate, bnNums)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <CustomItemModal
        isOpen={isModalOpen}
        type="goal"
        item={editingGoal}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={(t, data) => {
          storage.saveGoal(data);
          setRefreshKey((k) => k + 1);
        }}
        onDelete={(t, id) => {
          storage.deleteGoal(id);
          setRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
};
