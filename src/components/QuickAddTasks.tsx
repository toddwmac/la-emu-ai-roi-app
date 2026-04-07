import React from 'react';
import { Zap, Clock, TrendingUp } from 'lucide-react';
import { TaskTemplate } from '../types';
import { TASK_TEMPLATES, getCategoryIcon, calculateAIPotential } from '../data/templates';

interface QuickAddTasksProps {
  onAddTask: (template: TaskTemplate) => void;
}

export const QuickAddTasks: React.FC<QuickAddTasksProps> = ({ onAddTask }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold text-slate-800">Quick Add Templates</h3>
        </div>
        <p className="text-sm text-slate-500">Click to add common tasks instantly</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {TASK_TEMPLATES.map((template) => {
          const aiPotential = calculateAIPotential(template);
          const savingsPercent = aiPotential >= 80 ? 60 : aiPotential >= 65 ? 45 : aiPotential >= 50 ? 30 : 15;

          return (
            <button
              key={template.name}
              onClick={() => onAddTask(template)}
              className="group relative flex flex-col items-start gap-2 p-4 bg-white border border-slate-200 hover:border-teal-400 hover:shadow-md rounded-xl transition-all text-left"
            >
              <div className="flex items-center gap-2 w-full">
                <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-800 text-sm truncate group-hover:text-teal-600 transition-colors">
                    {template.name}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">{template.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full text-xs">
                <div className="flex items-center gap-1 text-slate-600">
                  <Clock className="w-3 h-3" />
                  <span>{template.weeklyHours}h</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>{template.repetitiveness}/10</span>
                </div>
              </div>

              <div className="absolute top-2 right-2">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    aiPotential >= 70
                      ? 'bg-emerald-100 text-emerald-700'
                      : aiPotential >= 40
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {aiPotential}% AI
                </span>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 to-teal-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </button>
          );
        })}
      </div>

      <p className="text-xs text-slate-500 mt-3">
        💡 Tip: After adding, you can customize each task's details
      </p>
    </div>
  );
};
