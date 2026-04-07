import React, { useState } from 'react';
import { X, HelpCircle, Calculator, Info } from 'lucide-react';

interface CalculationGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculationGuide: React.FC<CalculationGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Calculation Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Introduction */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-800 mb-1">How Calculations Work</p>
                <p className="text-sm text-blue-700">
                  All calculations are based on industry research and benchmarks for AI automation potential. 
                  Values are estimates to help you understand potential ROI.
                </p>
              </div>
            </div>
          </div>

          {/* AI Potential Calculation */}
          <section>
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-teal-600" />
              1. AI Potential Score (0-100%)
            </h3>
            
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">Formula:</p>
              <code className="block bg-white border border-slate-200 rounded px-3 py-2 text-sm font-mono text-slate-800">
                AI Potential = (Category Base × 0.6) + (Repetition Factor × 0.25) + (Time Factor × 0.15)
              </code>
            </div>

            <div className="space-y-4">
              <div>
                <p className="font-semibold text-slate-800 mb-2">Category Base Values (0-85):</p>
                <div className="grid md:grid-cols-2 gap-2">
                  {[
                    { cat: 'Email & Communication', val: 85 },
                    { cat: 'Report Writing & Documentation', val: 80 },
                    { cat: 'Data Analysis & Reporting', val: 75 },
                    { cat: 'Research & Information Gathering', val: 75 },
                    { cat: 'Scheduling & Calendar Management', val: 80 },
                    { cat: 'Meeting Preparation & Follow-up', val: 70 },
                    { cat: 'Presentation Creation', val: 65 },
                    { cat: 'Social Media & Content Creation', val: 70 },
                    { cat: 'Code Development & Technical Tasks', val: 60 },
                    { cat: 'Project Management', val: 50 },
                    { cat: 'Creative & Design Work', val: 45 },
                  ].map((item) => (
                    <div key={item.cat} className="flex justify-between text-sm bg-white border border-slate-200 rounded px-3 py-1.5">
                      <span className="text-slate-600">{item.cat}</span>
                      <span className="font-semibold text-slate-800">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-800 mb-2">Repetition Factor (5-50):</p>
                <p className="text-sm text-slate-600">
                  Calculated as: <code className="bg-slate-100 px-1 rounded">repetitiveness (1-10) × 5</code>
                  <br />
                  Higher repetitiveness = higher AI potential
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-800 mb-2">Time Factor (0-30):</p>
                <p className="text-sm text-slate-600">
                  Calculated as: <code className="bg-slate-100 px-1 rounded">weeklyHours × 5</code>, capped at 30
                  <br />
                  More time spent = higher AI potential (with diminishing returns)
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-amber-800 mb-1">💡 Key Insight</p>
                <p className="text-sm text-amber-700">
                  Category type has the strongest influence (60%), followed by repetitiveness (25%), 
                  then time investment (15%). This prioritizes tasks that AI is naturally good at and that occur frequently.
                </p>
              </div>
            </div>
          </section>

          {/* Time Savings Calculation */}
          <section>
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              2. Estimated Time Savings Percentage
            </h3>

            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">Formula:</p>
              <p className="text-sm text-slate-600">
                Based on AI Potential brackets (industry estimates):
              </p>
            </div>

            <div className="space-y-2">
              {[
                { min: 80, savings: 60, desc: 'Excellent AI candidate' },
                { min: 65, savings: 45, desc: 'Strong AI potential' },
                { min: 50, savings: 30, desc: 'Moderate AI benefit' },
                { min: 35, savings: 15, desc: 'Limited AI assistance' },
                { min: 0, savings: 5, desc: 'Minimal AI impact' },
              ].map((item) => (
                <div key={item.min} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm
                      ${item.savings >= 45 ? 'bg-emerald-100 text-emerald-700' :
                        item.savings >= 30 ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'}">
                      {item.savings}%
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {item.min >= 80 ? '≥ 80%' : item.min >= 65 ? '≥ 65%' : item.min >= 50 ? '≥ 50%' : item.min >= 35 ? '≥ 35%' : '< 35%'} AI Potential
                      </p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm font-semibold text-blue-800 mb-1">📊 Example</p>
              <p className="text-sm text-blue-700">
                A task with 75% AI Potential could save 30% of the time spent on it. 
                If you spend 10 hours/week on it, AI could save you 3 hours/week.
              </p>
            </div>
          </section>

          {/* Financial Calculations */}
          <section>
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              3. Financial Savings
            </h3>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-slate-700 mb-2">Weekly Hours Saved:</p>
                <code className="block bg-white border border-slate-200 rounded px-3 py-2 text-sm font-mono text-slate-800 mb-4">
                  Hours Saved = (Weekly Hours × Time Savings %) ÷ 100
                </code>

                <p className="text-sm font-semibold text-slate-700 mb-2">Weekly Cost Saved:</p>
                <code className="block bg-white border border-slate-200 rounded px-3 py-2 text-sm font-mono text-slate-800 mb-4">
                  Cost Saved = Hours Saved × Hourly Rate
                </code>

                <p className="text-sm font-semibold text-slate-700 mb-2">Annual Savings:</p>
                <code className="block bg-white border border-slate-200 rounded px-3 py-2 text-sm font-mono text-slate-800">
                  Annual Savings = Weekly Cost Saved × 52 weeks
                </code>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-emerald-800 mb-1">💰 Example Calculation</p>
                <p className="text-sm text-emerald-700">
                  Task: 10 hours/week, 30% AI savings, $100/hour rate<br />
                  Weekly: 10 × 0.30 = <strong>3 hours saved</strong><br />
                  Weekly value: 3 × $100 = <strong>$300 saved/week</strong><br />
                  Annual value: $300 × 52 = <strong>$15,600 saved/year</strong>
                </p>
              </div>
            </div>
          </section>

          {/* Assumptions and Limitations */}
          <section>
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-purple-600" />
              Assumptions & Limitations
            </h3>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
              <p className="text-sm text-amber-800"><strong>✓ What This Tool Does:</strong></p>
              <ul className="text-sm text-amber-700 space-y-1 ml-4 list-disc">
                <li>Provides data-driven estimates based on AI capabilities</li>
                <li>Helps prioritize tasks for AI implementation</li>
                <li>Gives a baseline for ROI conversations</li>
                <li>Accounts for task characteristics and frequency</li>
              </ul>

              <p className="text-sm text-amber-800 mt-4"><strong>⚠️ What This Tool Does NOT Do:</strong></p>
              <ul className="text-sm text-amber-700 space-y-1 ml-4 list-disc">
                <li>Guarantee actual savings (results vary by tool quality and implementation)</li>
                <li>Account for learning curve or adoption time</li>
                <li>Consider organizational changes or process improvements</li>
                <li>Include AI tool subscription costs in savings</li>
                <li>Factor in quality improvements beyond time savings</li>
              </ul>

              <p className="text-sm text-amber-800 mt-4"><strong>🎯 Best Practices:</strong></p>
              <ul className="text-sm text-amber-700 space-y-1 ml-4 list-disc">
                <li>Start with high-potential, low-effort tools</li>
                <li>Track actual time savings after implementation</li>
                <li>Iterate and refine estimates based on experience</li>
                <li>Consider non-monetary benefits (quality, consistency)</li>
              </ul>
            </div>
          </section>

          {/* Data Sources */}
          <section>
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-slate-600" />
              Data Sources & References
            </h3>

            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-2">
                The calculation parameters are based on:
              </p>
              <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                <li>Industry reports on AI automation potential (McKinsey, Deloitte, Harvard Business Review)</li>
                <li>Case studies of AI adoption in business processes</li>
                <li>Analysis of AI tool capabilities across task categories</li>
                <li>Practical implementation experiences</li>
              </ul>
              <p className="text-xs text-slate-500 mt-3 italic">
                Note: These are generalized estimates. Actual results vary significantly based on specific tools, implementation quality, and organizational context.
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
          <p className="text-sm text-slate-600 text-center">
            Questions? Hover over any calculation in the app for detailed tooltips.
          </p>
        </div>
      </div>
    </div>
  );
};