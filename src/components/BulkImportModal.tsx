import React, { useEffect, useRef, useState } from 'react';
import { X, Upload, FileText, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { TASK_CSV_TEMPLATE } from '../utils/storage';
import { CATEGORIES } from '../data/templates';

interface BulkImportModalProps {
  isOpen: boolean;
  onImport: (tasks: any[]) => void;
  onClose: () => void;
}

interface ParsedTask {
  name?: string;
  category?: string;
  weeklyHours?: number;
  importance?: number;
  repetitiveness?: number;
  description?: string;
  valid: boolean;
  errors: string[];
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onImport,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'csv' | 'json'>('csv');
  const [csvText, setCsvText] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [parsedTasks, setParsedTasks] = useState<ParsedTask[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCsvText(TASK_CSV_TEMPLATE);
      setJsonText(JSON.stringify([
        {
          name: 'Sample Task 1',
          category: CATEGORIES[0],
          weeklyHours: 5,
          importance: 7,
          repetitiveness: 8,
          description: 'This is a sample task',
        },
        {
          name: 'Sample Task 2',
          category: CATEGORIES[1],
          weeklyHours: 3,
          importance: 6,
          repetitiveness: 7,
          description: 'Another sample task',
        },
      ], null, 2));
      setParsedTasks([]);
      setFile(null);
    }
  }, [isOpen]);

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

  const parseCSV = (text: string): ParsedTask[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
    const tasks: ParsedTask[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
      const task: any = {};
      const errors: string[] = [];

      headers.forEach((header, index) => {
        task[header] = values[index] || '';
      });

      // Validate
      if (!task.name || !task.name.trim()) {
        errors.push('Missing task name');
      }

      if (!task.category || !CATEGORIES.includes(task.category)) {
        errors.push('Invalid or missing category');
      }

      const hours = parseFloat(task.weeklyhours || '0');
      if (isNaN(hours) || hours < 0 || hours > 168) {
        errors.push('Invalid weekly hours');
      }

      const importance = parseInt(task.importance || '5');
      if (isNaN(importance) || importance < 1 || importance > 10) {
        errors.push('Importance must be 1-10');
      }

      const repetitiveness = parseInt(task.repetitiveness || '5');
      if (isNaN(repetitiveness) || repetitiveness < 1 || repetitiveness > 10) {
        errors.push('Repetitiveness must be 1-10');
      }

      tasks.push({
        name: task.name,
        category: task.category,
        weeklyHours: hours,
        importance: importance,
        repetitiveness: repetitiveness,
        description: task.description || '',
        valid: errors.length === 0,
        errors,
      });
    }

    return tasks;
  };

  const parseJSON = (text: string): ParsedTask[] => {
    try {
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error('JSON must be an array of tasks');

      return data.map((task: any) => {
        const errors: string[] = [];

        if (!task.name || !task.name.trim()) {
          errors.push('Missing task name');
        }

        if (!task.category || !CATEGORIES.includes(task.category)) {
          errors.push('Invalid or missing category');
        }

        const hours = parseFloat(task.weeklyHours);
        if (isNaN(hours) || hours < 0 || hours > 168) {
          errors.push('Invalid weekly hours');
        }

        const importance = parseInt(task.importance);
        if (isNaN(importance) || importance < 1 || importance > 10) {
          errors.push('Importance must be 1-10');
        }

        const repetitiveness = parseInt(task.repetitiveness);
        if (isNaN(repetitiveness) || repetitiveness < 1 || repetitiveness > 10) {
          errors.push('Repetitiveness must be 1-10');
        }

        return {
          ...task,
          valid: errors.length === 0,
          errors,
        };
      });
    } catch (error) {
      return [];
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;

      if (activeTab === 'csv') {
        setCsvText(content);
        setParsedTasks(parseCSV(content));
      } else {
        setJsonText(content);
        setParsedTasks(parseJSON(content));
      }
    };
    reader.readAsText(uploadedFile);
  };

  const handlePreview = () => {
    const tasks = activeTab === 'csv' ? parseCSV(csvText) : parseJSON(jsonText);
    setParsedTasks(tasks);
  };

  const handleImport = () => {
    const validTasks = parsedTasks.filter(t => t.valid);

    if (validTasks.length === 0) {
      alert('No valid tasks to import');
      return;
    }

    onImport(
      validTasks.map(t => ({
        ...t,
        id: crypto.randomUUID(),
        aiPotential: 0,
        estimatedTimeSavingsPercent: 0,
        recommendedTools: [],
        notes: '',
      }))
    );

    onClose();
  };

  const downloadTemplate = () => {
    const blob = new Blob([TASK_CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'task-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const validCount = parsedTasks.filter(t => t.valid).length;
  const invalidCount = parsedTasks.filter(t => !t.valid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Bulk Import Tasks</h2>
                <p className="text-sm text-teal-100">Import multiple tasks at once</p>
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

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => {
              setActiveTab('csv');
              setParsedTasks([]);
            }}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'csv'
                ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            CSV Import
          </button>
          <button
            onClick={() => {
              setActiveTab('json');
              setParsedTasks([]);
            }}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'json'
                ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            JSON Import
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* File Upload */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-700">
                Upload {activeTab.toUpperCase()} File
              </label>
              {activeTab === 'csv' && (
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-800 font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <label className="flex-1 flex items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-teal-500 hover:bg-teal-50/50 transition-colors">
                <Upload className="w-8 h-8 text-slate-400" />
                <div className="text-left">
                  <p className="font-medium text-slate-700">
                    {file ? file.name : `Drop ${activeTab.toUpperCase()} file here or click to browse`}
                  </p>
                  <p className="text-sm text-slate-500">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Maximum file size: 1 MB'}
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={activeTab === 'csv' ? '.csv' : '.json'}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
              >
                Browse Files
              </button>
            </div>
          </div>

          {/* Text Editor */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-700">
                Or paste {activeTab.toUpperCase()} content:
              </label>
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                Preview
              </button>
            </div>

            <textarea
              value={activeTab === 'csv' ? csvText : jsonText}
              onChange={(e) => {
                if (activeTab === 'csv') {
                  setCsvText(e.target.value);
                } else {
                  setJsonText(e.target.value);
                }
              }}
              className="w-full h-48 px-4 py-3 font-mono text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
              placeholder={activeTab === 'csv' ? 'Paste CSV content here...' : 'Paste JSON array here...'}
            />
          </div>

          {/* Preview Results */}
          {parsedTasks.length > 0 && (
            <div className="border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Import Preview</h3>
                <div className="flex items-center gap-4 text-sm">
                  {validCount > 0 && (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle className="w-4 h-4" />
                      {validCount} valid
                    </span>
                  )}
                  {invalidCount > 0 && (
                    <span className="flex items-center gap-1 text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                      {invalidCount} invalid
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {parsedTasks.map((task, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border ${
                      task.valid
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-800">
                            {task.name || 'Unnamed Task'}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                            {task.category || 'No Category'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {task.weeklyHours}h/week • Importance: {task.importance} • Repetitiveness: {task.repetitiveness}
                        </p>
                        {task.description && (
                          <p className="text-sm text-slate-500 mt-1 italic">{task.description}</p>
                        )}
                      </div>
                      {task.valid ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <AlertCircle className="w-5 h-5 text-amber-600" />
                          <div className="text-xs text-amber-700">
                            {task.errors.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-slate-600 font-medium hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleImport}
            disabled={parsedTasks.length === 0 || validCount === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            Import {validCount} {validCount === 1 ? 'Task' : 'Tasks'}
          </button>
        </div>
      </div>
    </div>
  );
};
