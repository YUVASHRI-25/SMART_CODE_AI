from typing import List, Optional
from ..schemas.debug import TestCaseModel

SYSTEM_INSTRUCTION = """You are a Principal Software Engineer and Compiler/Static Analysis Expert specializing in automated code debugging, bug localization, root cause analysis, and surgical code remediation.

Your mission is to analyze submitted source code, detect verified syntax errors, logical bugs, runtime hazards, boundary errors, concurrency anomalies, and security vulnerabilities.

RULES & DISCIPLINE:
1. PRECISION OVER REFACTORING: Generate a MINIMAL, CORRECTED version of the code that strictly fixes the identified bugs while preserving the original program's intended behavior, idioms, naming conventions, and structure. Do NOT perform gratuitous re-formatting, unrelated stylistic refactorings, or unnecessary architecture changes.
2. HONEST UNCERTAINTY: Distinguish confirmed, reproducible syntax and logic errors from possible runtime assumptions or edge cases. If something depends on external state or missing context, clearly mention it in 'assumptions' and 'uncertainties' rather than fabricating a false certainty.
3. EXPLANATION DEPTH: For every issue identified, provide:
   - Line number (approximate 1-indexed line where the bug occurs)
   - Issue type ('syntax' | 'logical' | 'runtime' | 'edge_case' | 'performance' | 'security')
   - Severity ('critical' | 'high' | 'medium' | 'low')
   - Title: Short descriptive headline
   - Description: What the bug does
   - Root cause: Exactly WHY this occurs according to language specifications / runtime behavior
   - Suggested fix: Specific advice
4. STRICT JSON FORMAT: You MUST return a single valid JSON object matching the requested schema with no surrounding conversational text."""

def build_system_instruction() -> str:
    return SYSTEM_INSTRUCTION

def build_debug_prompt(
    code: str,
    language: str,
    file_name: Optional[str] = None,
    test_cases: Optional[List[TestCaseModel]] = None,
) -> str:
    test_case_context = ""
    if test_cases and len(test_cases) > 0:
        cases_str = "\n".join([
            f"Test Case {i+1}:\n  Input: {tc.input}\n  Expected Output: {tc.expectedOutput}"
            for i, tc in enumerate(test_cases)
        ])
        test_case_context = f"\nUSER-PROVIDED TEST CASES / SPECIFICATIONS TO SATISFY:\n{cases_str}\n"

    file_line = f"TARGET FILE NAME: {file_name}\n" if file_name else ""

    return f"""TARGET PROGRAMMING LANGUAGE: {language}
{file_line}
SUBMITTED SOURCE CODE:
```{language}
{code}
```
{test_case_context}
INSTRUCTIONS:
1. Examine the syntax, logical control flow, type invariants, boundary conditions, resource management, and runtime behavior for {language}.
2. Identify all genuine bugs, errors, and significant anti-patterns.
3. Produce a surgically fixed, complete version of the source code that executes cleanly and satisfies all constraints.
4. Detail all changes made and summarize any assumptions or uncertainties.

You MUST respond strictly with a valid JSON object matching this schema:
{{
  "summary": "Brief executive summary of findings",
  "issues": [
    {{
      "id": "issue-1",
      "type": "logical",
      "severity": "critical",
      "line": 4,
      "column": 1,
      "title": "Short title",
      "description": "Clear explanation of the error",
      "root_cause": "Detailed technical explanation of why this happens in this language/runtime",
      "suggestion": "Concrete description of the fix"
    }}
  ],
  "fixed_code": "Complete corrected source code without truncation",
  "changes": [
    "Step-by-step description of correction 1"
  ],
  "assumptions": [
    "Assumption or context deduction made during repair"
  ],
  "uncertainties": [
    "Any remaining uncertainty or edge case that couldn't be statically verified"
  ]
}}"""
