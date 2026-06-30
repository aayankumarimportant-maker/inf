import React from 'react';
import { ArrowLeft, BookOpen, Target, Lightbulb, Sparkles, ChevronRight, ListChecks } from 'lucide-react';
import { SUBJECT_INFO, TOPICS } from '../../data/mock';
import InfinityBackground from '../decor/InfinityBackground';
import { useApp } from '../../context/AppContext';

const toneToBg = {
  primary: 'from-violet-500 via-violet-600 to-blue-600',
  violet: 'from-violet-500 via-violet-600 to-blue-600',
  blue: 'from-blue-500 via-blue-600 to-violet-600',
  secondary: 'from-blue-500 via-blue-600 to-violet-600',
  cyan: 'from-cyan-500 via-blue-500 to-violet-600',
  accent: 'from-cyan-500 via-blue-500 to-violet-600',
  success: 'from-emerald-500 via-blue-500 to-violet-600',
};
const toneToBadge = {
  primary: 'bg-violet-100 text-violet-700',
  violet: 'bg-violet-100 text-violet-700',
  blue: 'bg-blue-100 text-blue-700',
  secondary: 'bg-blue-100 text-blue-700',
  cyan: 'bg-cyan-100 text-cyan-700',
  accent: 'bg-cyan-100 text-cyan-700',
  success: 'bg-emerald-100 text-emerald-700',
};

export default function SubjectOverview({ subject, go, onBack }) {
  const { state } = useApp();
  const info = SUBJECT_INFO[subject] || { emoji: '\u{1F4DA}', tagline: 'Practice and improve.', description: 'Choose a topic and start practicing.', keyTopics: [], studyTips: [], tone: 'primary' };
  const topics = TOPICS[subject] || info.keyTopics || [];

  // Per-topic stats from completed worksheets
  const stats = {};
  (state.worksheets || []).forEach((w) => {
    if (w.subject === subject) {
      if (!stats[w.topic]) stats[w.topic] = { correct: 0, total: 0 };
      stats[w.topic].correct += w.correct;
      stats[w.topic].total += w.total;
    }
  });
  const totalAnswered = Object.values(stats).reduce((s, x) => s + x.total, 0);
  const totalCorrect = Object.values(stats).reduce((s, x) => s + x.correct, 0);
  const subjectAccuracy = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const launch = (topic) => {
    if (topic) window.sessionStorage.setItem('preselect_topic', topic);
    window.sessionStorage.setItem('preselect_subject', subject);
    go('worksheets');
  };

  return (
    <div className="relative">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-800 transition-colors mb-4">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to subjects
      </button>

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl text-white">
        <div className={`absolute inset-0 bg-gradient-to-br ${toneToBg[info.tone] || toneToBg.primary}`} />
        <InfinityBackground variant="hero" />
        <div className="absolute inset-0 grid-fade opacity-60" />
        <div className="relative p-7 lg:p-10 grid lg:grid-cols-[1.4fr_1fr] gap-6 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center text-[28px]">{info.emoji}</div>
              <div>
                <div className="text-[11px] tracking-[0.18em] uppercase font-semibold text-white/70">{state.user?.examTrack || 'SSLC'} · Subject overview</div>
                <div className="text-[28px] font-semibold tracking-tight leading-tight">{subject}</div>
              </div>
            </div>
            <p className="text-[15.5px] text-white/85 max-w-[640px] leading-relaxed">{info.description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button onClick={() => launch(null)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 transition-colors text-[14px] font-semibold shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)]">
                <Sparkles className="w-4 h-4 text-violet-600" /> Create worksheet
              </button>
              <button onClick={() => go('history')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/30 text-white hover:bg-white/10 transition-colors text-[14px] font-medium">
                <ListChecks className="w-4 h-4" /> View history
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Topics" value={topics.length} />
            <MiniStat label="Your accuracy" value={`${subjectAccuracy}%`} />
            <MiniStat label="Worksheets" value={(state.worksheets || []).filter((w) => w.subject === subject).length} />
            <MiniStat label="Questions tried" value={totalAnswered} />
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="mt-6 grid lg:grid-cols-[1.4fr_1fr] gap-4">
        {/* Topics list */}
        <div className="card-soft p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${toneToBadge[info.tone] || toneToBadge.primary}`}><BookOpen className="w-4 h-4" /></span>
            <h3 className="text-[16px] font-semibold text-slate-900">Topics in {subject}</h3>
          </div>
          <p className="text-[13.5px] text-slate-500 mb-5">Click any topic to start a focused worksheet on that area.</p>
          <div className="flex flex-col gap-2">
            {topics.map((t) => {
              const s = stats[t];
              const acc = s && s.total ? Math.round((s.correct / s.total) * 100) : null;
              return (
                <button key={t} onClick={() => launch(t)} className="text-left rounded-xl border border-[color:var(--color-border)] px-4 py-3 flex items-center justify-between hover:border-violet-300 hover:bg-violet-50/50 transition-colors group">
                  <div className="min-w-0">
                    <div className="text-[14.5px] font-medium text-slate-900">{t}</div>
                    <div className="text-[12px] text-slate-500 mt-0.5">{acc !== null ? `Your accuracy ${acc}% · ${s.total} questions` : 'Not attempted yet'}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {acc !== null && (
                      <div className="hidden sm:block w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full ${acc >= 70 ? 'bg-emerald-500' : acc >= 40 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{ width: `${acc}%` }} />
                      </div>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              );
            })}
            {topics.length === 0 && <div className="text-[13px] text-slate-500">No topics defined for this subject yet.</div>}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="card-soft p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center"><Target className="w-4 h-4" /></span>
              <h3 className="text-[15px] font-semibold text-slate-900">Key focus areas</h3>
            </div>
            <ul className="flex flex-col gap-1.5">
              {(info.keyTopics || []).map((k) => (
                <li key={k} className="text-[13.5px] text-slate-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  <span>{k}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-soft p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center"><Lightbulb className="w-4 h-4" /></span>
              <h3 className="text-[15px] font-semibold text-slate-900">Study tips</h3>
            </div>
            <ul className="flex flex-col gap-2">
              {(info.studyTips || []).map((tip, i) => (
                <li key={i} className="text-[13.5px] text-slate-700 flex items-start gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-semibold mt-0.5">{i + 1}</span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl bg-white/12 backdrop-blur border border-white/20 px-4 py-3">
      <div className="text-[10px] tracking-[0.16em] uppercase font-semibold text-white/70">{label}</div>
      <div className="text-[18px] font-semibold text-white mt-1 tabular-nums">{value}</div>
    </div>
  );
}
