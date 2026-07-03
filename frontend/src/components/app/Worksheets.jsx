import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SUBJECTS, TOPICS, QUESTION_BANK, FALLBACK_QUESTIONS, EXAM_DURATIONS } from '../../data/mock';
import { Check, X, Clock, ChevronLeft, ChevronRight, Sparkles, FileText } from 'lucide-react';
import { toast } from 'sonner';

const ANSWER_TYPES = ['Multiple choice', 'Typed response', 'Exam style'];
const DIFFICULTIES = ['Easy', 'Medium', 'Exam level', 'Hard'];
const DURATION_MIN = 5;
const DURATION_MAX = 240;
const DURATION_STEP = 5;

function buildQuestions(topics, n) {
  const list = (topics && topics.length) ? topics : [];
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = list[i % Math.max(1, list.length)] || null;
    const pool = (t && QUESTION_BANK[t]) || FALLBACK_QUESTIONS;
    const base = pool[i % pool.length];
    out.push({ ...base, _topic: t });
  }
  return out;
}

function fmtDuration(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

export default function Worksheets({ go }) {
  const { state, recordWorksheet } = useApp();
  const track = state.user?.examTrack || 'SSLC';
  const examMinutes = EXAM_DURATIONS[track] || 60;

  // Only subjects the user has actually chosen (from onboarding / courses)
  const allTrackSubjects = SUBJECTS[track] || [];
  const chosenSubjects = useMemo(() => {
    const fromUser = state.user?.subjects || [];
    const fromCourses = [];
    (state.courses || []).forEach((c) => {
      const subs = Array.isArray(c.subjects) ? c.subjects.map((x) => x.subject) : [c.subject];
      subs.forEach((s) => { if (s && !fromCourses.includes(s)) fromCourses.push(s); });
    });
    const merged = Array.from(new Set([...fromUser, ...fromCourses])).filter((s) => allTrackSubjects.includes(s));
    // Fall back to all subjects for the track if none picked (edge case).
    return merged.length ? merged : allTrackSubjects;
  }, [state.user?.subjects, state.courses, allTrackSubjects]);

  const preselect = typeof window !== 'undefined' ? window.sessionStorage.getItem('preselect_subject') : null;
  const preselectTopic = typeof window !== 'undefined' ? window.sessionStorage.getItem('preselect_topic') : null;

  const [subject, setSubject] = useState(() => {
    if (preselect && chosenSubjects.includes(preselect)) return preselect;
    return chosenSubjects[0] || '';
  });
  const topicsList = TOPICS[subject] || [];
  const [topics, setTopics] = useState(() => {
    if (preselectTopic && topicsList.includes(preselectTopic)) return [preselectTopic];
    return topicsList.length ? [topicsList[0]] : [];
  });

  const [answerType, setAnswerType] = useState('Multiple choice');
  const [difficulty, setDifficulty] = useState('Medium');
  const [duration, setDuration] = useState(examMinutes);
  const [pastPapers, setPastPapers] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(true);

  const [stage, setStage] = useState('build'); // build | take | result
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);

  // When the subject changes, reset topics to the first topic of the new subject.
  useEffect(() => {
    const t = TOPICS[subject] || [];
    setTopics(t.length ? [t[0]] : []);
  }, [subject]);

  useEffect(() => {
    if (preselect) window.sessionStorage.removeItem('preselect_subject');
    if (preselectTopic) window.sessionStorage.removeItem('preselect_topic');
  }, [preselect, preselectTopic]);

  useEffect(() => {
    if (stage !== 'take') return;
    if (timeLeft <= 0) {
      finalize();
      return;
    }
    const id = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, timeLeft]);

  const toggleTopic = (t) => {
    setTopics((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };

  const start = () => {
    if (!subject) { toast.error('Select a subject'); return; }
    if (!topics.length) { toast.error('Select at least one topic'); return; }
    if (!pastPapers && !aiGenerated) { toast.error('Pick past papers, AI generated, or both'); return; }
    // Auto-size the worksheet: roughly one question every ~3 minutes, min 3, cap 30.
    const length = Math.max(3, Math.min(30, Math.round(duration / 3)));
    const qs = buildQuestions(topics, length);
    setQuestions(qs);
    setAnswers(new Array(qs.length).fill(-1));
    setCurrent(0);
    setStartTime(Date.now());
    setTimeLeft(duration * 60);
    setStage('take');
  };

  const finalize = () => {
    const correct = questions.reduce((acc, q, i) => acc + (answers[i] === q.a ? 1 : 0), 0);
    const durationSec = Math.round((Date.now() - startTime) / 1000);
    const sheet = {
      id: `ws_${Date.now()}`,
      subject,
      topic: topics.join(', '),
      topics,
      difficulty,
      length: questions.length,
      answerType,
      duration,
      pastPapers,
      aiGenerated,
      questions,
      answers,
      total: questions.length,
      correct,
      score: Math.round((correct / questions.length) * 100),
      durationSec,
      date: new Date().toISOString(),
    };
    recordWorksheet(sheet);
    setResult(sheet);
    setStage('result');
  };

  const fmtTime = (s) => {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // ===== Take stage =====
  if (stage === 'take') {
    const q = questions[current];
    return (
      <div className="max-w-[800px]">
        <div className="flex items-center justify-between mb-5">
          <div className="text-[13px] text-zinc-500">{subject} · {topics.join(' · ')}</div>
          <div className="inline-flex items-center gap-2 text-[13px] text-zinc-700 bg-blue-50 px-3 py-1.5 rounded-md">
            <Clock className="w-3.5 h-3.5" /> {fmtTime(timeLeft)}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 p-6">
          <div className="text-[12px] text-zinc-500 mb-2">Question {current + 1} of {questions.length}{q._topic ? ` · ${q._topic}` : ''}</div>
          <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden mb-5">
            <div className="h-full bg-blue-500 transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
          </div>
          <h3 className="text-[18px] font-semibold mb-5 leading-snug">{q.q}</h3>
          <div className="flex flex-col gap-2.5">
            {q.options.map((opt, i) => (
              <button key={`${q.q}-${i}`}
                onClick={() => { const c = [...answers]; c[current] = i; setAnswers(c); }}
                className={`text-left px-4 py-3 rounded-lg border text-[14px] transition-colors ${answers[current] === i ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}`}>
                <span className="inline-block w-6 text-zinc-500 font-medium">{String.fromCharCode(65 + i)}.</span>
                <span>{opt}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between mt-6">
            <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0} className="btn-outline-dark inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13.5px] disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            {current < questions.length - 1 ? (
              <button onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))} className="btn-violet inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13.5px] font-medium">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={finalize} className="btn-violet inline-flex items-center px-5 py-2 rounded-lg text-[13.5px] font-medium">Submit worksheet</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===== Result stage =====
  if (stage === 'result' && result) {
    return (
      <div className="max-w-[820px]">
        <div className="rounded-2xl border border-zinc-200 p-6 mb-5">
          <div className="eyebrow-muted mb-1">Worksheet complete</div>
          <div className="flex items-end justify-between">
            <h2 className="text-[26px] font-semibold tracking-tight">{result.score}% · {result.correct}/{result.total} correct</h2>
            <div className="text-[13px] text-zinc-500">{result.subject} · {result.topic}</div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-zinc-100 overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${result.score}%` }} />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {result.questions.map((q, i) => {
            const ok = result.answers[i] === q.a;
            return (
              <div key={`${q.q}-${i}`} className={`rounded-xl border p-4 ${ok ? 'border-zinc-200' : 'border-rose-200 bg-rose-50/40'}`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white ${ok ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                    {ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-zinc-900">{i + 1}. {q.q}</div>
                    <div className="text-[13px] text-zinc-600 mt-1">Correct: <span className="font-medium text-zinc-800">{q.options[q.a]}</span></div>
                    {!ok && result.answers[i] !== -1 && (
                      <div className="text-[13px] text-rose-600 mt-0.5">Your answer: {q.options[result.answers[i]]}</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => { setStage('build'); setResult(null); }} className="btn-violet px-4 py-2 rounded-lg text-[14px] font-medium">Create another</button>
          <button onClick={() => go('dashboard')} className="btn-outline-dark px-4 py-2 rounded-lg text-[14px] font-medium">Back to dashboard</button>
        </div>
      </div>
    );
  }

  // ===== Build stage =====
  const isDurationDefault = duration === examMinutes;

  return (
    <div className="max-w-[820px]">
      <p className="text-[14px] text-zinc-500 mb-6">Create targeted practice. Choose a subject you&apos;re studying, pick one or more topics, and dial in the format.</p>
      <div className="rounded-2xl border border-zinc-200 p-6 flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Subject">
            <select className="input-base" value={subject} onChange={(e) => setSubject(e.target.value)} data-testid="ws-subject">
              {chosenSubjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {chosenSubjects.length < allTrackSubjects.length && (
              <div className="text-[11px] text-slate-500 mt-1">Only showing subjects from your courses.</div>
            )}
          </Field>
          <Field label="Answer type">
            <Segmented value={answerType} onChange={setAnswerType} options={ANSWER_TYPES} />
          </Field>
        </div>

        <Field label={`Topics (${topics.length} selected)`}>
          {topicsList.length === 0 ? (
            <div className="text-[13px] text-slate-500 italic">No topics available for this subject yet.</div>
          ) : (
            <div className="flex flex-wrap gap-2" data-testid="ws-topics">
              {topicsList.map((t) => {
                const sel = topics.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTopic(t)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium border transition-colors ${sel ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-zinc-200 bg-white text-slate-700 hover:bg-slate-100'}`}
                  >
                    {sel && <Check className="w-3.5 h-3.5" />}
                    {t}
                  </button>
                );
              })}
            </div>
          )}
        </Field>

        <Field label="Difficulty">
          <Segmented value={difficulty} onChange={setDifficulty} options={DIFFICULTIES} />
        </Field>

        <Field label={`Duration · ${fmtDuration(duration)}${isDurationDefault ? ' (real exam length)' : ''}`}>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={DURATION_MIN}
              max={DURATION_MAX}
              step={DURATION_STEP}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10))}
              className="flex-1 accent-blue-600"
              data-testid="ws-duration"
            />
            <button
              type="button"
              onClick={() => setDuration(examMinutes)}
              className="text-[11.5px] font-medium text-blue-700 hover:text-blue-900 transition-colors whitespace-nowrap"
              title="Reset to real exam length"
            >
              Reset
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>{fmtDuration(DURATION_MIN)}</span>
            <span>{fmtDuration(DURATION_MAX)}</span>
          </div>
        </Field>

        <div>
          <div className="text-[10px] tracking-[0.14em] uppercase font-semibold text-zinc-500 mb-2">Question source</div>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <CheckboxCard
              label="Past paper questions"
              icon={<FileText className="w-4 h-4 text-slate-600" />}
              checked={pastPapers}
              onChange={setPastPapers}
              testid="ws-past-papers"
            />
            <CheckboxCard
              label={<>&#x2728; AI generated questions</>}
              icon={<Sparkles className="w-4 h-4 text-blue-700" />}
              checked={aiGenerated}
              onChange={setAiGenerated}
              testid="ws-ai-generated"
            />
          </div>
          {!pastPapers && !aiGenerated && (
            <div className="text-[11.5px] text-rose-600 mt-2">Pick at least one question source.</div>
          )}
        </div>
      </div>

      <button onClick={start} data-testid="ws-start" className="btn-violet mt-5 px-5 py-3 rounded-lg text-[14px] font-medium">Create interactive worksheet</button>
      {answerType !== 'Multiple choice' && (
        <p className="text-[12.5px] text-zinc-500 mt-3">Note: This demo evaluates multiple choice only. Typed and exam-style answers won&apos;t be auto-graded.</p>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] tracking-[0.14em] uppercase font-semibold text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

function Segmented({ value, onChange, options, format }) {
  return (
    <div className="inline-flex flex-wrap gap-1 p-1 bg-zinc-100 rounded-lg">
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)} className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${value === o ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'}`}>{format ? format(o) : o}</button>
      ))}
    </div>
  );
}

function CheckboxCard({ label, icon, checked, onChange, testid }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      data-testid={testid}
      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-[13px] font-medium transition-colors flex-1 min-w-0 ${checked ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-zinc-200 bg-white text-slate-700 hover:bg-slate-100'}`}
    >
      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${checked ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}`}>
        {checked && <Check className="w-3 h-3" />}
      </span>
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}
