import React from 'react';
import { User } from '../types/auth';
import {
  Code2,
  PlusCircle,
  History,
  Languages,
  Settings,
  ShieldCheck,
  Layers,
  Bug,
  Home,
  LogOut,
  LogIn,
} from 'lucide-react';

interface SidebarProps {
  currentTab: 'workspace' | 'diff' | 'analysis' | 'validation';
  onSelectTab: (tab: 'workspace' | 'diff' | 'analysis' | 'validation') => void;
  onNewSession: () => void;
  onOpenHistory: () => void;
  onOpenLanguages: () => void;
  onOpenSettings: () => void;
  onGoHome?: () => void;
  user: User | null;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onSignOut: () => void;
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
  onGoHome,
  user,
  onOpenAuth,
  onSignOut,
  historyCount,
  activeProvider,
}) => {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0 select-none">
      {/* Top Branding & Primary Actions */}
      <div className="flex flex-col">
        {/* App Logo & Header */}
        <div
          onClick={onGoHome}
          className="p-4 border-b border-slate-800/80 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
          title="Return to Home Page"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
                <span>Smart Debugger</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">
                  AI
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Automated Bug Fixing</p>
            </div>
          </div>
          {onGoHome && (
            <button
              type="button"
              className="p-1.5 text-slate-400 hover:text-white rounded"
              title="Home"
            >
              <Home className="w-4 h-4" />
            </button>
          )}
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
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
            onClick={() => onSelectTab('analysis')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              currentTab === 'analysis'
                ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bug className="w-4 h-4 text-amber-400" />
            <span>Bug Diagnostics</span>
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
            <span>Tests & Verification</span>
          </button>
        </div>

        {/* Global Tools Section */}
        <div className="px-3 py-3 space-y-1 border-t border-slate-800/80">
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
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

      {/* Bottom User Profile & Engine Status */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
        {user ? (
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 truncate">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <div className="font-bold text-slate-200 text-[11px] truncate">{user.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onOpenAuth('signin')}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors border border-slate-700"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[10px] flex items-center justify-between text-slate-400">
          <span>Engine: {activeProvider === 'openrouter' ? 'Qwen2.5' : 'Gemini'}</span>
          <span className="text-emerald-400 font-bold">• Active</span>
        </div>
      </div>
    </aside>
  );
};
