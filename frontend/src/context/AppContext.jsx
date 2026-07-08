import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

// NOTE on storage: this app does NOT store credentials, tokens, or PII secrets.
// Only non-sensitive study data (worksheet history, mistakes, theme, courses, settings).
// Auth tokens live in httpOnly cookies set by the backend, never localStorage.
const STORAGE_KEY = 'infinitysheets_state_v1';
const isProd = process.env.NODE_ENV === 'production';

// Prefer same-origin fetches so we work correctly across preview URLs even if
// REACT_APP_BACKEND_URL points at a stale subdomain. The k8s ingress routes
// /api on any preview URL to the FastAPI backend, so a relative URL always
// resolves correctly. Falls back to the env var only when there is no browser
// origin (e.g., SSR / build-time).
function resolveApiBase() {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }
  return process.env.REACT_APP_BACKEND_URL || '';
}

const API_BASE = resolveApiBase();

async function apiCall(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  if (!res.ok) {
    const detail = data?.detail;
    let message = 'Request failed';
    if (typeof detail === 'string') message = detail;
    else if (Array.isArray(detail)) message = detail.map((e) => e?.msg || JSON.stringify(e)).join(' ');
    else if (detail?.msg) message = detail.msg;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return data;
}

function logError(scope, err) {
  // Single place to plug into a real error tracker (Sentry, etc.) later.
  if (!isProd) {
    // Surface details locally for debugging; stay quiet in production.
    // eslint-disable-next-line no-console
    console.warn(`[AppContext:${scope}]`, err);
  }
}

const defaultState = {
  user: null, // { name, email, examTrack, subjects?, isDemo? }
  worksheets: [],
  mistakes: [],
  courses: [],
  pastPapers: [], // admin-uploaded past-paper questions
  streak: 0,
  lastStudyDate: null,
  tutorialDone: false,
  onboardingDone: false,
  theme: 'light',
  settings: {
    dailyGoal: 10,
    weeklyGoal: 50,
    frequency: '3-4 per week',
    defaultDifficulty: 'Medium',
    examDate: '',
    keyboardShortcuts: true,
  },
  questionsToday: 0,
  goalDate: null,
};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(defaultState);
  const [loaded, setLoaded] = useState(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({ ...defaultState, ...parsed });
      }
    } catch (err) {
      logError('hydrate', err);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Persist on every state change, but only after initial hydration completes
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      logError('persist', err);
    }
  }, [state, loaded]);

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [state.theme]);

  // Sync past papers from backend once we finish hydrating from localStorage.
  // Backend is the source of truth; localStorage only serves as a fast preview.
  useEffect(() => {
    if (!loaded) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await apiCall('/api/past-papers');
        if (!cancelled && Array.isArray(list)) {
          setState((s) => ({ ...s, pastPapers: list }));
        }
      } catch (err) {
        // Backend may be temporarily unreachable; keep local cache and try again on next load.
        logError('past-papers/hydrate', err);
      }
    })();
    return () => { cancelled = true; };
  }, [loaded]);

  const toggleTheme = useCallback(() => {
    setState((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }));
  }, []);

  const startDemo = useCallback(() => {
    setState((s) => ({
      ...s,
      user: { name: 'Demo Student', email: 'demo@infinitysheets.app', examTrack: 'CBSE', isDemo: true, subjects: [] },
      onboardingDone: true,
    }));
  }, []);

  const completeOnboarding = useCallback(({ examTrack, examDate, subjects, frequency, weeklyGoal }) => {
    setState((s) => ({
      ...s,
      user: { ...s.user, examTrack: examTrack || s.user?.examTrack, subjects: subjects || [] },
      settings: {
        ...s.settings,
        examDate: examDate || s.settings.examDate,
        frequency: frequency || s.settings.frequency,
        weeklyGoal: typeof weeklyGoal === 'number' ? weeklyGoal : s.settings.weeklyGoal,
      },
      onboardingDone: true,
    }));
  }, []);

  const restartOnboarding = useCallback(() => {
    setState((s) => ({ ...s, onboardingDone: false }));
  }, []);

  const signup = useCallback((user) => {
    setState((s) => ({ ...s, user }));
  }, []);

  const login = useCallback((email) => {
    setState((s) => {
      if (s.user && s.user.email === email) return s;
      return { ...s, user: s.user || { name: email.split('@')[0], email, examTrack: 'SSLC' } };
    });
  }, []);

  const logout = useCallback(() => {
    setState((s) => ({ ...s, user: null }));
  }, []);

  const apiRegister = useCallback(async ({ email, password, name, examTrack, subjects }) => {
    const me = await apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    setState((s) => ({
      ...s,
      user: {
        id: me.id,
        email: me.email,
        name: me.name,
        role: me.role || 'user',
        examTrack: examTrack || s.user?.examTrack || 'SSLC',
        subjects: subjects || s.user?.subjects || [],
        isDemo: false,
      },
    }));
    return me;
  }, []);

  const apiLogin = useCallback(async ({ email, password }) => {
    const me = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setState((s) => ({
      ...s,
      user: {
        ...(s.user && !s.user.isDemo && s.user.email === me.email ? s.user : {}),
        id: me.id,
        email: me.email,
        name: me.name,
        role: me.role || 'user',
        examTrack: (s.user && !s.user.isDemo ? s.user.examTrack : null) || 'SSLC',
        subjects: (s.user && !s.user.isDemo ? s.user.subjects : null) || [],
        isDemo: false,
      },
    }));
    return me;
  }, []);

  const apiLogout = useCallback(async () => {
    try {
      await apiCall('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      logError('logout', e);
    }
    setState((s) => ({ ...s, user: null }));
  }, []);

  const updateProfile = useCallback((patch) => {
    setState((s) => ({ ...s, user: { ...s.user, ...patch } }));
  }, []);

  const updateSettings = useCallback((patch) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const resetProgress = useCallback(() => {
    setState((s) => ({ ...s, worksheets: [], mistakes: [], streak: 0, questionsToday: 0, goalDate: null, lastStudyDate: null }));
  }, []);

  const deleteAccount = useCallback(() => {
    setState(defaultState);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      logError('deleteAccount', err);
    }
  }, []);

  const recordWorksheet = useCallback((sheet) => {
    setState((s) => {
      const today = new Date().toDateString();
      const lastDate = s.lastStudyDate;
      let streak = s.streak || 0;
      if (lastDate !== today) {
        if (lastDate) {
          const diffDays = Math.floor((new Date(today).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) streak += 1;
          else if (diffDays > 1) streak = 1;
        } else {
          streak = 1;
        }
      }
      const goalDate = today;
      const questionsToday = (s.goalDate === today ? s.questionsToday : 0) + sheet.total;
      const newMistakes = (sheet.questions || []).map((q, i) => {
        const wrong = Array.isArray(sheet.results) ? sheet.results[i] === false : sheet.answers[i] !== q.a;
        if (wrong) {
          return {
            id: `${sheet.id}-${i}`,
            subject: sheet.subject,
            topic: q._topic || sheet.topic,
            question: q.q,
            options: q.options || null,
            correct: q.a,
            given: sheet.answers[i],
            answerType: q.answerType || sheet.answerType || 'Multiple choice',
            typedAnswer: q.typedAnswer || null,
            examKeywords: q.examKeywords || null,
            date: sheet.date,
          };
        }
        return null;
      }).filter(Boolean);
      return {
        ...s,
        worksheets: [sheet, ...s.worksheets],
        mistakes: [...newMistakes, ...s.mistakes].slice(0, 200),
        streak,
        lastStudyDate: today,
        questionsToday,
        goalDate,
      };
    });
  }, []);

  const removeMistake = useCallback((id) => {
    setState((s) => ({ ...s, mistakes: s.mistakes.filter((m) => m.id !== id) }));
  }, []);

  const finishTutorial = useCallback(() => {
    setState((s) => ({ ...s, tutorialDone: true }));
  }, []);

  const restartTutorial = useCallback(() => {
    setState((s) => ({ ...s, tutorialDone: false }));
  }, []);

  const addCourse = useCallback((course) => {
    setState((s) => ({ ...s, courses: [{ id: `c_${Date.now()}`, addedAt: new Date().toISOString(), ...course }, ...s.courses] }));
  }, []);

  const removeCourse = useCallback((id) => {
    setState((s) => ({ ...s, courses: s.courses.filter((c) => c.id !== id) }));
  }, []);

  const updateCourse = useCallback((id, patch) => {
    setState((s) => ({ ...s, courses: s.courses.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  }, []);

  const refreshPastPapers = useCallback(async () => {
    try {
      const list = await apiCall('/api/past-papers');
      setState((s) => ({ ...s, pastPapers: Array.isArray(list) ? list : [] }));
      return list;
    } catch (err) {
      logError('past-papers/list', err);
      return null;
    }
  }, []);

  const addPastPaper = useCallback(async (pp) => {
    // Optimistic client-side add so the UI stays snappy even if the backend is slow.
    const tempId = `pp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const optimistic = { id: tempId, addedAt: new Date().toISOString(), source: 'past-paper', ...pp };
    setState((s) => ({ ...s, pastPapers: [optimistic, ...(s.pastPapers || [])] }));
    try {
      const saved = await apiCall('/api/past-papers', { method: 'POST', body: JSON.stringify(pp) });
      // Replace optimistic entry with the server-authoritative one.
      setState((s) => ({
        ...s,
        pastPapers: (s.pastPapers || []).map((p) => (p.id === tempId ? saved : p)),
      }));
      return saved;
    } catch (err) {
      logError('past-papers/create', err);
      // Roll back the optimistic add.
      setState((s) => ({ ...s, pastPapers: (s.pastPapers || []).filter((p) => p.id !== tempId) }));
      throw err;
    }
  }, []);

  const removePastPaper = useCallback(async (id) => {
    const before = state.pastPapers || [];
    setState((s) => ({ ...s, pastPapers: (s.pastPapers || []).filter((p) => p.id !== id) }));
    try {
      await apiCall(`/api/past-papers/${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch (err) {
      logError('past-papers/delete', err);
      // Rollback if the server rejected the delete.
      setState((s) => ({ ...s, pastPapers: before }));
      throw err;
    }
  }, [state.pastPapers]);

  // Stable context value — prevents needless rerenders of every consumer.
  const value = useMemo(() => ({
    state,
    loaded,
    signup,
    login,
    logout,
    apiRegister,
    apiLogin,
    apiLogout,
    updateProfile,
    updateSettings,
    resetProgress,
    deleteAccount,
    recordWorksheet,
    removeMistake,
    finishTutorial,
    restartTutorial,
    addCourse,
    removeCourse,
    updateCourse,
    addPastPaper,
    removePastPaper,
    refreshPastPapers,
    toggleTheme,
    startDemo,
    completeOnboarding,
    restartOnboarding,
  }), [
    state,
    loaded,
    signup,
    login,
    logout,
    apiRegister,
    apiLogin,
    apiLogout,
    updateProfile,
    updateSettings,
    resetProgress,
    deleteAccount,
    recordWorksheet,
    removeMistake,
    finishTutorial,
    restartTutorial,
    addCourse,
    removeCourse,
    updateCourse,
    addPastPaper,
    removePastPaper,
    refreshPastPapers,
    toggleTheme,
    startDemo,
    completeOnboarding,
    restartOnboarding,
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
