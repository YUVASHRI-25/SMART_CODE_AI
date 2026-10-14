import React, { useState } from 'react';
import { HistorySession } from '../types/debugger';
import {
  History,
  X,
  Trash2,
  Calendar,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
} from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: HistorySession[];
  onSelectSession: (session: HistorySession) => void;
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
  onDeleteSession,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLang, setFilterLang] = useState<string>('all');

  if (!isOpen) return null;

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.fileName && s.fileName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLang = filterLang === 'all' || s.language === filterLang;
    return matchesSearch && matchesLang;
  });

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800 text-sm">Debugging History</h3>
            <span className="text-xs text-slate-500 font-mono">({sessions.length})</span>
          </div>

          <div className="flex items-center gap-2">
            {sessions.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs text-rose-600 hover:text-rose-800 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                title="Clear all session history"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3 border-b border-slate-200 bg-white space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search history by summary or language..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1">
            {['all', 'python', 'javascript', 'typescript', 'java', 'cpp', 'go'].map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setFilterLang(lang)}
                className={`px-2 py-0.5 rounded capitalize whitespace-nowrap text-[11px] font-medium transition-colors ${
                  filterLang === lang
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              {sessions.length === 0
                ? 'No debugging history recorded yet. Analyze code to save sessions.'
                : 'No sessions matched your filter.'}
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className="p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-lg shadow-xs transition-all text-xs space-y-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold uppercase text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-mono">
                      {session.language}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(session.timestamp)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-0.5 transition-opacity"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="font-medium text-slate-800 line-clamp-2 leading-snug">
                  {session.summary}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                      {session.issueCount} {session.issueCount === 1 ? 'issue' : 'issues'}
                    </span>
                    {session.validationStatus === 'passed' && (
                      <span className="text-emerald-700 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Fix Verified
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectSession(session);
                      onClose();
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline"
                  >
                    <span>Load</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
