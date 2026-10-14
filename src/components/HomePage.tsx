import React from 'react';
import { User } from '../types/auth';
import {
  Bug,
  Code2,
  Layers,
  ShieldCheck,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Terminal,
  Play,
  History,
  LogIn,
  LogOut,
  User as UserIcon,
  Sparkles,
  FileCode,
  Zap,
  Lock,
} from 'lucide-react';

interface HomePageProps {
  user: User | null;
  onOpenWorkspace: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onSignOut: () => void;
  onOpenLanguages: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  user,
  onOpenWorkspace,
  onOpenAuth,
  onSignOut,
  onOpenLanguages,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none overflow-y-auto">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
              <span>Smart Debugger</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Automated Bug Fixing System</p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <a href="#features" className="hover:text-blue-600 transition-colors">
            Features
          </a>
          <a href="#languages" className="hover:text-blue-600 transition-colors">
            Languages
          </a>
          <a href="#architecture" className="hover:text-blue-600 transition-colors">
            Architecture
          </a>
          <a href="#workflow" className="hover:text-blue-600 transition-colors">
            Workflow
          </a>
        </nav>

        {/* Auth / Action Area */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="font-bold text-slate-800 leading-none text-[11px]">{user.name}</div>
                  <div className="text-[10px] text-slate-500 leading-tight">{user.role || 'Developer'}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenWorkspace}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
              >
                <span>Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onSignOut}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAuth('signin')}
                className="px-3 py-1.5 text-slate-700 hover:text-slate-900 text-xs font-bold hover:bg-slate-100 rounded-lg transition-colors"
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth('signup')}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
              >
                Create Account
              </button>

              <button
                type="button"
                onClick={onOpenWorkspace}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-16 pb-20 max-w-6xl mx-auto w-full text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200 mb-6 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Real Dynamic AST & LLM Developer Diagnostics</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mb-6">
          Automated Code Debugging &amp; Surgical Bug Remediation
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed mb-8">
          Localize syntax errors, subtle boundary conditions, and runtime traps across 10 programming
          languages. Inspect exact root causes, compare side-by-side Monaco diffs, and verify fixes
          with real dynamic execution.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
          <button
            type="button"
            onClick={onOpenWorkspace}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/25 transition-all active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Open Debugging Workspace</span>
          </button>

          {!user && (
            <button
              type="button"
              onClick={() => onOpenAuth('signin')}
              className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-sm font-bold shadow-2xs transition-all active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4 text-slate-600" />
              <span>Sign In to Save Sessions</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenLanguages}
            className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-sm font-bold shadow-2xs transition-all active:scale-[0.98]"
          >
            <FileCode className="w-4 h-4 text-blue-600" />
            <span>Supported Languages</span>
          </button>
        </div>

        {/* Live Interactive Code Preview Mockup */}
        <div className="w-full max-w-4xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden text-left font-mono text-xs">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-slate-400 text-[11px] ml-2 font-mono">
                solution.py • Real Diff View
              </span>
            </div>
            <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Surgically Corrected &amp; Verified</span>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/90 text-[12px] leading-relaxed">
            {/* Left: Original faulty code */}
            <div className="space-y-1">
              <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-rose-400 mb-2">
                Original Code (With Mutable Trap)
              </div>
              <div className="text-slate-500">1 | def track_actions(action, log=[]):</div>
              <div className="text-rose-400 bg-rose-950/40 p-1 rounded">
                - 2 |     # Default list shared across calls
              </div>
              <div className="text-slate-400">3 |     log.append(action)</div>
              <div className="text-slate-400">4 |     return log</div>
            </div>

            {/* Right: Corrected code */}
            <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
              <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-emerald-400 mb-2">
                Corrected Surgical Fix
              </div>
              <div className="text-slate-500">1 | def track_actions(action, log=None):</div>
              <div className="text-emerald-400 bg-emerald-950/40 p-1 rounded">
                + 2 |     if log is None: log = []
              </div>
              <div className="text-slate-400">3 |     log.append(action)</div>
              <div className="text-slate-400">4 |     return log</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 py-16 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              Engineered for Precision Debugging
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Unlike generic chatbot assistants, Smart Debugger provides surgical compiler diagnostics
              and side-by-side diffing without rewriting your codebase.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Monaco Code Editor</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full-featured VS Code editor inside the browser with real-time error marker decorations,
                font scaling, line jumping, and drag-and-drop file upload.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                <Bug className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Root Cause Analysis</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clear technical breakdowns explaining *why* a failure happens according to language
                runtime specifications, zero-index boundaries, or memory rules.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Monaco Diff Viewer</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inspect added lines (+) and removed lines (-) side-by-side or inline, with 1-click
                "Apply to Editor" and source code download.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Dynamic Test Runner</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Executes user-defined test inputs against actual code in real Python 3 and Node.js VM
                sandboxes, capturing genuine output and exceptions.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Dual AI Reasoning</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Powered by Qwen2.5 Coder 32B Instruct via OpenRouter and Google Gemini, configured with
                deterministic low-temperature precision.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center mb-4">
                <History className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Audited Session History</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every debugging run is securely recorded with issue summaries, timestamps, diff versions,
                and 1-click restore functionality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Languages Section */}
      <section id="languages" className="px-6 py-16 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Multi-Language Compiler Support
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Native syntax AST parsing and semantic bug localization across the top languages:
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {[
            { name: 'Python', ext: '.py', desc: 'Mutable traps, off-by-one, AST parse' },
            { name: 'JavaScript', ext: '.js', desc: 'Async closures, unhandled rejections' },
            { name: 'TypeScript', ext: '.ts', desc: 'Type narrowing, null safety' },
            { name: 'Java', ext: '.java', desc: 'ConcurrentModification, NPEs' },
            { name: 'C++', ext: '.cpp', desc: 'Memory leaks, buffer boundary' },
            { name: 'C', ext: '.c', desc: 'Pointer arithmetic, boundary checks' },
            { name: 'Go', ext: '.go', desc: 'Channel deadlocks, nil pointers' },
            { name: 'Rust', ext: '.rs', desc: 'Borrow checker invariants' },
            { name: 'Ruby', ext: '.rb', desc: 'Block scope, nil safety' },
            { name: 'PHP', ext: '.php', desc: 'Type safety modes, sanitize' },
          ].map((lang) => (
            <div
              key={lang.name}
              className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 transition-colors"
            >
              <div className="font-bold text-slate-900 text-xs mb-0.5">{lang.name}</div>
              <div className="font-mono text-[10px] text-blue-600 font-semibold mb-1">{lang.ext}</div>
              <div className="text-[11px] text-slate-500 leading-tight">{lang.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="px-6 py-14 bg-slate-900 text-white mt-auto">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            Ready to Debug Your Source Code?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mb-6">
            Upload any source file or paste code directly into the Monaco editor to identify defects and
            generate verified fixes instantly.
          </p>
          <button
            type="button"
            onClick={onOpenWorkspace}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
          >
            <span>Launch Smart Debugger Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 bg-slate-950 text-slate-400 text-xs border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="font-bold text-slate-300">Smart Code Debugger</span> • AI Automated Bug Fixing System
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <button type="button" onClick={onOpenWorkspace} className="hover:text-white transition-colors">
            Workspace
          </button>
          <button type="button" onClick={onOpenLanguages} className="hover:text-white transition-colors">
            Languages
          </button>
          <span>Privacy &amp; Security</span>
        </div>
      </footer>
    </div>
  );
};
