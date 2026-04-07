import React, { useState } from 'react';
import { Search, Calendar, Clock, TrendingUp, FolderOpen, Trash2, Copy, Download, Share2, X, FileText } from 'lucide-react';
import { SavedAnalysis } from '../types';
import { formatDate, formatCurrency, calculateTotalSavings } from '../utils/helpers';

interface AnalysisLibraryProps {
  isOpen: boolean;
  analyses: SavedAnalysis[];
  onLoad: (analysis: SavedAnalysis) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onExport: (analysis: SavedAnalysis) => void;
  onShare: (analysis: SavedAnalysis) => void;
  onClose: () => void;
  hourlyRate?: number;
}

export const AnalysisLibrary: React.FC<AnalysisLibraryProps> = ({
  isOpen,
  analyses,
  onLoad,
  onDelete,
  onDuplicate,
  onExport,
  onShare,
  onClose,
  hourlyRate = 100,
}) => {
  if (!isOpen) return null;
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'savings'>('date');
  const [selectedAnalysis, setSelectedAnalysis] = useState<SavedAnalysis | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredAnalyses = analyses
    .filter(a =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'savings':
          const savingsA = calculateTotalSavings(a.tasks, a.profile.hourlyRate).totalSavings;
          const savingsB = calculateTotalSavings(b.tasks, b.profile.hourlyRate).totalSavings;
          return savingsB - savingsA;
        default:
          return 0;
      }
    });

  const handleDelete = () => {
    if (selectedAnalysis) {
      onDelete(selectedAnalysis.id);
      setShowDeleteConfirm(false);
      setSelectedAnalysis(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-500/20 rounded-lg">
                  <FolderOpen className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Analysis Library</h2>
                  <p className="text-sm text-slate-400">{analyses.length} saved {analyses.length === 1 ? 'analysis' : 'analyses'}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search and Filter */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search analyses..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-teal-500"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="savings">Sort by Savings</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            {filteredAnalyses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                  <FolderOpen className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  {searchQuery ? 'No analyses found' : 'No saved analyses'}
                </h3>
                <p className="text-slate-500 max-w-md">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Save your first analysis to see it here'}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAnalyses.map((analysis) => {
                  const savings = calculateTotalSavings(analysis.tasks, analysis.profile.hourlyRate);

                  return (
                    <div
                      key={analysis.id}
                      className="bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all group"
                    >
                      {/* Card Header */}
                      <div className="p-5 border-b border-slate-100">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-800 text-lg mb-1 line-clamp-2">
                              {analysis.name}
                            </h3>
                            <p className="text-sm text-slate-500 line-clamp-2">
                              {analysis.description || 'No description'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          Modified {formatDate(analysis.lastModified)}
                        </div>
                      </div>

                      {/* Card Stats */}
                      <div className="p-5 grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-teal-600 mb-1">
                            <FileText className="w-3.5 h-3.5" />
                            <span className="text-lg font-bold">{analysis.tasks.length}</span>
                          </div>
                          <p className="text-xs text-slate-500">Tasks</p>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-lg font-bold">{savings.totalHours}h</span>
                          </div>
                          <p className="text-xs text-slate-500">Saved/Week</p>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="text-lg font-bold">${(savings.totalSavings / 1000).toFixed(1)}k</span>
                          </div>
                          <p className="text-xs text-slate-500">Yearly</p>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="px-5 pb-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onLoad(analysis)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:shadow-md transition-all"
                          >
                            <FolderOpen className="w-4 h-4" />
                            Open
                          </button>

                          <div className="flex gap-1">
                            <button
                              onClick={() => onDuplicate(analysis.id)}
                              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onExport(analysis)}
                              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Export"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onShare(analysis)}
                              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Share"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedAnalysis(analysis);
                                setShowDeleteConfirm(true);
                              }}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Profile Info */}
                      {analysis.profile.name && (
                        <div className="px-5 pb-4 pt-0">
                          <p className="text-xs text-slate-400">
                            {analysis.profile.name}
                            {analysis.profile.role && ` • ${analysis.profile.role}`}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedAnalysis && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">Delete Analysis?</h3>
            </div>

            <p className="text-slate-600 mb-6">
              Are you sure you want to delete "<strong>{selectedAnalysis.name}</strong>"? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedAnalysis(null);
                }}
                className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
