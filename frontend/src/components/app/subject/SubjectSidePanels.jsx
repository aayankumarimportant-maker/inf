import React from 'react';
import { Target, Lightbulb } from 'lucide-react';

/**
 * Right-hand sidebar on the SubjectOverview page.
 * Two stacked cards: key focus areas (red-tinted) and study tips (amber-tinted).
 */
export default function SubjectSidePanels({ keyTopics = [], studyTips = [] }) {
  return (
    <div className="flex flex-col gap-4" data-testid="subject-side-panels">
      <div className="card-soft p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </span>
          <h3 className="text-[15px] font-semibold text-slate-900">Key focus areas</h3>
        </div>
        <ul className="flex flex-col gap-1.5">
          {keyTopics.map((k) => (
            <li key={k} className="text-[13.5px] text-slate-700 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>{k}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card-soft p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <Lightbulb className="w-4 h-4" />
          </span>
          <h3 className="text-[15px] font-semibold text-slate-900">Study tips</h3>
        </div>
        <ul className="flex flex-col gap-2">
          {studyTips.map((tip, i) => (
            <li key={tip} className="text-[13.5px] text-slate-700 flex items-start gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-semibold mt-0.5">{i + 1}</span>
              <span className="leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
