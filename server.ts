import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { buildSystemInstruction, buildDebugPrompt } from './server/promptTemplate.js';
import { validateTestCases, validateSyntax } from './server/validator.js';
import { historyStore } from './server/historyStore.js';
import { DebugRequest, DebugResponse, HistorySession, SupportedLanguage } from './src/types/debugger.js';
import { SAMPLE_CODES } from './src/data/sampleCodes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '5mb' }));

// Initialize Google Gemini Client if key exists
let geminiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  geminiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to clean JSON string from LLMs
function extractAndParseJson(raw: string): any {
  let cleaned = raw.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/```\s*$/i, '');
  }
  cleaned = cleaned.trim();

  // Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Attempt to locate first { and last }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const sliced = cleaned.slice(firstBrace, lastBrace + 1);
      return JSON.parse(sliced);
    }
    throw err;
  }
}

// API Routes

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  const hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your_api_key_here');
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Smart Code Debugger & Automated Bug Fixing System',
    providers: {
      openrouter: {
        configured: hasOpenRouter,
        model: process.env.OPENROUTER_MODEL || 'qwen/qwen-2.5-coder-32b-instruct',
      },
      gemini: {
        configured: hasGemini,
        model: 'gemini-3.8-flash',
      },
    },
    activeProvider: hasOpenRouter ? 'openrouter' : (hasGemini ? 'gemini' : 'none'),
  });
});

// 2. Supported languages and samples
app.get('/api/languages', (req: Request, res: Response) => {
  const languages = [
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

  res.json({
    languages,
    samples: SAMPLE_CODES,
  });
});

// 3. Debug endpoint (Core AI bug detection and automated fix generation)
app.post('/api/debug', async (req: Request, res: Response) => {
  try {
    const { code, language, fileName, provider: requestedProvider, model: requestedModel, testCases } = req.body as DebugRequest;

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Source code is required and cannot be empty.',
      });
    }

    if (code.length > 500000) {
      return res.status(400).json({
        error: 'Payload Too Large',
        message: 'Source code exceeds maximum allowed size of 500KB.',
      });
    }

    const validLanguages: SupportedLanguage[] = ['python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'go', 'rust', 'ruby', 'php'];
    if (!validLanguages.includes(language)) {
      return res.status(400).json({
        error: 'Unsupported Language',
        message: `Language '${language}' is not supported. Supported: ${validLanguages.join(', ')}`,
      });
    }

    const systemPrompt = buildSystemInstruction();
    const userPrompt = buildDebugPrompt({ code, language, fileName, testCases });

    let rawAiResponse = '';
    let providerUsed: 'openrouter' | 'gemini' | 'simulated' = 'gemini';
    let modelUsed = 'gemini-3.8-flash';

    const openRouterApiKey =
      (req.body as any).openRouterKey ||
      (req.headers['x-openrouter-key'] as string) ||
      process.env.OPENROUTER_API_KEY;

    const hasOpenRouterKey = Boolean(openRouterApiKey && openRouterApiKey !== 'your_api_key_here');
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');

    const preferOpenRouter = requestedProvider === 'openrouter' || (!requestedProvider && hasOpenRouterKey);

    // Call OpenRouter if preferred and key exists
    if (preferOpenRouter && hasOpenRouterKey) {
      try {
        const targetModel = requestedModel || process.env.OPENROUTER_MODEL || 'qwen/qwen-2.5-coder-32b-instruct';
        console.log(`[AI Debug] Calling OpenRouter with model: ${targetModel}`);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45000);

        const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openRouterApiKey}`,
            'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
            'X-Title': 'Smart Code Debugger & Bug Fixing System',
          },
          body: JSON.stringify({
            model: targetModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.1,
            response_format: { type: 'json_object' },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!openRouterRes.ok) {
          const errBody = await openRouterRes.text();
          console.warn(`[AI Debug] OpenRouter returned ${openRouterRes.status}: ${errBody}`);
          throw new Error(`OpenRouter API error: ${openRouterRes.statusText}`);
        }

        const openRouterData = await openRouterRes.json();
        rawAiResponse = openRouterData.choices?.[0]?.message?.content || '';
        providerUsed = 'openrouter';
        modelUsed = targetModel;
      } catch (orError: any) {
        console.warn(`[AI Debug] OpenRouter failed (${orError.message}), falling back to Gemini if available...`);
      }
    }

    // Call Gemini if OpenRouter was not used or failed
    if (!rawAiResponse && geminiClient && hasGeminiKey) {
      const geminiCandidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
      let lastGeminiErr: any = null;

      const callGeminiWithTimeout = async (modelName: string, timeoutMs = 25000) => {
        return Promise.race([
          geminiClient!.models.generateContent({
            model: modelName,
            contents: userPrompt,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
          ),
        ]);
      };

      for (const modelCandidate of geminiCandidateModels) {
        try {
          console.log(`[AI Debug] Querying Gemini model: ${modelCandidate}...`);
          const response = await callGeminiWithTimeout(modelCandidate, 25000);

          if (response.text && response.text.trim().length > 0) {
            rawAiResponse = response.text;
            providerUsed = 'gemini';
            modelUsed = modelCandidate;
            break;
          }
        } catch (geminiErr: any) {
          lastGeminiErr = geminiErr;
          console.warn(`[AI Debug] Gemini candidate ${modelCandidate} failed: ${geminiErr.message}`);
        }
      }

      if (!rawAiResponse && lastGeminiErr) {
        console.error('[AI Debug] Gemini call failed:', lastGeminiErr);
        // Clean error message if 503
        if (lastGeminiErr.message?.includes('503') || lastGeminiErr.message?.includes('high demand')) {
          throw new Error('AI Model is temporarily experiencing high traffic. Please click Analyze again in a few seconds.');
        }
        throw new Error(lastGeminiErr.message || 'AI model service temporarily unavailable');
      }
    }

    // If still no response, return a helpful error
    if (!rawAiResponse) {
      return res.status(503).json({
        error: 'AI Provider Unavailable',
        message:
          'Neither OpenRouter API key nor Gemini API key is currently active. Please configure OPENROUTER_API_KEY in your environment, or provide GEMINI_API_KEY in settings.',
      });
    }

    // Parse structured AI response
    let parsed: any;
    try {
      parsed = extractAndParseJson(rawAiResponse);
    } catch (parseError) {
      console.error('[AI Debug] Failed to parse JSON response:', rawAiResponse);
      return res.status(502).json({
        error: 'Malformed AI Response',
        message: 'The AI model response could not be parsed into the required structured schema.',
        raw: rawAiResponse.slice(0, 500),
      });
    }

    const codeLines = code.split('\n');

    // Sanitize and format issues
    const formattedIssues = (parsed.issues || []).map((issue: any, idx: number) => {
      const lineNum = typeof issue.line === 'number' ? issue.line : undefined;
      const extractedLine = lineNum && lineNum <= codeLines.length ? codeLines[lineNum - 1]?.trim() : undefined;

      return {
        id: issue.id || `issue-${idx + 1}`,
        type: issue.type || 'logical',
        severity: issue.severity || 'medium',
        line: lineNum,
        column: typeof issue.column === 'number' ? issue.column : undefined,
        title: issue.title || `Detected ${issue.type || 'code'} issue`,
        description: issue.description || 'No description provided.',
        root_cause: issue.root_cause || issue.rootCause || 'Root cause could not be determined with absolute certainty.',
        suggestion: issue.suggestion || 'Review code logic against language specifications.',
        code_snippet: issue.code_snippet || extractedLine,
        fixed_snippet: issue.fixed_snippet || undefined,
      };
    });

    const fixedCode = parsed.fixed_code || parsed.fixedCode || code;

    // Validate the fixed code
    const validationResult = validateTestCases(fixedCode, language, testCases || []);

    const sessionId = `dbg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();

    const responsePayload: DebugResponse = {
      id: sessionId,
      timestamp,
      language,
      summary: parsed.summary || 'Code analysis completed.',
      issues: formattedIssues,
      fixed_code: fixedCode,
      original_code: code,
      changes: Array.isArray(parsed.changes) ? parsed.changes : [],
      assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions : [],
      uncertainties: Array.isArray(parsed.uncertainties) ? parsed.uncertainties : [],
      validation: validationResult,
      model_used: modelUsed,
      provider_used: providerUsed,
    };

    // Save to Debugging History
    const historyItem: HistorySession = {
      id: sessionId,
      timestamp,
      language,
      fileName,
      summary: responsePayload.summary,
      issueCount: formattedIssues.length,
      criticalCount: formattedIssues.filter((i: any) => i.severity === 'critical' || i.type === 'syntax').length,
      originalCode: code,
      fixedCode,
      changes: responsePayload.changes,
      validationStatus: validationResult.status,
      modelUsed,
      providerUsed,
    };
    historyStore.add(historyItem);

    return res.json(responsePayload);
  } catch (error: any) {
    console.error('[API /api/debug] Unexpected error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred while debugging code.',
    });
  }
});

// 4. Code Validation & Test Case Execution
app.post('/api/validate', (req: Request, res: Response) => {
  try {
    const { code, language, testCases } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code is required for validation.' });
    }

    const result = validateTestCases(code, language || 'python', testCases || []);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: 'Validation failed', message: err.message });
  }
});

// 5. History Endpoints
app.get('/api/history', (req: Request, res: Response) => {
  res.json({
    sessions: historyStore.getAll(),
  });
});

app.get('/api/history/:id', (req: Request, res: Response) => {
  const session = historyStore.getById(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'History session not found' });
  }
  return res.json(session);
});

app.delete('/api/history/:id', (req: Request, res: Response) => {
  const deleted = historyStore.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Session not found to delete' });
  }
  return res.json({ success: true, message: 'Session deleted' });
});

app.delete('/api/history', (req: Request, res: Response) => {
  historyStore.clear();
  return res.json({ success: true, message: 'Debugging history cleared' });
});

// Mount Vite or serve static assets
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Smart Code Debugger] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
