import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SUBJECTS, TOPICS, QUESTION_BANK, FALLBACK_QUESTIONS } from '../../data/mock';
import { Check, X, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const DIFFICULTIES = ['Basics', 'Mixed exam practice', 'Challenge'];
const DURATIONS = ['Untimed', '10 minutes', '20 minutes', '30 minutes', '45 minutes'];
const LENGTHS = [5, 10, 15];

function buildQuestions(topic, n) {
  const pool = QUESTION_BANK[topic] || FALLBACK_QUESTIONS;
  const out = [];
  for (let i = 0; i < n; i++) {
    const base = pool[i % pool.length];
    out.push({ ...base });
  }
  return out;
}

export default function Worksheets({ go }) {
  const { state, recordWorksheet } = useApp();
  const track = state.user?.examTrack || 'SSLC';
  const subjects = SUBJECTS[track] || [];
  const preselect = typeof window !== 'undefined' ? window.sessionStorage.getItem('preselect_subject') : null;
  const preselectTopic = typeof window !== 'undefined' ? window.sessionStorage.getItem('preselect_topic') : null;
  const [subject, setSubject] = useState(preselect || subjects[0] || '');
  const topicsList = TOPICS[subject] || [];
  const [topic, setTopic] = useState((preselectTopic && topicsList.includes(preselectTopic)) ? preselectTopic : (topicsList[0] || ''));
  const [answerType, setAnswerType] = useState('Multiple choice');
  const [difficulty, setDifficulty] = useState('Mixed exam practice');
  const [duration, setDuration] = useState('Untimed');
  const [length, setLength] = useState(10);
  const [stage, setStage] = useState('build'); // build | take | result
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const t = TOPICS[subject] || [];
    setTopic(t[0] || '');
  }, [subject]);

  useEffect(() => {
    if (preselect) window.sessionStorage.removeItem('preselect_subject');
    if (preselectTopic) window.sessionStorage.removeItem('preselect_topic');
  }, [preselect, preselectTopic]);

  useEffect(() => {
    if (stage !== 'take' || duration === 'Untimed') return;
    if (timeLeft <= 0) {
      finalize();
      return;
    }
    const id = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [stage, timeLeft]);

  const start = () => {
    if (!subject || !topic) {
      toast.error('Select subject and topic');
      return;
    }
    const qs = buildQuestions(topic, length);
    setQuestions(qs);
    setAnswers(new Array(qs.length).fill(-1));
    setCurrent(0);
    setStartTime(Date.now());
    if (duration !== 'Untimed') {
      const mins = parseInt(duration, 10);
      setTimeLeft(mins * 60);
    }
    setStage('take');
  };

  const finalize = () => {
    const correct = questions.reduce((acc, q, i) => acc + (answers[i] === q.a ? 1 : 0), 0);
    const durationSec = Math.round((Date.now() - startTime) / 1000);
    const sheet = {
      id: `ws_${Date.now()}`,
      subject, topic, difficulty, length, answerType,
      questions, answers,
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

  if (stage === 'take') {
    const q = questions[current];
    return (
      <div className="max-w-[800px]">
        <div className="flex items-center justify-between mb-5">
          <div className="text-[13px] text-zinc-500">{subject} · {topic}</div>
          {duration !== 'Untimed' && (
            <div className="inline-flex items-center gap-2 text-[13px] text-zinc-700 bg-violet-50 px-3 py-1.5 rounded-md">
              <Clock className="w-3.5 h-3.5" /> {fmtTime(timeLeft)}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-zinc-200 p-6">
          <div className="text-[12px] text-zinc-500 mb-2">Question {current + 1} of {questions.length}</div>
          <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden mb-5">
            <div className="h-full bg-violet-500 transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
          </div>
          <h3 className="text-[18px] font-semibold mb-5 leading-snug">{q.q}</h3>
          <div className="flex flex-col gap-2.5">
            {q.options.map((opt, i) => (
              <button key={i}
                onClick={() => { const c = [...answers]; c[current] = i; setAnswers(c); }}
                className={`text-left px-4 py-3 rounded-lg border text-[14px] transition-colors ${answers[current] === i ? 'border-violet-500 bg-violet-50 text-violet-800' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}`}>
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
            <div className="h-full bg-violet-500" style={{ width: `${result.score}%` }} />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {result.questions.map((q, i) => {
            const ok = result.answers[i] === q.a;
            return (
              <div key={i} className={`rounded-xl border p-4 ${ok ? 'border-zinc-200' : 'border-rose-200 bg-rose-50/40'}`}>
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

  return (
    <div className="max-w-[820px]">
      <p className="text-[14px] text-zinc-500 mb-6">Create targeted practice. Choose exam, subject, topic, difficulty, and length. The app builds a worksheet instantly.</p>
      <div className="rounded-2xl border border-zinc-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Subject">
          <select className="input-base" value={subject} onChange={(e) => setSubject(e.target.value)}>
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Topic">
          <select className="input-base" value={topic} onChange={(e) => setTopic(e.target.value)}>
            {(TOPICS[subject] || []).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Answer type">
          <Segmented value={answerType} onChange={setAnswerType} options={['Multiple choice', 'Typed response']} />
        </Field>
        <Field label="Difficulty">
          <Segmented value={difficulty} onChange={setDifficulty} options={DIFFICULTIES} />
        </Field>
        <Field label="Duration">
          <select className="input-base" value={duration} onChange={(e) => setDuration(e.target.value)}>
            {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Length">
          <Segmented value={length} onChange={setLength} options={LENGTHS} format={(n) => `${n} questions`} />
        </Field>
      </div>
      <button onClick={start} className="btn-violet mt-5 px-5 py-3 rounded-lg text-[14px] font-medium">Create interactive worksheet</button>
      {answerType === 'Typed response' && (
        <p className="text-[12.5px] text-zinc-500 mt-3">Note: This demo evaluates multiple choice only.</p>
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
        <button key={o} onClick={() => onChange(o)} className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${value === o ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'}`}>{format ? format(o) : o}</button>
      ))}
    </div>
  );
}
