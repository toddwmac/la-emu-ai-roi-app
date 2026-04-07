import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Info, X } from 'lucide-react';

interface CalculationTooltipProps {
  children: React.ReactNode;
  title: string;
  description: string;
  formula?: string;
  example?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const CalculationTooltip: React.FC<CalculationTooltipProps> = ({
  children,
  title,
  description,
  formula,
  example,
  position = 'top'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-flex items-center">
      {children}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ml-2 text-teal-600 hover:text-teal-700 transition-colors"
        title={`How is ${title} calculated?`}
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 w-80 bg-white rounded-lg shadow-2xl border border-slate-200 p-4 ${
            position === 'top' ? 'bottom-full mb-2 left-1/2 -translate-x-1/2' :
            position === 'bottom' ? 'top-full mt-2 left-1/2 -translate-x-1/2' :
            position === 'left' ? 'right-full mr-2 top-0' :
            'left-full ml-2 top-0'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <h4 className="font-semibold text-slate-800 text-sm">{title}</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-600 mb-3 leading-relaxed">{description}</p>

          {formula && (
            <div className="bg-slate-50 rounded border border-slate-200 p-2 mb-3">
              <p className="text-xs font-semibold text-slate-700 mb-1">Formula:</p>
              <code className="block text-xs font-mono text-slate-800 break-all">{formula}</code>
            </div>
          )}

          {example && (
            <div className="bg-blue-50 rounded border border-blue-200 p-2">
              <p className="text-xs font-semibold text-blue-700 mb-1">Example:</p>
              <p className="text-xs text-blue-700">{example}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};