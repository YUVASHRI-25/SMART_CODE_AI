import React, { useState } from 'react';
import { CodeIssue, DebugResponse } from '../types/debugger';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  ShieldAlert,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  FileText,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Code,
  Search,
  Filter,
  Check,
} from 'lucide-react';

interface BugAnalysisPanelProps {
  debugResponse: DebugResponse | null;
  onSelectIssueLine?: (line: number) => void;
  onViewDiff?: () => void;
}

export const BugAnalysisPanel: React.FC<BugAnalysisPanelProps> = ({
  debugResponse,
  onSelectIssueLine,
  onViewDiff,
}) => {
  const [expandedIssueIds, setExpandedIssueIds] = useState<Record<string, boolean>>({});
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!debugResponse) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
          <Code className="w-6 h-6 text-slate-500" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 mb-1">Diagnostics Ready</h3>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          Type, paste, or upload code, then click <span className="font-semibold text-blue-600">"Analyze & Fix Code"</span> to inspect language-specific syntax errors, logical bugs, and line-by-line root causes.
        </p>
      </div>
    );
  }

  const { issues, summary, changes, assumptions, uncertainties, model_used } = debugResponse;

  const toggleExpand = (id: string) => {
    setExpandedIssueIds((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const getSeverityBadge = (severity: string, type: string) => {
    if (type === 'syntax' || severity === 'critical') {
      return {
        label: 'Error',
        badge: 'bg-rose-100 text-rose-800 border-rose-300',
        dot: 'bg-rose-600',
        icon: AlertCircle,
      };
    }
    if (severity === 'high') {
      return {
        label: 'High Hazard',
        badge: 'bg-amber-100 text-amber-900 border-amber-300',
        dot: 'bg-amber-500',
        icon: AlertTriangle,
      };
    }
    if (severity === 'medium') {
      return {
        label: 'Warning',
        badge: 'bg-yellow-50 text-yellow-800 border-yellow-300',
        dot: 'bg-yellow-500',
        icon: AlertTriangle,
      };
    }
    return {
      label: 'Suggestion',
      badge: 'bg-blue-50 text-blue-800 border-blue-200',
      dot: 'bg-blue-500',
      icon: Info,
    };
  };

  const filteredIssues = issues.filter((issue) => {
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'critical' && (issue.severity === 'critical' || issue.type === 'syntax')) ||
      (filterType === 'logical' && issue.type === 'logical') ||
      (filterType === 'runtime' && issue.type === 'runtime') ||
      (filterType === 'syntax' && issue.type === 'syntax');

    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.root_cause.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const criticalCount = issues.filter(
    (i) => i.severity === 'critical' || i.type === 'syntax'
  ).length;
  const warningCount = issues.filter(
    (i) => i.severity === 'high' || i.severity === 'medium'
  ).length;

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1">
      {/* Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Inspection Report
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[10px] font-mono text-slate-400">
                Engine: <span className="text-slate-700 font-semibold">{model_used}</span>
              </span>
            </div>
            <h3 className="text-xs font-bold text-slate-800 leading-snug">{summary}</h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {criticalCount > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                {criticalCount} {criticalCount === 1 ? 'Error' : 'Errors'}
              </span>
            )}
            {warningCount > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                {warningCount} {warningCount === 1 ? 'Warning' : 'Warnings'}
              </span>
            )}
            {issues.length === 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                ✓ 0 Defects
              </span>
            )}
          </div>
        </div>

        {onViewDiff && (
          <button
            type="button"
            onClick={onViewDiff}
            className="w-full mt-2 py-1 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-blue-200 transition-colors"
          >
            <span>Inspect Side-by-Side Code Diff</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      {issues.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                filterType === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All ({issues.length})
            </button>
            {criticalCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterType('critical')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  filterType === 'critical'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-rose-700 hover:bg-rose-50 border border-slate-200'
                }`}
              >
                Errors ({criticalCount})
              </button>
            )}
            {warningCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterType('runtime')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  filterType === 'runtime'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-amber-700 hover:bg-amber-50 border border-slate-200'
                }`}
              >
                Runtime / Logic
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search diagnostics..."
              className="pl-6 pr-2 py-1 bg-white border border-slate-200 rounded text-[11px] w-36 focus:w-44 transition-all focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Issues Cards */}
      <div className="space-y-2.5">
        {issues.length === 0 ? (
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <div>
              <div className="font-bold">No Defects Detected</div>
              <div className="text-[11px] text-emerald-700">
                The program syntax and control flows validated cleanly with zero fatal anomalies.
              </div>
            </div>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="p-4 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500">
            No issues match the selected filter or search term.
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isExpanded = expandedIssueIds[issue.id] ?? true;
            const sev = getSeverityBadge(issue.severity, issue.type);
            const SevIcon = sev.icon;

            return (
              <div
                key={issue.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Issue Header */}
                <div
                  onClick={() => toggleExpand(issue.id)}
                  className="flex items-center justify-between p-3 cursor-pointer bg-slate-50/70 hover:bg-slate-50 transition-colors select-none"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${sev.badge}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                      {sev.label}
                    </span>

                    <span className="text-[10px] font-mono uppercase font-bold text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                      {issue.type}
                    </span>

                    <h4 className="text-xs font-bold text-slate-800 truncate">{issue.title}</h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {issue.line && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIssueLine?.(issue.line!);
                        }}
                        className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1 shadow-2xs"
                        title="Jump to this line in the code editor"
                      >
                        <span>Line {issue.line}</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </button>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-3.5 space-y-3 text-xs border-t border-slate-100 bg-white">
                    {/* Problem Statement */}
                    <div>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        {issue.description}
                      </p>
                    </div>

                    {/* Inline Code Frame Preview (Faulty line vs Fixed line) */}
                    {(issue.code_snippet || issue.fixed_snippet) && (
                      <div className="rounded-lg border border-slate-200 bg-slate-900 text-slate-100 overflow-hidden font-mono text-[11px]">
                        <div className="px-2.5 py-1 bg-slate-950 border-b border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                          <span>Code Frame {issue.line ? `• Line ${issue.line}` : ''}</span>
                        </div>
                        <div className="p-2.5 space-y-1">
                          {issue.code_snippet && (
                            <div className="flex items-start gap-2 text-rose-300 bg-rose-950/40 p-1.5 rounded">
                              <span className="text-rose-500 font-bold select-none">-</span>
                              <span className="overflow-x-auto whitespace-pre">{issue.code_snippet}</span>
                            </div>
                          )}
                          {issue.fixed_snippet && (
                            <div className="flex items-start gap-2 text-emerald-300 bg-emerald-950/40 p-1.5 rounded">
                              <span className="text-emerald-500 font-bold select-none">+</span>
                              <span className="overflow-x-auto whitespace-pre">{issue.fixed_snippet}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Root Cause Technical Breakdown */}
                    <div className="bg-amber-50/70 rounded-lg p-2.5 border border-amber-200/80">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900 mb-0.5 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                        Root Cause (Why this occurs)
                      </div>
                      <p className="text-amber-950 text-[11.5px] leading-relaxed">
                        {issue.root_cause}
                      </p>
                    </div>

                    {/* Concrete Fix Recommendation */}
                    <div className="bg-blue-50/70 rounded-lg p-2.5 border border-blue-200/80">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-900 mb-0.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                        Recommended Remediation
                      </div>
                      <p className="text-blue-950 text-[11.5px] leading-relaxed">
                        {issue.suggestion}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Changes list */}
      {changes && changes.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            Remediations Applied in Proposed Fix ({changes.length})
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {changes.map((change, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-snug">{change}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
