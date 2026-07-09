import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CalendarClock, Sparkles } from 'lucide-react';
import { useStrengthsWeaknesses, useSavedSwOverrides } from '../../hooks/useStrengthsWeaknesses';
import { predictedScore, formatGrade, scoreToIBGrade, TONE_CLASSES, isGradedTrack } from '../../lib/predictedGrade';

function Ring({ value = 0 }) {
  const r = 32;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <div className="relative w-[80px] h-[80px]">
      <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" className="ring-track" />
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" strokeLinecap="round" className="ring-fill" strokeDasharray={c} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[18px] font-semibold text-zinc-900">{Math.round(value)}</div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-[color:var(--color-border)] p-4 bg-white">
      <div className="text-[10px] tracking-[0.14em] uppercase font-semibold text-slate-500">{label}</div>
      <div className="text-[20px] font-semibold mt-1 text-slate-900">{value}</div>
    </div>
  );
}

function DaysStat({ days, subLabel }) {
  const has = days !== null && days !== undefined;
  return (
    <div className="rounded-xl border border-violet-200/70 p-4 bg-violet-50 relative overflow-hidden" data-testid="days-until-exam">
      <div className="relative text-[10px] tracking-[0.14em] uppercase font-semibold text-violet-700">Days until exam</div>
      <div className="relative text-[24px] font-semibold mt-1 text-slate-900 tabular-nums">
        {has ? days : '\u2014'}
        {has && <span className="text-[12px] font-medium text-slate-500 ml-1">{days === 1 ? 'day' : 'days'}</span>}
      </div>
      {subLabel && <div className="relative text-[11px] text-slate-500 mt-0.5 truncate">{subLabel}</div>}
      {!has && !subLabel && <div className="relative text-[11px] text-slate-500 mt-0.5">Add a course</div>}
    </div>
  );
}

export default function Dashboard({ go }) {
  const { state } = useApp();
  const ws = state.worksheets || [];

  const stats = useMemo(() => {
    const total = ws.reduce((s, w) => s + (w.total || 0), 0);
    const correct = ws.reduce((s, w) => s + (w.correct || 0), 0);
    const sheets = ws.length;
    const readiness = total === 0 ? 0 : Math.round((correct / total) * 100);
    return { total, correct, sheets, readiness };
  }, [ws]);

  // Adaptive strengths/weaknesses shared with the Strengths page. Respects any
  // user-customized thresholds (persisted in localStorage).
  const swOverrides = useSavedSwOverrides();
  const {
    strengthMin,
    weaknessMax,
    isCustom: swIsCustom,
    strengths: swStrengths,
    weaknesses: swWeaknesses,
  } = useStrengthsWeaknesses(ws, swOverrides);

  const strongTopics = useMemo(() => swStrengths.slice(0, 3), [swStrengths]);
  const weakTopics = useMemo(() => swWeaknesses.slice(0, 3), [swWeaknesses]);

  // ---------------------------------------------------------------------------
  // Per-subject predicted grade + optional IB total.
  // ---------------------------------------------------------------------------
  const examTrack = state.user?.examTrack || 'CBSE';
  const isIB = (examTrack || '').toUpperCase() === 'IB';
  const perSubjectGrades = useMemo(() => {
    const subjects = Array.from(new Set(ws.map((w) => w.subject))).sort();
    return subjects.map((s) => {
      const list = ws.filter((w) => w.subject === s);
      const score = predictedScore(list);
      return {
        subject: s,
        score,
        count: list.length,
        grade: formatGrade(score, examTrack),
        ibGrade: scoreToIBGrade(score), // handy for the IB total
      };
    });
  }, [ws, examTrack]);

  // IB total: sum of per-subject IB grades (out of subjectCount × 7).
  // Only shown when the student is on the IB track — CBSE/ICSE stay per-subject.
  const ibTotal = useMemo(() => {
    if (!isIB || perSubjectGrades.length === 0) return null;
    const sum = perSubjectGrades.reduce((acc, g) => acc + g.ibGrade, 0);
    const max = perSubjectGrades.length * 7;
    return { sum, max, subjects: perSubjectGrades.length };
  }, [isIB, perSubjectGrades]);

  const goalDate = new Date().toDateString();
  const questionsToday = state.goalDate === goalDate ? state.questionsToday : 0;
  const dailyGoal = state.settings?.dailyGoal || 10;
  const progressPct = Math.min(100, Math.round((questionsToday / dailyGoal) * 100));

  // Flatten all subjects from all courses with their per-subject exam dates
  const courseExams = useMemo(() => {
    const flat = [];
    (state.courses || []).forEach((c) => {
      const subs = Array.isArray(c.subjects) ? c.subjects : [{ subject: c.subject, examDate: c.examDate }];
      subs.forEach((s) => {
        if (!s.examDate) return;
        flat.push({
          name: s.subject,
          courseName: c.name,
          subject: s.subject,
          date: s.examDate,
          days: Math.max(0, Math.ceil((new Date(s.examDate + 'T00:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
        });
      });
    });
    flat.sort((a, b) => a.days - b.days);
    return flat;
  }, [state.courses]);

  const fallbackDate = state.settings?.examDate;
  const fallbackDays = fallbackDate ? Math.max(0, Math.ceil((new Date(fallbackDate + 'T00:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;
  const nearest = courseExams[0];
  const examCountdown = nearest ? nearest.days : fallbackDays;
  const examLabel = nearest ? nearest.name : (fallbackDate ? new Date(fallbackDate).toLocaleDateString() : null);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[28px] font-semibold tracking-tight text-slate-900">Welcome back, {state.user?.name || 'Student'}.</h2>
        <p className="text-[14px] text-slate-500 mt-1">Here is your study overview.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <DaysStat days={examCountdown} subLabel={examLabel} />
        <Stat label="Study streak" value={`${state.streak || 0} ${(state.streak || 0) === 1 ? 'day' : 'days'}`} />
        <Stat label="Questions answered" value={stats.total} />
        <Stat label="Worksheets completed" value={stats.sheets} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[color:var(--color-border)] p-5 bg-white">
          <div className="eyebrow-muted mb-2">Today&rsquo;s goal</div>
          <div className="text-[18px] font-semibold">{questionsToday} / {dailyGoal} questions</div>
          <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-blue-500 transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <div className="rounded-xl border border-[color:var(--color-border)] p-5 bg-white">
          <div className="eyebrow-muted mb-3 flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5 text-violet-600" /> Upcoming exams</div>
          {courseExams.length === 0 ? (
            <button onClick={() => go('courses')} className="text-[14px] text-blue-700 hover:text-blue-900 transition-colors">Add a course to set per-subject exam dates &rarr;</button>
          ) : (
            <div className="flex flex-col gap-2">
              {courseExams.slice(0, 4).map((c) => (
                <div key={c.name + c.date} className="flex items-center justify-between gap-3 px-3 py-2 rounded-md border border-[color:var(--color-border)]">
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-medium text-slate-900 truncate">{c.name}</div>
                    <div className="text-[11.5px] text-slate-500">{new Date(c.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[16px] font-semibold tabular-nums text-slate-900">{c.days}</div>
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">days</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {perSubjectGrades.length > 0 && (
        <div className="rounded-xl border border-[color:var(--color-border)] bg-white p-5" data-testid="dashboard-predicted-grades">
          <div className="flex items-center justify-between mb-3 gap-3">
            <div>
              <div className="eyebrow-muted flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Predicted grades
              </div>
              <div className="text-[12px] text-slate-500 mt-0.5">
                {isGradedTrack(examTrack)
                  ? `${examTrack.toUpperCase()}-style, per subject. Difficulty-weighted and heavily biased toward your most recent worksheet.`
                  : 'Per subject. Difficulty-weighted and heavily biased toward your most recent worksheet.'}
              </div>
            </div>
            {ibTotal && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-right shrink-0" data-testid="ib-total">
                <div className="text-[10px] tracking-[0.14em] uppercase font-semibold text-emerald-700">IB total</div>
                <div className="text-[18px] font-semibold text-emerald-800 tabular-nums leading-tight">
                  {ibTotal.sum}<span className="text-slate-500 font-normal">/{ibTotal.max}</span>
                </div>
                <div className="text-[10.5px] text-slate-500">{ibTotal.subjects} {ibTotal.subjects === 1 ? 'subject' : 'subjects'}</div>
              </div>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {perSubjectGrades.map((g) => (
              <PredictedGradeMini key={g.subject} g={g} onClick={() => go('progress')} />
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="eyebrow-muted">Strong topics</div>
            <div className="text-[11px] text-slate-500 inline-flex items-center gap-1">
              {swIsCustom
                ? <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 font-medium">Custom</span>
                : <><Sparkles className="w-3 h-3 text-slate-400" />Adaptive</>}
              <span className="tabular-nums">≥ {strengthMin}%</span>
            </div>
          </div>
          {strongTopics.length === 0 ? (
            <div className="text-[14px] text-zinc-500">Complete a worksheet to start measuring strengths.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {strongTopics.map((t) => (
                <span key={t.topic} className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-[12.5px] font-medium">{t.topic} · {t.acc}%</span>
              ))}
              {swStrengths.length > 3 && (
                <button onClick={() => go('strengths')} className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 text-[12.5px] font-medium hover:bg-slate-100 transition">
                  +{swStrengths.length - 3} more
                </button>
              )}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-zinc-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="eyebrow-muted">Weak topics</div>
            <div className="text-[11px] text-slate-500 inline-flex items-center gap-1">
              {swIsCustom
                ? <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 font-medium">Custom</span>
                : <><Sparkles className="w-3 h-3 text-slate-400" />Adaptive</>}
              <span className="tabular-nums">&lt; {weaknessMax}%</span>
            </div>
          </div>
          {weakTopics.length === 0 ? (
            <div className="text-[14px] text-zinc-500">Missed questions will appear here.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {weakTopics.map((t) => (
                <span key={t.topic} className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-[12.5px] font-medium">{t.topic} · {t.acc}%</span>
              ))}
              {swWeaknesses.length > 3 && (
                <button onClick={() => go('strengths')} className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 text-[12.5px] font-medium hover:bg-slate-100 transition">
                  +{swWeaknesses.length - 3} more
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => go('worksheets')} className="btn-violet px-5 py-2.5 rounded-lg text-[14px] font-medium">Create a worksheet</button>
        <button onClick={() => go('study')} className="btn-outline-dark px-5 py-2.5 rounded-lg text-[14px] font-medium">Browse subjects</button>
      </div>
    </div>
  );
}


function PredictedGradeMini({ g, onClick }) {
  const tone = TONE_CLASSES[g.grade?.tone] || TONE_CLASSES.ok;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-lg border ${tone.border} ${tone.bg} p-3 hover:brightness-95 transition group`}
      data-testid={`pred-grade-${g.subject}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-slate-900 truncate">{g.subject}</div>
          <div className="text-[10.5px] text-slate-500 tabular-nums">
            {g.count} {g.count === 1 ? 'worksheet' : 'worksheets'}
          </div>
        </div>
        <div className={`text-[20px] font-bold ${tone.text} tabular-nums leading-none`}>
          {g.grade?.label ?? '\u2014'}
        </div>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-white/60 overflow-hidden">
        <div className={`h-full ${tone.dot}`} style={{ width: `${g.score}%` }} />
      </div>
    </button>
  );
}
