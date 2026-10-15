import type { SupportedLanguage, TestCase } from '../src/types/debugger.ts';

export interface PromptInput {
  code: string;
  language: SupportedLanguage;
  fileName?: string;
  testCases?: TestCase[];
}

export function buildSystemInstruction(): string {
  return `You are a Principal Software Engineer and Compiler/Static Analysis Expert specializing in automated code debugging, bug localization, root cause analysis, and surgical code remediation.

Your mission is to analyze submitted source code, detect verified syntax errors, logical bugs, runtime hazards, boundary errors, concurrency anomalies, and security vulnerabilities.

RULES & DISCIPLINE:
1. PRECISION OVER REFACTORING: Generate a MINIMAL, CORRECTED version of the code that strictly fixes the identified bugs while preserving the original program's intended behavior, idioms, naming conventions, and structure. Do NOT perform gratuitous re-formatting, unrelated stylistic refactorings, or unnecessary architecture changes.
2. HONEST UNCERTAINTY: Distinguish confirmed, reproducible syntax and logic errors from possible runtime assumptions or edge cases. If something depends on external state or missing context, clearly mention it in 'assumptions' and 'uncertainties' rather than fabricating a false certainty.
3. EXPLANATION DEPTH: For every issue identified, provide:
   - Line number (approximate 1-indexed line where the bug occurs or is triggered)
   - Issue type ('syntax' | 'logical' | 'runtime' | 'edge_case' | 'performance' | 'security')
   - Severity ('critical' | 'high' | 'medium' | 'low')
   - Title: Short descriptive headline
   - Description: What the bug does
   - Root cause: Exactly WHY this occurs according to language specifications / runtime behavior
   - Suggested fix: Specific advice
4. STRICT JSON FORMAT: You MUST return a single valid JSON object matching the requested schema with no surrounding conversational text, no markdown backticks around the json if possible, or inside a clean json markdown block.`;
}

export function buildDebugPrompt(input: PromptInput): string {
  const { code, language, fileName, testCases } = input;

  let testCaseContext = '';
  if (testCases && testCases.length > 0) {
    testCaseContext = `
USER-PROVIDED TEST CASES / SPECIFICATIONS TO SATISFY:
${testCases
  .map(
    (tc, idx) =>
      `Test Case ${idx + 1}:
  Input: ${tc.input}
  Expected Output: ${tc.expectedOutput}`
  )
  .join('\n')}
`;
  }

  return `TARGET PROGRAMMING LANGUAGE: ${language}
${fileName ? `TARGET FILE NAME: ${fileName}` : ''}

SUBMITTED SOURCE CODE:
\`\`\`${language}
${code}
\`\`\`
${testCaseContext}
INSTRUCTIONS:
1. Examine the syntax, logical control flow, type invariants, boundary conditions, resource management, and runtime behavior for ${language}.
2. Identify all genuine bugs, errors, and significant anti-patterns.
3. Produce a surgically fixed, complete version of the source code that executes cleanly and satisfies all constraints.
4. Detail all changes made and summarize any assumptions or uncertainties.

You MUST respond strictly with a valid JSON object matching this schema:
{
  "summary": "Brief executive summary of findings (e.g. 'Found 2 logical errors including mutable default argument and boundary overflow')",
  "issues": [
    {
      "id": "issue-1",
      "type": "logical", // one of: "syntax", "logical", "runtime", "edge_case", "performance", "security"
      "severity": "critical", // one of: "critical", "high", "medium", "low"
      "line": 4, // 1-indexed approximate line number
      "column": 1,
      "title": "Short title",
      "description": "Clear explanation of the error",
      "root_cause": "Detailed technical explanation of why this happens in this language/runtime",
      "suggestion": "Concrete description of the fix",
      "code_snippet": "Exact line of faulty code (e.g. 'for (let i = 0; i <= arr.length; i++)')",
      "fixed_snippet": "Exact corrected replacement line (e.g. 'for (let i = 0; i < arr.length; i++)')"
    }
  ],
  "fixed_code": "Complete corrected source code without truncation",
  "changes": [
    "Step-by-step description of correction 1",
    "Step-by-step description of correction 2"
  ],
  "assumptions": [
    "Assumption or context deduction made during repair"
  ],
  "uncertainties": [
    "Any remaining uncertainty or edge case that couldn't be statically verified"
  ]
}`;
}
