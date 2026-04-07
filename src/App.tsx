import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Plus,
  Trash2,
  Download,
  Save,
  ArrowRight,
  ArrowLeft,
  Clock,
  DollarSign,
  TrendingUp,
  Sparkles,
  CheckCircle,
  BarChart3,
  Calendar,
  Briefcase,
  Zap,
  Lightbulb,
  Bot,
  ChevronDown,
  ChevronUp,
  PieChart,
  FileText,
  Home,
  User,
  AlertCircle,
  FolderOpen,
  Upload,
  X,
  Edit2,
  Copy,
  ExternalLink,
} from 'lucide-react';

// Types
import { Task, AITool, UserProfile, SavedAnalysis, AssessmentState } from './types';
import { TaskTemplate } from './types';

// Data & Templates
import {
  CATEGORIES,
  TASK_TEMPLATES,
  calculateAIPotential,
  calculateSavingsPercent,
  getRecommendedTools,
  formatCurrency,
  getCategoryIcon,
  AI_TOOLS_DATABASE,
} from './data/templates';

// Storage & Utilities
import {
  getSavedAnalyses,
  saveAnalysis as saveAnalysisToStorage,
  deleteAnalysis as deleteAnalysisFromStorage,
  duplicateAnalysis as duplicateAnalysisInStorage,
  exportAnalysisAsJSON,
  importAnalysisFromJSON,
  generateShareableLink,
  loadFromShareableLink,
  getCurrentState,
  saveCurrentState,
  clearCurrentState,
  TASK_CSV_TEMPLATE,
} from './utils/storage';
import { debounce, useKeyboardShortcuts, KeyboardShortcut, formatDate, calculateTotalSavings } from './utils/helpers';

// Components
import { TaskSlideOver } from './components/TaskSlideOver';
import { SaveAnalysisModal } from './components/SaveAnalysisModal';
import { AnalysisLibrary } from './components/AnalysisLibrary';
import { BulkImportModal } from './components/BulkImportModal';
import { TaskList } from './components/TaskList';
import { QuickAddTasks } from './components/QuickAddTasks';
import ToastContainer from './components/ToastContainer';
import { ToastProvider, useToastContext } from './contexts/ToastContext';

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  role: '',
  organization: '',
  hourlyRate: 100,
  email: '',
};

const DEFAULT_TASK: Omit<Task, 'id'> = {
  name: '',
  category: CATEGORIES[0],
  weeklyHours: 2,
  importance: 5,
  repetitiveness: 5,
  description: '',
  aiPotential: 0,
  estimatedTimeSavingsPercent: 0,
  recommendedTools: [],
  notes: '',
};

// Storage Keys
const STORAGE_KEY = 'ai-roi-coach-data';

// Helper: Calculate AI Potential for template
const calculateAIPotentialForTemplate = (template: TaskTemplate): number => {
  return calculateAIPotential(template);
};

// Navigation Component
const Navigation: React.FC<{
  currentStep: number;
  onNavigate: (step: number) => void;
  totalSteps: number;
  actionBar?: React.ReactNode;
}> = ({ currentStep, onNavigate, totalSteps, actionBar }) => {
  const steps = [
    { id: 1, label: 'Welcome', icon: Home },
    { id: 2, label: 'Profile', icon: User },
    { id: 3, label: 'Tasks', icon: Briefcase },
    { id: 4, label: 'Analysis', icon: BarChart3 },
    { id: 5, label: 'Recommendations', icon: Lightbulb },
    { id: 6, label: 'Report', icon: FileText },
  ];

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Applied AI Labs</h1>
              <p className="text-xs text-slate-400">AI ROI Coach</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden lg:flex items-center gap-1">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isPast = currentStep > step.id;

                return (
                  <button
                    key={step.id}
                    onClick={() => onNavigate(step.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                        : isPast
                        ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{step.label}</span>
                  </button>
                );
              })}
            </nav>
            {actionBar}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-700">
        <div
          className="h-full bg-gradient-to-r from-teal-400 to-blue-500 transition-all duration-500"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
};

// Welcome Step
const WelcomeStep: React.FC<{
  onNext: () => void;
  onLoadAnalysis: () => void;
}> = ({ onNext, onLoadAnalysis }) => (
  <div className="max-w-4xl mx-auto">
    <div className="text-center mb-12">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-400 to-blue-600 rounded-2xl mb-6 shadow-xl shadow-teal-500/20">
        <Sparkles className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-4xl font-bold text-slate-800 mb-4">
        Discover Your AI Savings Potential
      </h2>
      <p className="text-xl text-slate-600 max-w-2xl mx-auto">
        Take 15 minutes to uncover how AI tools could save you hours every week
        and transform your productivity.
      </p>
    </div>

    {/* Load Analysis Button */}
    <div className="mb-8">
      <button
        onClick={onLoadAnalysis}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50 rounded-xl transition-all group"
      >
        <FolderOpen className="w-5 h-5 text-slate-400 group-hover:text-teal-600" />
        <span className="font-medium text-slate-600 group-hover:text-slate-800">
          Load Saved Analysis
        </span>
      </button>
    </div>

    <div className="grid md:grid-cols-3 gap-6 mb-12">
      {[
        {
          icon: Clock,
          title: 'Document Your Tasks',
          desc: 'List your regular activities and how much time you invest in each.',
        },
        {
          icon: TrendingUp,
          title: 'AI Opportunity Analysis',
          desc: 'Our engine identifies which tasks are most ripe for AI automation.',
        },
        {
          icon: DollarSign,
          title: 'See Your Savings',
          desc: 'Get a personalized report with recommended tools and estimated ROI.',
        },
      ].map((item, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg flex items-center justify-center mb-4">
            <item.icon className="w-6 h-6 text-teal-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">{item.title}</h3>
          <p className="text-slate-600 text-sm">{item.desc}</p>
        </div>
      ))}
    </div>

    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white mb-12">
      <h3 className="text-2xl font-bold mb-6">How It Works</h3>
      <div className="grid md:grid-cols-5 gap-4">
        {['Welcome', 'Profile', 'Tasks', 'Analysis', 'Report'].map((step, i) => (
          <div key={step} className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-teal-500/20 border-2 border-teal-400 flex items-center justify-center text-teal-400 font-bold mb-2">
              {i + 1}
            </div>
            <span className="text-sm text-slate-300">{step}</span>
            {i < 4 && <div className="hidden md:block w-full h-0.5 bg-teal-500/30 mt-5" />}
          </div>
        ))}
      </div>
    </div>

    <div className="text-center">
      <button
        onClick={onNext}
        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all transform hover:-translate-y-0.5"
      >
        Let's Get Started
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  </div>
);

// Profile Step
const ProfileStep: React.FC<{
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onNext: () => void;
  onPrev: () => void;
}> = ({ profile, onUpdate, onNext, onPrev }) => (
  <div className="max-w-2xl mx-auto">
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Your Professional Profile</h2>
      <p className="text-slate-600">
        This helps us calculate your potential financial savings accurately.
      </p>
    </div>

    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => onUpdate({ ...profile, name: e.target.value })}
            placeholder="e.g., John Smith"
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Job Title / Role
            </label>
            <input
              type="text"
              value={profile.role}
              onChange={(e) => onUpdate({ ...profile, role: e.target.value })}
              placeholder="e.g., Marketing Manager"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Organization
            </label>
            <input
              type="text"
              value={profile.organization}
              onChange={(e) => onUpdate({ ...profile, organization: e.target.value })}
              placeholder="e.g., Acme Corp"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email (for report export)
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => onUpdate({ ...profile, email: e.target.value })}
            placeholder="e.g., john@company.com"
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Estimated Hourly Rate (USD)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="number"
              value={profile.hourlyRate}
              onChange={(e) =>
                onUpdate({ ...profile, hourlyRate: parseInt(e.target.value) || 0 })
              }
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            This is used to calculate the financial value of time saved. Include salary +
            benefits overhead.
          </p>
        </div>
      </div>
    </div>

    <div className="flex justify-between mt-8">
      <button
        onClick={onPrev}
        className="flex items-center gap-2 px-6 py-3 text-slate-600 font-medium hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>
      <button
        onClick={onNext}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
      >
        Continue
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  </div>
);

// Enhanced Tasks Step
const EnhancedTasksStep: React.FC<{
  tasks: Task[];
  profile: UserProfile;
  onAddTask: (template?: TaskTemplate) => void;
  onEditTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onDuplicateTask: (id: string) => void;
  onNext: () => void;
  onPrev: () => void;
}> = ({
  tasks,
  profile,
  onAddTask,
  onEditTask,
  onUpdateTask,
  onDeleteTask,
  onDuplicateTask,
  onNext,
  onPrev,
}) => {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Your Tasks & Activities</h2>
          <p className="text-slate-600">
            List the tasks you regularly perform. We'll analyze each one for AI automation
            potential.
          </p>
        </div>
      </div>

      {/* Quick Add Templates */}
      {tasks.length < 5 && <QuickAddTasks onAddTask={onAddTask} />}

      {/* Task List */}
      <TaskList
        tasks={tasks}
        hourlyRate={profile.hourlyRate}
        onAddTask={() => onAddTask()}
        onEditTask={onEditTask}
        onDuplicateTask={onDuplicateTask}
        onDeleteTask={onDeleteTask}
      />

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 px-6 py-3 text-slate-600 font-medium hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={tasks.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {tasks.length === 0 ? 'Add at least one task' : 'View Analysis'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Main App Component
  const App: React.FC = () => {
    const { showToast } = useToastContext();
    
    // Main state
    const [state, setState] = useState<AssessmentState>({
      profile: DEFAULT_PROFILE,
      tasks: [],
      currentStep: 1,
      lastUpdated: new Date().toISOString(),
    });

  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);

  // UI State for new features
  const [showTaskSlideOver, setShowTaskSlideOver] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showAnalysisLibrary, setShowAnalysisLibrary] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((currentState: AssessmentState) => {
      saveCurrentState(currentState);
    }, 1000),
    []
  );

  // Load from storage on mount
  useEffect(() => {
    const loadState = () => {
      // Check for shared link first
      const sharedAnalysis = loadFromShareableLink();
      if (sharedAnalysis) {
        setState({
          profile: sharedAnalysis.profile,
          tasks: sharedAnalysis.tasks,
          currentStep: 3,
          lastUpdated: new Date().toISOString(),
        });
        setCurrentAnalysisId(sharedAnalysis.id);
        setHasLoaded(true);
        return;
      }

      // Load from autosave
      const saved = getCurrentState();
      if (saved) {
        setState(saved);
      }

      setHasLoaded(true);
    };

    loadState();
  }, []);

  // Auto-save on state change
  useEffect(() => {
    if (hasLoaded) {
      debouncedSave(state);
    }
  }, [state, hasLoaded, debouncedSave]);

  // Keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'n',
      ctrlKey: true,
      metaKey: true,
      description: 'New task',
      action: () => {
        setEditingTask(null);
        setShowTaskSlideOver(true);
      },
    },
    {
      key: 's',
      ctrlKey: true,
      metaKey: true,
      description: 'Save analysis',
      action: () => setShowSaveModal(true),
    },
    {
      key: 'o',
      ctrlKey: true,
      metaKey: true,
      description: 'Open library',
      action: () => setShowAnalysisLibrary(true),
    },
    {
      key: 'e',
      ctrlKey: true,
      metaKey: true,
      description: 'Export analysis',
      action: () => handleExportCurrent(),
    },
    {
      key: 'i',
      ctrlKey: true,
      metaKey: true,
      description: 'Import tasks',
      action: () => setShowBulkImport(true),
    },
  ];

  useKeyboardShortcuts(shortcuts);

  // Task handlers
  const handleAddTask = useCallback((template?: TaskTemplate) => {
    const newTask: Task = {
      id: uuidv4(),
      ...DEFAULT_TASK,
      ...(template || {}),
      aiPotential: 0,
      estimatedTimeSavingsPercent: 0,
      recommendedTools: [],
    };

    // Calculate AI potential
    newTask.aiPotential = calculateAIPotential(newTask);
    newTask.estimatedTimeSavingsPercent = calculateSavingsPercent(newTask.aiPotential);
    newTask.recommendedTools = getRecommendedTools(newTask.category);

    setState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));

    // If template was used, don't open slide-over
    if (!template) {
      setEditingTask(newTask);
      setShowTaskSlideOver(true);
    }
  }, []);

  const handleUpdateTask = useCallback((updatedTask: Task) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
    }));
    setShowTaskSlideOver(false);
    setEditingTask(null);
  }, []);

  const handleDeleteTask = useCallback((id: string) => {
    // For now, delete directly - in a full implementation, we'd add a confirmation modal
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
    showToast({
      type: 'success',
      title: 'Task deleted',
      message: 'The task has been removed from your analysis',
    });
  }, [showToast]);

  const handleDuplicateTask = useCallback((id: string) => {
    setState((prev) => {
      const task = prev.tasks.find((t) => t.id === id);
      if (!task) return prev;

      const duplicated: Task = {
        ...task,
        id: uuidv4(),
        name: `${task.name} (Copy)`,
      };

      return {
        ...prev,
        tasks: [...prev.tasks, duplicated],
      };
    });
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setShowTaskSlideOver(true);
  }, []);

  // Analysis handlers
  const handleSaveAnalysis = useCallback((name: string, description: string) => {
    const analysis: SavedAnalysis = {
      id: currentAnalysisId || uuidv4(),
      name,
      description,
      profile: state.profile,
      tasks: state.tasks,
      createdAt: currentAnalysisId
        ? getSavedAnalyses().find((a) => a.id === currentAnalysisId)?.createdAt ||
          new Date().toISOString()
        : new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    saveAnalysisToStorage(analysis);
    setCurrentAnalysisId(analysis.id);
    setShowSaveModal(false);
  }, [state.profile, state.tasks, currentAnalysisId]);

  const handleLoadAnalysis = useCallback((analysis: SavedAnalysis) => {
    setState({
      profile: analysis.profile,
      tasks: analysis.tasks,
      currentStep: 3,
      lastUpdated: new Date().toISOString(),
    });
    setCurrentAnalysisId(analysis.id);
    setShowAnalysisLibrary(false);
  }, []);

  const handleDeleteAnalysis = useCallback((id: string) => {
    deleteAnalysisFromStorage(id);
    if (currentAnalysisId === id) {
      setCurrentAnalysisId(null);
    }
  }, [currentAnalysisId]);

  const handleDuplicateAnalysis = useCallback((id: string) => {
    const duplicated = duplicateAnalysisInStorage(id);
    return duplicated;
  }, []);

  const handleExportAnalysis = useCallback((analysis: SavedAnalysis) => {
    exportAnalysisAsJSON(analysis);
  }, []);

  const handleShareAnalysis = useCallback((analysis: SavedAnalysis) => {
    const link = generateShareableLink(analysis);

    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        showToast({
          type: 'success',
          title: 'Link copied!',
          message: 'Shareable link copied to clipboard',
        });
      });
    } else {
      window.open(link, '_blank');
    }
  }, [showToast]);

  const handleExportCurrent = useCallback(() => {
    const analysis: SavedAnalysis = {
      id: currentAnalysisId || uuidv4(),
      name: state.profile.name
        ? `${state.profile.name}'s Analysis`
        : 'AI ROI Analysis',
      description: `Exported on ${new Date().toLocaleDateString()}`,
      profile: state.profile,
      tasks: state.tasks,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    exportAnalysisAsJSON(analysis);
  }, [state, currentAnalysisId]);

  const handleBulkImport = useCallback((tasks: any[]) => {
    setState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, ...tasks],
    }));
    setShowBulkImport(false);
  }, []);

  // Navigation handlers
  const handleNavigate = useCallback((step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const handleNext = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(6, prev.currentStep + 1),
    }));
  }, []);

  const handlePrev = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1),
    }));
  }, []);

  const handleReset = useCallback(() => {
    if (
      window.confirm(
        'Are you sure you want to reset all your data? This cannot be undone.'
      )
    ) {
      clearCurrentState();
      setState({
        profile: DEFAULT_PROFILE,
        tasks: [],
        currentStep: 1,
        lastUpdated: new Date().toISOString(),
      });
      setCurrentAnalysisId(null);
    }
  }, []);

  // Analysis Step (Step 4)
  const AnalysisStep: React.FC<{
    tasks: Task[];
    hourlyRate: number;
    onPrev: () => void;
    onNext: () => void;
  }> = ({ tasks, hourlyRate, onPrev, onNext }) => {
    const totalSavings = calculateTotalSavings(tasks, hourlyRate);
    const sortedTasks = [...tasks].sort((a, b) => b.aiPotential - a.aiPotential);
    const highImpactTasks = tasks.filter(t => t.aiPotential >= 70);
    const mediumImpactTasks = tasks.filter(t => t.aiPotential >= 40 && t.aiPotential < 70);
    const lowImpactTasks = tasks.filter(t => t.aiPotential < 40);

    const getPotentialColor = (potential: number) => {
      if (potential >= 70) return { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' };
      if (potential >= 40) return { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50' };
      return { bg: 'bg-slate-400', text: 'text-slate-600', light: 'bg-slate-50' };
    };

    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">AI Opportunity Analysis</h2>
          <p className="text-slate-600">
            Comprehensive breakdown of your AI automation potential across all tasks
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl p-5 text-white">
            <p className="text-teal-100 text-sm font-medium mb-1">Total Tasks</p>
            <p className="text-3xl font-bold">{tasks.length}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-5 text-white">
            <p className="text-emerald-100 text-sm font-medium mb-1">High Impact</p>
            <p className="text-3xl font-bold">{highImpactTasks.length}</p>
            <p className="text-emerald-100 text-xs">70%+ AI Potential</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 text-white">
            <p className="text-amber-100 text-sm font-medium mb-1">Medium Impact</p>
            <p className="text-3xl font-bold">{mediumImpactTasks.length}</p>
            <p className="text-amber-100 text-xs">40-69% AI Potential</p>
          </div>
          <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl p-5 text-white">
            <p className="text-slate-300 text-sm font-medium mb-1">Low Impact</p>
            <p className="text-3xl font-bold">{lowImpactTasks.length}</p>
            <p className="text-slate-300 text-xs">&lt;40% AI Potential</p>
          </div>
        </div>

        {/* Total Savings Overview */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white mb-8">
          <h3 className="text-2xl font-bold mb-6">Total Savings Potential</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-slate-400 text-sm mb-2">Weekly Time Savings</p>
              <p className="text-4xl font-bold text-teal-400">{totalSavings.totalHours}h</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Weekly Cost Savings</p>
              <p className="text-4xl font-bold text-emerald-400">{formatCurrency(totalSavings.totalSavings)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Annual Value</p>
              <p className="text-4xl font-bold text-blue-400">{formatCurrency(totalSavings.totalSavings * 52)}</p>
            </div>
          </div>
        </div>

        {/* Tasks by AI Potential */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Tasks Ranked by AI Potential</h3>
          <div className="space-y-4">
            {sortedTasks.map((task, index) => {
              const colors = getPotentialColor(task.aiPotential);
              const weeklySavingsHours = (task.weeklyHours * task.estimatedTimeSavingsPercent) / 100;
              const weeklySavingsDollars = weeklySavingsHours * hourlyRate;

              return (
                <div key={task.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${colors.bg} rounded-full flex items-center justify-center text-white font-bold`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-800">{task.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors.light} ${colors.text} border`}>
                          {task.aiPotential}% AI
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{task.category} • {task.weeklyHours}h/week</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${colors.text}`}>{weeklySavingsHours.toFixed(1)}h/week</p>
                      <p className="text-sm text-slate-500">{formatCurrency(weeklySavingsDollars * 52)}/year</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors.bg} transition-all duration-500`}
                        style={{ width: `${task.aiPotential}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={onPrev}
            className="flex items-center gap-2 px-6 py-3 text-slate-600 font-medium hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Tasks
          </button>
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            View Recommendations
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  // Recommendations Step (Step 5)
  const RecommendationsStep: React.FC<{
    tasks: Task[];
    hourlyRate: number;
    onPrev: () => void;
    onNext: () => void;
  }> = ({ tasks, hourlyRate, onPrev, onNext }) => {
    const tasksByCategory = tasks.reduce((acc, task) => {
      if (!acc[task.category]) acc[task.category] = [];
      acc[task.category].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    const getAdoptionEffortColor = (effort: string) => {
      switch (effort) {
        case 'Low': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
        case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-300';
        case 'High': return 'bg-rose-100 text-rose-700 border-rose-300';
        default: return 'bg-slate-100 text-slate-700 border-slate-300';
      }
    };

    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">AI Tool Recommendations</h2>
          <p className="text-slate-600">
            Curated AI tools tailored to your specific tasks and categories
          </p>
        </div>

        {Object.entries(tasksByCategory).map(([category, categoryTasks]) => {
          const allTools = AI_TOOLS_DATABASE[category] || [];
          const categorySavings = calculateTotalSavings(categoryTasks, hourlyRate);

          return (
            <div key={category} className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getCategoryIcon(category)}</span>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{category}</h3>
                    <p className="text-sm text-slate-500">
                      {categoryTasks.length} task{categoryTasks.length > 1 ? 's' : ''} • {formatCurrency(categorySavings.totalSavings * 52)}/year savings
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allTools.map((tool, toolIndex) => (
                  <div
                    key={toolIndex}
                    className="bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 mb-1">{tool.name}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getAdoptionEffortColor(tool.adoptionEffort)}`}>
                          {tool.adoptionEffort} Effort
                        </span>
                      </div>
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Visit website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{tool.description}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="px-2 py-1 bg-slate-100 rounded">{tool.category}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Related Tasks */}
              <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs font-semibold text-slate-700 mb-2">Related Tasks:</p>
                <div className="flex flex-wrap gap-2">
                  {categoryTasks.map(task => (
                    <span key={task.id} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-700">
                      {task.name} ({task.aiPotential}%)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex justify-between">
          <button
            onClick={onPrev}
            className="flex items-center gap-2 px-6 py-3 text-slate-600 font-medium hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Analysis
          </button>
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            View Report
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  // Report Step (Step 6)
  const ReportStep: React.FC<{
    profile: UserProfile;
    tasks: Task[];
    onPrev: () => void;
    onExport: () => void;
  }> = ({ profile, tasks, onPrev, onExport }) => {
    const totalSavings = calculateTotalSavings(tasks, profile.hourlyRate);
    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const handlePrint = () => {
      window.print();
    };

    return (
      <div className="max-w-4xl mx-auto print:max-w-none">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">AI ROI Report</h2>
          <p className="text-slate-600">
            Your comprehensive AI automation savings analysis
          </p>
        </div>

        {/* Report Header */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-600 rounded-xl flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">AI ROI Analysis Report</h3>
                <p className="text-slate-500">Generated on {reportDate}</p>
              </div>
            </div>
          </div>

          {profile.name && (
            <div className="border-t border-slate-200 pt-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">PROFILE INFORMATION</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Name</p>
                  <p className="font-medium text-slate-800">{profile.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Role</p>
                  <p className="font-medium text-slate-800">{profile.role || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Organization</p>
                  <p className="font-medium text-slate-800">{profile.organization || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Hourly Rate</p>
                  <p className="font-medium text-slate-800">{formatCurrency(profile.hourlyRate)}/hour</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Executive Summary */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 text-white mb-6">
          <h4 className="text-lg font-bold mb-6">EXECUTIVE SUMMARY</h4>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-slate-300 text-sm mb-2">Tasks Analyzed</p>
              <p className="text-3xl font-bold text-teal-400">{tasks.length}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-slate-300 text-sm mb-2">Weekly Time Savings</p>
              <p className="text-3xl font-bold text-emerald-400">{totalSavings.totalHours}h</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-slate-300 text-sm mb-2">Annual Value</p>
              <p className="text-3xl font-bold text-blue-400">{formatCurrency(totalSavings.totalSavings * 52)}</p>
            </div>
          </div>
        </div>

        {/* Task Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <h4 className="text-lg font-bold text-slate-800 mb-4">TASK BREAKDOWN</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Task</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Hours/Week</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">AI Potential</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Time Saved</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Annual Value</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => {
                  const weeklySavingsHours = (task.weeklyHours * task.estimatedTimeSavingsPercent) / 100;
                  const annualSavings = weeklySavingsHours * profile.hourlyRate * 52;
                  return (
                    <tr key={task.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-800">{task.name}</p>
                          <p className="text-xs text-slate-500">{task.category}</p>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4 text-slate-700">{task.weeklyHours}h</td>
                      <td className="text-center py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          task.aiPotential >= 70 ? 'bg-emerald-100 text-emerald-700' :
                          task.aiPotential >= 40 ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {task.aiPotential}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4 text-slate-700">{weeklySavingsHours.toFixed(1)}h</td>
                      <td className="text-right py-3 px-4 font-medium text-slate-800">{formatCurrency(annualSavings)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-800">TOTAL</td>
                  <td className="text-center py-3 px-4 font-bold text-slate-800">
                    {tasks.reduce((sum, t) => sum + t.weeklyHours, 0)}h
                  </td>
                  <td />
                  <td className="text-center py-3 px-4 font-bold text-emerald-600">{totalSavings.totalHours}h</td>
                  <td className="text-right py-3 px-4 font-bold text-emerald-600 text-lg">
                    {formatCurrency(totalSavings.totalSavings * 52)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Recommendations Summary */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <h4 className="text-lg font-bold text-slate-800 mb-4">TOP AI TOOL RECOMMENDATIONS</h4>
          <div className="space-y-3">
            {Array.from(new Set(tasks.flatMap(t => t.recommendedTools)))
              .slice(0, 5)
              .map((tool, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{tool.name}</p>
                    <p className="text-sm text-slate-500">{tool.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    tool.adoptionEffort === 'Low' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                    tool.adoptionEffort === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-300' :
                    'bg-rose-100 text-rose-700 border-rose-300'
                  }`}>
                    {tool.adoptionEffort}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            onClick={onPrev}
            className="flex items-center gap-2 px-6 py-3 text-slate-600 font-medium hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Recommendations
          </button>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
            >
              <FileText className="w-5 h-5" />
              Print Report
            </button>
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <Download className="w-5 h-5" />
              Export Report
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render step
  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <WelcomeStep onNext={handleNext} onLoadAnalysis={() => setShowAnalysisLibrary(true)} />;
      case 2:
        return (
          <ProfileStep
            profile={state.profile}
            onUpdate={(profile) => setState((prev) => ({ ...prev, profile }))}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 3:
        return (
          <EnhancedTasksStep
            tasks={state.tasks}
            profile={state.profile}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onDuplicateTask={handleDuplicateTask}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 4:
        return (
          <AnalysisStep
            tasks={state.tasks}
            hourlyRate={state.profile.hourlyRate}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        );
      case 5:
        return (
          <RecommendationsStep
            tasks={state.tasks}
            hourlyRate={state.profile.hourlyRate}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        );
      case 6:
        return (
          <ReportStep
            profile={state.profile}
            tasks={state.tasks}
            onPrev={handlePrev}
            onExport={handleExportCurrent}
          />
        );
      default:
        return <WelcomeStep onNext={handleNext} onLoadAnalysis={() => {}} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Navigation */}
      <Navigation
        currentStep={state.currentStep}
        onNavigate={handleNavigate}
        totalSteps={6}
        actionBar={
          hasLoaded && state.tasks.length > 0 ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAnalysisLibrary(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg border border-white/20 text-sm text-white hover:bg-white/20 transition-colors"
                title="Open Analysis Library (Ctrl+O)"
              >
                <FolderOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Library</span>
              </button>

              <button
                onClick={() => setShowSaveModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg border border-white/20 text-sm text-white hover:bg-white/20 transition-colors"
                title="Save Analysis (Ctrl+S)"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Save</span>
              </button>

              <button
                onClick={handleExportCurrent}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg border border-white/20 text-sm text-white hover:bg-white/20 transition-colors"
                title="Export Analysis (Ctrl+E)"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          ) : null
        }
      />

      {/* Main Content */}
      <main className="py-10 px-4">{renderStep()}</main>

      {/* Modals */}
      <TaskSlideOver
        isOpen={showTaskSlideOver}
        task={editingTask}
        hourlyRate={state.profile.hourlyRate}
        onSave={handleUpdateTask}
        onClose={() => {
          setShowTaskSlideOver(false);
          setEditingTask(null);
        }}
      />

      <SaveAnalysisModal
        isOpen={showSaveModal}
        profile={state.profile}
        tasks={state.tasks}
        existingId={currentAnalysisId || undefined}
        existingName={currentAnalysisId ? getSavedAnalyses().find(a => a.id === currentAnalysisId)?.name : undefined}
        existingDescription={currentAnalysisId ? getSavedAnalyses().find(a => a.id === currentAnalysisId)?.description : undefined}
        onSave={handleSaveAnalysis}
        onClose={() => setShowSaveModal(false)}
      />

      <AnalysisLibrary
        isOpen={showAnalysisLibrary}
        analyses={getSavedAnalyses()}
        onLoad={handleLoadAnalysis}
        onDelete={handleDeleteAnalysis}
        onDuplicate={handleDuplicateAnalysis}
        onExport={handleExportAnalysis}
        onShare={handleShareAnalysis}
        onClose={() => setShowAnalysisLibrary(false)}
        hourlyRate={state.profile.hourlyRate}
      />

      <BulkImportModal
        isOpen={showBulkImport}
        onImport={handleBulkImport}
        onClose={() => setShowBulkImport(false)}
      />

      {/* Auto-save indicator */}
      <div className="fixed bottom-4 right-4 flex items-center gap-3">
        {hasLoaded && state.tasks.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-slate-200 text-xs text-slate-500">
            <Save className="w-3.5 h-3.5 text-emerald-500" />
            Auto-saved
          </div>
        )}
        {hasLoaded && state.tasks.length > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg shadow-sm border border-red-200 text-xs text-red-600 hover:bg-red-50 transition-colors"
            title="Reset all data"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      {hasLoaded && state.currentStep === 3 && (
        <div className="fixed bottom-4 left-4 px-3 py-2 bg-white/80 backdrop-blur rounded-lg shadow-sm border border-slate-200 text-xs text-slate-500">
          <span className="font-semibold">Shortcuts:</span> Ctrl+N New • Ctrl+S Save •
          Ctrl+O Library • Ctrl+E Export • Ctrl+I Import
        </div>
      )}
    </div>
  );
};

const AppWithToast: React.FC = () => (
  <ToastProvider>
    <App />
    <ToastContainer />
  </ToastProvider>
);

export default AppWithToast;
