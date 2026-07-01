import React from 'react';
import { Moon, Sun, Sparkles } from 'lucide-react';

/**
 * Page header shown at the top of every dashboard page.
 * Displays the eyebrow exam track, the page title, and the primary
 * page-scoped action (currently only rendered on the dashboard route).
 */
export default function TopHeader({ examTrack, title, activeKey, isDark, courseCount, onToggleTheme, onNewWorksheet }) {
  return (
    <header className="px-8 pt-7 pb-2 flex items-start justify-between border-b border-[color:var(--color-border)] bg-white" data-testid="top-header">
      <div>
        <div className="eyebrow-muted mb-1 flex items-center gap-2">
          <span>{examTrack}</span>
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight text-slate-900" data-testid="page-title">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleTheme}
          className="w-9 h-9 rounded-lg border border-[color:var(--color-border)] bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors"
          aria-label="Toggle theme"
          data-testid="header-theme-toggle"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-600" />}
        </button>
        {activeKey === 'dashboard' && (
          <button
            onClick={onNewWorksheet}
            data-testid="header-new-worksheet"
            className="btn-violet inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[14px] font-medium"
          >
            <Sparkles className="w-4 h-4" /> New worksheet
          </button>
        )}
        {activeKey === 'courses' && (
          <div className="text-[13px] text-slate-500" data-testid="header-course-count">
            {courseCount} course{courseCount === 1 ? '' : 's'}
          </div>
        )}
      </div>
    </header>
  );
}
