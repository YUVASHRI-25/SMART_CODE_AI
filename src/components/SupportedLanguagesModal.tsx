import React from 'react';
import { SupportedLanguage } from '../types/debugger';
import { SAMPLE_CODES, SampleSnippet } from '../data/sampleCodes';
import { Globe, X, Check, Code, Play } from 'lucide-react';

interface SupportedLanguagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSample: (sample: SampleSnippet) => void;
}

export const SupportedLanguagesModal: React.FC<SupportedLanguagesModalProps> = ({
  isOpen,
  onClose,
  onLoadSample,
}) => {
  if (!isOpen) return null;

  const languagesList = [
    {
      id: 'python' as SupportedLanguage,
      name: 'Python',
      ext: '.py',
      version: '3.12+',
      features: ['AST Syntax Parsing', 'Logical Bug Detection', 'Indentation & Scope Checks'],
      sampleSnippet: SAMPLE_CODES.find((s) => s.language === 'python'),
    },
    {
      id: 'javascript' as SupportedLanguage,
      name: 'JavaScript',
      ext: '.js',
      version: 'ES2024',
      features: ['Async/Promise Tracking', 'Closure Inspection', 'Dynamic Scope Validation'],
      sampleSnippet: SAMPLE_CODES.find((s) => s.language === 'javascript'),
    },
    {
      id: 'typescript' as SupportedLanguage,
      name: 'TypeScript',
      ext: '.ts',
      version: '5.x',
      features: ['Type Guard Invariance', 'Nullability Diagnostics', 'Generics Resolution'],
      sampleSnippet: SAMPLE_CODES.find((s) => s.language === 'typescript'),
    },
    {
      id: 'java' as SupportedLanguage,
      name: 'Java',
      ext: '.java',
      version: '17/21 LTS',
      features: ['ConcurrentModification Analysis', 'NullPointer Checks', 'Object Lifecycle'],
      sampleSnippet: SAMPLE_CODES.find((s) => s.language === 'java'),
    },
    {
      id: 'cpp' as SupportedLanguage,
      name: 'C++',
      ext: '.cpp',
      version: 'C++20',
      features: ['Memory Leak Localization', 'Buffer Overflow Boundaries', 'RAII Destructors'],
      sampleSnippet: SAMPLE_CODES.find((s) => s.language === 'cpp'),
    },
    {
      id: 'c' as SupportedLanguage,
      name: 'C',
      ext: '.c',
      version: 'C17',
      features: ['Pointer Arithmetic', 'Stack & Heap Hazards', 'Bounds Enforcement'],
    },
    {
      id: 'go' as SupportedLanguage,
      name: 'Go',
      ext: '.go',
      version: '1.22+',
      features: ['Goroutine Leaks', 'Channel Deadlocks', 'Nil Pointer Dereference'],
    },
    {
      id: 'rust' as SupportedLanguage,
      name: 'Rust',
      ext: '.rs',
      version: '2021 Edition',
      features: ['Borrow Checker Compliance', 'Lifetime Invariants', 'Pattern Match Exhaustion'],
    },
    {
      id: 'ruby' as SupportedLanguage,
      name: 'Ruby',
      ext: '.rb',
      version: '3.3+',
      features: ['Block Scope Analysis', 'Nil Safety', 'Metaprogramming Traps'],
    },
    {
      id: 'php' as SupportedLanguage,
      name: 'PHP',
      ext: '.php',
      version: '8.3+',
      features: ['Type Safety Modes', 'Null-safe Operators', 'Superglobal Sanitization'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800 text-sm">Supported Programming Languages</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3">
          <p className="text-xs text-slate-600">
            The Smart Code Debugger uses multi-language static token analysis alongside deep LLM
            reasoning with Qwen2.5 Coder 32B and Google Gemini to detect defects and generate
            validated corrections across all of the following languages:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {languagesList.map((lang) => (
              <div
                key={lang.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between space-y-2 hover:border-blue-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-blue-600" />
                      {lang.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600">
                      {lang.ext} • {lang.version}
                    </span>
                  </div>

                  <ul className="space-y-0.5 text-[11px] text-slate-600">
                    {lang.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {lang.sampleSnippet && (
                  <button
                    type="button"
                    onClick={() => {
                      onLoadSample(lang.sampleSnippet!);
                      onClose();
                    }}
                    className="w-full mt-2 flex items-center justify-center gap-1 px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-300 rounded text-xs font-medium transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    <span>Load {lang.name} Buggy Sample</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
