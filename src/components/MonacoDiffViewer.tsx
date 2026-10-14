import React, { useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { SupportedLanguage } from '../types/debugger';
import { Copy, Check, Download, RotateCcw, Columns, AlignJustify, CheckCircle } from 'lucide-react';

interface MonacoDiffViewerProps {
  originalCode: string;
  fixedCode: string;
  language: SupportedLanguage;
  fileName?: string;
  onApplyFix?: () => void;
  onRestoreOriginal?: () => void;
}

export const MonacoDiffViewer: React.FC<MonacoDiffViewerProps> = ({
  originalCode,
  fixedCode,
  language,
  fileName,
  onApplyFix,
  onRestoreOriginal,
}) => {
  const [copied, setCopied] = useState(false);
  const [renderSideBySide, setRenderSideBySide] = useState(true);

  const getMonacoLanguage = (lang: SupportedLanguage): string => {
    switch (lang) {
      case 'python':
        return 'python';
      case 'javascript':
        return 'javascript';
      case 'typescript':
        return 'typescript';
      case 'java':
        return 'java';
      case 'cpp':
      case 'c':
        return 'cpp';
      case 'go':
        return 'go';
      case 'rust':
        return 'rust';
      case 'ruby':
        return 'ruby';
      case 'php':
        return 'php';
      default:
        return 'plaintext';
    }
  };

  const getFileExtension = (lang: SupportedLanguage): string => {
    const extMap: Record<SupportedLanguage, string> = {
      python: '.py',
      javascript: '.js',
      typescript: '.ts',
      java: '.java',
      cpp: '.cpp',
      c: '.c',
      go: '.go',
      rust: '.rs',
      ruby: '.rb',
      php: '.php',
    };
    return extMap[lang] || '.txt';
  };

  const handleCopyFixed = async () => {
    try {
      await navigator.clipboard.writeText(fixedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy fixed code:', err);
    }
  };

  const handleDownloadFixed = () => {
    const name = fileName ? `fixed_${fileName}` : `fixed_source${getFileExtension(language)}`;
    const blob = new Blob([fixedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
      {/* Diff Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Code Diff Comparison</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 font-mono text-[11px]">
              Left: Original | Right: Corrected Fix
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-medium">
              - Removed
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
              + Added
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setRenderSideBySide(!renderSideBySide)}
            className="flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors"
            title={renderSideBySide ? 'Switch to inline diff view' : 'Switch to side-by-side diff view'}
          >
            {renderSideBySide ? (
              <>
                <AlignJustify className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px]">Inline</span>
              </>
            ) : (
              <>
                <Columns className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px]">Side-by-Side</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyFixed}
            className="flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors"
            title="Copy corrected code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] text-emerald-600 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px]">Copy Fix</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadFixed}
            className="flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors"
            title="Download fixed source file"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px]">Download</span>
          </button>

          {onApplyFix && (
            <button
              type="button"
              onClick={onApplyFix}
              className="flex items-center gap-1 px-3 py-1 text-white bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors shadow-xs"
              title="Apply fixed code into active editor"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="text-[11px]">Apply to Editor</span>
            </button>
          )}

          {onRestoreOriginal && (
            <button
              type="button"
              onClick={onRestoreOriginal}
              className="flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors"
              title="Restore original code"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px]">Restore Original</span>
            </button>
          )}
        </div>
      </div>

      {/* Monaco Diff Editor Body */}
      <div className="flex-1 w-full min-h-[380px]">
        <DiffEditor
          height="100%"
          language={getMonacoLanguage(language)}
          original={originalCode}
          modified={fixedCode}
          theme="vs"
          options={{
            readOnly: true,
            renderSideBySide,
            fontSize: 13,
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, 'Courier New', monospace",
            diffWordWrap: 'on',
            renderIndicators: true,
            smoothScrolling: true,
          }}
        />
      </div>
    </div>
  );
};
