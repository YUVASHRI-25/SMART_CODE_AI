import React from 'react';
import { User } from '../types/auth';
import {
  Bug,
  ArrowRight,
  LogOut,
  Code2,
} from 'lucide-react';

interface HomePageProps {
  user: User | null;
  onOpenWorkspace: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onSignOut: () => void;
  onOpenLanguages?: () => void;
  onSelectSample?: (sample: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  user,
  onOpenWorkspace,
  onOpenAuth,
  onSignOut,
}) => {
  return (
    <div className="w-full flex-1 min-h-screen h-full bg-slate-50 text-slate-800 flex flex-col font-sans select-none overflow-y-auto overflow-x-hidden">
      {/* 1. Header (Clean & Minimal) */}
      <header className="w-full shrink-0 sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs">
            <Bug className="w-4 h-4 text-blue-400" />
          </div>
          <span className="font-bold text-slate-900 text-sm tracking-tight whitespace-nowrap">
            Smart Code Debugger
          </span>
        </div>

        {/* User / Action Area */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-slate-700 font-medium text-xs hidden sm:inline">{user.name}</span>
              </div>
              <button
                type="button"
                onClick={onOpenWorkspace}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onSignOut}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => onOpenAuth('signin')}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={onOpenWorkspace}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <span>Open Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-4xl mx-auto w-full text-center">
        {/* Unboxed Metadata Tagline */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-4">
          <span>Static AST Diagnostics</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>Surgical Bug Remediation</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>Monaco Diff Inspection</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight max-w-2xl mb-4 text-balance">
          Automated Code Debugging &amp; Surgical Bug Fixing
        </h1>

        {/* Clear Subtitle */}
        <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed mb-8">
          Localize syntax errors, logical bugs, and boundary traps. Inspect root causes with side-by-side Monaco diffs and verify fixes with real test execution.
        </p>

        {/* Primary CTA Button */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            type="button"
            onClick={onOpenWorkspace}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all cursor-pointer"
          >
            <span>Launch Debugging Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Clean Code Preview Card */}
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden text-left">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs">
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Python • Mutable Default Argument Fix</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">Verified Fix</span>
          </div>

          <div className="p-4 bg-slate-900 text-slate-100 font-mono text-[12px] leading-relaxed overflow-x-auto">
            <pre className="text-slate-300">
              <code>
                <span className="text-slate-500">1 | def track_user_actions(action, log_history=[]):</span>{'\n'}
                <span className="text-rose-400 bg-rose-950/60 block px-1 -mx-1 rounded">
                  - 2 |     # Mutable default parameter persists across calls!
                </span>
                <span className="text-emerald-400 bg-emerald-950/60 block px-1 -mx-1 rounded">
                  + 2 | def track_user_actions(action, log_history=None):
                </span>
                <span className="text-emerald-400 bg-emerald-950/60 block px-1 -mx-1 rounded">
                  + 3 |     if log_history is None: log_history = []
                </span>
                <span className="text-slate-500">4 |     log_history.append(action)</span>{'\n'}
                <span className="text-slate-500">5 |     return len(log_history)</span>
              </code>
            </pre>
          </div>

          <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Surgically isolates mutable traps without rewriting structure.</span>
            <button
              type="button"
              onClick={onOpenWorkspace}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <span>Try in Workspace</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </main>

      {/* 3. Quiet Minimal Footer */}
      <footer className="w-full shrink-0 px-6 py-4 bg-white border-t border-slate-200 text-slate-400 text-xs flex items-center justify-between mt-auto">
        <span>Smart Code Debugger</span>
        <button
          type="button"
          onClick={onOpenWorkspace}
          className="text-slate-600 hover:text-slate-900 font-medium text-xs transition-colors cursor-pointer"
        >
          Open Workspace →
        </button>
      </footer>
    </div>
  );
};
