import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Task } from '../types';
import { formatCurrency, getCategoryIcon } from '../data/templates';
import { calculateTotalSavings } from '../utils/helpers';

interface TaskListProps {
  tasks: Task[];
  hourlyRate: number;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDuplicateTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  hourlyRate,
  onAddTask,
  onEditTask,
  onDuplicateTask,
  onDeleteTask,
}) => {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);

  const totalWeeklyHours = tasks.reduce((sum, t) => sum + t.weeklyHours, 0);
  const totalSavings = calculateTotalSavings(tasks, hourlyRate);

  const getPotentialColor = (potential: number) => {
    if (potential >= 70) return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    if (potential >= 40) return 'bg-amber-100 text-amber-700 border-amber-300';
    return 'bg-slate-100 text-slate-600 border-slate-300';
  };

  const getPotentialBadgeColor = (potential: number) => {
    if (potential >= 70) return 'bg-emerald-500';
    if (potential >= 40) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  const hasManualAdjustment = (task: Task) => task.manualAIAdjustment === true;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-teal-100 text-sm font-medium">Total Tasks</span>
            <Plus className="w-5 h-5 text-teal-200" />
          </div>
          <p className="text-3xl font-bold">{tasks.length}</p>
          <p className="text-teal-100 text-sm mt-1">{totalWeeklyHours} hours/week</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-100 text-sm font-medium">Weekly Savings</span>
            <Clock className="w-5 h-5 text-emerald-200" />
          </div>
          <p className="text-3xl font-bold">{totalSavings.totalHours}h</p>
          <p className="text-emerald-100 text-sm mt-1">
            {formatCurrency(totalSavings.totalSavings)}/week
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100 text-sm font-medium">Yearly Value</span>
            <TrendingUp className="w-5 h-5 text-blue-200" />
          </div>
          <p className="text-3xl font-bold">
            {formatCurrency(totalSavings.totalSavings * 52)}
          </p>
          <p className="text-blue-100 text-sm mt-1">annual savings potential</p>
        </div>
      </div>

      {/* Quick Add Button */}
      <button
        onClick={onAddTask}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-teal-500 hover:bg-teal-50/50 transition-all group"
      >
        <div className="w-10 h-10 bg-slate-100 group-hover:bg-teal-100 rounded-full flex items-center justify-center transition-colors">
          <Plus className="w-5 h-5 text-slate-400 group-hover:text-teal-600" />
        </div>
        <span className="font-medium text-slate-500 group-hover:text-slate-700">
          Add a new task
        </span>
      </button>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No tasks yet</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Add your first task to start analyzing your AI automation potential
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isExpanded = expandedTask === task.id;
            const isHovered = hoveredTask === task.id;
            const weeklySavingsHours = (task.weeklyHours * task.estimatedTimeSavingsPercent) / 100;
            const weeklySavingsDollars = weeklySavingsHours * hourlyRate;

            return (
              <div
                key={task.id}
                className={`bg-white rounded-xl border transition-all duration-200 ${
                  isHovered
                    ? 'border-teal-300 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onMouseEnter={() => setHoveredTask(task.id)}
                onMouseLeave={() => setHoveredTask(null)}
              >
                {/* Task Header */}
                <div className="flex items-center gap-4 p-4">
                  {/* Category Icon */}
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                    {getCategoryIcon(task.category)}
                  </div>

                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-800 truncate">
                        {task.name || 'Untitled Task'}
                      </h4>
                      {hasManualAdjustment(task) && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300" title="Manual adjustment">
                          <Zap className="w-3 h-3 inline mr-0.5" />
                          Adjusted
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPotentialColor(
                          task.aiPotential
                        )} border`}
                      >
                        {task.aiPotential}% AI
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {task.category} • {task.weeklyHours}h/week
                    </p>
                  </div>

                  {/* Savings Preview */}
                  {weeklySavingsHours > 0 && (
                    <div className="hidden sm:block text-right px-4">
                      <p className="text-sm font-semibold text-emerald-600">
                        Save {weeklySavingsHours.toFixed(1)}h/week
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatCurrency(weeklySavingsDollars)}/value
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditTask(task)}
                      className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDuplicateTask(task.id)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors ml-1"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50/50">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                            Importance
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: `${task.importance * 10}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-blue-600">
                              {task.importance}/10
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                            Repetitiveness
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500"
                                style={{ width: `${task.repetitiveness * 10}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-purple-600">
                              {task.repetitiveness}/10
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Savings Breakdown */}
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-emerald-600" />
                          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                            AI Savings
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-2xl font-bold text-emerald-600">
                              {weeklySavingsHours.toFixed(1)}h
                            </p>
                            <p className="text-xs text-slate-600">per week</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-teal-600">
                              {formatCurrency(weeklySavingsDollars * 52)}
                            </p>
                            <p className="text-xs text-slate-600">per year</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {task.description && (
                      <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
                        <p className="text-sm text-slate-600">{task.description}</p>
                      </div>
                    )}

                    {/* Notes */}
                    {task.notes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">{task.notes}</p>
                      </div>
                    )}

                    {/* Recommended Tools Preview */}
                    {task.recommendedTools.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-700 mb-2">
                          Recommended AI Tools:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {task.recommendedTools.slice(0, 3).map((tool, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm text-slate-700"
                            >
                              {tool.name}
                            </span>
                          ))}
                          {task.recommendedTools.length > 3 && (
                            <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm">
                              +{task.recommendedTools.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Keyboard Shortcuts Hint */}
      {tasks.length > 0 && (
        <div className="flex items-center justify-center gap-6 text-xs text-slate-500 py-2">
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-slate-100 rounded font-mono">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-slate-100 rounded font-mono">N</kbd>
            <span className="ml-1">New task</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-slate-100 rounded font-mono">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-slate-100 rounded font-mono">S</kbd>
            <span className="ml-1">Save</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-slate-100 rounded font-mono">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-slate-100 rounded font-mono">E</kbd>
            <span className="ml-1">Export</span>
          </span>
        </div>
      )}
    </div>
  );
};
