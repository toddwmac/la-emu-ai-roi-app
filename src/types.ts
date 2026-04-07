export interface Task {
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
  manualAIAdjustment?: boolean;
}

export interface AITool {
  name: string;
  category: string;
  description: string;
  url: string;
  adoptionEffort: 'Low' | 'Medium' | 'High';
}

export interface UserProfile {
  name: string;
  role: string;
  organization: string;
  hourlyRate: number;
  email: string;
}

export interface SavedAnalysis {
  id: string;
  name: string;
  description: string;
  profile: UserProfile;
  tasks: Task[];
  createdAt: string;
  lastModified: string;
}

export interface AssessmentState {
  profile: UserProfile;
  tasks: Task[];
  currentStep: number;
  lastUpdated: string;
}

export interface TaskTemplate {
  name: string;
  category: string;
  weeklyHours: number;
  importance: number;
  repetitiveness: number;
  description: string;
}

// Toast notification types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: ValidationError[];
}