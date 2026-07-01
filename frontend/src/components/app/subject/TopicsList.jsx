import React from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';

const toneToBadge = {
  primary: 'bg-blue-100 text-blue-700',
  violet: 'bg-blue-100 text-blue-700',
  blue: 'bg-violet-100 text-violet-700',
  secondary: 'bg-violet-100 text-violet-700',
  cyan: 'bg-red-100 text-red-700',
  accent: 'bg-red-100 text-red-700',
  success: 'bg-emerald-100 text-emerald-700',
};

function TopicRow({ topic, stats, onLaunch }) {
  const acc = stats && stats.total ? Math.round((stats.correct / stats.total) * 100) : null;
  const barColor = acc === null
    ? ''
    : acc >= 70 ? 'bg-emerald-500' : acc >= 40 ? 'bg-amber-400' : 'bg-red-500';
  return (
    <button
      onClick={onLaunch}
      data-testid={`topic-row-${topic}`}
      className="text-left rounded-xl border border-[color:var(--color-border)] px-4 py-3 flex items-center justify-between hover:border-blue-300 hover:bg-blue-50/50 transition-colors group"
    >
      <div className="min-w-0">
        <div className="text-[14.5px] font-medium text-slate-900">{topic}</div>
        <div className="text-[12px] text-slate-500 mt-0.5">
          {acc !== null ? `Your accuracy ${acc}% · ${stats.total} questions` : 'Not attempted yet'}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {acc !== null && (
          <div className="hidden sm:block w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-full ${barColor}`} style={{ width: `${acc}%` }} />
          </div>
        )}
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  );
}

/**
 * Card listing all topics of a subject with per-topic accuracy indicators.
 */
export default function TopicsList({ subject, tone, topics, stats, onLaunch }) {
  return (
    <div className="card-soft p-6" data-testid="topics-list">
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${toneToBadge[tone] || toneToBadge.primary}`}>
          <BookOpen className="w-4 h-4" />
        </span>
        <h3 className="text-[16px] font-semibold text-slate-900">Topics in {subject}</h3>
      </div>
      <p className="text-[13.5px] text-slate-500 mb-5">Click any topic to start a focused worksheet on that area.</p>
      <div className="flex flex-col gap-2">
        {topics.map((t) => (
          <TopicRow key={t} topic={t} stats={stats[t]} onLaunch={() => onLaunch(t)} />
        ))}
        {topics.length === 0 && (
          <div className="text-[13px] text-slate-500">No topics defined for this subject yet.</div>
        )}
      </div>
    </div>
  );
}
