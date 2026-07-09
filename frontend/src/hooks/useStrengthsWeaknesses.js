import { useEffect, useMemo, useState } from 'react';

// Clamp helper
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

// localStorage key shared with the Strengths page for user overrides.
const PREFS_KEY = 'infinitysheets_sw_prefs_v1';

/**
 * Migrate any older payload shape to the new one so returning users don't lose
 * their customization. Old shape stored `overrides` at the top level (applied
 * globally). New shape splits into `globalOverrides` (used when the "All
 * subjects" view is active) and `subjectOverrides` (per-subject, independent).
 */
function normalizePrefs(raw) {
  if (!raw) return { globalOverrides: null, subjectOverrides: {} };
  const p = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const out = {
    globalOverrides: null,
    subjectOverrides: {},
  };
  if (p.globalOverrides && typeof p.globalOverrides === 'object') {
    out.globalOverrides = {
      strengthMin: p.globalOverrides.strengthMin != null ? Number(p.globalOverrides.strengthMin) : null,
      weaknessMax: p.globalOverrides.weaknessMax != null ? Number(p.globalOverrides.weaknessMax) : null,
    };
  } else if (p.overrides && typeof p.overrides === 'object') {
    // Legacy: single `overrides` object → treat as global.
    out.globalOverrides = {
      strengthMin: p.overrides.strengthMin != null ? Number(p.overrides.strengthMin) : null,
      weaknessMax: p.overrides.weaknessMax != null ? Number(p.overrides.weaknessMax) : null,
    };
  }
  if (p.subjectOverrides && typeof p.subjectOverrides === 'object') {
    Object.entries(p.subjectOverrides).forEach(([k, v]) => {
      if (v && typeof v === 'object') {
        out.subjectOverrides[k] = {
          strengthMin: v.strengthMin != null ? Number(v.strengthMin) : null,
          weaknessMax: v.weaknessMax != null ? Number(v.weaknessMax) : null,
        };
      }
    });
  }
  return out;
}

function readPrefs() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(PREFS_KEY) : null;
    if (!raw) return { globalOverrides: null, subjectOverrides: {} };
    return normalizePrefs(raw);
  } catch (_e) {
    return { globalOverrides: null, subjectOverrides: {} };
  }
}

/**
 * Live-updating read of the saved threshold prefs. Consumers get both the
 * global overrides and the per-subject map. Handy for the Strengths page and
 * anything else that needs both.
 */
function useSavedSwPrefs() {
  const [prefs, setPrefs] = useState(readPrefs);
  useEffect(() => {
    const handler = (e) => {
      if (!e || e.key === PREFS_KEY || e.key === null) setPrefs(readPrefs());
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handler);
      const t = setTimeout(() => setPrefs(readPrefs()), 300);
      return () => { window.removeEventListener('storage', handler); clearTimeout(t); };
    }
    return undefined;
  }, []);
  return prefs;
}

/**
 * Returns the GLOBAL overrides only. Used by Dashboard / Smart Recommendations
 * whose scope is the whole student profile, not a specific subject.
 */
export function useSavedSwOverrides() {
  return useSavedSwPrefs().globalOverrides;
}

/**
 * Returns the effective overrides for a specific subject scope. Subject
 * overrides are INDEPENDENT — they do not fall back to the global overrides
 * (per product spec). Pass `null` / `'all'` to get the global scope.
 */
export function useSavedSwOverridesFor(subject) {
  const prefs = useSavedSwPrefs();
  if (!subject || subject === 'all') return prefs.globalOverrides;
  return prefs.subjectOverrides?.[subject] || null;
}

// Non-hook variant of the same lookup, for use inside memos.
export function pickOverridesFor(prefs, subject) {
  if (!prefs) return null;
  if (!subject || subject === 'all') return prefs.globalOverrides;
  return prefs.subjectOverrides?.[subject] || null;
}

/**
 * Shared strengths/weaknesses computation used across the app (Strengths page,
 * Dashboard, Smart Recommendations).
 *
 * Adaptive thresholds are derived from the student's own weighted-average
 * accuracy across all completed topics:
 *
 *   adaptiveStrengthMin = round(avg + 10), clamped to [60, 90]
 *   adaptiveWeaknessMax = round(avg - 10), clamped to [20, 55]
 *
 * A minimum 10-pt gap is enforced so the buckets never overlap.
 *
 * The caller may override either threshold via the `overrides` argument to
 * support "Customize" mode. `isCustom` is true whenever the effective values
 * differ from the adaptive defaults.
 *
 * @param {Array} worksheets  - list of worksheet records ({subject, topic, correct, total})
 * @param {{strengthMin?: number|null, weaknessMax?: number|null}} [overrides]
 */
export function useStrengthsWeaknesses(worksheets, overrides) {
  const ws = worksheets || [];

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

  const adaptive = useMemo(() => {
    const totalCorrect = byTopic.reduce((s, t) => s + t.correct, 0);
    const totalQ = byTopic.reduce((s, t) => s + t.total, 0);
    const avg = totalQ ? Math.round((totalCorrect / totalQ) * 100) : 0;
    let strengthMin = clamp(Math.round(avg + 10), 60, 90);
    let weaknessMax = clamp(Math.round(avg - 10), 20, 55);
    if (weaknessMax >= strengthMin - 10) weaknessMax = strengthMin - 10;
    return { avg, strengthMin, weaknessMax };
  }, [byTopic]);

  const effective = useMemo(() => {
    const ov = overrides || {};
    let strengthMin = ov.strengthMin != null ? Number(ov.strengthMin) : adaptive.strengthMin;
    let weaknessMax = ov.weaknessMax != null ? Number(ov.weaknessMax) : adaptive.weaknessMax;
    // Guardrails: keep sensible bounds & minimum 5-pt gap
    strengthMin = clamp(strengthMin, 10, 100);
    weaknessMax = clamp(weaknessMax, 0, 90);
    if (weaknessMax >= strengthMin - 5) weaknessMax = Math.max(0, strengthMin - 5);
    return { strengthMin, weaknessMax };
  }, [adaptive, overrides]);

  const isCustom = useMemo(() => {
    return (
      effective.strengthMin !== adaptive.strengthMin ||
      effective.weaknessMax !== adaptive.weaknessMax
    );
  }, [effective, adaptive]);

  const strengths = useMemo(
    () => byTopic.filter((t) => t.acc >= effective.strengthMin),
    [byTopic, effective.strengthMin]
  );
  const weaknesses = useMemo(
    () => byTopic.filter((t) => t.acc < effective.weaknessMax),
    [byTopic, effective.weaknessMax]
  );

  return {
    byTopic,
    avg: adaptive.avg,
    adaptiveStrengthMin: adaptive.strengthMin,
    adaptiveWeaknessMax: adaptive.weaknessMax,
    strengthMin: effective.strengthMin,
    weaknessMax: effective.weaknessMax,
    isCustom,
    strengths,
    weaknesses,
  };
}

export default useStrengthsWeaknesses;
