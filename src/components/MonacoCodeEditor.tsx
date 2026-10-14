import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { CodeIssue, SupportedLanguage } from '../types/debugger';
import {
  Copy,
  Check,
  Trash2,
  WrapText,
  ZoomIn,
  ZoomOut,
  UploadCloud,
  FileCode,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export interface MonacoCodeEditorHandle {
  revealLine: (lineNumber: number) => void;
}

interface MonacoCodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language: SupportedLanguage;
  issues?: CodeIssue[];
  fontSize?: number;
  readOnly?: boolean;
  onClear?: () => void;
  onFileDrop?: (file: File) => void;
  fileName?: string;
}

export const MonacoCodeEditor = forwardRef<MonacoCodeEditorHandle, MonacoCodeEditorProps>(
  (
    {
      code,
      onChange,
      language,
      issues = [],
      fontSize = 14,
      readOnly = false,
      onClear,
      onFileDrop,
      fileName,
    },
    ref
  ) => {
    const [copied, setCopied] = useState(false);
    const [wordWrap, setWordWrap] = useState<'on' | 'off'>('on');
    const [localFontSize, setLocalFontSize] = useState(fontSize);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const decorationsRef = useRef<any[]>([]);

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

    useImperativeHandle(ref, () => ({
      revealLine: (lineNumber: number) => {
        if (!editorRef.current || !monacoRef.current) return;
        editorRef.current.revealLineInCenter(lineNumber);
        editorRef.current.setPosition({ lineNumber, column: 1 });
        editorRef.current.focus();

        // Highlight line temporarily
        const monaco = monacoRef.current;
        const newDecorations = editorRef.current.deltaDecorations(
          decorationsRef.current,
          [
            {
              range: new monaco.Range(lineNumber, 1, lineNumber, 1000),
              options: {
                isWholeLine: true,
                className: 'bg-amber-100/70 border-l-4 border-amber-500',
              },
            },
          ]
        );
        decorationsRef.current = newDecorations;
        setTimeout(() => {
          if (editorRef.current) {
            decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
          }
        }, 2500);
      },
    }));

    const handleEditorDidMount: OnMount = (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;
      updateMarkers();
    };

    const updateMarkers = () => {
      if (!editorRef.current || !monacoRef.current) return;
      const monaco = monacoRef.current;
      const model = editorRef.current.getModel();
      if (!model) return;

      const markers = issues
        .filter((iss) => iss.line && iss.line > 0)
        .map((iss) => {
          let severity = monaco.MarkerSeverity.Warning;
          if (iss.severity === 'critical' || iss.type === 'syntax') {
            severity = monaco.MarkerSeverity.Error;
          } else if (iss.severity === 'high') {
            severity = monaco.MarkerSeverity.Error;
          } else if (iss.type === 'edge_case' || iss.type === 'performance') {
            severity = monaco.MarkerSeverity.Info;
          }

          return {
            startLineNumber: iss.line!,
            startColumn: iss.column || 1,
            endLineNumber: iss.line!,
            endColumn: 1000,
            message: `[${iss.type.toUpperCase()}] ${iss.title}: ${iss.description}`,
            severity,
          };
        });

      monaco.editor.setModelMarkers(model, 'bug-detector', markers);
    };

    useEffect(() => {
      updateMarkers();
    }, [issues]);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    };

    // Drag and Drop files directly onto the editor
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file && onFileDrop) {
        onFileDrop(file);
      }
    };

    const lineCount = code ? code.split('\n').length : 0;
    const charCount = code.length;

    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col h-full bg-white rounded-xl border transition-all duration-150 shadow-xs overflow-hidden relative ${
          isDraggingOver ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
        }`}
      >
        {/* Drag Overlay Notice */}
        {isDraggingOver && (
          <div className="absolute inset-0 z-30 bg-blue-50/90 backdrop-blur-2xs flex flex-col items-center justify-center text-blue-700 pointer-events-none">
            <UploadCloud className="w-12 h-12 text-blue-600 mb-2 animate-bounce" />
            <span className="font-semibold text-sm">Drop source file to load into editor</span>
            <span className="text-xs text-blue-500 mt-1">.py, .js, .ts, .cpp, .java, .go, .rs, .rb, .php</span>
          </div>
        )}

        {/* Editor Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between px-3.5 py-2 bg-slate-50/90 border-b border-slate-200 text-xs text-slate-600 select-none gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-bold text-slate-800 uppercase tracking-wider text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
              <FileCode className="w-3 h-3 text-blue-600" />
              {fileName || `${language} source`}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              {lineCount} {lineCount === 1 ? 'line' : 'lines'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400 font-mono text-[11px]">{charCount} chars</span>

            {issues.length > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs">
                {issues.length} {issues.length === 1 ? 'issue' : 'issues'} flagged
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setLocalFontSize((s) => Math.max(11, s - 1))}
              className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
              title="Decrease font size"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-slate-500 w-5 text-center font-mono font-medium">
              {localFontSize}
            </span>
            <button
              type="button"
              onClick={() => setLocalFontSize((s) => Math.min(22, s + 1))}
              className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
              title="Increase font size"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <span className="text-slate-300 mx-1">|</span>

            <button
              type="button"
              onClick={() => setWordWrap((w) => (w === 'on' ? 'off' : 'on'))}
              className={`p-1 rounded text-slate-600 transition-colors ${
                wordWrap === 'on' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200'
              }`}
              title="Toggle word wrap"
            >
              <WrapText className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!code}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 disabled:opacity-40 rounded text-slate-700 border border-slate-200 transition-colors shadow-2xs font-medium"
              title="Copy code to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] text-emerald-600 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px]">Copy</span>
                </>
              )}
            </button>

            {onClear && (
              <button
                type="button"
                onClick={onClear}
                disabled={!code}
                className="p-1 hover:bg-rose-50 hover:text-rose-700 border border-transparent hover:border-rose-200 disabled:opacity-40 rounded text-slate-400 transition-colors"
                title="Clear editor"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 w-full min-h-[300px] relative">
          {(!code || code.trim().length === 0) && !isDraggingOver && (
            <div
              onClick={() => editorRef.current?.focus()}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-white/60 pointer-events-none select-none"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
                <FileCode className="w-6 h-6 text-slate-400" />
              </div>
              <h4 className="text-xs font-bold text-slate-600 mb-1">
                Workspace is Ready
              </h4>
              <p className="text-[11px] text-slate-400 max-w-sm">
                Paste your source code here, or click <span className="font-semibold text-slate-600">"Upload File"</span> (or drag & drop any code file) to begin debugging.
              </p>
            </div>
          )}

          <Editor
            height="100%"
            language={getMonacoLanguage(language)}
            value={code}
            onChange={(val) => onChange(val || '')}
            onMount={handleEditorDidMount}
            theme="vs"
            options={{
              readOnly,
              fontSize: localFontSize,
              lineNumbers: 'on',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap,
              tabSize: 4,
              automaticLayout: true,
              glyphMargin: true,
              renderWhitespace: 'selection',
              fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, 'Courier New', monospace",
              fontLigatures: true,
              cursorBlinking: 'smooth',
              smoothScrolling: true,
            }}
          />
        </div>
      </div>
    );
  }
);
