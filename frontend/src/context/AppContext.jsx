import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

// NOTE on storage: this app does NOT store credentials, tokens, or PII secrets.
// Only non-sensitive study data (worksheet history, mistakes, theme, courses, settings).
// Passwords are entered for signup/login UX but never persisted. If you ever add
// auth tokens, do not place them in localStorage — use httpOnly cookies instead.
const STORAGE_KEY = 'infinitysheets_state_v1';
const isProd = process.env.NODE_ENV === 'production';

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
  streak: 0,
  lastStudyDate: null,
  tutorialDone: false,
  onboardingDone: false,
  theme: 'light',
  settings: {
    dailyGoal: 10,
    defaultDifficulty: 'Mixed exam practice',
    examDate: '',
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

  const completeOnboarding = useCallback(({ examTrack, examDate, subjects }) => {
    setState((s) => ({
      ...s,
      user: { ...s.user, examTrack: examTrack || s.user?.examTrack, subjects: subjects || [] },
      settings: { ...s.settings, examDate: examDate || s.settings.examDate },
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
        if (sheet.answers[i] !== q.a) {
          return { id: `${sheet.id}-${i}`, subject: sheet.subject, topic: sheet.topic, question: q.q, options: q.options, correct: q.a, given: sheet.answers[i], date: sheet.date };
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

  // Stable context value — prevents needless rerenders of every consumer.
  const value = useMemo(() => ({
    state,
    loaded,
    signup,
    login,
    logout,
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
