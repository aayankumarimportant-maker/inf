import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Plus, Trash2, FileText, Sparkles, Filter } from 'lucide-react';
import { SUBJECTS, TOPICS } from '../../data/mock';
import { toast } from 'sonner';

const ANSWER_TYPES = ['Multiple choice', 'Typed response', 'Exam style'];
const DIFFICULTIES = ['Easy', 'Medium', 'Exam level', 'Hard'];

function emptyForm(track) {
  return {
    subject: SUBJECTS[track]?.[0] || '',
    topic: '',
    year: '',
    board: track,
    difficulty: 'Medium',
    answerType: 'Multiple choice',
    q: '',
    options: ['', '', '', ''],
    a: 0,
    typedAnswer: '',
    typedAliases: '',
    examAnswer: '',
    examKeywords: '',
    marks: '',
  };
}

export default function AdminPlaceholder() {
  const { state, addPastPaper, removePastPaper } = useApp();
  const track = state.user?.examTrack || 'SSLC';
  const [form, setForm] = useState(() => emptyForm(track));
  const [filterSubject, setFilterSubject] = useState('');
  const [filterTopic, setFilterTopic] = useState('');

  const pastPapers = state.pastPapers || [];
  const trackSubjects = SUBJECTS[track] || Object.keys(TOPICS);
  const formTopics = TOPICS[form.subject] || [];
  const filterTopics = filterSubject ? (TOPICS[filterSubject] || []) : [];

  const setF = (patch) => setForm((f) => ({ ...f, ...patch }));

  const filtered = useMemo(() => {
    return pastPapers.filter((p) => (!filterSubject || p.subject === filterSubject) && (!filterTopic || p.topic === filterTopic));
  }, [pastPapers, filterSubject, filterTopic]);

  const validate = () => {
    if (!form.subject) return 'Pick a subject';
    if (!form.topic) return 'Pick a topic';
    if (!form.q.trim()) return 'Enter a question';
    if (form.answerType === 'Multiple choice') {
      if (form.options.filter((o) => o.trim()).length < 2) return 'Add at least two options';
      if (!form.options[form.a] || !form.options[form.a].trim()) return 'Pick a correct option that has text';
    }
    if (form.answerType === 'Typed response' && !form.typedAnswer.trim()) return 'Enter the expected typed answer';
    if (form.answerType === 'Exam style' && !form.examAnswer.trim()) return 'Enter the model exam-style answer';
    return null;
  };

  const submit = () => {
    const err = validate();
    if (err) { toast.error(err); return; }
    const base = {
      subject: form.subject,
      topic: form.topic,
      year: form.year ? parseInt(form.year, 10) : null,
      board: form.board || null,
      difficulty: form.difficulty,
      answerType: form.answerType,
      marks: form.marks ? parseInt(form.marks, 10) : null,
      q: form.q.trim(),
      source: 'past-paper',
    };
    if (form.answerType === 'Multiple choice') {
      const opts = form.options.map((o) => o.trim()).filter((_, i) => form.options[i] !== undefined);
      // Preserve correct index by dropping empties AFTER trimming, but keep positions.
      const clean = form.options.map((o) => o.trim());
      base.options = clean;
      base.a = form.a;
    } else if (form.answerType === 'Typed response') {
      base.typedAnswer = form.typedAnswer.trim();
      base.typedAliases = form.typedAliases.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (form.answerType === 'Exam style') {
      base.examAnswer = form.examAnswer.trim();
      base.examKeywords = form.examKeywords.split(',').map((s) => s.trim()).filter(Boolean);
    }
    addPastPaper(base);
    toast.success('Past paper question added');
    setForm(emptyForm(track));
  };

  return (
    <div className="max-w-[1080px]" data-testid="admin-placeholder">
      <div className="flex items-center gap-3 mb-5">
        <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
          <Shield className="w-5 h-5" />
        </span>
        <div>
          <div className="text-[11px] tracking-[0.16em] uppercase font-semibold text-blue-600">Admin</div>
          <h2 className="text-[24px] font-semibold tracking-tight text-slate-900">Past paper question bank</h2>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-5">
        {/* Add-question form */}
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-white p-5">
          <div className="text-[12px] tracking-[0.16em] uppercase font-semibold text-blue-700 mb-1">Add a past-paper question</div>
          <p className="text-[12.5px] text-slate-500 mb-4">These questions feed the worksheet builder when learners tick <span className="font-semibold">Past paper questions</span>.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Subject">
              <select className="input-base" value={form.subject} onChange={(e) => setF({ subject: e.target.value, topic: '' })} data-testid="admin-subject">
                {trackSubjects.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Topic">
              <select className="input-base" value={form.topic} onChange={(e) => setF({ topic: e.target.value })} data-testid="admin-topic">
                <option value="">Pick a topic</option>
                {formTopics.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Difficulty">
              <select className="input-base" value={form.difficulty} onChange={(e) => setF({ difficulty: e.target.value })}>
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Answer type">
              <select className="input-base" value={form.answerType} onChange={(e) => setF({ answerType: e.target.value })} data-testid="admin-answer-type">
                {ANSWER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Year (optional)">
              <input className="input-base" type="number" min="1990" max="2099" value={form.year} onChange={(e) => setF({ year: e.target.value })} placeholder="e.g., 2023" />
            </Field>
            <Field label="Marks (optional)">
              <input className="input-base" type="number" min="1" max="30" value={form.marks} onChange={(e) => setF({ marks: e.target.value })} placeholder="e.g., 5" />
            </Field>
          </div>

          <div className="mt-3">
            <Field label="Question">
              <textarea className="input-base" rows={3} value={form.q} onChange={(e) => setF({ q: e.target.value })} placeholder="Type the past-paper question exactly as it appeared." data-testid="admin-question" />
            </Field>
          </div>

          {form.answerType === 'Multiple choice' && (
            <div className="mt-3">
              <div className="text-[10px] tracking-[0.14em] uppercase font-semibold text-slate-500 mb-2">Options · click the radio to mark the correct one</div>
              <div className="flex flex-col gap-2">
                {form.options.map((opt, i) => (
                  <label key={i} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${form.a === i ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                    <input type="radio" name="admin-correct" checked={form.a === i} onChange={() => setF({ a: i })} />
                    <span className="text-[12px] font-semibold text-slate-500 w-5">{String.fromCharCode(65 + i)}.</span>
                    <input
                      className="flex-1 bg-transparent outline-none text-[13.5px] text-slate-900"
                      value={opt}
                      onChange={(e) => {
                        const opts = [...form.options];
                        opts[i] = e.target.value;
                        setF({ options: opts });
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {form.answerType === 'Typed response' && (
            <div className="mt-3 flex flex-col gap-3">
              <Field label="Expected answer">
                <input className="input-base" value={form.typedAnswer} onChange={(e) => setF({ typedAnswer: e.target.value })} placeholder="e.g., 9.8 m/s²" />
              </Field>
              <Field label="Accepted aliases (comma separated)">
                <input className="input-base" value={form.typedAliases} onChange={(e) => setF({ typedAliases: e.target.value })} placeholder="9.8, 9.81, 9.8 m/s^2" />
              </Field>
            </div>
          )}

          {form.answerType === 'Exam style' && (
            <div className="mt-3 flex flex-col gap-3">
              <Field label="Model answer / mark scheme">
                <textarea className="input-base" rows={3} value={form.examAnswer} onChange={(e) => setF({ examAnswer: e.target.value })} placeholder="Model examiner answer describing what a full-mark response looks like." />
              </Field>
              <Field label="Required keywords (comma separated)">
                <input className="input-base" value={form.examKeywords} onChange={(e) => setF({ examKeywords: e.target.value })} placeholder="e.g., photosynthesis, chloroplast, sunlight, glucose" />
              </Field>
            </div>
          )}

          <button onClick={submit} data-testid="admin-add-question" className="btn-violet mt-5 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[14px] font-semibold text-white bg-blue-600 hover:opacity-95">
            <Plus className="w-4 h-4" /> Add question
          </button>
        </div>

        {/* Existing past-paper questions */}
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-white p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <div className="text-[12px] tracking-[0.16em] uppercase font-semibold text-blue-700">Past-paper library</div>
              <div className="text-[12.5px] text-slate-500">{pastPapers.length} total · {filtered.length} shown</div>
            </div>
            <Filter className="w-4 h-4 text-slate-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            <select className="input-base" value={filterSubject} onChange={(e) => { setFilterSubject(e.target.value); setFilterTopic(''); }}>
              <option value="">All subjects</option>
              {trackSubjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="input-base" value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)} disabled={!filterSubject}>
              <option value="">All topics</option>
              {filterTopics.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[color:var(--color-border)] p-8 text-center text-[13px] text-slate-500 bg-slate-50/50">
              <FileText className="w-5 h-5 text-slate-400 mx-auto mb-2" />
              {pastPapers.length === 0 ? 'No past-paper questions uploaded yet.' : 'No questions match this filter.'}
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[520px] overflow-auto pr-1">
              {filtered.map((p) => (
                <div key={p.id} className="rounded-xl border border-[color:var(--color-border)] p-3.5 bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10.5px] font-semibold">{p.subject}</span>
                        <span className="px-2 py-0.5 rounded-md bg-violet-100 text-violet-700 text-[10.5px] font-semibold">{p.topic}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10.5px] font-semibold">{p.answerType}</span>
                        {p.difficulty && <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10.5px] font-semibold">{p.difficulty}</span>}
                        {p.year && <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10.5px] font-semibold">{p.year}</span>}
                        {p.marks && <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10.5px] font-semibold">{p.marks} marks</span>}
                      </div>
                      <div className="text-[13.5px] font-medium text-slate-900 leading-snug">{p.q}</div>
                      {p.answerType === 'Multiple choice' && Array.isArray(p.options) && (
                        <div className="text-[12.5px] text-slate-600 mt-1">Correct: <span className="font-medium text-emerald-700">{p.options[p.a]}</span></div>
                      )}
                      {p.answerType === 'Typed response' && (
                        <div className="text-[12.5px] text-slate-600 mt-1">Expected: <span className="font-medium text-emerald-700">{p.typedAnswer}</span></div>
                      )}
                      {p.answerType === 'Exam style' && (
                        <div className="text-[12.5px] text-slate-600 mt-1 flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>Keywords: <span className="font-medium text-slate-800">{(p.examKeywords || []).join(', ') || '—'}</span></span>
                        </div>
                      )}
                    </div>
                    <button onClick={() => { removePastPaper(p.id); toast.success('Question removed'); }} className="w-8 h-8 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center shrink-0" aria-label="Remove">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] tracking-[0.14em] uppercase font-semibold text-slate-500">{label}</span>
      {children}
    </label>
  );
}
