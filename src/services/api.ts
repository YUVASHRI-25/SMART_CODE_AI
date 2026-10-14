import {
  DebugRequest,
  DebugResponse,
  HistorySession,
  LanguageInfo,
  SupportedLanguage,
  TestCase,
  ValidationResult,
} from '../types/debugger';
import { SampleSnippet } from '../data/sampleCodes';

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

export async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch('/api/health');
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchLanguages(): Promise<{
  languages: LanguageInfo[];
  samples: SampleSnippet[];
}> {
  const res = await fetch('/api/languages');
  if (!res.ok) {
    throw new Error(`Failed to fetch languages: ${res.statusText}`);
  }
  return res.json();
}

export async function submitDebugCode(req: DebugRequest): Promise<DebugResponse> {
  const res = await fetch('/api/debug', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || `Debug request failed with status ${res.status}`);
  }
  return data;
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

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || `Validation failed: ${res.statusText}`);
  }
  return data;
}

export async function fetchHistory(): Promise<HistorySession[]> {
  const res = await fetch('/api/history');
  if (!res.ok) {
    throw new Error(`Failed to fetch history: ${res.statusText}`);
  }
  const data = await res.json();
  return data.sessions || [];
}

export async function fetchHistoryItem(id: string): Promise<HistorySession> {
  const res = await fetch(`/api/history/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch session: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteHistoryItem(id: string): Promise<void> {
  const res = await fetch(`/api/history/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete session: ${res.statusText}`);
  }
}

export async function clearAllHistory(): Promise<void> {
  const res = await fetch('/api/history', {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to clear history: ${res.statusText}`);
  }
}
