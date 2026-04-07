import React, { useEffect, useRef, useState } from 'react';
import { X, Save, Sparkles } from 'lucide-react';
import { UserProfile, Task } from '../types';

interface SaveAnalysisModalProps {
  isOpen: boolean;
  profile: UserProfile;
  tasks: Task[];
  existingId?: string;
  existingName?: string;
  existingDescription?: string;
  onSave: (name: string, description: string) => void;
  onClose: () => void;
}

export const SaveAnalysisModal: React.FC<SaveAnalysisModalProps> = ({
  isOpen,
  profile,
  tasks,
  existingId,
  existingName = '',
  existingDescription = '',
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(existingName);
  const [description, setDescription] = useState(existingDescription);
  const [isSaving, setIsSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !existingId) {
      // Generate default name
      const defaultName = profile.name
        ? `${profile.name}'s Analysis - ${new Date().toLocaleDateString()}`
        : `AI ROI Analysis - ${new Date().toLocaleDateString()}`;
      setName(defaultName);

      // Generate default description
      const taskCount = tasks.length;
      const totalHours = tasks.reduce((sum, t) => sum + t.weeklyHours, 0);
      const highPotentialTasks = tasks.filter(t => t.aiPotential >= 70).length;

      setDescription(
        `${taskCount} tasks analyzed • ${totalHours}h/week total • ${highPotentialTasks} high-impact AI opportunities`
      );
    }

    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, existingId, profile.name, tasks]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter a name for this analysis');
      return;
    }

    setIsSaving(true);

    // Simulate a brief save delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    onSave(name.trim(), description.trim());
    setIsSaving(false);

    // Reset form if it's a new save
    if (!existingId) {
      setName('');
      setDescription('');
    }
  };

  const suggestedNames = profile.name
    ? [
        `${profile.name}'s ${new Date().toLocaleDateString()} Analysis`,
        `${profile.name}'s Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()} Review`,
        `${profile.name}'s AI Assessment`,
      ]
    : [
        `AI ROI Analysis - ${new Date().toLocaleDateString()}`,
        `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()} Review`,
        `AI Assessment`,
      ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Save className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {existingId ? 'Update Analysis' : 'Save Analysis'}
                </h2>
                <p className="text-sm text-teal-100">
                  {existingId ? 'Update your saved analysis' : 'Save for future reference and comparison'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Quick Stats */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-slate-700">Analysis Summary</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold text-teal-600">{tasks.length}</p>
                <p className="text-xs text-slate-500">Tasks</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {tasks.reduce((sum, t) => sum + t.weeklyHours, 0)}
                </p>
                <p className="text-xs text-slate-500">Hours/Week</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">
                  {tasks.filter(t => t.aiPotential >= 70).length}
                </p>
                <p className="text-xs text-slate-500">High Impact</p>
              </div>
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Analysis Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My AI ROI Analysis"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            />

            {/* Suggested Names */}
            {!existingId && suggestedNames.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-slate-500 mb-1">Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedNames.slice(0, 3).map((suggested, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setName(suggested)}
                      className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
                    >
                      {suggested}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Briefly describe this analysis..."
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 text-slate-600 font-medium hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {existingId ? 'Update' : 'Save Analysis'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
