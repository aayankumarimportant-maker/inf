import React from 'react';
import { Eye, X, RotateCcw } from 'lucide-react';

/**
 * Top strip shown only while the user is in demo mode. Provides quick
 * reset & exit affordances. Red hues on the destructive actions make the
 * risk visible.
 */
export default function DemoBanner({ onResetDemo, onExit }) {
  return (
    <div className="px-8 pt-3" data-testid="demo-banner">
      <div className="rounded-xl border border-blue-200/70 bg-blue-50 px-4 py-2.5 flex items-center justify-between gap-3 text-[13px] text-slate-700">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-[color:var(--color-primary)] text-white flex items-center justify-center">
            <Eye className="w-3.5 h-3.5" />
          </span>
          <span>
            <span className="font-semibold">Demo mode</span> · explore the app without an account. Progress saves on this device.
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onResetDemo}
            data-testid="demo-banner-reset"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12.5px] font-medium text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset demo
          </button>
          <button
            onClick={onExit}
            data-testid="demo-banner-exit"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12.5px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Exit
          </button>
        </div>
      </div>
    </div>
  );
}
