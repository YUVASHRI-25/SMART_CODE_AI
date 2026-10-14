import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MonacoCodeEditor, MonacoCodeEditorHandle } from './components/MonacoCodeEditor';
import { MonacoDiffViewer } from './components/MonacoDiffViewer';
import { BugAnalysisPanel } from './components/BugAnalysisPanel';
import { ValidationPanel } from './components/ValidationPanel';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SettingsModal } from './components/SettingsModal';
import { SupportedLanguagesModal } from './components/SupportedLanguagesModal';
import { HomePage } from './components/HomePage';
import { AuthModal } from './components/AuthModal';
import { User } from './types/auth';
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
  Columns,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function App() {
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  // AI & Debugging State
  const [debugResponse, setDebugResponse] = useState<DebugResponse | null>(null);
  const [fixedCode, setFixedCode] = useState<string>('');
  const [originalCode, setOriginalCode] = useState<string>('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Layout View Modes:
  // 'split' = Editor on Left, Inspector on Right (Default desktop)
  // 'diff' = Full-width Diff Viewer
  // 'editor' = Full-width Editor
  // 'validation' = Full-width Test Suite
  const [currentTab, setCurrentTab] = useState<'workspace' | 'diff' | 'analysis' | 'validation'>(
    'workspace'
  );
  const [inspectorTab, setInspectorTab] = useState<'analysis' | 'diff' | 'validation'>('analysis');

  // Loading States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStage, setAnalyzingStage] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Navigation View: 'home' (Landing Page with Sign In) vs 'workspace' (Code Editor & Diagnostics)
  const [currentView, setCurrentView] = useState<'home' | 'workspace'>('home');
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('smart_debugger_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Modals & Drawers
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);

  // History & Health
  const [historySessions, setHistorySessions] = useState<HistorySession[]>([]);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);

  // Editor Ref for line jumping
  const editorRef = useRef<MonacoCodeEditorHandle>(null);

  // Settings
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
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);

  const showNotification = (
    type: 'success' | 'error' | 'info',
    message: string,
    actionLabel?: string,
    onAction?: () => void
  ) => {
    setNotification({ type, message, actionLabel, onAction });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 5000);
  };

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

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    showNotification('success', `Welcome back, ${authenticatedUser.name}!`);
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('smart_debugger_user');
    } catch {}
    setUser(null);
    showNotification('info', 'Signed out successfully.');
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('smart_debugger_settings', JSON.stringify(newSettings));
      showNotification('success', 'Settings updated.');
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  };

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
    setInspectorTab('analysis');
    showNotification('info', `Loaded ${sample.title}`);
  };

  const handleFileUpload = (file: File) => {
    const MAX_SIZE = 500 * 1024;
    if (file.size > MAX_SIZE) {
      showNotification('error', `File exceeds 500KB limit (${(file.size / 1024).toFixed(1)}KB).`);
      return;
    }

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const extToLang: Record<string, SupportedLanguage> = {
      '.py': 'python',
      '.py3': 'python',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.mjs': 'javascript',
      '.cjs': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.java': 'java',
      '.cpp': 'cpp',
      '.cxx': 'cpp',
      '.cc': 'cpp',
      '.c': 'c',
      '.h': 'c',
      '.hpp': 'cpp',
      '.go': 'go',
      '.rs': 'rust',
      '.rb': 'ruby',
      '.php': 'php',
    };

    const detectedLang = extToLang[ext] || language;

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
        showNotification(
          'success',
          `Loaded ${file.name} successfully (${detectedLang.toUpperCase()}). Ready to analyze.`
        );
      }
    };
    reader.onerror = () => {
      showNotification('error', 'Could not read file.');
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    setCode('');
    setFileName(undefined);
    setDebugResponse(null);
    setFixedCode('');
    setOriginalCode('');
    setValidationResult(null);
    setTestCases([]);
    showNotification('info', 'Workspace cleared.');
  };

  const handleAnalyzeCode = async () => {
    if (!code || code.trim().length === 0) {
      showNotification('error', 'Please enter or paste some code to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setAnalyzingStage('Starting analysis...');

    try {
      const stageTimer1 = setTimeout(() => {
        setAnalyzingStage('Checking syntax & grammar...');
      }, 500);

      const stageTimer2 = setTimeout(() => {
        setAnalyzingStage('Localizing bugs & root causes...');
      }, 1200);

      const stageTimer3 = setTimeout(() => {
        setAnalyzingStage('Generating surgical fix...');
      }, 2200);

      const response = await submitDebugCode({
        code,
        language,
        fileName,
        provider: settings.aiProvider,
        model: settings.openRouterModel,
        openRouterKey: settings.openRouterKey,
        testCases,
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);

      setDebugResponse(response);
      setFixedCode(response.fixed_code);
      setOriginalCode(response.original_code);
      setValidationResult(response.validation);

      fetchHistory().then(setHistorySessions).catch(console.warn);

      showNotification(
        'success',
        `Analysis complete! Found ${response.issues.length} ${
          response.issues.length === 1 ? 'issue' : 'issues'
        }.`,
        'View Diff',
        () => {
          setCurrentTab('diff');
        }
      );

      // Auto switch inspector tab to analysis or diff
      if (response.issues.length > 0) {
        setInspectorTab('analysis');
      }
    } catch (err: any) {
      console.error('Debug error:', err);
      showNotification('error', err.message || 'Failed to complete AI code analysis.');
    } finally {
      setIsAnalyzing(false);
      setAnalyzingStage('');
    }
  };

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
          ? 'All validation checks passed!'
          : `Validation failed: ${res.details}`
      );
    } catch (err: any) {
      showNotification('error', err.message || 'Validation request failed.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleApplyFix = () => {
    if (!fixedCode) return;
    const prevCode = code;
    setCode(fixedCode);
    showNotification(
      'success',
      'Corrected code applied to main editor!',
      'Undo',
      () => setCode(prevCode)
    );
    setCurrentTab('workspace');
  };

  const handleRestoreOriginal = () => {
    if (!originalCode) return;
    setCode(originalCode);
    showNotification('info', 'Restored original code.');
  };

  const handleSelectHistorySession = (session: HistorySession) => {
    setCode(session.originalCode);
    setLanguage(session.language);
    setFileName(session.fileName);
    setOriginalCode(session.originalCode);
    setFixedCode(session.fixedCode);
    setValidationResult({
      status: session.validationStatus,
      details: 'Restored from previous history session.',
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
      provider_used: (session.providerUsed as any) || 'gemini',
    });
    setCurrentTab('diff');
    showNotification('info', `Loaded session from ${new Date(session.timestamp).toLocaleTimeString()}`);
  };

  const handleDeleteHistorySession = async (id: string) => {
    try {
      await deleteHistoryItem(id);
      setHistorySessions((prev) => prev.filter((s) => s.id !== id));
      showNotification('info', 'Session deleted.');
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete session.');
    }
  };

  const handleClearAllHistory = async () => {
    try {
      await clearAllHistory();
      setHistorySessions([]);
      showNotification('info', 'Debugging history cleared.');
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to clear history.');
    }
  };

  const handleJumpToLine = (lineNumber: number) => {
    if (currentTab !== 'workspace') {
      setCurrentTab('workspace');
    }
    setTimeout(() => {
      editorRef.current?.revealLine(lineNumber);
    }, 50);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800 antialiased">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium border transition-all animate-in fade-in slide-in-from-top-2 duration-150 ${
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
          <span className="leading-snug">{notification.message}</span>

          {notification.actionLabel && notification.onAction && (
            <button
              type="button"
              onClick={notification.onAction}
              className="ml-1 px-2 py-0.5 rounded bg-white font-bold text-blue-700 border border-blue-200 hover:bg-blue-50 shadow-2xs"
            >
              {notification.actionLabel}
            </button>
          )}

          <button
            type="button"
            onClick={() => setNotification(null)}
            className="ml-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main View: Home Page or Debugger Workspace */}
      {currentView === 'home' ? (
        <HomePage
          user={user}
          onOpenWorkspace={() => setCurrentView('workspace')}
          onOpenAuth={handleOpenAuth}
          onSignOut={handleSignOut}
          onOpenLanguages={() => setIsLanguagesOpen(true)}
        />
      ) : (
        <>
          {/* Navigation Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            onNewSession={handleReset}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onOpenLanguages={() => setIsLanguagesOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onGoHome={() => setCurrentView('home')}
            user={user}
            onOpenAuth={handleOpenAuth}
            onSignOut={handleSignOut}
            historyCount={historySessions.length}
            activeProvider={healthStatus?.activeProvider || settings.aiProvider}
          />

          {/* Main Container */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Workspace Toolbar & Samples */}
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

        {/* View Layout Switcher Bar */}
        <div className="h-11 bg-white border-b border-slate-200 px-4 flex items-center justify-between gap-3 text-xs shrink-0 select-none">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentTab('workspace')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                currentTab === 'workspace'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Columns className="w-3.5 h-3.5 text-blue-600" />
              <span>Workspace (Split View)</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('diff')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                currentTab === 'diff'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                currentTab === 'analysis'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bug className="w-3.5 h-3.5 text-amber-600" />
              <span>Diagnostics ({debugResponse ? debugResponse.issues.length : 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('validation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                currentTab === 'validation'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tests & Verification</span>
            </button>
          </div>

          {/* Quick Status Tag on Right */}
          <div className="hidden sm:flex items-center gap-2 text-slate-500 text-[11px]">
            {validationResult?.status === 'passed' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified
              </span>
            )}
            {fixedCode && (
              <button
                type="button"
                onClick={handleApplyFix}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold text-[11px] shadow-2xs transition-colors flex items-center gap-1"
                title="Apply fixed code into active editor"
              >
                <span>Apply Fix</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Workspace Main Area */}
        <main className="flex-1 p-3.5 overflow-hidden flex flex-col">
          {/* Split Mode (Workspace) */}
          {currentTab === 'workspace' && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full overflow-hidden">
              {/* Left Column: Monaco Editor (7 cols) */}
              <div className="lg:col-span-7 h-full flex flex-col min-h-0">
                <MonacoCodeEditor
                  ref={editorRef}
                  code={code}
                  onChange={setCode}
                  language={language}
                  issues={debugResponse?.issues}
                  fontSize={settings.editorFontSize}
                  onClear={() => setCode('')}
                  onFileDrop={handleFileUpload}
                  fileName={fileName}
                />
              </div>

              {/* Right Column: Interactive Companion Inspector (5 cols) */}
              <div className="lg:col-span-5 h-full flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Inspector Mini-tabs */}
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200 select-none text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setInspectorTab('analysis')}
                      className={`px-2.5 py-1 rounded-md font-bold text-xs transition-colors ${
                        inspectorTab === 'analysis'
                          ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Bugs & Root Cause ({debugResponse?.issues.length || 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectorTab('diff')}
                      className={`px-2.5 py-1 rounded-md font-bold text-xs transition-colors ${
                        inspectorTab === 'diff'
                          ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Mini Diff
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectorTab('validation')}
                      className={`px-2.5 py-1 rounded-md font-bold text-xs transition-colors ${
                        inspectorTab === 'validation'
                          ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Tests ({testCases.length})
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentTab(inspectorTab === 'diff' ? 'diff' : inspectorTab)}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                    title="Maximize panel"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Inspector Content */}
                <div className="flex-1 p-3 overflow-y-auto">
                  {inspectorTab === 'analysis' && (
                    <BugAnalysisPanel
                      debugResponse={debugResponse}
                      onSelectIssueLine={handleJumpToLine}
                      onViewDiff={() => setCurrentTab('diff')}
                    />
                  )}

                  {inspectorTab === 'diff' && (
                    <div className="h-full flex flex-col">
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
                        <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-500">
                          <Layers className="w-10 h-10 text-slate-300 mb-2" />
                          <h4 className="text-xs font-bold text-slate-700 mb-1">
                            No Diff Generated Yet
                          </h4>
                          <p className="text-[11px] text-slate-500 mb-3 max-w-xs">
                            Run "Analyze & Fix Code" to generate an automated correction and review
                            line-by-line differences.
                          </p>
                          <button
                            type="button"
                            onClick={handleAnalyzeCode}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                          >
                            Analyze Now
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {inspectorTab === 'validation' && (
                    <ValidationPanel
                      validationResult={validationResult}
                      testCases={testCases}
                      onUpdateTestCases={setTestCases}
                      onRunValidation={handleRunValidation}
                      isValidating={isValidating}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Full-width Diff Mode */}
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
                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white rounded-xl border border-slate-200">
                  <Layers className="w-12 h-12 text-slate-300 mb-3" />
                  <h3 className="text-base font-bold text-slate-800 mb-1">
                    No Comparison Available Yet
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mb-4">
                    Submit code or pick a sample scenario, then click "Analyze & Fix Code" to view
                    side-by-side Monaco diff highlights.
                  </p>
                  <button
                    type="button"
                    onClick={handleAnalyzeCode}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                  >
                    Analyze Code Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Full-width Analysis Mode */}
          {currentTab === 'analysis' && (
            <div className="flex-1 h-full min-h-0 max-w-4xl mx-auto w-full">
              <BugAnalysisPanel
                debugResponse={debugResponse}
                onSelectIssueLine={handleJumpToLine}
                onViewDiff={() => setCurrentTab('diff')}
              />
            </div>
          )}

          {/* Full-width Validation Mode */}
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
    </>
  )}

      {/* Drawers & Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialMode={authMode}
      />

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
