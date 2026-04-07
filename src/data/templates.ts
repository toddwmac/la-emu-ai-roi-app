import { TaskTemplate, AITool } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const AI_TOOLS_DATABASE: Record<string, AITool[]> = {
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
    { name: 'ChatGPT / GPT-4o', category: 'Coding', description: 'Advanced AI for code generation, debugging, and architecture decisions', url: 'https://openai.com', adoptionEffort: 'Low' },
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

export const CATEGORIES = Object.keys(AI_TOOLS_DATABASE);

export const TASK_TEMPLATES: TaskTemplate[] = [
  {
    name: 'Email Management',
    category: 'Email & Communication',
    weeklyHours: 5,
    importance: 6,
    repetitiveness: 9,
    description: 'Daily email triage, responses, and inbox management',
  },
  {
    name: 'Weekly Reports',
    category: 'Report Writing & Documentation',
    weeklyHours: 3,
    importance: 7,
    repetitiveness: 8,
    description: 'Weekly status reports and documentation',
  },
  {
    name: 'Meeting Prep & Notes',
    category: 'Meeting Preparation & Follow-up',
    weeklyHours: 4,
    importance: 6,
    repetitiveness: 7,
    description: 'Preparing agendas, taking notes, and following up',
  },
  {
    name: 'Data Analysis',
    category: 'Data Analysis & Reporting',
    weeklyHours: 6,
    importance: 8,
    repetitiveness: 6,
    description: 'Analyzing metrics and creating reports',
  },
  {
    name: 'Presentation Creation',
    category: 'Presentation Creation',
    weeklyHours: 4,
    importance: 7,
    repetitiveness: 5,
    description: 'Creating slide decks and visual presentations',
  },
  {
    name: 'Research Tasks',
    category: 'Research & Information Gathering',
    weeklyHours: 3,
    importance: 6,
    repetitiveness: 6,
    description: 'Market research, competitive analysis, and information gathering',
  },
  {
    name: 'Social Media Content',
    category: 'Social Media & Content Creation',
    weeklyHours: 3,
    importance: 5,
    repetitiveness: 7,
    description: 'Creating and scheduling social media posts',
  },
  {
    name: 'Project Management',
    category: 'Project Management',
    weeklyHours: 5,
    importance: 7,
    repetitiveness: 6,
    description: 'Project planning, tracking, and team coordination',
  },
  {
    name: 'Scheduling & Calendar',
    category: 'Scheduling & Calendar Management',
    weeklyHours: 2,
    importance: 5,
    repetitiveness: 8,
    description: 'Managing appointments, meetings, and calendar coordination',
  },
  {
    name: 'Code Development',
    category: 'Code Development & Technical Tasks',
    weeklyHours: 8,
    importance: 8,
    repetitiveness: 5,
    description: 'Writing, reviewing, and debugging code',
  },
];

export const DEFAULT_TASK: Omit<TaskTemplate, 'name'> = {
  category: 'Email & Communication',
  weeklyHours: 2,
  importance: 5,
  repetitiveness: 5,
  description: '',
};

// Helper Functions
export const calculateAIPotential = (task: Partial<TaskTemplate>): number => {
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
  const repetitionFactor = (task.repetitiveness || 5) * 5;
  const timeFactor = Math.min((task.weeklyHours || 0) * 5, 30);

  const potential = Math.round((basePotential * 0.6) + (repetitionFactor * 0.25) + (timeFactor * 0.15));
  return Math.min(100, Math.max(0, potential));
};

export const calculateSavingsPercent = (aiPotential: number): number => {
  if (aiPotential >= 80) return 60;
  if (aiPotential >= 65) return 45;
  if (aiPotential >= 50) return 30;
  if (aiPotential >= 35) return 15;
  return 5;
};

export const getRecommendedTools = (category: string): AITool[] => {
  return AI_TOOLS_DATABASE[category] || [];
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'Email & Communication': '📧',
    'Report Writing & Documentation': '📄',
    'Data Analysis & Reporting': '📊',
    'Meeting Preparation & Follow-up': '🤝',
    'Presentation Creation': '📽️',
    'Research & Information Gathering': '🔍',
    'Scheduling & Calendar Management': '📅',
    'Social Media & Content Creation': '📱',
    'Code Development & Technical Tasks': '💻',
    'Project Management': '📋',
    'Creative & Design Work': '🎨',
  };
  return icons[category] || '📌';
};
