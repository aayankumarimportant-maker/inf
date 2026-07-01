import React from 'react';
import { Infinity, LogOut, Moon, Sun, RotateCcw } from 'lucide-react';

/**
 * Left navigation rail. Renders brand mark, nav items, and the bottom
 * theme / demo / logout controls. All handlers are provided by the parent shell.
 */
export default function Sidebar({ nav, activeKey, isDark, isDemo, onNavigate, onToggleTheme, onResetDemo, onLogout }) {
  return (
    <aside className="border-r border-[color:var(--color-border)] flex flex-col bg-white relative overflow-hidden">
      <div className="relative px-5 pt-5 pb-6 flex items-center gap-2">
        <span className="w-9 h-9 rounded-xl bg-[color:var(--color-primary)] flex items-center justify-center" data-testid="brand-mark">
          <Infinity className="w-5 h-5 text-white" strokeWidth={2.6} />
        </span>
        <div className="leading-tight">
          <div className="font-semibold text-[14.5px] tracking-tight">InfinitySheets</div>
          <div className="text-[10px] text-slate-500">{isDemo ? 'Demo session' : 'Adaptive study'}</div>
        </div>
      </div>
      <nav className="relative flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto" data-testid="sidebar-nav">
        {nav.map((n) => {
          const isActive = activeKey === n.key;
          const Icon = n.Icon;
          return (
            <button
              key={n.key}
              data-nav-key={n.key}
              data-testid={`nav-${n.key}`}
              onClick={() => onNavigate(n.key)}
              className={`text-left text-[13.5px] px-3 py-2 rounded-lg flex items-center gap-2.5 transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-slate-500'}`} strokeWidth={2} />
              <span className="flex-1">{n.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="relative px-3 pb-4 pt-4 border-t border-[color:var(--color-border)] flex flex-col gap-1">
        <button
          onClick={onToggleTheme}
          data-testid="sidebar-theme-toggle"
          className="w-full text-left text-[13.5px] px-3 py-2 rounded-lg flex items-center gap-2.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-600" />}
          <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
        </button>
        {isDemo && (
          <button
            onClick={onResetDemo}
            data-testid="sidebar-reset-demo"
            className="w-full text-left text-[13.5px] px-3 py-2 rounded-lg flex items-center gap-2.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-blue-600" />
            <span>Reset demo</span>
          </button>
        )}
        <button
          onClick={onLogout}
          data-testid="sidebar-logout"
          className="w-full text-left text-[13.5px] px-3 py-2 rounded-lg flex items-center gap-2.5 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{isDemo ? 'Exit demo' : 'Logout'}</span>
        </button>
      </div>
    </aside>
  );
}
