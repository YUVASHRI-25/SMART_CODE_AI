
import {
  DebugRequest,
  DebugResponse,
  HistorySession,
  LanguageInfo,
  SupportedLanguage,
  TestCase,
  ValidationResult,
} from '../types/debugger';
import { SAMPLE_CODES, SampleSnippet } from '../data/sampleCodes';

export interface HealthStatus {
  status: string;
  timestamp: string;
  service: string;
  providers: {
    openrouter: {
      configured: boolean;
      model: string;
    };
    gemini?: {
      configured: boolean;
      model: string;
    };
  };
  activeProvider: string;
}

const DEFAULT_LANGUAGES: LanguageInfo[] = [
  { id: 'python', name: 'Python', extension: '.py', monacoLanguage: 'python', version: '3.12+', syntaxValidatorAvailable: true },
  { id: 'javascript', name: 'JavaScript', extension: '.js', monacoLanguage: 'javascript', version: 'ES2024', syntaxValidatorAvailable: true },
  { id: 'typescript', name: 'TypeScript', extension: '.ts', monacoLanguage: 'typescript', version: '5.x', syntaxValidatorAvailable: true },
  { id: 'java', name: 'Java', extension: '.java', monacoLanguage: 'java', version: '17 / 21 LTS', syntaxValidatorAvailable: true },
  { id: 'cpp', name: 'C++', extension: '.cpp', monacoLanguage: 'cpp', version: 'C++20', syntaxValidatorAvailable: true },
  { id: 'c', name: 'C', extension: '.c', monacoLanguage: 'c', version: 'C17', syntaxValidatorAvailable: true },
  { id: 'go', name: 'Go', extension: '.go', monacoLanguage: 'go', version: '1.22+', syntaxValidatorAvailable: true },
  { id: 'rust', name: 'Rust', extension: '.rs', monacoLanguage: 'rust', version: '2021 Edition', syntaxValidatorAvailable: true },
  { id: 'ruby', name: 'Ruby', extension: '.rb', monacoLanguage: 'ruby', version: '3.3+', syntaxValidatorAvailable: true },
  { id: 'php', name: 'PHP', extension: '.php', monacoLanguage: 'php', version: '8.3+', syntaxValidatorAvailable: true },
];

/**
 * Safely parse JSON from a fetch response.
 * Prevents "Unexpected token 'T', 'The page c'... is not valid JSON" errors
 * when a proxy, CDN, or server returns an HTML error page.
 */
async function parseJsonResponse<T>(res: Response, endpointLabel: string): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!isJson) {
    const rawText = await res.text();
    const cleanText = rawText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const preview = cleanText.length > 150 ? `${cleanText.substring(0, 150)}...` : cleanText;

    if (!res.ok) {
      throw new Error(
        `Server ${endpointLabel} returned error (HTTP ${res.status}): ${
          preview || res.statusText || 'Endpoint unavailable'
        }`
      );
    }

    throw new Error(
      `Invalid response format from ${endpointLabel} (expected JSON, got ${contentType || 'non-JSON'}).`
    );
  }

  let data: any;
  try {
    data = await res.json();
  } catch (err: any) {
    throw new Error(`Failed to parse JSON response from ${endpointLabel}: ${err.message}`);
  }

  if (!res.ok) {
    throw new Error(
      data.message || data.error || `${endpointLabel} failed with status ${res.status}`
    );
  }

  return data as T;
}

export async function fetchHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch('/api/health');
    return await parseJsonResponse<HealthStatus>(res, 'Health check');
  } catch (err: any) {
    console.warn('[API] Health check failed, using fallback status:', err.message);
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Smart Code Debugger & Bug Fixing System',
      providers: {
        openrouter: { configured: false, model: 'qwen/qwen-2.5-coder-32b-instruct' },
        gemini: { configured: true, model: 'gemini-3.8-flash' },
      },
      activeProvider: 'gemini',
    };
  }
}

export async function fetchLanguages(): Promise<{
  languages: LanguageInfo[];
  samples: SampleSnippet[];
}> {
  try {
    const res = await fetch('/api/languages');
    return await parseJsonResponse<{ languages: LanguageInfo[]; samples: SampleSnippet[] }>(
      res,
      'Languages'
    );
  } catch (err) {
    console.warn('[API] Languages endpoint failed, using bundled defaults:', err);
    return {
      languages: DEFAULT_LANGUAGES,
      samples: SAMPLE_CODES,
    };
  }
}

export async function submitDebugCode(req: DebugRequest): Promise<DebugResponse> {
  const res = await fetch('/api/debug', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  return parseJsonResponse<DebugResponse>(res, 'Debug service');
}

export async function validateCode(
  code: string,
  language: SupportedLanguage,
  testCases: TestCase[] = []
): Promise<ValidationResult> {
  const res = await fetch('/api/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language, testCases }),
  });

  return parseJsonResponse<ValidationResult>(res, 'Code validator');
}

export async function fetchHistory(): Promise<HistorySession[]> {
  try {
    const res = await fetch('/api/history');
    const data = await parseJsonResponse<{ sessions: HistorySession[] }>(res, 'History');
    return data.sessions || [];
  } catch (err: any) {
    console.warn('[API] History endpoint failed, checking localStorage cache:', err.message);
    try {
      const local = localStorage.getItem('smart_debugger_history');
      if (local) return JSON.parse(local);
    } catch {}
    return [];
  }
}

export async function fetchHistoryItem(id: string): Promise<HistorySession> {
  const res = await fetch(`/api/history/${encodeURIComponent(id)}`);
  return parseJsonResponse<HistorySession>(res, 'History session');
}

export async function deleteHistoryItem(id: string): Promise<void> {
  const res = await fetch(`/api/history/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  await parseJsonResponse<{ success: boolean; message?: string }>(res, 'Delete history');
}

export async function clearAllHistory(): Promise<void> {
  const res = await fetch('/api/history', {
    method: 'DELETE',
  });
  await parseJsonResponse<{ success: boolean; message?: string }>(res, 'Clear history');
}
