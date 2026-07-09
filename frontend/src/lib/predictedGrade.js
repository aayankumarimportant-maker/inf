// Pure helpers used to derive a difficulty-adjusted, heavily-latest-biased
// predicted grade from a student's worksheet history.
//
// Design notes (per product requirement):
//  - Predicted grade is PER SUBJECT — never averaged across subjects.
//  - Difficulty of the worksheet shifts the predicted score:
//        Easy   → predicted lower than raw accuracy (0.85×)
//        Medium → mostly matches (0.92×)
//        Exam level → matches raw accuracy (1.00×)
//        Hard   → predicted higher than raw accuracy (1.15×)
//  - Recency weighting is very heavy on the LATEST worksheet.
//        weight = 0.5^k, where k is the number of worksheets AFTER this one
//        (0 for the newest). Convergent sum ≈ 2, so the latest attempt
//        contributes ~50% of the prediction, the previous ~25%, the one
//        before that ~12.5%, etc.
//  - Format of the label depends on the student's exam track (syllabus):
//        IB              → "6/7"          (1-7 scale, per-subject IB grade)
//        IGCSE / AS-A    → "A*", "A", ... (letter grade)
//        CBSE / ICSE /   → "82%"          (percentage)
//        SSLC / SAT /
//        JEE / NEET

// Difficulty adjustment applied to a single worksheet's raw score.
export const DIFF_ADJUST = {
  'Easy': 0.85,
  'Medium': 0.92,
  'Exam level': 1.0,
  'Hard': 1.15,
};

// Recency weighting: latest worksheet weight = 1, decays by RECENCY_DECAY
// each step back. 0.5 → latest ≈ 50%, prev ≈ 25%, ...
export const RECENCY_DECAY = 0.5;

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

/**
 * Compute the predicted score (0-100) for a single subject's worksheet list.
 * Accepts worksheets in any order — internally sorts by date descending so
 * that `worksheets[0]` is the newest attempt (and gets the highest weight).
 *
 * @param {Array<{score:number, correct?:number, total?:number, difficulty?:string, date?:string}>} worksheets
 * @returns {number} 0-100, or 0 when list is empty
 */
export function predictedScore(worksheets) {
  if (!worksheets || worksheets.length === 0) return 0;

  // Sort by date desc (newest first). Fall back to insertion order if no date.
  const sorted = [...worksheets].sort((a, b) => {
    const ta = a.date ? new Date(a.date).getTime() : 0;
    const tb = b.date ? new Date(b.date).getTime() : 0;
    return tb - ta;
  });

  let num = 0;
  let den = 0;
  sorted.forEach((w, i) => {
    const raw = typeof w.score === 'number'
      ? w.score
      : (w.total ? (w.correct / w.total) * 100 : 0);
    const adj = clamp(raw * (DIFF_ADJUST[w.difficulty] ?? DIFF_ADJUST.Medium), 0, 100);
    const weight = Math.pow(RECENCY_DECAY, i);
    num += adj * weight;
    den += weight;
  });

  if (den === 0) return 0;
  return Math.round(num / den);
}

// -----------------------------------------------------------------------------
// Grade formatting
// -----------------------------------------------------------------------------

// Percentage → IB grade (1-7). Per-subject only.
export function scoreToIBGrade(score) {
  if (score >= 85) return 7;
  if (score >= 75) return 6;
  if (score >= 65) return 5;
  if (score >= 55) return 4;
  if (score >= 45) return 3;
  if (score >= 30) return 2;
  return 1;
}

// Percentage → IGCSE / AS-A letter. Per-subject only.
export function scoreToLetterGrade(score) {
  if (score >= 90) return 'A*';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  if (score >= 40) return 'E';
  if (score >= 30) return 'F';
  if (score >= 20) return 'G';
  return 'U';
}

/**
 * Format a per-subject predicted score for display based on the student's
 * exam track. Returns { label, sub, tone } where:
 *   label — the primary text ("6/7", "A", "82%")
 *   sub   — small helper text under the label
 *   tone  — 'good' | 'ok' | 'weak' — driving colour of the pill
 *
 * @param {number} score      0-100 predicted score
 * @param {string} examTrack  e.g. 'IB', 'IGCSE', 'ASA', 'CBSE', ...
 */
export function formatGrade(score, examTrack) {
  const s = Math.round(score);
  let tone = 'weak';
  if (s >= 70) tone = 'good';
  else if (s >= 45) tone = 'ok';

  const track = (examTrack || '').toUpperCase();
  if (track === 'IB') {
    const g = scoreToIBGrade(s);
    return { label: `${g}/7`, sub: `Predicted IB grade`, tone };
  }
  if (track === 'IGCSE' || track === 'ASA') {
    const g = scoreToLetterGrade(s);
    const trackLabel = track === 'ASA' ? 'A Level' : 'IGCSE';
    return { label: g, sub: `Predicted ${trackLabel} grade`, tone };
  }
  // CBSE, ICSE, SSLC, SAT, JEE, NEET → percentage
  return { label: `${s}%`, sub: 'Predicted score', tone };
}

// Tailwind classes for the tone (kept in one place so the whole app stays consistent).
export const TONE_CLASSES = {
  good: {
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  ok: {
    text: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  weak: {
    text: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
};

// True if the predicted grade for this track should be shown as a "grade"
// (IB/IGCSE/ASA) rather than a percentage. Handy for UI copy.
export function isGradedTrack(examTrack) {
  const t = (examTrack || '').toUpperCase();
  return t === 'IB' || t === 'IGCSE' || t === 'ASA';
}
