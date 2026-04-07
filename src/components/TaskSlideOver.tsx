import React, { useEffect, useRef } from 'react';
import { X, Clock, TrendingUp, Zap } from 'lucide-react';
import { Task, AITool } from '../types';
import { CATEGORIES, calculateAIPotential, calculateSavingsPercent, getRecommendedTools, formatCurrency } from '../data/templates';
import { useToastContext } from '../contexts/ToastContext';

interface TaskSlideOverProps {
  isOpen: boolean;
  task: Partial<Task> | null;
  hourlyRate: number;
  onSave: (task: Task) => void;
  onClose: () => void;
}

export const TaskSlideOver: React.FC<TaskSlideOverProps> = ({
  isOpen,
  task,
  hourlyRate,
  onSave,
  onClose,
}) => {
  const { showToast } = useToastContext();
  const [formData, setFormData] = React.useState<Partial<Task>>(task || {
    name: '',
    category: CATEGORIES.length > 0 ? CATEGORIES[0] : '',
    weeklyHours: 2,
    importance: 5,
    repetitiveness: 5,
    description: '',
    notes: '',
    manualAIAdjustment: false,
  });

  const [aiPotential, setAiPotential] = React.useState(0);
  const [savingsPercent, setSavingsPercent] = React.useState(0);
  const [recommendedTools, setRecommendedTools] = React.useState<AITool[]>([]);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        manualAIAdjustment: task.manualAIAdjustment || false,
      });
      setAiPotential(task.aiPotential || 0);
      setSavingsPercent(task.estimatedTimeSavingsPercent || 0);
      setRecommendedTools(task.recommendedTools || []);
    }
  }, [task]);

  // Toggle manual AI adjustment mode
  const toggleManualAIAdjustment = React.useCallback(() => {
    setFormData(prev => ({
      ...prev,
      manualAIAdjustment: !prev.manualAIAdjustment
    }));
  }, []);

  // Recalculate AI potential based on form inputs
  useEffect(() => {
    if (!formData.manualAIAdjustment && formData.category) {
      const potential = calculateAIPotential(formData);
      const savings = calculateSavingsPercent(potential);
      const tools = getRecommendedTools(formData.category);

      setAiPotential(potential);
      setSavingsPercent(savings);
      setRecommendedTools(tools);
    } else if (formData.manualAIAdjustment && formData.category && isOpen) {
      // When in manual mode, recalculate tools based on category
      setRecommendedTools(getRecommendedTools(formData.category));
    }
  }, [formData.manualAIAdjustment, formData.category, formData.repetitiveness, isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      showToast({
        type: 'error',
        title: 'Task name required',
        message: 'Please enter a task name to continue',
      });
      return;
    }

    const newTask: Task = {
      id: task?.id || crypto.randomUUID(),
      name: formData.name!,
      category: formData.category!,
      weeklyHours: formData.weeklyHours || 0,
      importance: formData.importance || 5,
      repetitiveness: formData.repetitiveness || 5,
      description: formData.description || '',
      notes: formData.notes || '',
      aiPotential,
      estimatedTimeSavingsPercent: savingsPercent,
      recommendedTools,
      manualAIAdjustment: formData.manualAIAdjustment || false,
    };

    onSave(newTask);
    showToast({
      type: 'success',
      title: task?.id ? 'Task updated' : 'Task added',
      message: 'Your task has been saved successfully',
    });
  };

  const weeklySavingsHours = (formData.weeklyHours! * savingsPercent) / 100;
  const weeklySavingsDollars = weeklySavingsHours * hourlyRate;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
        <div
          ref={modalRef}
          className="relative w-screen max-w-2xl transform transition-all bg-white shadow-xl h-full overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {task?.id ? 'Edit Task' : 'Add New Task'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Define your task and see AI recommendations
              </p>
            </div>
            <div className="flex items-center gap-3">
              {formData.manualAIAdjustment && (
                <button
                  type="button"
                  onClick={toggleManualAIAdjustment}
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-200 transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Manual Mode On
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Task Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Task Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Weekly report preparation"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                autoFocus
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Hours and Sliders */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Weekly Hours
                </label>
                <input
                  type="number"
                  value={formData.weeklyHours}
                  onChange={(e) => setFormData({ ...formData, weeklyHours: parseFloat(e.target.value) || 0 })}
                  min="0"
                  max="168"
                  step="0.5"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Importance (1-10)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    value={formData.importance}
                    onChange={(e) => setFormData({ ...formData, importance: parseInt(e.target.value) })}
                    min="1"
                    max="10"
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                  <span className="text-lg font-semibold text-teal-600 w-8 text-center">{formData.importance}</span>
                </div>
              </div>
            </div>

            {/* Repetitiveness */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Repetitiveness (1-10)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  value={formData.repetitiveness}
                  onChange={(e) => setFormData({ ...formData, repetitiveness: parseInt(e.target.value) })}
                  min="1"
                  max="10"
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
                <span className="text-lg font-semibold text-teal-600 w-8 text-center">{formData.repetitiveness}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Higher values indicate more repetitive, routine tasks that benefit more from AI automation
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Briefly describe what this task involves..."
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                placeholder="Any additional context or requirements..."
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none"
              />
            </div>

            {/* AI Analysis Preview */}
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-slate-800">AI Analysis</h3>
                </div>
                {formData.manualAIAdjustment && (
                  <button
                    type="button"
                    onClick={toggleManualAIAdjustment}
                    className="text-xs text-slate-500 hover:text-slate-700 underline"
                  >
                    Use Auto-Calculation
                  </button>
                )}
              </div>

              {formData.manualAIAdjustment ? (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-slate-600 mb-3">
                      Adjust the AI impact rating based on your judgment. This will override the automatic calculation.
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        value={aiPotential}
                        onChange={(e) => {
                          const newPotential = parseInt(e.target.value);
                          setAiPotential(newPotential);
                          setSavingsPercent(calculateSavingsPercent(newPotential));
                        }}
                        min="0"
                        max="100"
                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                      <span className="text-lg font-semibold text-teal-600 w-12 text-center">{aiPotential}%</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-4 border border-teal-200">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">AI Impact</p>
                      <p className="text-2xl font-bold text-teal-600">{aiPotential}%</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-teal-200">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Weekly Savings</p>
                      <p className="text-2xl font-bold text-emerald-600">{weeklySavingsHours.toFixed(1)}h</p>
                      <p className="text-xs text-slate-600">{formatCurrency(weeklySavingsDollars)}/week</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-teal-200">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Time Saved</p>
                      <p className="text-2xl font-bold text-blue-600">{savingsPercent}%</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {aiPotential > 0 && (
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white rounded-lg p-4 border border-teal-200">
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">AI Potential</p>
                        <p className="text-2xl font-bold text-teal-600">{aiPotential}%</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-teal-200">
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Weekly Savings</p>
                        <p className="text-2xl font-bold text-emerald-600">{weeklySavingsHours.toFixed(1)}h</p>
                        <p className="text-xs text-slate-600">{formatCurrency(weeklySavingsDollars)}/week</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-teal-200">
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Time Saved</p>
                        <p className="text-2xl font-bold text-blue-600">{savingsPercent}%</p>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={toggleManualAIAdjustment}
                    className="w-full mb-4 px-4 py-2 bg-white border-2 border-dashed border-amber-300 text-amber-600 text-sm font-medium rounded-lg hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Adjust AI Impact Manually
                  </button>

                  {recommendedTools.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Recommended AI Tools</h4>
                      <div className="grid md:grid-cols-2 gap-2">
                        {recommendedTools.slice(0, 4).map((tool, i) => (
                          <div key={i} className="bg-white rounded-lg p-3 border border-slate-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-slate-800 text-sm">{tool.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                tool.adoptionEffort === 'Low' ? 'bg-emerald-100 text-emerald-700' :
                                tool.adoptionEffort === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {tool.adoptionEffort}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">{tool.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-slate-600 font-medium hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                {task?.id ? 'Save Changes' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
