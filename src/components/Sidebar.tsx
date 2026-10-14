import React from 'react';
import {
  Code2,
  PlusCircle,
  History,
  Languages,
  Settings,
  ShieldCheck,
  Cpu,
  Layers,
  Bug,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentTab: 'workspace' | 'diff' | 'analysis' | 'validation';
  onSelectTab: (tab: 'workspace' | 'diff' | 'analysis' | 'validation') => void;
  onNewSession: () => void;
  onOpenHistory: () => void;
  onOpenLanguages: () => void;
  onOpenSettings: () => void;
  historyCount: number;
  activeProvider: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onNewSession,
  onOpenHistory,
  onOpenLanguages,
  onOpenSettings,
  historyCount,
  activeProvider,
}) => {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0 select-none">
      {/* Top Branding & Primary Actions */}
      <div className="flex flex-col">
        {/* App Logo & Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
              <span>Smart Debugger</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">
                AI
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Automated Bug Fixing System</p>
          </div>
        </div>

        {/* New Session Button */}
        <div className="p-3">
          <button
            type="button"
            onClick={onNewSession}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm shadow-blue-600/30 active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Debugging Session</span>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="px-3 py-2 space-y-1">
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Workspace Views
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('workspace')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentTab === 'workspace'
                ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Code2 className="w-4 h-4 text-blue-400" />
            <span>Code Editor</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('analysis')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentTab === 'analysis'
                ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bug className="w-4 h-4 text-amber-400" />
            <span>Bug Analysis</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('diff')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentTab === 'diff'
                ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Diff Comparison</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('validation')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentTab === 'validation'
                ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Validation & Tests</span>
          </button>
        </div>

        {/* Global Tools Section */}
        <div className="px-3 py-3 space-y-1 border-t border-slate-800/80">
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Explorer & Tools
          </div>

          <button
            type="button"
            onClick={onOpenHistory}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4 text-slate-400" />
              <span>Debugging History</span>
            </div>
            <span className="font-mono text-[10px] px-1.5 py-0.2 bg-slate-800 rounded text-slate-400">
              {historyCount}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenLanguages}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <Languages className="w-4 h-4 text-slate-400" />
            <span>Supported Languages</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings & Models</span>
          </button>
        </div>
      </div>

      {/* Bottom Status Panel */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">AI Engine</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Connected
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300 font-mono text-[10px]">
            <span className="truncate">
              {activeProvider === 'openrouter' ? 'Qwen2.5 Coder 32B' : 'Gemini 3.8 Flash'}
            </span>
            <span className="text-[10px] uppercase font-semibold text-blue-400">
              {activeProvider === 'openrouter' ? 'OR' : '1P'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
