import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Plus, Trash2, Download, Save, ArrowRight, ArrowLeft, 
  Clock, DollarSign, TrendingUp, Sparkles, CheckCircle,
  BarChart3, Calendar, Briefcase, Zap, Lightbulb, Bot,
  ChevronDown, ChevronUp, PieChart, FileText,
  Home, User, AlertCircle
} from 'lucide-react';

// Types
interface Task {
  id: string;
  name: string;
  category: string;
  weeklyHours: number;
  importance: number;
  repetitiveness: number;
  description: string;
  aiPotential: number;
  estimatedTimeSavingsPercent: number;
  recommendedTools: AITool[];
  notes: string;
}

interface AITool {
  name: string;
  category: string;
  description: string;
  url: string;
  adoptionEffort: 'Low' | 'Medium' | 'High';
}

interface UserProfile {
  name: string;
  role: string;
  organization: string;
  hourlyRate: number;
  email: string;
}

interface AssessmentState {
  profile: UserProfile;
  tasks: Task[];
  currentStep: number;
  lastUpdated: string;
}

// AI Tools Database
const AI_TOOLS_DATABASE: Record<string, AITool[]> = {
  'Email & Communication': [
    { name: 'Microsoft Copilot', category: 'Email', description: 'AI-powered email drafting, summarization, and inbox management', url: 'https://copilot.microsoft.com', adoptionEffort: 'Low' },
    { name: 'GrammarlyGO', category: 'Writing', description: 'AI writing assistant for email, documents, and messaging', url: 'https://grammarly.com', adoptionEffort: 'Low' },
    { name: 'Notion AI', category: 'Productivity', description: 'AI assistant for drafting, summarizing, and brainstorming', url: 'https://notion.so', adoptionEffort: 'Low' },
  ],
  'Report Writing & Documentation': [
    { name: 'ChatGPT / GPT-4', category: 'Writing', description: 'Advanced AI for report generation, research, and content creation', url: 'https://chat.openai.com', adoptionEffort: 'Low' },
    { name: 'Claude', category: 'Writing', description: 'AI assistant for long-form writing, analysis, and documentation', url: 'https://anthropic.com', adoptionEffort: 'Low' },
    { name: 'Notion AI', category: 'Productivity', description: 'AI-powered documentation and knowledge base management', url: 'https://notion.so', adoptionEffort: 'Low' },
  ],
  'Data Analysis & Reporting': [
    { name: 'Microsoft Copilot for Excel', category: 'Analytics', description: 'AI-powered data analysis, visualization, and insights in Excel', url: 'https://microsoft.com/copilot', adoptionEffort: 'Medium' },
    { name: 'Tableau GPT', category: 'Analytics', description: 'AI-powered data visualization and natural language queries', url: 'https://tableau.com', adoptionEffort: 'Medium' },
    { name: 'Python + AI Assistants', category: 'Coding', description: 'Use AI to generate Python scripts for advanced data analysis', url: 'https://github.com/features/copilot', adoptionEffort: 'High' },
  ],
  'Meeting Preparation & Follow-up': [
    { name: 'Otter.ai', category: 'Meetings', description: 'AI meeting transcription, note-taking, and summarization', url: 'https://otter.ai', adoptionEffort: 'Low' },
    { name: 'Microsoft Copilot', category: 'Productivity', description: 'AI-powered meeting notes, action item extraction, and follow-up emails', url: 'https://copilot.microsoft.com', adoptionEffort: 'Medium' },
    { name: 'Fireflies.ai', category: 'Meetings', description: 'AI meeting assistant with transcription and conversation intelligence', url: 'https://fireflies.ai', adoptionEffort: 'Low' },
  ],
  'Presentation Creation': [
    { name: 'Canva AI', category: 'Design', description: 'AI-powered presentation design with Magic Design and text-to-slides', url: 'https://canva.com', adoptionEffort: 'Low' },
    { name: 'Gamma', category: 'Design', description: 'AI-powered presentation and document creation with beautiful templates', url: 'https://gamma.app', adoptionEffort: 'Low' },
    { name: 'Microsoft Copilot', category: 'Productivity', description: 'AI-assisted PowerPoint creation and slide design', url: 'https://microsoft.com/copilot', adoptionEffort: 'Medium' },
  ],
  'Research & Information Gathering': [
    { name: 'Perplexity AI', category: 'Research', description: 'AI-powered search engine with cited sources and deep research capabilities', url: 'https://perplexity.ai', adoptionEffort: 'Low' },
    { name: 'ChatGPT with Browse', category: 'Research', description: 'Real-time web access for research and current information gathering', url: 'https://chat.openai.com', adoptionEffort: 'Low' },
    { name: 'Consensus', category: 'Research', description: 'AI-powered search engine for scientific papers and academic research', url: 'https://consensus.app', adoptionEffort: 'Low' },
  ],
  'Scheduling & Calendar Management': [
    { name: 'Calendly AI', category: 'Scheduling', description: 'AI-powered scheduling assistant with smart time suggestions', url: 'https://calendly.com', adoptionEffort: 'Low' },
    { name: 'Microsoft Copilot', category: 'Productivity', description: 'AI-assisted calendar management and meeting scheduling', url: 'https://copilot.microsoft.com', adoptionEffort: 'Medium' },
    { name: 'Reclaim AI', category: 'Scheduling', description: 'AI-powered calendar assistant for time blocking and task scheduling', url: 'https://reclaim.ai', adoptionEffort: 'Medium' },
  ],
  'Social Media & Content Creation': [
    { name: 'ChatGPT / GPT-4', category: 'Writing', description: 'Content ideation, drafting, and social media post creation', url: 'https://chat.openai.com', adoptionEffort: 'Low' },
    { name: 'Canva AI', category: 'Design', description: 'AI-powered social media graphic design and video creation', url: 'https://canva.com', adoptionEffort: 'Low' },
    { name: 'Buffer AI Assistant', category: 'Social Media', description: 'AI-powered social media scheduling and content optimization', url: 'https://buffer.com', adoptionEffort: 'Medium' },
  ],
  'Code Development & Technical Tasks': [
    { name: 'GitHub Copilot', category: 'Coding', description: 'AI-powered code completion, generation, and debugging in IDEs', url: 'https://github.com/features/copilot', adoptionEffort: 'Medium' },
    { name: 'Cursor', category: 'Coding', description: 'AI-first code editor with advanced code understanding and generation', url: 'https://cursor.sh', adoptionEffort: 'Medium' },
    { name: 'ChatGPT / GPT-4o', category: 'Coding', description: 'Advanced AI for code generation, debugging, and architecture decisions', url: 'https://chat.openai.com', adoptionEffort: 'Low' },
  ],
  'Project Management': [
    { name: 'Microsoft Copilot', category: 'Productivity', description: 'AI-assisted project planning, status updates, and risk identification', url: 'https://microsoft.com/copilot', adoptionEffort: 'Medium' },
    { name: 'Notion AI', category: 'Productivity', description: 'AI-powered project documentation, meeting notes, and task management', url: 'https://notion.so', adoptionEffort: 'Low' },
    { name: 'Monday AI', category: 'PM', description: 'AI-powered work management with automation and insights', url: 'https://monday.com', adoptionEffort: 'Medium' },
  ],
  'Creative & Design Work': [
    { name: 'Midjourney', category: 'Design', description: 'AI-powered image generation and creative visual ideation', url: 'https://midjourney.com', adoptionEffort: 'Medium' },
    { name: 'DALL-E 3', category: 'Design', description: 'AI image generation integrated with ChatGPT for creative work', url: 'https://openai.com/dall-e-3', adoptionEffort: 'Low' },
    { name: 'Canva AI', category: 'Design', description: 'Comprehensive AI design tools for graphics, videos, and presentations', url: 'https://canva.com', adoptionEffort: 'Low' },
  ],
};

const CATEGORIES = Object.keys(AI_TOOLS_DATABASE);

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  role: '',
  organization: '',
  hourlyRate: 100,
  email: '',
};

const DEFAULT_TASK: Omit<Task, 'id'> = {
  name: '',
  category: 'Email & Communication',
  weeklyHours: 2,
  importance: 5,
  repetitiveness: 5,
  description: '',
  aiPotential: 0,
  estimatedTimeSavingsPercent: 0,
  recommendedTools: [],
  notes: '',
};

// Helper Functions
const calculateAIPotential = (task: Partial<Task>): number => {
  // AI Potential is based on repetitiveness, time spent, and category
  const categoryPotential: Record<string, number> = {
    'Email & Communication': 85,
    'Report Writing & Documentation': 80,
    'Data Analysis & Reporting': 75,
    'Meeting Preparation & Follow-up': 70,
    'Presentation Creation': 65,
    'Research & Information Gathering': 75,
    'Scheduling & Calendar Management': 80,
    'Social Media & Content Creation': 70,
    'Code Development & Technical Tasks': 60,
    'Project Management': 50,
    'Creative & Design Work': 45,
  };

  const basePotential = categoryPotential[task.category || 'Email & Communication'] || 50;
  const repetitionFactor = (task.repetitiveness || 5) * 5; // 0-50
  const timeFactor = Math.min((task.weeklyHours || 0) * 5, 30); // 0-30
  
  const potential = Math.round((basePotential * 0.6) + (repetitionFactor * 0.25) + (timeFactor * 0.15));
  return Math.min(100, Math.max(0, potential));
};

const calculateSavingsPercent = (aiPotential: number): number => {
  if (aiPotential >= 80) return 60;
  if (aiPotential >= 65) return 45;
  if (aiPotential >= 50) return 30;
  if (aiPotential >= 35) return 15;
  return 5;
};

const getRecommendedTools = (category: string): AITool[] => {
  return AI_TOOLS_DATABASE[category] || [];
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const STORAGE_KEY = 'ai-roi-coach-data';

// Components
const Navigation: React.FC<{ currentStep: number; onNavigate: (step: number) => void; totalSteps: number }> = ({ currentStep, onNavigate, totalSteps }) => {
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
          
          <nav className="hidden md:flex items-center gap-1">
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
                  <span className="hidden lg:inline">{step.label}</span>
                </button>
              );
            })}
          </nav>
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

const WelcomeStep: React.FC<{ onNext: () => void }> = ({ onNext }) => (
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

    <div className="grid md:grid-cols-3 gap-6 mb-12">
      {[
        { icon: Clock, title: 'Document Your Tasks', desc: 'List your regular activities and how much time you invest in each.' },
        { icon: TrendingUp, title: 'AI Opportunity Analysis', desc: 'Our engine identifies which tasks are most ripe for AI automation.' },
        { icon: DollarSign, title: 'See Your Savings', desc: 'Get a personalized report with recommended tools and estimated ROI.' },
      ].map((item, i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
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

const ProfileStep: React.FC<{
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onNext: () => void;
  onPrev: () => void;
}> = ({ profile, onUpdate, onNext, onPrev }) => (
  <div className="max-w-2xl mx-auto">
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Your Professional Profile</h2>
      <p className="text-slate-600">This helps us calculate your potential financial savings accurately.</p>
    </div>

    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Job Title / Role</label>
            <input
              type="text"
              value={profile.role}
              onChange={(e) => onUpdate({ ...profile, role: e.target.value })}
              placeholder="e.g., Marketing Manager"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Organization</label>
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
          <label className="block text-sm font-medium text-slate-700 mb-2">Email (for report export)</label>
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
              onChange={(e) => onUpdate({ ...profile, hourlyRate: parseInt(e.target.value) || 0 })}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            This is used to calculate the financial value of time saved. Include salary + benefits overhead.
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

const TaskEditor: React.FC<{
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  hourlyRate: number;
}> = ({ task, onUpdate, onDelete, isExpanded, onToggleExpand, hourlyRate }) => {
  const weeklySavingsHours = (task.weeklyHours * task.estimatedTimeSavingsPercent) / 100;
  const weeklySavingsDollars = weeklySavingsHours * hourlyRate;

  const handleFieldChange = (field: keyof Task, value: string | number) => {
    const updated = { ...task, [field]: value };
    // Recalculate AI potential when key fields change
    if (['category', 'repetitiveness', 'weeklyHours'].includes(field)) {
      updated.aiPotential = calculateAIPotential(updated);
      updated.estimatedTimeSavingsPercent = calculateSavingsPercent(updated.aiPotential);
      updated.recommendedTools = getRecommendedTools(updated.category);
    }
    onUpdate(updated);
  };

  const getPotentialColor = (potential: number) => {
    if (potential >= 70) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (potential >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-slate-500 bg-slate-50 border-slate-200';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${getPotentialColor(task.aiPotential)}`}>
            {task.aiPotential}% AI Fit
          </div>
          <div>
            <h4 className="font-semibold text-slate-800">
              {task.name || 'Untitled Task'}
            </h4>
            <p className="text-sm text-slate-500">{task.category} • {task.weeklyHours}h/week</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {weeklySavingsHours > 0 && (
            <div className="text-right mr-4">
              <p className="text-sm font-semibold text-emerald-600">
                Save {weeklySavingsHours.toFixed(1)}h/week
              </p>
              <p className="text-xs text-slate-500">
                {formatCurrency(weeklySavingsDollars)}/week
              </p>
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-100 p-6 bg-slate-50/50">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Task Name *
              </label>
              <input
                type="text"
                value={task.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="e.g., Weekly report preparation"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={task.category}
                onChange={(e) => handleFieldChange('category', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Weekly Hours Spent
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={task.weeklyHours}
                  onChange={(e) => handleFieldChange('weeklyHours', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="80"
                  step="0.5"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
                <span className="text-sm text-slate-500">hours</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Business Importance (1-10)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  value={task.importance}
                  onChange={(e) => handleFieldChange('importance', parseInt(e.target.value))}
                  min="1"
                  max="10"
                  className="flex-1"
                />
                <span className="w-8 text-center font-semibold text-slate-700">{task.importance}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Repetitiveness (1-10)
                <span className="block text-xs font-normal text-slate-500 mt-0.5">
                  Higher = better AI candidate
                </span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  value={task.repetitiveness}
                  onChange={(e) => handleFieldChange('repetitiveness', parseInt(e.target.value))}
                  min="1"
                  max="10"
                  className="flex-1"
                />
                <span className="w-8 text-center font-semibold text-slate-700">{task.repetitiveness}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Estimated Time Savings (%)
                <span className="block text-xs font-normal text-slate-500 mt-0.5">
                  Auto-calculated, but adjustable
                </span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  value={task.estimatedTimeSavingsPercent}
                  onChange={(e) => handleFieldChange('estimatedTimeSavingsPercent', parseInt(e.target.value))}
                  min="0"
                  max="90"
                  step="5"
                  className="flex-1"
                />
                <span className="w-12 text-center font-semibold text-teal-600">{task.estimatedTimeSavingsPercent}%</span>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Task Description / Notes
              </label>
              <textarea
                value={task.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Describe what this task involves, what tools you use, and any challenges..."
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>
          </div>

          {/* AI Analysis Section */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <h5 className="font-semibold text-slate-800">AI Analysis & Recommendations</h5>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-4 border border-teal-100">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">AI Fit Score</p>
                <p className="text-3xl font-bold text-teal-600">{task.aiPotential}%</p>
                <p className="text-xs text-slate-600 mt-1">
                  {task.aiPotential >= 70 ? 'Excellent AI candidate' :
                   task.aiPotential >= 40 ? 'Moderate AI potential' : 'Limited AI benefit'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-100">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Weekly Hours Saved</p>
                <p className="text-3xl font-bold text-emerald-600">{weeklySavingsHours.toFixed(1)}h</p>
                <p className="text-xs text-slate-600 mt-1">
                  {formatCurrency(weeklySavingsDollars)} value
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg p-4 border border-blue-100">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Time Reinvestment</p>
                <p className="text-3xl font-bold text-blue-600">
                  {task.importance >= 7 ? '↑ High' :
                   task.importance >= 4 ? '→ Medium' : '↓ Low'}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {task.importance >= 7 ? 'Strategic importance focus' :
                   task.importance >= 4 ? 'Quality improvements' : 'Cost reduction focus'}
                </p>
              </div>
            </div>

            {/* Recommended Tools */}
            {task.recommendedTools.length > 0 && (
              <div>
                <h6 className="text-sm font-semibold text-slate-700 mb-3">Recommended AI Tools</h6>
                <div className="grid md:grid-cols-3 gap-3">
                  {task.recommendedTools.map((tool, i) => (
                    <div key={i} className="bg-white rounded-lg border border-slate-200 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-800 text-sm">{tool.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          tool.adoptionEffort === 'Low' ? 'bg-emerald-100 text-emerald-700' :
                          tool.adoptionEffort === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {tool.adoptionEffort} effort
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{tool.description}</p>
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-xs text-teal-600 hover:text-teal-800 font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Learn more →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Remove Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const TasksStep: React.FC<{
  tasks: Task[];
  profile: UserProfile;
  onAddTask: () => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onNext: () => void;
  onPrev: () => void;
}> = ({ tasks, profile, onAddTask, onUpdateTask, onDeleteTask, onNext, onPrev }) => {
  const [expandedTask, setExpandedTask] = useState<string | null>(tasks[0]?.id || null);

  const totalWeeklyHours = tasks.reduce((sum, t) => sum + t.weeklyHours, 0);

  const quickAddTemplates = [
    { name: 'Email Management', category: 'Email & Communication', weeklyHours: 5, repetitiveness: 9 },
    { name: 'Report Writing', category: 'Report Writing & Documentation', weeklyHours: 4, repetitiveness: 7 },
    { name: 'Meeting Prep & Follow-up', category: 'Meeting Preparation & Follow-up', weeklyHours: 3, repetitiveness: 8 },
    { name: 'Data Analysis', category: 'Data Analysis & Reporting', weeklyHours: 4, repetitiveness: 6 },
    { name: 'Presentation Creation', category: 'Presentation Creation', weeklyHours: 3, repetitiveness: 5 },
    { name: 'Research', category: 'Research & Information Gathering', weeklyHours: 3, repetitiveness: 6 },
  ];

  const handleQuickAdd = (template: typeof quickAddTemplates[0]) => {
    const newTask: Task = {
      id: uuidv4(),
      ...DEFAULT_TASK,
      ...template,
      importance: 7,
      aiPotential: 0,
      estimatedTimeSavingsPercent: 0,
      recommendedTools: [],
    };
    newTask.aiPotential = calculateAIPotential(newTask);
    newTask.estimatedTimeSavingsPercent = calculateSavingsPercent(newTask.aiPotential);
    newTask.recommendedTools = getRecommendedTools(newTask.category);
    onAddTask();
    setTimeout(() => onUpdateTask(newTask), 0);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Your Tasks & Activities</h2>
        <p className="text-slate-600">
          List the tasks you regularly perform. We'll analyze each one for AI automation potential.
        </p>
      </div>

      {/* Summary Card */}
      {tasks.length > 0 && (
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl p-6 text-white mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-teal-100 text-sm">Tasks Added</p>
              <p className="text-3xl font-bold">{tasks.length}</p>
            </div>
            <div>
              <p className="text-teal-100 text-sm">Total Weekly Hours</p>
              <p className="text-3xl font-bold">{totalWeeklyHours.toFixed(1)}h</p>
            </div>
            <div>
              <p className="text-teal-100 text-sm">Potential Weekly Savings</p>
              <p className="text-3xl font-bold">
                {tasks.reduce((sum, t) => sum + (t.weeklyHours * t.estimatedTimeSavingsPercent) / 100, 0).toFixed(1)}h
              </p>
            </div>
            <div>
              <p className="text-teal-100 text-sm">Avg AI Fit Score</p>
              <p className="text-3xl font-bold">
                {tasks.length > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.aiPotential, 0) / tasks.length) : 0}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Section */}
      {tasks.length === 0 && (
        <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-8 mb-6">
          <div className="text-center mb-6">
            <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Let's add your tasks</h3>
            <p className="text-slate-500">Start with quick templates below, or create a custom task.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {quickAddTemplates.map((template, i) => (
              <button
                key={i}
                onClick={() => handleQuickAdd(template)}
                className="p-4 bg-slate-50 hover:bg-teal-50 rounded-lg border border-slate-200 hover:border-teal-300 transition-all text-left group"
              >
                <p className="font-medium text-slate-700 group-hover:text-teal-700">{template.name}</p>
                <p className="text-xs text-slate-500 mt-1">{template.weeklyHours}h/week • {template.category}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-4 mb-6">
        {tasks.map((task) => (
          <TaskEditor
            key={task.id}
            task={task}
            onUpdate={onUpdateTask}
            onDelete={() => onDeleteTask(task.id)}
            isExpanded={expandedTask === task.id}
            onToggleExpand={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
            hourlyRate={profile.hourlyRate}
          />
        ))}
      </div>

      {/* Add Task Button */}
      <button
        onClick={onAddTask}
        className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:text-teal-600 hover:border-teal-400 hover:bg-teal-50/50 transition-all flex items-center justify-center gap-2 font-medium"
      >
        <Plus className="w-5 h-5" />
        Add Custom Task
      </button>

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

const AnalysisStep: React.FC<{
  tasks: Task[];
  profile: UserProfile;
  onNext: () => void;
  onPrev: () => void;
}> = ({ tasks, profile, onNext, onPrev }) => {
  const totalWeeklyHours = tasks.reduce((sum, t) => sum + t.weeklyHours, 0);
  const totalWeeklySavingsHours = tasks.reduce((sum, t) => sum + (t.weeklyHours * t.estimatedTimeSavingsPercent) / 100, 0);
  const totalWeeklySavingsDollars = totalWeeklySavingsHours * profile.hourlyRate;
  
  const monthlySavingsHours = totalWeeklySavingsHours * 4.33;
  const monthlySavingsDollars = monthlySavingsHours * profile.hourlyRate;
  
  const quarterlySavingsHours = totalWeeklySavingsHours * 13;
  const quarterlySavingsDollars = quarterlySavingsHours * profile.hourlyRate;
  const annualSavingsDollars = totalWeeklySavingsDollars * 52;

  const sortedTasks = [...tasks].sort((a, b) => b.aiPotential - a.aiPotential);

  const avgAIFit = tasks.length > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.aiPotential, 0) / tasks.length) : 0;
  const savingsPercent = totalWeeklyHours > 0 ? Math.round((totalWeeklySavingsHours / totalWeeklyHours) * 100) : 0;

  const getEffortColor = (effort: string) => {
    if (effort === 'Low') return 'bg-emerald-100 text-emerald-700';
    if (effort === 'Medium') return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-700';
  };

  // Get unique tools across all tasks
  const allRecommendedTools = tasks.flatMap(t => 
    t.recommendedTools.map(tool => ({ ...tool, taskName: t.name, aiPotential: t.aiPotential }))
  );
  const uniqueTools = Array.from(new Map(allRecommendedTools.map(t => [t.name, t])).values());

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">AI Opportunity Analysis</h2>
        <p className="text-slate-600">
          Here's what we found based on your tasks.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Weekly Hours', value: `${totalWeeklyHours.toFixed(1)}h`, sub: 'Across all tasks', icon: Clock, color: 'from-slate-500 to-slate-600' },
          { label: 'Potential Weekly Savings', value: `${totalWeeklySavingsHours.toFixed(1)}h`, sub: `${savingsPercent}% of total time`, icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
          { label: 'Avg AI Fit Score', value: `${avgAIFit}%`, sub: 'Across all tasks', icon: Zap, color: 'from-teal-500 to-blue-600' },
          { label: 'Annual Value', value: formatCurrency(annualSavingsDollars), sub: 'Time reclaimed', icon: DollarSign, color: 'from-blue-500 to-sky-600' },
        ].map((metric, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className={`bg-gradient-to-r ${metric.color} p-4`}>
              <metric.icon className="w-8 h-8 text-white/80" />
            </div>
            <div className="p-4">
              <p className="text-2xl font-bold text-slate-800">{metric.value}</p>
              <p className="text-sm text-slate-600">{metric.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{metric.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Time Period Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-teal-600" />
          Savings Breakdown by Time Period
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { period: 'Weekly', hours: totalWeeklySavingsHours, dollars: totalWeeklySavingsDollars, multiplier: 1 },
            { period: 'Monthly', hours: monthlySavingsHours, dollars: monthlySavingsDollars, multiplier: 4.33 },
            { period: 'Quarterly', hours: quarterlySavingsHours, dollars: quarterlySavingsDollars, multiplier: 13 },
          ].map((item, i) => (
            <div key={i} className="text-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
              <p className="text-sm text-slate-500 uppercase tracking-wide mb-2">{item.period}</p>
              <p className="text-3xl font-bold text-teal-600 mb-1">{item.hours.toFixed(1)}h</p>
              <p className="text-xl font-semibold text-slate-700">{formatCurrency(item.dollars)}</p>
              <p className="text-xs text-slate-500 mt-2">of time value</p>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-emerald-800">Annual Estimated Savings</p>
              <p className="text-2xl font-bold text-emerald-700">
                {formatCurrency(annualSavingsDollars)} and {annualSavingsDollars > 0 ? (annualSavingsDollars / profile.hourlyRate).toFixed(0) : 0} hours reclaimed
              </p>
              <p className="text-sm text-emerald-600">
                That's time you can redirect to strategic initiatives, professional development, or work-life balance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Opportunities */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Tasks by AI Fit */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            Top AI Opportunities
          </h3>
          <div className="space-y-3">
             {sortedTasks.map((task) => {
              const savingsHours = (task.weeklyHours * task.estimatedTimeSavingsPercent) / 100;
              return (
                <div key={task.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                    task.aiPotential >= 70 ? 'bg-emerald-100 text-emerald-700' :
                    task.aiPotential >= 40 ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {task.aiPotential}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{task.name}</p>
                    <p className="text-xs text-slate-500">{task.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">Save {savingsHours.toFixed(1)}h</p>
                    <p className="text-xs text-slate-500">per week</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommended Tools */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Bot className="w-5 h-5 text-teal-600" />
            Recommended Tools
          </h3>
          <div className="space-y-3">
            {uniqueTools.slice(0, 6).map((tool, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800">{tool.name}</p>
                  <p className="text-xs text-slate-500 truncate">{tool.description}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getEffortColor(tool.adoptionEffort)}`}>
                  {tool.adoptionEffort}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Summary */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-teal-600" />
          Time Investment by Category
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(
            tasks.reduce((acc, task) => {
              acc[task.category] = (acc[task.category] || 0) + task.weeklyHours;
              return acc;
            }, {} as Record<string, number>)
          ).map(([category, hours]) => {
            const percent = totalWeeklyHours > 0 ? Math.round((hours / totalWeeklyHours) * 100) : 0;
            return (
              <div key={category} className="p-4 bg-slate-50 rounded-lg">
                <p className="font-medium text-slate-800 text-sm">{category}</p>
                <div className="flex items-end justify-between mt-2">
                  <div>
                    <p className="text-2xl font-bold text-teal-600">{hours.toFixed(1)}h</p>
                    <p className="text-xs text-slate-500">per week ({percent}%)</p>
                  </div>
                  <div className="w-16 h-16 relative">
                    {/* Simple donut chart */}
                    <svg viewBox="0 0 36 36" className="w-16 h-16 transform -rotate-90">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="15.9155"
                        fill="none" stroke="#14b8a6" strokeWidth="3"
                        strokeDasharray={`${percent}, 100`}
                      />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 px-6 py-3 text-slate-600 font-medium hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Edit Tasks
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

const RecommendationsStep: React.FC<{
  tasks: Task[];
  profile: UserProfile;
  onNext: () => void;
  onPrev: () => void;
}> = ({ tasks, profile, onNext, onPrev }) => {
  const sortedTasks = [...tasks].sort((a, b) => b.aiPotential - a.aiPotential);
  const highPriorityTasks = sortedTasks.filter(t => t.aiPotential >= 60);
  const mediumPriorityTasks = sortedTasks.filter(t => t.aiPotential >= 40 && t.aiPotential < 60);

  const totalWeeklySavingsHours = tasks.reduce((sum, t) => sum + (t.weeklyHours * t.estimatedTimeSavingsPercent) / 100, 0);

  const getAdoptionPhase = (index: number): 'Quick Wins' | 'Medium Term' | 'Strategic' => {
    if (index < 3) return 'Quick Wins';
    if (index < 6) return 'Medium Term';
    return 'Strategic';
  };

  const phaseColors = {
    'Quick Wins': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Medium Term': 'bg-amber-100 text-amber-700 border-amber-200',
    'Strategic': 'bg-blue-100 text-blue-700 border-blue-200',
  };

  const phaseDescriptions = {
    'Quick Wins': 'Start here - these tools require minimal training and deliver immediate value.',
    'Medium Term': 'Implement after quick wins - these may require process changes but offer substantial benefits.',
    'Strategic': 'Long-term investments - consider for organization-wide rollout after building AI literacy.',
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Your AI Adoption Roadmap</h2>
        <p className="text-slate-600">
          Prioritized recommendations based on your specific tasks and potential savings.
        </p>
      </div>

      {/* Executive Summary */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white mb-8">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-teal-400" />
          Executive Summary
        </h3>
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-slate-400 text-sm">High-Impact Opportunities</p>
            <p className="text-4xl font-bold text-teal-400">{highPriorityTasks.length}</p>
            <p className="text-slate-400 text-sm">tasks ready for AI</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Recommended Starting Point</p>
            <p className="text-lg font-bold text-white">
              {highPriorityTasks[0]?.name || mediumPriorityTasks[0]?.name || 'Add more tasks'}
            </p>
            <p className="text-slate-400 text-sm">
              {highPriorityTasks[0] ? `Save ${(highPriorityTasks[0].weeklyHours * highPriorityTasks[0].estimatedTimeSavingsPercent / 100).toFixed(1)}h/week` : ''}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Expected 6-Month Outcome</p>
            <p className="text-3xl font-bold text-emerald-400">
              {formatCurrency(totalWeeklySavingsHours * profile.hourlyRate * 26)}
            </p>
            <p className="text-slate-400 text-sm">reclaimed value</p>
          </div>
        </div>
        <div className="p-4 bg-white/10 rounded-lg">
          <p className="text-slate-300">
            <strong className="text-white">Strategy:</strong> Start with {highPriorityTasks.length > 0 ? '"' + highPriorityTasks[0].name + '"' : 'your most repetitive tasks'} 
            using low-effort tools. Build momentum and expand to other areas as you develop your AI literacy.
          </p>
        </div>
      </div>

      {/* Adoption Phases */}
      <div className="space-y-8 mb-8">
        {(['Quick Wins', 'Medium Term', 'Strategic'] as const).map((phase, phaseIndex) => {
          const phaseTasks = sortedTasks.filter((_, i) => getAdoptionPhase(i) === phase);
          if (phaseTasks.length === 0 && phaseIndex > 0) return null;

          return (
            <div key={phase}>
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${phaseColors[phase]}`}>
                  {phase}
                </span>
                <p className="text-sm text-slate-500">{phaseDescriptions[phase]}</p>
              </div>

              <div className="grid gap-4">
                {phaseTasks.map((task) => {
                  const savingsHours = (task.weeklyHours * task.estimatedTimeSavingsPercent) / 100;
                  const savingsDollars = savingsHours * profile.hourlyRate;

                  return (
                    <div key={task.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-slate-800">{task.name}</h4>
                          <p className="text-sm text-slate-500">{task.category} • {task.weeklyHours}h/week</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">Potential Savings</p>
                          <p className="text-xl font-bold text-emerald-600">{savingsHours.toFixed(1)}h/week</p>
                          <p className="text-sm text-slate-600">{formatCurrency(savingsDollars * 52)}/year</p>
                        </div>
                      </div>

                      {/* AI Fit Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>AI Fit Score</span>
                          <span className="font-semibold text-teal-600">{task.aiPotential}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              task.aiPotential >= 70 ? 'bg-emerald-500' :
                              task.aiPotential >= 40 ? 'bg-amber-500' :
                              'bg-slate-400'
                            }`}
                            style={{ width: `${task.aiPotential}%` }}
                          />
                        </div>
                      </div>

                      {/* Why AI helps */}
                      <div className="bg-slate-50 rounded-lg p-4 mb-4">
                        <h5 className="text-sm font-semibold text-slate-700 mb-2">Why AI can help:</h5>
                        <p className="text-sm text-slate-600">
                          This task is {task.repetitiveness >= 7 ? 'highly' : task.repetitiveness >= 4 ? 'somewhat' : 'less'} repetitive,
                          spending {task.weeklyHours} hours weekly.
                          {task.aiPotential >= 60 ? ' Excellent candidate for AI automation.' :
                           task.aiPotential >= 40 ? ' Can benefit from AI assistance for specific subtasks.' :
                           ' AI may play a supportive role.'}
                        </p>
                      </div>

                      {/* Recommended Tools */}
                      {task.recommendedTools.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-slate-700 mb-3">Recommended Tools:</h5>
                          <div className="grid md:grid-cols-3 gap-3">
                            {task.recommendedTools.map((tool, i) => (
                              <div key={i} className="border border-slate-200 rounded-lg p-3 hover:border-teal-300 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold text-slate-800 text-sm">{tool.name}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    tool.adoptionEffort === 'Low' ? 'bg-emerald-100 text-emerald-700' :
                                    tool.adoptionEffort === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                    'bg-slate-100 text-slate-700'
                                  }`}>
                                    {tool.adoptionEffort}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mb-2">{tool.description}</p>
                                <a
                                  href={tool.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-teal-600 hover:text-teal-800 font-medium"
                                >
                                  Learn more →
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
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
          View Full Report
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const ReportStep: React.FC<{
  tasks: Task[];
  profile: UserProfile;
  onPrev: () => void;
}> = ({ tasks, profile, onPrev }) => {
  const [copied, setCopied] = useState(false);

  const totalWeeklyHours = tasks.reduce((sum, t) => sum + t.weeklyHours, 0);
  const totalWeeklySavingsHours = tasks.reduce((sum, t) => sum + (t.weeklyHours * t.estimatedTimeSavingsPercent) / 100, 0);
  const totalWeeklySavingsDollars = totalWeeklySavingsHours * profile.hourlyRate;
  const annualSavingsDollars = totalWeeklySavingsDollars * 52;
  const monthlySavingsDollars = totalWeeklySavingsDollars * 4.33;
  const quarterlySavingsDollars = totalWeeklySavingsDollars * 13;

  const sortedTasks = [...tasks].sort((a, b) => b.aiPotential - a.aiPotential);
  const avgAIFit = tasks.length > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.aiPotential, 0) / tasks.length) : 0;

  const generateMarkdownReport = (): string => {
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    return `
# AI ROI Assessment Report
**Prepared for:** ${profile.name || '[Name]'}${profile.role ? `, ${profile.role}` : ''}
**Organization:** ${profile.organization || '[Organization]'}
**Date:** ${date}
**Prepared by:** Applied AI Labs - AI ROI Coach

---

## Executive Summary

This report outlines the potential time and financial savings from implementing AI tools and strategies based on your current tasks and workflows.

### Key Findings:

| Metric | Value |
|--------|-------|
| Tasks Analyzed | ${tasks.length} |
| Total Weekly Hours | ${totalWeeklyHours.toFixed(1)} hours |
| Average AI Fit Score | ${avgAIFit}% |
| Potential Weekly Hours Saved | ${totalWeeklySavingsHours.toFixed(1)} hours |
| Potential Weekly Value Saved | ${formatCurrency(totalWeeklySavingsDollars)} |

### Projected Annual Impact:

- **Time Reclaimed:** ${(totalWeeklySavingsHours * 52).toFixed(0)} hours per year
- **Financial Value:** ${formatCurrency(annualSavingsDollars)} per year

### Breakdown by Period:

| Period | Hours Saved | Value Saved |
|--------|-------------|-------------|
| Weekly | ${totalWeeklySavingsHours.toFixed(1)}h | ${formatCurrency(totalWeeklySavingsDollars)} |
| Monthly | ${(totalWeeklySavingsHours * 4.33).toFixed(1)}h | ${formatCurrency(monthlySavingsDollars)} |
| Quarterly | ${(totalWeeklySavingsHours * 13).toFixed(1)}h | ${formatCurrency(quarterlySavingsDollars)} |
| Annually | ${(totalWeeklySavingsHours * 52).toFixed(0)}h | ${formatCurrency(annualSavingsDollars)} |

---

## Task Analysis

### Priority Ranking by AI Opportunity:

${sortedTasks.map((task, i) => {
  const savingsHours = (task.weeklyHours * task.estimatedTimeSavingsPercent) / 100;
  const savingsDollars = savingsHours * profile.hourlyRate;
  return `
### ${i + 1}. ${task.name || 'Untitled Task'}
- **Category:** ${task.category}
- **Time Investment:** ${task.weeklyHours} hours/week
- **AI Fit Score:** ${task.aiPotential}%
- **Potential Time Savings:** ${task.estimatedTimeSavingsPercent}% (${savingsHours.toFixed(1)}h/week)
- **Annual Value:** ${formatCurrency(savingsDollars * 52)}
- **Importance:** ${task.importance}/10
- **Repetitiveness:** ${task.repetitiveness}/10
${task.description ? `- **Notes:** ${task.description}` : ''}

**Recommended Tools:**
${task.recommendedTools.map(tool => `- **${tool.name}** (${tool.adoptionEffort} effort) - ${tool.description}`).join('\n')}
`;
}).join('\n---\n')}

---

## Recommendations

### Phase 1: Quick Wins (Start Here)
Focus on these high-impact, low-effort opportunities first:

${sortedTasks.slice(0, 3).map((t, i) => `${i + 1}. **${t.name}** - Try ${t.recommendedTools[0]?.name || 'AI-powered tools'} first`).join('\n')}

### Phase 2: Medium Term (Next 30-90 Days)
Build momentum with these:

${sortedTasks.slice(3, 6).map((t, i) => `${i + 1}. **${t.name}** - ${t.recommendedTools[0]?.name || 'Explore AI solutions'}`).join('\n')}

### Phase 3: Strategic (90+ Days)
Longer-term strategic initiatives:

${sortedTasks.slice(6).map((t, i) => `${i + 1}. **${t.name}** - Evaluate for organization-wide solutions`).join('\n')}

---

## Next Steps

1. **Pick one task** from the Quick Wins list to start with
2. **Allocate 1-2 hours** this week to experiment with the recommended tool
3. **Track your results** - measure actual time saved vs. estimated
4. **Expand** to the next task once you're comfortable
5. **Consider training** - developing your AI skills will amplify these results

---

## About This Report

This analysis was generated by the Applied AI Labs AI ROI Coach. The assessment is based on your self-reported tasks and is designed to help identify potential areas where AI tools and techniques could improve productivity and save time.

**Disclaimer:** This is a guidance tool. Actual results may vary based on specific use cases, tool adoption rates, and individual proficiency. We recommend testing tools in your actual workflow before making decisions.

---

*Generated by Applied AI Labs - AI ROI Coach*
*www.centerforappliedai.com*
    `;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const markdown = generateMarkdownReport();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-roi-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportHTML = () => {
    const reportHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>AI ROI Assessment Report - ${profile.name || 'User'}</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1e293b; line-height: 1.6; }
      h1 { color: #0f172a; border-bottom: 3px solid #14b8a6; padding-bottom: 16px; }
      h2 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 40px; }
      h3 { color: #0f172a; margin-top: 32px; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
      th { background-color: #f8fafc; font-weight: 600; }
      .highlight { background: linear-gradient(135deg, #f0fdfa, #e0f2fe); padding: 24px; border-radius: 12px; border-left: 4px solid #14b8a6; margin: 24px 0; }
      .metric { display: inline-block; background: #f8fafc; padding: 16px 24px; border-radius: 8px; margin: 8px; text-align: center; }
      .metric-value { font-size: 28px; font-weight: 700; color: #14b8a6; }
      .footer { margin-top: 60px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; text-align: center; }
    </style>
</head>
<body>
    <h1>🤖 AI ROI Assessment Report</h1>
    
    <p><strong>Prepared for:</strong> ${profile.name || '[Name]'}${profile.role ? `, ${profile.role}` : ''}</p>
    <p><strong>Organization:</strong> ${profile.organization || '[Organization]'}</p>
    <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p><strong>Prepared by:</strong> Applied AI Labs - AI ROI Coach</p>

    <hr>

    <h2>📊 Executive Summary</h2>
    
    <div class="highlight">
        <p>This report outlines the potential time and financial savings from implementing AI tools and strategies based on your current tasks and workflows.</p>
    </div>

    <h3>Key Findings:</h3>
    <table>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Tasks Analyzed</td><td>${tasks.length}</td></tr>
        <tr><td>Total Weekly Hours</td><td>${totalWeeklyHours.toFixed(1)} hours</td></tr>
        <tr><td>Average AI Fit Score</td><td>${avgAIFit}%</td></tr>
        <tr><td>Potential Weekly Hours Saved</td><td>${totalWeeklySavingsHours.toFixed(1)} hours</td></tr>
        <tr><td>Potential Weekly Value Saved</td><td>${formatCurrency(totalWeeklySavingsDollars)}</td></tr>
    </table>

    <h3>💰 Projected Annual Impact:</h3>
    <div class="metric">
        <div class="metric-value">${(totalWeeklySavingsHours * 52).toFixed(0)}h</div>
        <div>Time Reclaimed</div>
    </div>
    <div class="metric">
        <div class="metric-value">${formatCurrency(annualSavingsDollars)}</div>
        <div>Financial Value</div>
    </div>

    <h3>Savings Breakdown:</h3>
    <table>
        <tr><th>Period</th><th>Hours Saved</th><th>Value Saved</th></tr>
        <tr><td>Weekly</td><td>${totalWeeklySavingsHours.toFixed(1)}h</td><td>${formatCurrency(totalWeeklySavingsDollars)}</td></tr>
        <tr><td>Monthly</td><td>${(totalWeeklySavingsHours * 4.33).toFixed(1)}h</td><td>${formatCurrency(monthlySavingsDollars)}</td></tr>
        <tr><td>Quarterly</td><td>${(totalWeeklySavingsHours * 13).toFixed(1)}h</td><td>${formatCurrency(quarterlySavingsDollars)}</td></tr>
        <tr><td>Annually</td><td>${(totalWeeklySavingsHours * 52).toFixed(0)}h</td><td>${formatCurrency(annualSavingsDollars)}</td></tr>
    </table>

    <h2>📋 Task Analysis</h2>
    ${sortedTasks.map((task, i) => {
      const savingsHours = (task.weeklyHours * task.estimatedTimeSavingsPercent) / 100;
      const savingsDollars = savingsHours * profile.hourlyRate;
      return `
      <h3>${i + 1}. ${task.name || 'Untitled Task'}</h3>
      <table>
          <tr><td><strong>Category</strong></td><td>${task.category}</td></tr>
          <tr><td><strong>Time Investment</strong></td><td>${task.weeklyHours} hours/week</td></tr>
          <tr><td><strong>AI Fit Score</strong></td><td>${task.aiPotential}%</td></tr>
          <tr><td><strong>Potential Savings</strong></td><td>${task.estimatedTimeSavingsPercent}% (${savingsHours.toFixed(1)}h/week or ${formatCurrency(savingsDollars * 52)}/year)</td></tr>
          <tr><td><strong>Importance</strong></td><td>${task.importance}/10</td></tr>
          <tr><td><strong>Repetitiveness</strong></td><td>${task.repetitiveness}/10</td></tr>
      </table>
      ${task.description ? `<p><strong>Notes:</strong> ${task.description}</p>` : ''}
      <p><strong>Recommended Tools:</strong></p>
      <ul>
          ${task.recommendedTools.map(tool => `<li><strong>${tool.name}</strong> (${tool.adoptionEffort} effort) - ${tool.description} <a href="${tool.url}" target="_blank">Learn more</a></li>`).join('')}
      </ul>
      `;
    }).join('<hr>')}

    <h2>🎯 Recommendations & Next Steps</h2>
    
    <div class="highlight">
        <h4>Phase 1: Quick Wins (Start Here)</h4>
        <ol>
            ${sortedTasks.slice(0, 3).map((t) => `<li><strong>${t.name}</strong> - Try ${t.recommendedTools[0]?.name || 'AI-powered tools'} first</li>`).join('')}
        </ol>
        
        <h4>Phase 2: Medium Term (Next 30-90 Days)</h4>
        <ol>
            ${sortedTasks.slice(3, 6).map((t) => `<li><strong>${t.name}</strong> - ${t.recommendedTools[0]?.name || 'Explore AI solutions'}</li>`).join('')}
        </ol>
        
        <h4>Phase 3: Strategic (90+ Days)</h4>
        <ol>
            ${sortedTasks.slice(6).map((t) => `<li><strong>${t.name}</strong> - Evaluate for organization-wide solutions</li>`).join('')}
        </ol>
    </div>

    <h3>📝 Action Plan:</h3>
    <ol>
        <li><strong>Pick one task</strong> from the Quick Wins list to start with</li>
        <li><strong>Allocate 1-2 hours</strong> this week to experiment with the recommended tool</li>
        <li><strong>Track your results</strong> - measure actual time saved vs. estimated</li>
        <li><strong>Expand</strong> to the next task once you're comfortable</li>
        <li><strong>Consider training</strong> - developing your AI skills will amplify these results</li>
    </ol>

    <div class="footer">
        <p><em>This report was generated by Applied AI Labs - AI ROI Coach</em></p>
        <p><a href="https://www.centerforappliedai.com" target="_blank">www.centerforappliedai.com</a></p>
        <p style="margin-top: 16px; font-size: 12px;"><strong>Disclaimer:</strong> This is a guidance tool. Actual results may vary based on specific use cases, tool adoption rates, and individual proficiency.</p>
    </div>
</body>
</html>
    `;
    
    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-roi-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Your AI ROI Report</h2>
        <p className="text-slate-600">
          Your personalized assessment is ready. Download or copy it for your records.
        </p>
      </div>

      {/* Export Actions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-teal-600" />
          Export Your Report
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <Download className="w-5 h-5" />
            Download Markdown (.md)
          </button>
          <button
            onClick={handleExportHTML}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-sky-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <FileText className="w-5 h-5" />
            Download HTML (.html)
          </button>
          <button
            onClick={handleCopyReport}
            className={`flex items-center gap-2 px-5 py-3 font-medium rounded-lg border-2 transition-all ${
              copied
                ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {copied ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Report Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-blue-600 rounded-xl flex items-center justify-center">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI ROI Assessment Report</h1>
              <p className="text-slate-400">Applied AI Labs - AI ROI Coach</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Prepared for</p>
              <p className="font-semibold">{profile.name || '[Your Name]'}</p>
              {profile.role && <p className="text-slate-400">{profile.role}</p>}
            </div>
            <div>
              <p className="text-slate-400">Organization</p>
              <p className="font-semibold">{profile.organization || '[Organization]'}</p>
            </div>
            <div>
              <p className="text-slate-400">Date</p>
              <p className="font-semibold">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-8 space-y-10">
          {/* Summary Stats */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-6 pb-2 border-b-2 border-slate-200">
              Executive Summary
            </h2>
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Tasks Analyzed', value: tasks.length, sub: '' },
                { label: 'Total Weekly Hours', value: `${totalWeeklyHours.toFixed(1)}h`, sub: '' },
                { label: 'Avg AI Fit Score', value: `${avgAIFit}%`, sub: '' },
                { label: 'Annual Savings', value: formatCurrency(annualSavingsDollars), sub: '' },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-teal-600">{stat.value}</p>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Savings Table */}
            <div className="bg-slate-50 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Period</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Hours Saved</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Value Saved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[
                    { period: 'Weekly', hours: totalWeeklySavingsHours, value: totalWeeklySavingsDollars },
                    { period: 'Monthly', hours: totalWeeklySavingsHours * 4.33, value: monthlySavingsDollars },
                    { period: 'Quarterly', hours: totalWeeklySavingsHours * 13, value: quarterlySavingsDollars },
                    { period: 'Annually', hours: totalWeeklySavingsHours * 52, value: annualSavingsDollars },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 px-4 font-medium text-slate-800">{row.period}</td>
                      <td className="py-3 px-4 text-right text-slate-600">{row.hours.toFixed(1)} hours</td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-600">{formatCurrency(row.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Task Details */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-6 pb-2 border-b-2 border-slate-200">
              Task Analysis
            </h2>
            <div className="space-y-6">
              {sortedTasks.map((task, i) => {
                const savingsHours = (task.weeklyHours * task.estimatedTimeSavingsPercent) / 100;
                const savingsDollars = savingsHours * profile.hourlyRate;

                return (
                  <div key={task.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                          task.aiPotential >= 70 ? 'bg-emerald-500' :
                          task.aiPotential >= 40 ? 'bg-amber-500' :
                          'bg-slate-400'
                        }`}>
                          #{i + 1}
                        </span>
                        <div>
                          <h3 className="font-semibold text-slate-800">{task.name}</h3>
                          <p className="text-sm text-slate-500">{task.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-teal-600">{task.aiPotential}% AI Fit</p>
                        <p className="text-sm text-slate-500">Save {savingsHours.toFixed(1)}h/week</p>
                      </div>
                    </div>
                    <div className="px-6 py-4">
                      <div className="grid md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-slate-500">Weekly Hours</p>
                          <p className="font-semibold text-slate-800">{task.weeklyHours}h</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Time Savings</p>
                          <p className="font-semibold text-slate-800">{task.estimatedTimeSavingsPercent}%</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Importance</p>
                          <p className="font-semibold text-slate-800">{task.importance}/10</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Annual Value</p>
                          <p className="font-semibold text-emerald-600">{formatCurrency(savingsDollars * 52)}</p>
                        </div>
                      </div>
                      {task.recommendedTools.length > 0 && (
                        <div>
                          <p className="text-sm text-slate-600 mb-2">
                            <strong className="text-slate-700">Recommended Tools:</strong>
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {task.recommendedTools.map((tool, ti) => (
                              <span key={ti} className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 text-sm rounded-full border border-teal-200">
                                {tool.name}
                                <span className="text-xs text-teal-500">({tool.adoptionEffort})</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Recommendations */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-6 pb-2 border-b-2 border-slate-200">
              Recommended Next Steps
            </h2>
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-200">
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                  <span className="text-slate-700">
                    <strong className="text-slate-800">Start with "{sortedTasks[0]?.name || 'your highest-potential task'}"</strong> — 
                    it has the highest AI fit score. Experiment with {sortedTasks[0]?.recommendedTools[0]?.name || 'a recommended tool'} for 1-2 hours.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                  <span className="text-slate-700">
                    <strong className="text-slate-800">Track your actual time savings</strong> — 
                    measure how much time the AI-assisted task takes compared to your baseline.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                  <span className="text-slate-700">
                    <strong className="text-slate-800">Build momentum</strong> — 
                    once comfortable, move to the next 1-2 tasks on your priority list.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                  <span className="text-slate-700">
                    <strong className="text-slate-800">Develop your AI skills</strong> — 
                    as you gain experience, your ability to leverage AI will grow, increasing these savings further.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
                  <span className="text-slate-700">
                    <strong className="text-slate-800">Revisit this assessment</strong> — 
                    update your tasks in 3-6 months to track progress and identify new opportunities.
                  </span>
                </li>
              </ol>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
            <p>Generated by <strong>Applied AI Labs - AI ROI Coach</strong></p>
            <p className="mt-1">www.centerforappliedai.com</p>
            <p className="mt-4 text-xs text-slate-400">
              <strong>Disclaimer:</strong> This is a guidance tool. Actual results may vary based on specific use cases, tool adoption rates, and individual proficiency.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 px-6 py-3 text-slate-600 font-medium hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Recommendations
        </button>
      </div>
    </div>
  );
};

// Main App
const App: React.FC = () => {
  const [state, setState] = useState<AssessmentState>({
    profile: DEFAULT_PROFILE,
    tasks: [],
    currentStep: 1,
    lastUpdated: new Date().toISOString(),
  });

  const [hasLoaded, setHasLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState(parsed);
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    setHasLoaded(true);
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    if (hasLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...state,
          lastUpdated: new Date().toISOString(),
        }));
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
    }
  }, [state, hasLoaded]);

  const handleAddTask = useCallback(() => {
    const newTask: Task = {
      id: uuidv4(),
      ...DEFAULT_TASK,
      aiPotential: calculateAIPotential(DEFAULT_TASK),
      estimatedTimeSavingsPercent: calculateSavingsPercent(calculateAIPotential(DEFAULT_TASK)),
      recommendedTools: getRecommendedTools(DEFAULT_TASK.category),
    };
    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
  }, []);

  const handleUpdateTask = useCallback((updatedTask: Task) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t),
    }));
  }, []);

  const handleDeleteTask = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
    }));
  }, []);

  const handleUpdateProfile = useCallback((profile: UserProfile) => {
    setState(prev => ({ ...prev, profile }));
  }, []);

  const handleNavigate = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const handleNext = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: Math.min(6, prev.currentStep + 1) }));
  }, []);

  const handlePrev = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: Math.max(1, prev.currentStep - 1) }));
  }, []);

  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all your data? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      setState({
        profile: DEFAULT_PROFILE,
        tasks: [],
        currentStep: 1,
        lastUpdated: new Date().toISOString(),
      });
    }
  }, []);

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <WelcomeStep onNext={handleNext} />;
      case 2:
        return (
          <ProfileStep
            profile={state.profile}
            onUpdate={handleUpdateProfile}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 3:
        return (
          <TasksStep
            tasks={state.tasks}
            profile={state.profile}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 4:
        return (
          <AnalysisStep
            tasks={state.tasks}
            profile={state.profile}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 5:
        return (
          <RecommendationsStep
            tasks={state.tasks}
            profile={state.profile}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 6:
        return (
          <ReportStep
            tasks={state.tasks}
            profile={state.profile}
            onPrev={handlePrev}
          />
        );
      default:
        return <WelcomeStep onNext={handleNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navigation
        currentStep={state.currentStep}
        onNavigate={handleNavigate}
        totalSteps={6}
      />

      <main className="py-10 px-4">
        {renderStep()}
      </main>

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
    </div>
  );
};

export default App;
