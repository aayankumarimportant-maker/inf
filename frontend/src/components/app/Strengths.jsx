import React, { useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import EmptyStateScene from '../decor/EmptyStateScene';

const STRENGTH_MIN = 70; // % accuracy that qualifies as a strength
const WEAKNESS_MAX = 40; // % accuracy strictly below this is a weakness

export default function Strengths() {
  const { state } = useApp();
  const ws = state.worksheets || [];
  const [filter, setFilter] = useState('all'); // 'all' | 'strengths' | 'weaknesses'

  const byTopic = useMemo(() => {
    const t = {};
    ws.forEach((w) => {
      if (!t[w.topic]) t[w.topic] = { correct: 0, total: 0, subject: w.subject };
      t[w.topic].correct += w.correct;
      t[w.topic].total += w.total;
    });
    return Object.entries(t)
      .map(([k, v]) => ({ topic: k, ...v, acc: v.total ? Math.round((v.correct / v.total) * 100) : 0 }))
      .sort((a, b) => b.acc - a.acc);
  }, [ws]);

  const strengthCount = useMemo(() => byTopic.filter((t) => t.acc >= STRENGTH_MIN).length, [byTopic]);
  const weaknessCount = useMemo(() => byTopic.filter((t) => t.acc < WEAKNESS_MAX).length, [byTopic]);

  const filtered = useMemo(() => {
    if (filter === 'strengths') return byTopic.filter((t) => t.acc >= STRENGTH_MIN);
    if (filter === 'weaknesses') return byTopic.filter((t) => t.acc < WEAKNESS_MAX);
    return byTopic;
  }, [byTopic, filter]);

  if (byTopic.length === 0) {
    return (
      <div className="relative rounded-2xl border border-dashed border-[color:var(--color-border)] bg-white overflow-hidden min-h-[360px]">
        <EmptyStateScene variant="both" className="absolute inset-0" />
        <div className="relative p-12 text-center">
          <div className="text-[15px] font-medium text-slate-700">No data yet</div>
          <div className="text-[13px] text-slate-500 mt-1">Complete a worksheet to see personalized learning analytics.</div>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'all', label: 'All', count: byTopic.length },
    { key: 'strengths', label: 'Strengths', count: strengthCount },
    { key: 'weaknesses', label: 'Weaknesses', count: weaknessCount },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--color-border)] bg-white p-2 pl-3">
        <div className="flex items-center gap-2 text-slate-500">
          <Filter className="w-4 h-4" />
          <span className="text-[12.5px] font-medium">Filter</span>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          {tabs.map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors ${
                  active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 tabular-nums ${active ? 'text-slate-500' : 'text-slate-400'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[color:var(--color-border)] p-8 text-center text-[13px] text-slate-500 bg-slate-50/50">
          {filter === 'strengths'
            ? `No strengths yet. Topics with ${STRENGTH_MIN}%+ accuracy will show up here.`
            : `No weaknesses yet. Topics below ${WEAKNESS_MAX}% accuracy will show up here.`}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((t) => (
            <div key={t.topic} className="rounded-xl border border-[color:var(--color-border)] bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[14.5px] font-medium">
                  {t.topic} <span className="text-slate-400 font-normal">· {t.subject}</span>
                </div>
                <div className="text-[13px] text-slate-700 tabular-nums">{t.acc}% · {t.correct}/{t.total}</div>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full ${t.acc >= 70 ? 'bg-blue-500' : t.acc >= 40 ? 'bg-amber-400' : 'bg-rose-400'}`}
                  style={{ width: `${t.acc}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
