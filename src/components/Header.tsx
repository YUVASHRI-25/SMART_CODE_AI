import React, { useRef } from 'react';
import { SupportedLanguage } from '../types/debugger';
import { SAMPLE_CODES, SampleSnippet } from '../data/sampleCodes';
import {
  Play,
  RotateCcw,
  Upload,
  Sparkles,
  FileCode,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface HeaderProps {
  language: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  fileName?: string;
  onFileUpload: (file: File) => void;
  onAnalyzeCode: () => void;
  onReset: () => void;
  onSelectSample: (sample: SampleSnippet) => void;
  isAnalyzing: boolean;
  analyzingStage: string;
  hasCode: boolean;
  activeProvider: string;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onSelectLanguage,
  fileName,
  onFileUpload,
  onAnalyzeCode,
  onReset,
  onSelectSample,
  isAnalyzing,
  analyzingStage,
  hasCode,
  activeProvider,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    // reset input value so re-uploading same file triggers event
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between gap-3 shrink-0">
      {/* Left controls: Language & Sample */}
      <div className="flex items-center gap-2.5">
        {/* Language selector */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="language-select" className="text-xs font-semibold text-slate-700">Language:</label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => onSelectLanguage(e.target.value as SupportedLanguage)}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-md text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="python">Python (.py)</option>
            <option value="javascript">JavaScript (.js)</option>
            <option value="typescript">TypeScript (.ts)</option>
            <option value="java">Java (.java)</option>
            <option value="cpp">C++ (.cpp)</option>
            <option value="c">C (.c)</option>
            <option value="go">Go (.go)</option>
            <option value="rust">Rust (.rs)</option>
            <option value="ruby">Ruby (.rb)</option>
            <option value="php">PHP (.php)</option>
          </select>
        </div>

        {/* Sample snippet picker */}
        <div className="hidden md:flex items-center gap-1.5">
          <span className="text-slate-300">|</span>
          <label htmlFor="sample-bug-select" className="text-xs text-slate-500">Buggy Sample:</label>
          <select
            id="sample-bug-select"
            onChange={(e) => {
              const sample = SAMPLE_CODES.find((s) => s.id === e.target.value);
              if (sample) onSelectSample(sample);
            }}
            defaultValue=""
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer max-w-[210px] truncate"
          >
            <option value="" disabled>
              Select Buggy Code Sample...
            </option>
            {SAMPLE_CODES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        {fileName && (
          <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-mono">
            <FileCode className="w-3.5 h-3.5 text-blue-600" />
            <span className="truncate max-w-[140px]">{fileName}</span>
          </div>
        )}
      </div>

      {/* Right controls: Upload, Reset, Analyze */}
      <div className="flex items-center gap-2">
        {/* Upload file hidden input & button */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept=".py,.js,.jsx,.ts,.tsx,.java,.cpp,.c,.h,.hpp,.go,.rs,.rb,.php,.txt"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-md text-xs font-medium transition-colors shadow-2xs"
          title="Upload source code file (.py, .js, .ts, .cpp, .java, etc. max 500KB)"
        >
          <Upload className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Upload File</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-600 rounded-md text-xs font-medium transition-colors shadow-2xs"
          title="Reset workspace and clear editor"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {/* Primary Analyze Code Action */}
        <button
          type="button"
          onClick={onAnalyzeCode}
          disabled={isAnalyzing || !hasCode}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all shadow-sm active:scale-[0.98] ${
            isAnalyzing
              ? 'bg-blue-500 text-white cursor-wait'
              : !hasCode
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
          }`}
          title={!hasCode ? 'Enter or paste code to analyze' : 'Run AI bug detection and remediation'}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>{analyzingStage || 'Analyzing...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-white" />
              <span>Analyze & Fix Code</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
