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
} from 'lucide-react';

interface BugAnalysisPanelProps {
  debugResponse: DebugResponse | null;
  onSelectIssueLine?: (line: number) => void;
}

export const BugAnalysisPanel: React.FC<BugAnalysisPanelProps> = ({
  debugResponse,
  onSelectIssueLine,
}) => {
  const [expandedIssueIds, setExpandedIssueIds] = useState<Record<string, boolean>>({});

  if (!debugResponse) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
        <Sparkles className="w-12 h-12 text-blue-300 mb-3" />
        <h3 className="text-base font-semibold text-slate-700 mb-1">No Active Bug Analysis</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Submit or paste your source code in the editor and click "Analyze & Fix Code" to receive deep
          AI-driven bug diagnostics, root-cause localization, and remediation.
        </p>
      </div>
    );
  }

  const { issues, summary, changes, assumptions, uncertainties, model_used, provider_used } =
    debugResponse;

  const toggleExpand = (id: string) => {
    setExpandedIssueIds((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'syntax':
        return {
          label: 'Syntax Error',
          icon: AlertCircle,
          className: 'bg-rose-100 text-rose-800 border-rose-200',
        };
      case 'logical':
        return {
          label: 'Logical Bug',
          icon: AlertTriangle,
          className: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      case 'runtime':
        return {
          label: 'Runtime Hazard',
          icon: ShieldAlert,
          className: 'bg-red-100 text-red-800 border-red-200',
        };
      case 'edge_case':
        return {
          label: 'Edge Case',
          icon: HelpCircle,
          className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        };
      case 'performance':
        return {
          label: 'Performance Issue',
          icon: Info,
          className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'security':
        return {
          label: 'Security Vulnerability',
          icon: ShieldAlert,
          className: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      default:
        return {
          label: category,
          icon: Info,
          className: 'bg-slate-100 text-slate-800 border-slate-200',
        };
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-600 text-white';
      case 'high':
        return 'bg-amber-600 text-white';
      case 'medium':
        return 'bg-blue-600 text-white';
      case 'low':
        return 'bg-slate-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  const criticalCount = issues.filter(
    (i) => i.severity === 'critical' || i.type === 'syntax'
  ).length;
  const highCount = issues.filter((i) => i.severity === 'high').length;
  const mediumCount = issues.filter((i) => i.severity === 'medium').length;

  return (
    <div className="flex flex-col gap-4 overflow-y-auto pr-1">
      {/* Summary Header Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Diagnostic Overview
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">
                Model: <span className="font-mono font-medium text-slate-700">{model_used}</span>
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 leading-snug">{summary}</h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {criticalCount > 0 && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                {criticalCount} Critical
              </span>
            )}
            {highCount > 0 && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                {highCount} High
              </span>
            )}
            {mediumCount > 0 && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                {mediumCount} Medium
              </span>
            )}
            {issues.length === 0 && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Clean
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Detected Issues ({issues.length})
          </h4>
          <span className="text-[11px] text-slate-500">
            Click an issue to jump to line or toggle root cause details
          </span>
        </div>

        {issues.length === 0 ? (
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>No critical defects or syntax errors detected in this code submission.</span>
          </div>
        ) : (
          issues.map((issue) => {
            const isExpanded = expandedIssueIds[issue.id] ?? true;
            const cat = getCategoryBadge(issue.type);
            const CatIcon = cat.icon;

            return (
              <div
                key={issue.id}
                className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Issue Header */}
                <div
                  onClick={() => toggleExpand(issue.id)}
                  className="flex items-center justify-between p-3.5 cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors select-none"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <CatIcon className="w-4 h-4 text-slate-600 shrink-0" />
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${cat.className}`}
                    >
                      {cat.label}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${getSeverityBadge(
                        issue.severity
                      )}`}
                    >
                      {issue.severity}
                    </span>
                    <h5 className="text-xs font-semibold text-slate-800 truncate">{issue.title}</h5>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {issue.line && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIssueLine?.(issue.line!);
                        }}
                        className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                        title="Jump to this line in editor"
                      >
                        Line {issue.line}
                      </button>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Issue Details Expanded */}
                {isExpanded && (
                  <div className="p-3.5 space-y-3 text-xs border-t border-slate-100 bg-white">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Problem Description
                      </div>
                      <p className="text-slate-700 leading-relaxed">{issue.description}</p>
                    </div>

                    <div className="bg-amber-50/80 rounded p-3 border border-amber-200">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                        Root Cause (Why this occurs)
                      </div>
                      <p className="text-amber-950 text-[11.5px] leading-relaxed">
                        {issue.root_cause}
                      </p>
                    </div>

                    <div className="bg-blue-50/80 rounded p-3 border border-blue-200">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-blue-900 mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                        Suggested Remediation
                      </div>
                      <p className="text-blue-950 text-[11.5px] leading-relaxed">{issue.suggestion}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Remediation Changes Summary */}
      {changes && changes.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            Applied Remediation Steps ({changes.length})
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

      {/* Assumptions & Uncertainties (Honest AI boundary) */}
      {((assumptions && assumptions.length > 0) ||
        (uncertainties && uncertainties.length > 0)) && (
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-3.5 text-xs space-y-2.5">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Analysis Assumptions & Constraints
          </div>

          {assumptions && assumptions.length > 0 && (
            <div>
              <span className="font-semibold text-slate-700">Assumptions: </span>
              <span className="text-slate-600">{assumptions.join('; ')}</span>
            </div>
          )}

          {uncertainties && uncertainties.length > 0 && (
            <div className="text-amber-800 bg-amber-50 p-2.5 rounded border border-amber-200">
              <span className="font-semibold text-amber-900">Uncertainties / Edge Cases: </span>
              <span>{uncertainties.join('; ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
