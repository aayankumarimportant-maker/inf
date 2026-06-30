import React from 'react';
import { Infinity, LayoutDashboard, BookOpen, FileText, TrendingUp, Target, AlertCircle, User, Settings as SettingsIcon, LogOut, Sparkles, History, GraduationCap, Moon, Sun, Eye, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Dashboard from './Dashboard';
import StartStudying from './StartStudying';
import Worksheets from './Worksheets';
import WorksheetHistory from './WorksheetHistory';
import ProgressView from './ProgressView';
import Strengths from './Strengths';
import Mistakes from './Mistakes';
import Recommendations from './Recommendations';
import Profile from './Profile';
import SettingsView from './SettingsView';
import MyCourses from './MyCourses';
import Tutorial from './Tutorial';

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, emoji: '\u{1F680}' },
  { key: 'courses', label: 'My Courses', icon: GraduationCap, emoji: '\u{1F393}' },
  { key: 'study', label: 'Start Studying', icon: BookOpen, emoji: '\u{1F9E0}' },
  { key: 'worksheets', label: 'Worksheets', icon: FileText, emoji: '\u270F\uFE0F' },
  { key: 'history', label: 'Worksheet History', icon: History, emoji: '\u23F3' },
  { key: 'progress', label: 'Progress', icon: TrendingUp, emoji: '\u{1F4C8}' },
  { key: 'strengths', label: 'Strengths & Weaknesses', icon: Target, emoji: '\u{1F4AA}' },
  { key: 'recommendations', label: 'Smart Recommendations', icon: Sparkles, emoji: '\u2728' },
  { key: 'mistakes', label: 'Mistake History', icon: AlertCircle, emoji: '\u{1F9F1}' },
  { key: 'profile', label: 'Profile', icon: User, emoji: '\u{1F464}' },
  { key: 'settings', label: 'Settings', icon: SettingsIcon, emoji: '\u2699\uFE0F' },
];

function parseHash(hash) {
  const raw = (hash || '').replace(/^#/, '');
  const [key, query] = raw.split('?');
  const params = {};
  (query || '').split('&').filter(Boolean).forEach((pair) => {
    const [k, v = ''] = pair.split('=');
    params[k] = v;
  });
  return { key: key || 'dashboard', params };
}

export default function AppShell({ hash }) {
  const { state, logout, toggleTheme } = useApp();
  const { key: active, params } = parseHash(hash);
  const current = NAV.find((n) => n.key === active) || NAV[0];

  const go = (k) => { window.location.hash = `#${k}`; };

  if (!state.tutorialDone && active !== 'settings') {
    return <Tutorial onDone={() => go('dashboard')} />;
  }

  let content = null;
  switch (current.key) {
    case 'dashboard': content = <Dashboard go={go} />; break;
    case 'courses': content = <MyCourses />; break;
    case 'study': content = <StartStudying go={go} subjectParam={params.subject} />; break;
    case 'worksheets': content = <Worksheets go={go} />; break;
    case 'history': content = <WorksheetHistory />; break;
    case 'progress': content = <ProgressView />; break;
    case 'strengths': content = <Strengths />; break;
    case 'recommendations': content = <Recommendations go={go} />; break;
    case 'mistakes': content = <Mistakes />; break;
    case 'profile': content = <Profile />; break;
    case 'settings': content = <SettingsView />; break;
    default: content = <Dashboard go={go} />;
  }

  const isDemo = !!state.user?.isDemo;
  const isDark = state.theme === 'dark';

  return (
    <div className="min-h-screen section-bg grid grid-cols-[230px_1fr]">
      <aside className="border-r border-[color:var(--color-border)] flex flex-col bg-white relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-40 h-40 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-10 w-44 h-44 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative px-5 pt-5 pb-6 flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-[0_8px_24px_-8px_rgba(124,58,237,0.6)]">
            <Infinity className="w-5 h-5 text-white" strokeWidth={2.6} />
          </span>
          <div className="leading-tight">
            <div className="font-semibold text-[14.5px] tracking-tight">InfinitySheets</div>
            <div className="text-[10px] text-slate-500">{isDemo ? 'Demo session' : 'Adaptive study'}</div>
          </div>
        </div>
        <nav className="relative flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto">
          {NAV.map((n) => {
            const Icon = n.icon;
            const isActive = current.key === n.key;
            return (
              <button key={n.key} onClick={() => go(n.key)}
                className={`text-left text-[13.5px] px-3 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${isActive ? 'bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <span className={`w-6 h-6 rounded-md flex items-center justify-center ${isActive ? 'bg-white shadow-sm' : ''}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="flex-1">{n.label}</span>
                <span className="text-[12px] opacity-60">{n.emoji}</span>
              </button>
            );
          })}
        </nav>
        <div className="relative px-3 pb-4 pt-4 border-t border-[color:var(--color-border)] flex flex-col gap-1">
          <button onClick={toggleTheme} className="w-full text-left text-[13.5px] px-3 py-2 rounded-lg flex items-center gap-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-600" />}
            <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <button onClick={() => { logout(); window.location.hash = ''; }} className="w-full text-left text-[13.5px] px-3 py-2 rounded-lg flex items-center gap-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <LogOut className="w-4 h-4" />
            <span>{isDemo ? 'Exit demo' : 'Logout'}</span>
          </button>
        </div>
      </aside>
      <main className="min-w-0 relative">
        {isDemo && (
          <div className="px-8 pt-3">
            <div className="rounded-xl border border-blue-200/70 bg-gradient-to-r from-blue-50 via-violet-50 to-cyan-50 px-4 py-2.5 flex items-center justify-between gap-3 text-[13px] text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 text-white flex items-center justify-center"><Eye className="w-3.5 h-3.5" /></span>
                <span><span className="font-semibold">Demo mode</span> · explore the app without an account. Progress saves on this device.</span>
              </div>
              <button onClick={() => { logout(); window.location.hash = ''; }} className="inline-flex items-center gap-1 text-[12.5px] font-medium text-slate-600 hover:text-slate-900">
                <X className="w-3.5 h-3.5" /> Exit
              </button>
            </div>
          </div>
        )}
        <header className="px-8 pt-7 pb-2 flex items-start justify-between border-b border-[color:var(--color-border)] bg-white">
          <div>
            <div className="eyebrow-muted mb-1 flex items-center gap-2">
              <span>{state.user?.examTrack || 'SSLC'}</span>
              <span className="text-slate-400">{current.emoji}</span>
            </div>
            <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">{current.label}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="w-9 h-9 rounded-lg border border-[color:var(--color-border)] bg-white text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors" aria-label="Toggle theme">
              {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>
            {current.key === 'dashboard' && (
              <button onClick={() => go('worksheets')} className="btn-violet inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[14px] font-medium">
                <Sparkles className="w-4 h-4" /> New worksheet
              </button>
            )}
            {current.key === 'courses' && (
              <div className="text-[13px] text-slate-500">{(state.courses || []).length} course{(state.courses || []).length === 1 ? '' : 's'}</div>
            )}
          </div>
        </header>
        <div className="px-8 py-7 max-w-[1280px]">{content}</div>
      </main>
    </div>
  );
}
