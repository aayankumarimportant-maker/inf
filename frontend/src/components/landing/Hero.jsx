import React from 'react';
import { ArrowRight, Play, Eye, Sparkles } from 'lucide-react';
import DashboardPreview from './DashboardPreview';
import InfinityBackground from '../decor/InfinityBackground';
import { useApp } from '../../context/AppContext';

export default function Hero() {
  const { startDemo } = useApp();
  const onDemo = () => { startDemo(); window.location.hash = '#dashboard'; };
  return (
    <section id="top" className="relative section-bg overflow-hidden">
      <InfinityBackground variant="hero" />
      <div className="absolute inset-0 grid-fade pointer-events-none" />
      <div className="relative max-w-[1280px] mx-auto px-6 pt-16 lg:pt-24 pb-20 lg:pb-28">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-gradient-to-r from-violet-50 to-blue-50 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11.5px] font-medium tracking-wide text-blue-700">AI-powered personalized learning</span>
            </div>
            <h1 className="h-display text-[52px] sm:text-[64px] lg:text-[76px]">
              A study tool <br />
              <span className="font-serif-italic text-gradient-vbc">tailored</span> just for you.
            </h1>
            <p className="mt-6 text-[16.5px] text-slate-500 max-w-[560px] leading-relaxed">
              InfinitySheets uses AI to identify your weaknesses, generate personalized worksheets, and guide your revision—helping you study smarter, not harder.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#signup" className="btn-violet inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[14.5px] font-medium shadow-sm">
                Start Free <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#how" className="btn-outline-dark inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[14.5px] font-medium">
                <Play className="w-4 h-4 text-cyan-600" /> Watch Demo
              </a>
              <button onClick={onDemo} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[14.5px] font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors">
                <Eye className="w-4 h-4" /> Try without signing up
              </button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-3 max-w-[560px]">
              <Stat num="2×" label="More effective than rereading" />
              <Stat num="89%" label="Better long-term retention" />
              <Stat num="100%" label="Personalized to you" />
            </div>
          </div>
          <div className="hidden lg:block">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ num, label }) {
  return (
    <div className="rounded-xl border border-[color:var(--color-border)] bg-white/80 backdrop-blur px-4 py-3 hover:border-blue-300 transition-colors">
      <div className="text-[20px] font-semibold tracking-tight text-gradient-vbc">{num}</div>
      <div className="text-[12px] text-slate-500 mt-0.5 leading-snug">{label}</div>
    </div>
  );
}
