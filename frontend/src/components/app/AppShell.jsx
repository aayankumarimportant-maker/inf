import React from 'react';
import { LayoutDashboard, GraduationCap, Brain, FileText, Library, History, TrendingUp, Dumbbell, Sparkles, AlertTriangle, User, Settings, Shield } from 'lucide-react';
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
import TutorialOverlay from './TutorialOverlay';
import CourseWizard from './CourseWizard';
import QuestionBank from './QuestionBank';
import AdminPlaceholder from './AdminPlaceholder';
import Sidebar from './shell/Sidebar';
import DemoBanner from './shell/DemoBanner';
import TopHeader from './shell/TopHeader';
import { toast } from 'sonner';

const BASE_NAV = [
  { key: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { key: 'courses', label: 'My Courses', Icon: GraduationCap },
  { key: 'study', label: 'Start Studying', Icon: Brain },
  { key: 'qbank', label: 'Question Bank', Icon: Library },
  { key: 'history', label: 'Worksheet History', Icon: History },
  { key: 'progress', label: 'Progress', Icon: TrendingUp },
  { key: 'strengths', label: 'Strengths & Weaknesses', Icon: Dumbbell },
  { key: 'recommendations', label: 'Smart Recommendations', Icon: Sparkles },
  { key: 'profile', label: 'Profile', Icon: User },
  { key: 'settings', label: 'Settings', Icon: Settings },
];
const ADMIN_ITEM = { key: 'admin', label: 'Admin', Icon: Shield };
const HIDDEN_ROUTES = [
  { key: 'worksheets', label: 'Create a Worksheet', Icon: FileText },
  { key: 'mistakes', label: 'Mistake History', Icon: AlertTriangle },
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

function renderRoute(activeKey, params, go, isAdmin) {
  switch (activeKey) {
    case 'dashboard': return <Dashboard go={go} />;
    case 'courses': return <MyCourses />;
    case 'study': return <StartStudying go={go} subjectParam={params.subject} />;
    case 'worksheets': return <Worksheets go={go} />;
    case 'qbank': return <QuestionBank go={go} subjectParam={params.subject} />;
    case 'history': return <WorksheetHistory />;
    case 'progress': return <ProgressView />;
    case 'strengths': return <Strengths />;
    case 'recommendations': return <Recommendations go={go} />;
    case 'mistakes': return <Mistakes />;
    case 'profile': return <Profile />;
    case 'settings': return <SettingsView />;
    case 'admin': return isAdmin ? <AdminPlaceholder /> : <Dashboard go={go} />;
    default: return <Dashboard go={go} />;
  }
}

export default function AppShell({ hash }) {
  const { state, logout, apiLogout, toggleTheme, restartTutorial, restartOnboarding, resetProgress } = useApp();
  const { key: active, params } = parseHash(hash);
  const isDemo = !!state.user?.isDemo;
  const isAdmin = state.user?.role === 'admin';
  const NAV = isAdmin ? [...BASE_NAV, ADMIN_ITEM] : BASE_NAV;
  const ALL_ITEMS = [...NAV, ...HIDDEN_ROUTES];
  const current = ALL_ITEMS.find((n) => n.key === active) || NAV[0];

  const go = (k) => { window.location.hash = `#${k}`; };
  const isDark = state.theme === 'dark';
  const showOnboarding = !state.onboardingDone;
  const showTutorial = state.onboardingDone && !state.tutorialDone;

  const resetDemo = () => {
    resetProgress();
    restartOnboarding();
    restartTutorial();
    window.location.hash = '#dashboard';
    toast.success('Demo reset — starting setup from the top');
  };

  const exitAccount = async () => {
    if (isDemo) {
      logout();
    } else {
      await apiLogout();
    }
    window.location.hash = '';
  };

  return (
    <div className="min-h-screen section-bg grid grid-cols-[230px_1fr]">
      <Sidebar
        nav={NAV}
        activeKey={current.key}
        isDark={isDark}
        isDemo={isDemo}
        onNavigate={go}
        onToggleTheme={toggleTheme}
        onResetDemo={resetDemo}
        onLogout={exitAccount}
      />
      <main className="min-w-0 relative">
        {isDemo && <DemoBanner onResetDemo={resetDemo} onExit={exitAccount} />}
        <TopHeader
          examTrack={state.user?.examTrack || 'SSLC'}
          title={current.label}
          activeKey={current.key}
          isDark={isDark}
          courseCount={(state.courses || []).length}
          onToggleTheme={toggleTheme}
          onNewWorksheet={() => go('worksheets')}
        />
        <div className="px-8 py-7 max-w-[1280px]">
          {renderRoute(current.key, params, go, isAdmin)}
        </div>
      </main>

      {showOnboarding && <CourseWizard mode="onboarding" />}
      {showTutorial && <TutorialOverlay />}
    </div>
  );
}
