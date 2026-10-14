import React, { useRef } from 'react';
import { SupportedLanguage } from '../types/debugger';
import { SAMPLE_CODES, SampleSnippet } from '../data/sampleCodes';
import {
  Upload,
  Sparkles,
  RotateCcw,
  Loader2,
  FileCode,
  Code2,
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 select-none shadow-2xs">
      {/* Left controls: Language & File Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <label htmlFor="language-select" className="text-xs font-bold text-slate-700">Language:</label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => onSelectLanguage(e.target.value as SupportedLanguage)}
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs"
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

        {fileName ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 text-xs font-mono border border-blue-200">
            <FileCode className="w-3.5 h-3.5 text-blue-600" />
            <span className="truncate max-w-[180px] font-medium">{fileName}</span>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400">
            <span>No file uploaded yet • Type or paste code below</span>
          </div>
        )}

        {/* Optional Demo loader for quick testing if needed */}
        <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-200">
          <label htmlFor="demo-select" className="sr-only">Load Demo Snippet</label>
          <select
            id="demo-select"
            onChange={(e) => {
              const sample = SAMPLE_CODES.find((s) => s.id === e.target.value);
              if (sample) onSelectSample(sample);
            }}
            defaultValue=""
            className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[11px] text-slate-600 focus:outline-hidden cursor-pointer"
          >
            <option value="" disabled>
              Load Demo Snippet (Optional)...
            </option>
            {SAMPLE_CODES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right controls: Upload, Reset, Analyze */}
      <div className="flex items-center gap-2">
        {/* Accept any source code file */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept="*/*"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium transition-colors shadow-2xs active:scale-[0.98]"
          title="Upload any source code file from your computer"
        >
          <Upload className="w-3.5 h-3.5 text-slate-500" />
          <span>Upload File</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-600 rounded-lg text-xs font-medium transition-colors shadow-2xs active:scale-[0.98]"
          title="Reset workspace and clear editor"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset</span>
        </button>

        {/* Primary Analyze Code Action */}
        <button
          type="button"
          onClick={onAnalyzeCode}
          disabled={isAnalyzing || !hasCode}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-[0.98] ${
            isAnalyzing
              ? 'bg-blue-600 text-white cursor-wait'
              : !hasCode
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 hover:shadow-blue-500/35'
          }`}
          title={!hasCode ? 'Paste or upload code to analyze' : 'Run AI bug detection and remediation'}
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
