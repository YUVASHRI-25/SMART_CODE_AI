import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { CodeIssue, SupportedLanguage } from '../types/debugger';
import { Copy, Check, Trash2, WrapText, ZoomIn, ZoomOut } from 'lucide-react';

interface MonacoCodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language: SupportedLanguage;
  issues?: CodeIssue[];
  fontSize?: number;
  readOnly?: boolean;
  onClear?: () => void;
}

export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  code,
  onChange,
  language,
  issues = [],
  fontSize = 14,
  readOnly = false,
  onClear,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [wordWrap, setWordWrap] = React.useState<'on' | 'off'>('on');
  const [localFontSize, setLocalFontSize] = React.useState(fontSize);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  // Map language to Monaco language identifier
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

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    updateDecorations();
  };

  const updateDecorations = () => {
    if (!editorRef.current || !monacoRef.current) return;
    const monaco = monacoRef.current;
    const model = editorRef.current.getModel();
    if (!model) return;

    // Create markers for detected issues
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
    updateDecorations();
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

  const lineCount = code ? code.split('\n').length : 0;
  const charCount = code.length;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
      {/* Editor Header Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 select-none">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
            {language}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 font-mono">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 font-mono">{charCount} chars</span>
          {issues.length > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
              {issues.length} {issues.length === 1 ? 'issue flagged' : 'issues flagged'}
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
          <span className="text-[11px] text-slate-500 w-5 text-center font-mono">{localFontSize}</span>
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
            className={`p-1 rounded text-slate-600 transition-colors ${wordWrap === 'on' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200'}`}
            title="Toggle word wrap"
          >
            <WrapText className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!code}
            className="flex items-center gap-1 px-2 py-1 hover:bg-slate-200 disabled:opacity-40 rounded text-slate-700 transition-colors"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] text-emerald-600 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>

          {onClear && (
            <button
              type="button"
              onClick={onClear}
              disabled={!code}
              className="p-1 hover:bg-rose-100 hover:text-rose-700 disabled:opacity-40 rounded text-slate-500 transition-colors"
              title="Clear editor"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 w-full min-h-[320px] relative">
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
};
