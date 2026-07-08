import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QUESTION_BANK, SUBJECTS, SUBJECT_INFO, TOPICS } from '../../data/mock';
import { BookOpen, Eye, EyeOff, Sparkles, Library, ChevronRight, Search, ArrowLeft, ArrowRight } from 'lucide-react';
import StudyDecor from '../decor/StudyDecor';

// Build a topic -> subject reverse index so we can group questions by subject
function buildTopicToSubject() {
  const map = {};
  Object.entries(TOPICS).forEach(([subject, topics]) => {
    topics.forEach((t) => { if (!map[t]) map[t] = subject; });
  });
  return map;
}

const TOPIC_TO_SUBJECT = buildTopicToSubject();

function questionsBySubject() {
  const out = {};
  Object.entries(QUESTION_BANK).forEach(([topic, qs]) => {
    const subject = TOPIC_TO_SUBJECT[topic] || 'General';
    if (!out[subject]) out[subject] = [];
    qs.forEach((q, i) => {
      out[subject].push({ ...q, topic, id: `${topic}-${i}` });
    });
  });
  return out;
}

const ALL_QUESTIONS = questionsBySubject();

export default function QuestionBank({ go, subjectParam }) {
  const { state } = useApp();
  const track = state.user?.examTrack || 'SSLC';

  // Only subjects the user has actually chosen (from onboarding / their courses),
  // intersected with what the current exam track offers. Falls back to all track
  // subjects if the user hasn't picked anything yet.
  const chosenSubjects = useMemo(() => {
    const trackSubs = SUBJECTS[track] || [];
    const fromUser = state.user?.subjects || [];
    const fromCourses = [];
    (state.courses || []).forEach((c) => {
      const subs = Array.isArray(c.subjects) ? c.subjects.map((x) => x.subject) : [c.subject];
      subs.forEach((s) => { if (s && !fromCourses.includes(s)) fromCourses.push(s); });
    });
    const merged = Array.from(new Set([...fromUser, ...fromCourses])).filter((s) => trackSubs.includes(s));
    return merged.length ? merged : trackSubs;
  }, [state.user?.subjects, state.courses, track]);

  const decodedParam = subjectParam ? decodeURIComponent(subjectParam) : null;
  const startInBrowse = decodedParam && chosenSubjects.includes(decodedParam);
  const [mode, setMode] = useState(startInBrowse ? 'browse' : 'select');
  const [active, setActive] = useState(startInBrowse ? decodedParam : (chosenSubjects[0] || null));

  const openSubject = (s) => { setActive(s); setMode('browse'); };
  const backToSubjects = () => setMode('select');

  if (mode === 'select') {
    return <SubjectPicker subjects={chosenSubjects} onPick={openSubject} track={track} />;
  }

  return (
    <BrowseSubject
      subject={active}
      chosenSubjects={chosenSubjects}
      onBack={backToSubjects}
      onSwitchSubject={openSubject}
      go={go}
    />
  );
}

// --------------------------------------------------------------------------
// Subject picker (landing screen)
// --------------------------------------------------------------------------

function SubjectPicker({ subjects, onPick, track }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 opacity-60"><StudyDecor /></div>
      <div className="mb-6">
        <p className="text-[14px] text-slate-500 max-w-[640px]">Pick a subject to browse its curated question bank. Only your chosen subjects are shown here.</p>
        <div className="text-[12px] text-slate-500 mt-1">{subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'} on {track}</div>
      </div>

      {subjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] p-10 text-center bg-white">
          <Library className="w-6 h-6 text-slate-400 mx-auto mb-3" />
          <div className="text-[14px] font-medium text-slate-700">No subjects yet</div>
          <div className="text-[12.5px] text-slate-500 mt-1">Pick subjects in setup to browse their question bank here.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="qbank-subject-grid">
          {subjects.map((s) => {
            const info = SUBJECT_INFO[s] || { emoji: '\u25A0' };
            const count = (ALL_QUESTIONS[s] || []).length;
            const topicCount = (TOPICS[s] || []).length;
            return (
              <button
                key={s}
                onClick={() => onPick(s)}
                data-testid={`qbank-subject-${s.replace(/\s+/g, '-')}`}
                className="group text-left card-soft p-5 border border-[color:var(--color-border)] hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-[22px]">{info.emoji}</div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="text-[16.5px] font-semibold text-slate-900">{s}</div>
                <div className="text-[12.5px] text-slate-500 mt-1">
                  {count} {count === 1 ? 'curated question' : 'curated questions'} · {topicCount} {topicCount === 1 ? 'topic' : 'topics'}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------
// Browse a single subject
// --------------------------------------------------------------------------

function BrowseSubject({ subject, chosenSubjects, onBack, onSwitchSubject, go }) {
  const [query, setQuery] = useState('');
  const [revealed, setRevealed] = useState({});
  const list = ALL_QUESTIONS[subject] || [];

  const filtered = useMemo(() => {
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter((x) =>
      x.q.toLowerCase().includes(q)
      || x.topic.toLowerCase().includes(q)
      || (x.options || []).some((o) => o.toLowerCase().includes(q))
    );
  }, [list, query]);

  const launchPractice = (topic) => {
    window.sessionStorage.setItem('preselect_subject', subject);
    window.sessionStorage.setItem('preselect_topic', topic);
    go('worksheets');
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 opacity-60"><StudyDecor /></div>

      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          data-testid="qbank-back"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All subjects
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <p className="text-[14px] text-slate-500 max-w-[640px]">A curated, hand-written question bank organized by topic.</p>
          <div className="text-[12px] text-slate-500 mt-1">{list.length} {list.length === 1 ? 'question' : 'questions'} in this subject</div>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search questions or topics" className="input-base pl-8 w-[260px]" />
        </div>
      </div>

      {chosenSubjects.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {chosenSubjects.map((s) => {
            const info = SUBJECT_INFO[s] || { emoji: '\u25A0' };
            const sel = subject === s;
            return (
              <button key={s} onClick={() => onSwitchSubject(s)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium border transition-colors ${sel ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-[color:var(--color-border)] text-slate-700 hover:bg-slate-100'}`}>
                <span className="text-[14px] leading-none">{info.emoji}</span>
                <span>{s}</span>
                <span className="text-[11px] text-slate-500">{ALL_QUESTIONS[s]?.length || 0}</span>
              </button>
            );
          })}
        </div>
      )}

      <SubjectQuestions subject={subject} questions={filtered} revealed={revealed} setRevealed={setRevealed} launchPractice={launchPractice} />
    </div>
  );
}

function SubjectQuestions({ subject, questions, revealed, setRevealed, launchPractice }) {
  const info = SUBJECT_INFO[subject] || { emoji: '\u25A0' };
  const byTopic = useMemo(() => {
    const m = {};
    questions.forEach((q) => { (m[q.topic] = m[q.topic] || []).push(q); });
    return m;
  }, [questions]);

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] p-10 text-center bg-white">
        <Library className="w-6 h-6 text-slate-400 mx-auto mb-3" />
        <div className="text-[14px] font-medium text-slate-700">No questions match your search</div>
        <div className="text-[12.5px] text-slate-500 mt-1">Try a different keyword or clear the search to see all questions.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="card-soft p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-[18px]">{info.emoji}</div>
            <div className="min-w-0">
              <div className="text-[15.5px] font-semibold text-slate-900">{subject}</div>
              <div className="text-[12px] text-slate-500">{questions.length} {questions.length === 1 ? 'question' : 'questions'} in this subject · curated</div>
            </div>
          </div>
        </div>
      </div>

      {Object.entries(byTopic).map(([topic, qs]) => (
        <TopicGroup key={topic} topic={topic} questions={qs} revealed={revealed} setRevealed={setRevealed} onPractice={() => launchPractice(topic)} />
      ))}
    </div>
  );
}

function TopicGroup({ topic, questions, revealed, setRevealed, onPractice }) {
  return (
    <div className="card-soft p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-7 h-7 rounded-md bg-violet-100 text-violet-700 flex items-center justify-center"><BookOpen className="w-3.5 h-3.5" /></span>
          <div>
            <div className="text-[14px] font-semibold text-slate-900">{topic}</div>
            <div className="text-[11.5px] text-slate-500">{questions.length} {questions.length === 1 ? 'question' : 'questions'}</div>
          </div>
        </div>
        <button onClick={onPractice} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-semibold text-white bg-blue-600 hover:opacity-95">
          <Sparkles className="w-3.5 h-3.5" /> Practice these
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {questions.map((q) => {
          const isRevealed = revealed[q.id];
          return (
            <div key={q.id} className="rounded-md border border-[color:var(--color-border)] px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="text-[13.5px] text-slate-800 font-medium leading-snug">{q.q}</div>
                <button onClick={() => setRevealed((r) => ({ ...r, [q.id]: !r[q.id] }))} className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11.5px] text-slate-600 hover:bg-slate-100 transition-colors">
                  {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {isRevealed ? 'Hide' : 'Reveal'}
                </button>
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, idx) => {
                  const isCorrect = idx === q.a;
                  const show = isRevealed && isCorrect;
                  return (
                    <div key={`${q.id}-${idx}`} className={`px-3 py-2 rounded-md border text-[13px] flex items-center gap-2 ${show ? 'border-emerald-300 bg-emerald-50/60 text-emerald-800 font-medium' : 'border-[color:var(--color-border)] text-slate-700'}`}>
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10.5px] font-semibold">{String.fromCharCode(65 + idx)}</span>
                      <span className="flex-1">{opt}</span>
                      {show && <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
