export type SupportedLanguage =
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'java'
  | 'cpp'
  | 'c'
  | 'go'
  | 'rust'
  | 'ruby'
  | 'php';

export type IssueCategory =
  | 'syntax'
  | 'logical'
  | 'runtime'
  | 'edge_case'
  | 'performance'
  | 'security';

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface CodeIssue {
  id: string;
  type: IssueCategory;
  severity: IssueSeverity;
  line?: number;
  column?: number;
  title: string;
  description: string;
  root_cause: string; // "Why this occurs"
  suggestion: string;
  code_snippet?: string;
  fixed_snippet?: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
  executionTimeMs?: number;
  error?: string;
}

export interface ValidationResult {
  status: 'passed' | 'failed' | 'syntax_error' | 'not_run' | 'skipped';
  details: string;
  syntaxValid: boolean;
  syntaxMessage?: string;
  testCasesRun: number;
  testCasesPassed: number;
  testResults: TestCase[];
  executionTimeMs?: number;
}

export interface DebugResponse {
  id: string;
  timestamp: string;
  language: SupportedLanguage;
  summary: string;
  issues: CodeIssue[];
  fixed_code: string;
  original_code: string;
  changes: string[];
  assumptions: string[];
  uncertainties?: string[];
  validation: ValidationResult;
  model_used: string;
  provider_used: 'openrouter' | 'gemini' | 'simulated';
}

export interface DebugRequest {
  code: string;
  language: SupportedLanguage;
  fileName?: string;
  provider?: 'openrouter' | 'gemini';
  model?: string;
  openRouterKey?: string;
  testCases?: TestCase[];
}

export interface HistorySession {
  id: string;
  timestamp: string;
  language: SupportedLanguage;
  fileName?: string;
  summary: string;
  issueCount: number;
  criticalCount: number;
  originalCode: string;
  fixedCode: string;
  changes: string[];
  validationStatus: ValidationResult['status'];
  modelUsed: string;
  providerUsed: string;
}

export interface LanguageInfo {
  id: SupportedLanguage;
  name: string;
  extension: string;
  monacoLanguage: string;
  icon: string;
  version: string;
  syntaxValidatorAvailable: boolean;
}

export interface AppSettings {
  aiProvider: 'gemini' | 'openrouter';
  openRouterModel: string;
  openRouterKey?: string;
  hasOpenRouterKey: boolean;
  hasGeminiKey: boolean;
  autoValidateOnFix: boolean;
  editorFontSize: number;
  theme: 'light' | 'vs-dark';
}
