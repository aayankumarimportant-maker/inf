import React, { useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import EmptyStateScene from '../decor/EmptyStateScene';

// Clamp helper
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

/**
 * Compute adaptive Strength / Weakness thresholds based on the student's own
 * weighted-average accuracy across all completed topics.
 *
 *   strengthMin  = round(avg + 10), clamped to [60, 90]
 *   weaknessMax  = round(avg - 10), clamped to [20, 55]
 *
 * A minimum 10-pt gap between the two is enforced so the buckets never overlap.
 */
function useAdaptiveThresholds(byTopic) {
  return useMemo(() => {
    const totalCorrect = byTopic.reduce((s, t) => s + t.correct, 0);
    const totalQ = byTopic.reduce((s, t) => s + t.total, 0);
    const avg = totalQ ? Math.round((totalCorrect / totalQ) * 100) : 0;

    let strengthMin = clamp(Math.round(avg + 10), 60, 90);
    let weaknessMax = clamp(Math.round(avg - 10), 20, 55);
    if (weaknessMax >= strengthMin - 10) weaknessMax = strengthMin - 10;

    return { avg, strengthMin, weaknessMax };
  }, [byTopic]);
}

export default function Strengths() {
  const { state } = useApp();
  const ws = state.worksheets || [];
  const [level, setLevel] = useState('all'); // 'all' | 'strengths' | 'weaknesses'
  const [subject, setSubject] = useState('all');

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

  const { avg, strengthMin, weaknessMax } = useAdaptiveThresholds(byTopic);

  const subjects = useMemo(() => {
    const set = new Set(byTopic.map((t) => t.subject).filter(Boolean));
    return Array.from(set).sort();
  }, [byTopic]);

  // Apply subject filter first, then compute counts against subject-scoped list
  const subjectScoped = useMemo(
    () => (subject === 'all' ? byTopic : byTopic.filter((t) => t.subject === subject)),
    [byTopic, subject]
  );

  const strengthCount = useMemo(
    () => subjectScoped.filter((t) => t.acc >= strengthMin).length,
    [subjectScoped, strengthMin]
  );
  const weaknessCount = useMemo(
    () => subjectScoped.filter((t) => t.acc < weaknessMax).length,
    [subjectScoped, weaknessMax]
  );

  const filtered = useMemo(() => {
    if (level === 'strengths') return subjectScoped.filter((t) => t.acc >= strengthMin);
    if (level === 'weaknesses') return subjectScoped.filter((t) => t.acc < weaknessMax);
    return subjectScoped;
  }, [subjectScoped, level, strengthMin, weaknessMax]);

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
    { key: 'all', label: 'All', count: subjectScoped.length },
    { key: 'strengths', label: 'Strengths', count: strengthCount },
    { key: 'weaknesses', label: 'Weaknesses', count: weaknessCount },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="rounded-xl border border-[color:var(--color-border)] bg-white p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-[12.5px] font-medium text-slate-500 shrink-0">Filter</span>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="ml-1 rounded-md border border-[color:var(--color-border)] bg-white px-2.5 py-1.5 text-[12.5px] text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
              aria-label="Filter by subject"
            >
              <option value="all">All subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            {tabs.map((tab) => {
              const active = level === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setLevel(tab.key)}
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

        {/* Adaptive threshold info */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
            Strength ≥ <span className="tabular-nums font-medium text-slate-700">{strengthMin}%</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400" />
            Weakness &lt; <span className="tabular-nums font-medium text-slate-700">{weaknessMax}%</span>
          </span>
          <span className="text-slate-400">
            Adapts to your <span className="tabular-nums font-medium text-slate-600">{avg}%</span> average
          </span>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[color:var(--color-border)] p-8 text-center text-[13px] text-slate-500 bg-slate-50/50">
          {level === 'strengths'
            ? `No strengths yet${subject !== 'all' ? ` in ${subject}` : ''}. Topics with ${strengthMin}%+ accuracy will show up here.`
            : level === 'weaknesses'
              ? `No weaknesses${subject !== 'all' ? ` in ${subject}` : ''}. Topics below ${weaknessMax}% accuracy will show up here.`
              : `No topics${subject !== 'all' ? ` in ${subject}` : ''} yet.`}
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
                  className={`h-full ${t.acc >= strengthMin ? 'bg-blue-500' : t.acc < weaknessMax ? 'bg-rose-400' : 'bg-amber-400'}`}
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
