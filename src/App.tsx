import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MonacoCodeEditor } from './components/MonacoCodeEditor';
import { MonacoDiffViewer } from './components/MonacoDiffViewer';
import { BugAnalysisPanel } from './components/BugAnalysisPanel';
import { ValidationPanel } from './components/ValidationPanel';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SettingsModal } from './components/SettingsModal';
import { SupportedLanguagesModal } from './components/SupportedLanguagesModal';
import {
  SupportedLanguage,
  TestCase,
  DebugResponse,
  ValidationResult,
  HistorySession,
  AppSettings,
} from './types/debugger';
import { SAMPLE_CODES, SampleSnippet } from './data/sampleCodes';
import {
  fetchHealth,
  fetchHistory,
  submitDebugCode,
  validateCode,
  deleteHistoryItem,
  clearAllHistory,
  HealthStatus,
} from './services/api';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  Layers,
  Bug,
  ShieldCheck,
  Code2,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  // Default code initialized with the first sample for immediate demonstration
  const defaultSample = SAMPLE_CODES[0];
  const [code, setCode] = useState<string>(defaultSample.code);
  const [language, setLanguage] = useState<SupportedLanguage>(defaultSample.language);
  const [fileName, setFileName] = useState<string | undefined>(defaultSample.fileName);
  const [testCases, setTestCases] = useState<TestCase[]>(defaultSample.suggestedTestCases);

  // AI & Debugging State
  const [debugResponse, setDebugResponse] = useState<DebugResponse | null>(null);
  const [fixedCode, setFixedCode] = useState<string>('');
  const [originalCode, setOriginalCode] = useState<string>('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // UI Navigation & Views
  const [currentTab, setCurrentTab] = useState<'workspace' | 'diff' | 'analysis' | 'validation'>(
    'workspace'
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStage, setAnalyzingStage] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Modals & Drawers
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);

  // Data & History
  const [historySessions, setHistorySessions] = useState<HistorySession[]>([]);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);

  // App Settings with LocalStorage persistence
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('smart_debugger_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      aiProvider: 'gemini',
      openRouterModel: 'qwen/qwen-2.5-coder-32b-instruct',
      hasOpenRouterKey: false,
      hasGeminiKey: true,
      autoValidateOnFix: true,
      editorFontSize: 14,
      theme: 'light',
    };
  });

  // Toast Notification
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  // Load initial backend health and history
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const health = await fetchHealth();
        setHealthStatus(health);
        setSettings((prev) => ({
          ...prev,
          hasOpenRouterKey: health.providers.openrouter.configured,
          hasGeminiKey: Boolean(health.providers.gemini?.configured),
        }));
      } catch (err) {
        console.warn('Backend health check error:', err);
      }

      try {
        const hist = await fetchHistory();
        setHistorySessions(hist);
      } catch (err) {
        console.warn('History load error:', err);
      }
    };

    loadInitialData();
  }, []);

  // Save settings change
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('smart_debugger_settings', JSON.stringify(newSettings));
      showNotification('success', 'Settings updated successfully.');
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  };

  // Sample Loader
  const handleSelectSample = (sample: SampleSnippet) => {
    setCode(sample.code);
    setLanguage(sample.language);
    setFileName(sample.fileName);
    setTestCases(sample.suggestedTestCases || []);
    setDebugResponse(null);
    setFixedCode('');
    setOriginalCode('');
    setValidationResult(null);
    setCurrentTab('workspace');
    showNotification('info', `Loaded sample: ${sample.title}`);
  };

  // File Upload Handler with Validation
  const handleFileUpload = (file: File) => {
    // Check file size (500KB limit)
    const MAX_SIZE = 500 * 1024;
    if (file.size > MAX_SIZE) {
      showNotification('error', `File too large (${(file.size / 1024).toFixed(1)}KB). Limit is 500KB.`);
      return;
    }

    // Infer language from extension
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const extToLang: Record<string, SupportedLanguage> = {
      '.py': 'python',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.java': 'java',
      '.cpp': 'cpp',
      '.cc': 'cpp',
      '.c': 'c',
      '.h': 'c',
      '.hpp': 'cpp',
      '.go': 'go',
      '.rs': 'rust',
      '.rb': 'ruby',
      '.php': 'php',
    };

    const detectedLang = extToLang[ext];
    if (!detectedLang) {
      showNotification(
        'error',
        `Unsupported file type '${ext}'. Please upload source files (.py, .js, .ts, .cpp, .java, etc.).`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (typeof content === 'string') {
        setCode(content);
        setLanguage(detectedLang);
        setFileName(file.name);
        setDebugResponse(null);
        setFixedCode('');
        setOriginalCode('');
        setValidationResult(null);
        showNotification('success', `Uploaded ${file.name} successfully (${detectedLang}).`);
      }
    };
    reader.onerror = () => {
      showNotification('error', 'Failed to read uploaded file.');
    };
    reader.readAsText(file);
  };

  // Workspace Reset
  const handleReset = () => {
    setCode('');
    setFileName(undefined);
    setDebugResponse(null);
    setFixedCode('');
    setOriginalCode('');
    setValidationResult(null);
    setTestCases([]);
    showNotification('info', 'Workspace reset. Editor cleared.');
  };

  // Core Analyze Code Handler
  const handleAnalyzeCode = async () => {
    if (!code || code.trim().length === 0) {
      showNotification('error', 'Please enter or paste source code before starting analysis.');
      return;
    }

    setIsAnalyzing(true);
    setAnalyzingStage('Initializing AI analyzer...');

    try {
      // Progress simulation stages
      const stageTimer1 = setTimeout(() => {
        setAnalyzingStage('Localizing syntax & logical anomalies...');
      }, 700);

      const stageTimer2 = setTimeout(() => {
        setAnalyzingStage('Synthesizing surgical remediation & diff...');
      }, 1800);

      const stageTimer3 = setTimeout(() => {
        setAnalyzingStage('Executing test cases & AST checks...');
      }, 3000);

      const response = await submitDebugCode({
        code,
        language,
        fileName,
        provider: settings.aiProvider,
        model: settings.openRouterModel,
        testCases,
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);

      setDebugResponse(response);
      setFixedCode(response.fixed_code);
      setOriginalCode(response.original_code);
      setValidationResult(response.validation);

      // Refresh history list
      fetchHistory().then(setHistorySessions).catch(console.warn);

      showNotification(
        'success',
        `Analysis complete! Identified ${response.issues.length} ${
          response.issues.length === 1 ? 'issue' : 'issues'
        }.`
      );

      // Transition to Diff or Analysis view to inspect results
      if (response.issues.length > 0) {
        setCurrentTab('diff');
      } else {
        setCurrentTab('analysis');
      }
    } catch (err: any) {
      console.error('Debug error:', err);
      showNotification('error', err.message || 'Failed to complete AI code analysis.');
    } finally {
      setIsAnalyzing(false);
      setAnalyzingStage('');
    }
  };

  // Test Case Validation Runner
  const handleRunValidation = async () => {
    const targetCode = fixedCode || code;
    if (!targetCode) {
      showNotification('error', 'No code available for validation.');
      return;
    }

    setIsValidating(true);
    try {
      const res = await validateCode(targetCode, language, testCases);
      setValidationResult(res);
      showNotification(
        res.status === 'passed' ? 'success' : 'error',
        res.status === 'passed'
          ? 'Validation test suite passed cleanly!'
          : `Validation: ${res.details}`
      );
    } catch (err: any) {
      showNotification('error', err.message || 'Validation request failed.');
    } finally {
      setIsValidating(false);
    }
  };

  // Apply Fixed Code into main editor
  const handleApplyFix = () => {
    if (!fixedCode) return;
    setCode(fixedCode);
    showNotification('success', 'Corrected fix applied to the main editor.');
    setCurrentTab('workspace');
  };

  // Restore Original Code
  const handleRestoreOriginal = () => {
    if (!originalCode) return;
    setCode(originalCode);
    showNotification('info', 'Restored original code.');
  };

  // Restore previous session from history
  const handleSelectHistorySession = (session: HistorySession) => {
    setCode(session.originalCode);
    setLanguage(session.language);
    setFileName(session.fileName);
    setOriginalCode(session.originalCode);
    setFixedCode(session.fixedCode);
    setValidationResult({
      status: session.validationStatus,
      details: 'Restored from previous session record.',
      syntaxValid: true,
      testCasesRun: 0,
      testCasesPassed: 0,
      testResults: [],
    });
    setDebugResponse({
      id: session.id,
      timestamp: session.timestamp,
      language: session.language,
      summary: session.summary,
      issues: [],
      fixed_code: session.fixedCode,
      original_code: session.originalCode,
      changes: session.changes,
      assumptions: [],
      validation: {
        status: session.validationStatus,
        details: 'Loaded from session history',
        syntaxValid: true,
        testCasesRun: 0,
        testCasesPassed: 0,
        testResults: [],
      },
      model_used: session.modelUsed,
      provider_used: (session.providerUsed as any) || 'openrouter',
    });
    setCurrentTab('diff');
    showNotification('info', `Loaded session from ${new Date(session.timestamp).toLocaleTimeString()}`);
  };

  // Delete history item
  const handleDeleteHistorySession = async (id: string) => {
    try {
      await deleteHistoryItem(id);
      setHistorySessions((prev) => prev.filter((s) => s.id !== id));
      showNotification('info', 'Session deleted from history.');
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete session.');
    }
  };

  // Clear all history
  const handleClearAllHistory = async () => {
    try {
      await clearAllHistory();
      setHistorySessions([]);
      showNotification('info', 'Debugging history cleared.');
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to clear history.');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800 antialiased">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium border transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : notification.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-300'
              : 'bg-blue-50 text-blue-900 border-blue-300'
          }`}
        >
          {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          {notification.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
          <span>{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="ml-2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onNewSession={handleReset}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenLanguages={() => setIsLanguagesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        historyCount={historySessions.length}
        activeProvider={healthStatus?.activeProvider || settings.aiProvider}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Workspace Toolbar */}
        <Header
          language={language}
          onSelectLanguage={setLanguage}
          fileName={fileName}
          onFileUpload={handleFileUpload}
          onAnalyzeCode={handleAnalyzeCode}
          onReset={handleReset}
          onSelectSample={handleSelectSample}
          isAnalyzing={isAnalyzing}
          analyzingStage={analyzingStage}
          hasCode={Boolean(code && code.trim().length > 0)}
          activeProvider={healthStatus?.activeProvider || settings.aiProvider}
        />

        {/* Tab Switcher & Status Bar */}
        <div className="h-11 bg-white border-b border-slate-200 px-4 flex items-center justify-between gap-3 text-xs shrink-0 select-none">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentTab('workspace')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                currentTab === 'workspace'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Editor</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('diff')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                currentTab === 'diff'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Diff Comparison</span>
              {fixedCode && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('analysis')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                currentTab === 'analysis'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bug className="w-3.5 h-3.5 text-amber-600" />
              <span>Bug Analysis</span>
              {debugResponse && debugResponse.issues.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {debugResponse.issues.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('validation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                currentTab === 'validation'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Validation & Tests</span>
              {validationResult?.status === 'passed' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>
          </div>

          {/* Quick Metrics Tag */}
          <div className="hidden sm:flex items-center gap-3 text-slate-500 text-[11px]">
            {debugResponse && (
              <span className="text-slate-600">
                Fix Engine:{' '}
                <span className="font-mono font-medium text-slate-800">
                  {debugResponse.model_used}
                </span>
              </span>
            )}
            {validationResult && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                  validationResult.status === 'passed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {validationResult.status === 'passed' ? 'Verified' : validationResult.status}
              </span>
            )}
          </div>
        </div>

        {/* Workspace Body */}
        <main className="flex-1 p-3.5 overflow-hidden flex flex-col">
          {currentTab === 'workspace' && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full overflow-hidden">
              {/* Left: Code Editor (7 cols on lg) */}
              <div className="lg:col-span-7 h-full flex flex-col min-h-0">
                <MonacoCodeEditor
                  code={code}
                  onChange={setCode}
                  language={language}
                  issues={debugResponse?.issues}
                  fontSize={settings.editorFontSize}
                  onClear={() => setCode('')}
                />
              </div>

              {/* Right: Companion Diagnostics Panel (5 cols on lg) */}
              <div className="lg:col-span-5 h-full flex flex-col min-h-0 overflow-hidden">
                <BugAnalysisPanel
                  debugResponse={debugResponse}
                  onSelectIssueLine={(line) => {
                    // line jump is handled inside monaco
                  }}
                />
              </div>
            </div>
          )}

          {currentTab === 'diff' && (
            <div className="flex-1 h-full min-h-0">
              {fixedCode ? (
                <MonacoDiffViewer
                  originalCode={originalCode || code}
                  fixedCode={fixedCode}
                  language={language}
                  fileName={fileName}
                  onApplyFix={handleApplyFix}
                  onRestoreOriginal={handleRestoreOriginal}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white rounded-lg border border-slate-200">
                  <Layers className="w-12 h-12 text-slate-300 mb-3" />
                  <h3 className="text-base font-semibold text-slate-700 mb-1">
                    No Comparison Available
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mb-4">
                    Run "Analyze & Fix Code" to generate an automated correction and view side-by-side
                    diff highlights.
                  </p>
                  <button
                    type="button"
                    onClick={handleAnalyzeCode}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    Analyze Code Now
                  </button>
                </div>
              )}
            </div>
          )}

          {currentTab === 'analysis' && (
            <div className="flex-1 h-full min-h-0 max-w-4xl mx-auto w-full">
              <BugAnalysisPanel debugResponse={debugResponse} />
            </div>
          )}

          {currentTab === 'validation' && (
            <div className="flex-1 h-full min-h-0 max-w-4xl mx-auto w-full">
              <ValidationPanel
                validationResult={validationResult}
                testCases={testCases}
                onUpdateTestCases={setTestCases}
                onRunValidation={handleRunValidation}
                isValidating={isValidating}
              />
            </div>
          )}
        </main>
      </div>

      {/* Drawers & Modals */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={historySessions}
        onSelectSession={handleSelectHistorySession}
        onDeleteSession={handleDeleteHistorySession}
        onClearAll={handleClearAllHistory}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      <SupportedLanguagesModal
        isOpen={isLanguagesOpen}
        onClose={() => setIsLanguagesOpen(false)}
        onLoadSample={handleSelectSample}
      />
    </div>
  );
}
