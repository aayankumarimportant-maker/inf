import React, { useState } from 'react';
import { Infinity, Menu, X, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Navbar({ onStart }) {
  const [open, setOpen] = useState(false);
  const { startDemo } = useApp();
  const tryDemo = () => { startDemo(); window.location.hash = '#dashboard'; };
  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Pricing', href: '#pricing' },
  ];
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-[color:var(--color-border)]">
      <div className="max-w-[1280px] mx-auto px-6 h-[60px] flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-[0_8px_24px_-10px_rgba(124,58,237,0.6)] group-hover:scale-105 transition-transform">
            <Infinity className="w-5 h-5 text-white" strokeWidth={2.6} />
          </span>
          <span className="font-semibold text-[15px] tracking-tight text-slate-900">InfinitySheets</span>
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-[14px] text-slate-600 hover:text-slate-900 transition-colors">{l.label}</a>
          ))}
          <a href="#signup" className="text-[14px] font-medium text-slate-900">Log In</a>
          <a href="#signup" className="text-[14px] font-medium text-slate-900">Sign Up</a>
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={tryDemo} className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13.5px] font-medium text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors">
            <Eye className="w-3.5 h-3.5" /> Try Demo
          </button>
          <button onClick={onStart} className="btn-violet hidden md:inline-flex px-4 py-2 rounded-lg text-[14px] font-medium shadow-sm">Start Free</button>
          <button onClick={() => setOpen(!open)} className="md:hidden w-9 h-9 inline-flex items-center justify-center rounded-md hover:bg-slate-100">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-[color:var(--color-border)] bg-white">
          <div className="px-6 py-4 flex flex-col gap-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-[14px] text-slate-700">{l.label}</a>
            ))}
            <a href="#signup" onClick={() => setOpen(false)} className="text-[14px] font-medium">Log In</a>
            <a href="#signup" onClick={() => setOpen(false)} className="text-[14px] font-medium">Sign Up</a>
            <button onClick={tryDemo} className="mt-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[14px] font-medium text-blue-700 border border-blue-200 bg-blue-50">
              <Eye className="w-3.5 h-3.5" /> Try Demo
            </button>
            <button onClick={onStart} className="btn-violet px-4 py-2 rounded-lg text-[14px] font-medium">Start Free</button>
          </div>
        </div>
      )}
    </header>
  );
}
