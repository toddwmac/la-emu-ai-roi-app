import { SavedAnalysis, AssessmentState } from '../types';

const ANALYSES_KEY = 'ai-roi-analyses';
const CURRENT_STATE_KEY = 'ai-roi-current-state';
const AUTOSAVE_KEY = 'ai-roi-autosave';

// Analysis Management
export const getSavedAnalyses = (): SavedAnalysis[] => {
  try {
    const data = localStorage.getItem(ANALYSES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading saved analyses:', error);
    return [];
  }
};

export const saveAnalysis = (analysis: SavedAnalysis): void => {
  try {
    const analyses = getSavedAnalyses();
    const existingIndex = analyses.findIndex(a => a.id === analysis.id);

    if (existingIndex >= 0) {
      analyses[existingIndex] = analysis;
    } else {
      analyses.push(analysis);
    }

    localStorage.setItem(ANALYSES_KEY, JSON.stringify(analyses));
  } catch (error) {
    console.error('Error saving analysis:', error);
  }
};

export const deleteAnalysis = (id: string): void => {
  try {
    const analyses = getSavedAnalyses();
    const filtered = analyses.filter(a => a.id !== id);
    localStorage.setItem(ANALYSES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting analysis:', error);
  }
};

export const duplicateAnalysis = (id: string): SavedAnalysis | null => {
  try {
    const analyses = getSavedAnalyses();
    const original = analyses.find(a => a.id === id);

    if (!original) return null;

    const duplicate: SavedAnalysis = {
      ...original,
      id: crypto.randomUUID(),
      name: `${original.name} (Copy)`,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    saveAnalysis(duplicate);
    return duplicate;
  } catch (error) {
    console.error('Error duplicating analysis:', error);
    return null;
  }
};

// Current State Management (for auto-save)
export const getCurrentState = (): AssessmentState | null => {
  try {
    const data = localStorage.getItem(AUTOSAVE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading current state:', error);
    return null;
  }
};

export const saveCurrentState = (state: AssessmentState): void => {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({
      ...state,
      lastUpdated: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error saving current state:', error);
  }
};

export const clearCurrentState = (): void => {
  try {
    localStorage.removeItem(AUTOSAVE_KEY);
  } catch (error) {
    console.error('Error clearing current state:', error);
  }
};

// Legacy Support (for existing users)
export const migrateLegacyData = (): AssessmentState | null => {
  try {
    const legacyData = localStorage.getItem(CURRENT_STATE_KEY);
    if (legacyData) {
      const state = JSON.parse(legacyData);
      // Move to new storage format
      saveCurrentState(state);
      localStorage.removeItem(CURRENT_STATE_KEY);
      return state;
    }
    return null;
  } catch (error) {
    console.error('Error migrating legacy data:', error);
    return null;
  }
};

// Export/Import
export const exportAnalysisAsJSON = (analysis: SavedAnalysis): void => {
  const dataStr = JSON.stringify(analysis, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-roi-analysis-${analysis.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importAnalysisFromJSON = (file: File): Promise<SavedAnalysis> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const analysis = JSON.parse(e.target?.result as string);
        // Validate required fields
        if (!analysis.id || !analysis.name || !analysis.profile || !analysis.tasks) {
          throw new Error('Invalid analysis format');
        }
        resolve(analysis);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

// Shareable Links (using compression)
export const generateShareableLink = (analysis: SavedAnalysis): string => {
  // For now, we'll use base64 encoding (LZ-string would be better for larger data)
  const dataStr = JSON.stringify(analysis);
  const encoded = btoa(dataStr);
  return `${window.location.origin}${window.location.pathname}#share=${encoded}`;
};

export const loadFromShareableLink = (): SavedAnalysis | null => {
  try {
    const hash = window.location.hash;
    if (hash.startsWith('#share=')) {
      const encoded = hash.slice(7);
      const dataStr = atob(encoded);
      const analysis = JSON.parse(dataStr);
      // Validate and clean up URL
      if (analysis.id && analysis.name && analysis.profile && analysis.tasks) {
        window.history.replaceState({}, '', window.location.pathname);
        return analysis;
      }
    }
    return null;
  } catch (error) {
    console.error('Error loading from shareable link:', error);
    return null;
  }
};

// Bulk Import
export const TASK_CSV_TEMPLATE = `Task Name,Category,Weekly Hours,Importance,Repetitiveness,Description
"Email Management","Email & Communication",5,7,9,"Daily email triage and responses"
"Weekly Reports","Report Writing & Documentation",3,8,8,"Weekly status report creation"
"Meeting Notes","Meeting Preparation & Follow-up",4,6,7,"Taking notes and following up"`;

export const parseTasksFromCSV = (csvText: string): Array<any> => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.replace(/"/g, '').trim());
    const task: any = {};
    headers.forEach((header, index) => {
      task[header] = values[index] || '';
    });
    return task;
  });
};
