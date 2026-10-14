import React, { useState } from 'react';
import { TestCase, ValidationResult } from '../types/debugger';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Plus,
  Trash2,
  Clock,
  ShieldCheck,
  Check,
  FileCode,
} from 'lucide-react';

interface ValidationPanelProps {
  validationResult: ValidationResult | null;
  testCases: TestCase[];
  onUpdateTestCases: (cases: TestCase[]) => void;
  onRunValidation: () => void;
  isValidating?: boolean;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  validationResult,
  testCases,
  onUpdateTestCases,
  onRunValidation,
  isValidating = false,
}) => {
  const [newTcInput, setNewTcInput] = useState('');
  const [newTcExpected, setNewTcExpected] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTestCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTcInput.trim() || !newTcExpected.trim()) return;

    const newCase: TestCase = {
      id: `tc-${Date.now()}`,
      input: newTcInput.trim(),
      expectedOutput: newTcExpected.trim(),
    };

    onUpdateTestCases([...testCases, newCase]);
    setNewTcInput('');
    setNewTcExpected('');
    setIsAdding(false);
  };

  const handleDeleteTestCase = (id: string) => {
    onUpdateTestCases(testCases.filter((tc) => tc.id !== id));
  };

  const getStatusBadge = (status: ValidationResult['status']) => {
    switch (status) {
      case 'passed':
        return {
          label: 'Fix Verified',
          icon: CheckCircle2,
          className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'failed':
        return {
          label: 'Test Cases Failed',
          icon: XCircle,
          className: 'bg-rose-100 text-rose-800 border-rose-200',
        };
      case 'syntax_error':
        return {
          label: 'Syntax Error',
          icon: AlertTriangle,
          className: 'bg-red-100 text-red-800 border-red-200',
        };
      case 'not_run':
      default:
        return {
          label: 'Unverified (Not Run)',
          icon: Clock,
          className: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  const statusBadge = validationResult
    ? getStatusBadge(validationResult.status)
    : getStatusBadge('not_run');
  const StatusIcon = statusBadge.icon;

  return (
    <div className="flex flex-col gap-4 overflow-y-auto pr-1">
      {/* Validation Status Banner */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800">Verification Engine</div>
              <div className="text-[11px] text-slate-500">
                Static AST validation & test-suite simulation
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border ${statusBadge.className}`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {statusBadge.label}
            </span>

            <button
              type="button"
              onClick={onRunValidation}
              disabled={isValidating}
              className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded text-xs font-medium transition-colors shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isValidating ? 'Validating...' : 'Run Test Suite'}</span>
            </button>
          </div>
        </div>

        {validationResult && (
          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="font-medium">{validationResult.details}</div>
            {validationResult.syntaxMessage && (
              <div className="text-[11px] text-slate-500 font-mono">
                Syntax check: {validationResult.syntaxMessage}
              </div>
            )}
            {typeof validationResult.executionTimeMs === 'number' && (
              <div className="text-[11px] text-slate-400">
                Evaluation latency: {validationResult.executionTimeMs} ms
              </div>
            )}
          </div>
        )}
      </div>

      {/* Test Cases Table & Manager */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Test Cases Suite ({testCases.length})
            </h4>
            <p className="text-[11px] text-slate-500">
              Provide input parameters and expected outcomes to verify fix correctness
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-200 rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Test Case</span>
          </button>
        </div>

        {/* Add Test Case Form */}
        {isAdding && (
          <form
            onSubmit={handleAddTestCase}
            className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-3"
          >
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Input Arguments / Context
              </label>
              <input
                type="text"
                value={newTcInput}
                onChange={(e) => setNewTcInput(e.target.value)}
                placeholder="e.g. data = [10, 20, 30], window = 2"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Expected Output / State
              </label>
              <input
                type="text"
                value={newTcExpected}
                onChange={(e) => setNewTcExpected(e.target.value)}
                placeholder="e.g. [15.0, 25.0]"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-xs"
              >
                Save Test Case
              </button>
            </div>
          </form>
        )}

        {/* Test Cases Table */}
        {testCases.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No test cases defined yet. Click "Add Test Case" or select a pre-loaded sample program.
          </div>
        ) : (
          <div className="space-y-2">
            {testCases.map((tc, idx) => {
              // Find matching result if executed
              const result = validationResult?.testResults?.find((r) => r.id === tc.id);

              return (
                <div
                  key={tc.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">Case {idx + 1}</span>
                      {result && (
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                            result.passed
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {result.passed ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" /> Passed
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" /> Failed
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteTestCase(tc.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Delete test case"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <div className="text-[10px] font-sans font-semibold text-slate-500 mb-0.5">
                        INPUT
                      </div>
                      <div className="text-slate-800 break-all">{tc.input}</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <div className="text-[10px] font-sans font-semibold text-slate-500 mb-0.5">
                        EXPECTED
                      </div>
                      <div className="text-slate-800 break-all">{tc.expectedOutput}</div>
                    </div>
                  </div>

                  {result && !result.passed && result.error && (
                    <div className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded border border-rose-200">
                      <span className="font-semibold">Reason:</span> {result.error}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
