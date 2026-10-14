# SMART CODE DEBUGGING AND AUTOMATED BUG FIXING SYSTEM USING AI

An intelligent, multi-language developer platform for detecting programming errors, generating verified surgical remediations, explaining root causes, comparing diffs with Monaco Editor, and executing test suites.

Powered by **Qwen2.5 Coder 32B Instruct** via OpenRouter and **Google Gemini 3.8 Flash**, providing high-precision bug localization without unprompted refactoring.

---

## 1. Project Overview

Students and developers frequently lose hours attempting to locate subtle logical errors, unhandled boundary cases, mutable default argument traps, async race conditions, and memory leaks. 

The **Smart Code Debugger** bridges this gap by:
1. Localizing exact line numbers and root causes ("*Why this problem occurs*") according to language specifications.
2. Generating a minimal, surgical fix preserving the original code's architecture and naming conventions.
3. Providing an interactive side-by-side or inline **Monaco Diff Viewer** with copy and download actions.
4. Validating fixes against safe syntax AST parsers and user-defined test cases before claiming verification.
5. Maintaining a persistent session history for iterative debugging.

---

## 2. Key Features

- **Multi-Language Monaco Workspace**: Native syntax highlighting and error markers for Python, JavaScript, TypeScript, Java, C++, C, Go, Rust, Ruby, and PHP.
- **Preloaded Buggy Code Scenarios**: One-click test cases for classic bugs (Python mutable default args, JS unhandled Promise rejections, TS type narrowing, C++ memory leaks, Java ConcurrentModificationException).
- **Dual AI Reasoning Engine**:
  - **OpenRouter**: Configured for `qwen/qwen-2.5-coder-32b-instruct`.
  - **Google Gemini**: Built-in `gemini-3.8-flash` with structured JSON schema extraction.
- **Surgical Remediation**: Strictly fixes identified defects; avoids gratuitous re-formatting or unwanted refactorings.
- **Code Validation & Test Runner**: Language-appropriate syntax checking and test case simulation (input/expected output) to prevent blind code trust.
- **File Upload & Strict Validation**: Accepts source code files (.py, .js, .ts, .cpp, .java, etc.) with file type verification and a 500KB size cap.
- **Audit History**: Full session persistence in `.data/history.json` with search, filter, and 1-click restore.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 19 with Vite & TypeScript
- **Styling**: Tailwind CSS v4
- **Code & Diff Editor**: `@monaco-editor/react` (VS Code engine in browser)
- **Icons**: Lucide React
- **Animations**: Motion

### Backend (Full-Stack Architecture)
- **Primary Node/Express Engine**: `server.ts` mounting Vite middlewares, OpenRouter API client, Google GenAI SDK (`@google/genai`), and AST syntax validator.
- **Python FastAPI Service**: Complete alternative/standalone Python FastAPI service located in `backend/` with Pydantic v2 models, OpenRouter client, and Pytest test suite.
- **Database / Persistence**: File-backed local JSON store with safe transactional writes.

---

## 4. Project Folder Structure

```text
smart-code-debugger/
├── backend/                        # Python FastAPI Backend
│   ├── app/
│   │   ├── main.py                 # FastAPI application & CORS
│   │   ├── core/config.py          # Pydantic BaseSettings
│   │   ├── schemas/debug.py        # Pydantic request/response models
│   │   ├── services/
│   │   │   ├── prompt_service.py   # Modular prompt builder
│   │   │   ├── openrouter_service.py # Qwen2.5 Coder API client
│   │   │   ├── validator_service.py  # AST & test suite runner
│   │   │   └── history_service.py    # History repository
│   │   └── api/endpoints.py        # REST router (/health, /debug, etc.)
│   ├── tests/
│   │   └── test_api.py             # Pytest automated test suite
│   └── requirements.txt            # Python dependencies
├── server/                         # Server-side TypeScript modules
│   ├── promptTemplate.ts           # System & user prompt templates
│   ├── validator.ts                # Syntax AST & test-case validation engine
│   └── historyStore.ts             # Persistent history file store
├── src/
│   ├── components/                 # React UI Components
│   │   ├── Sidebar.tsx             # Navigation & Engine status
│   │   ├── Header.tsx              # Toolbar, language & sample picker
│   │   ├── MonacoCodeEditor.tsx    # Monaco editor with issue markers
│   │   ├── MonacoDiffViewer.tsx    # Side-by-side / inline diff viewer
│   │   ├── BugAnalysisPanel.tsx    # Root cause & suggested fix cards
│   │   ├── ValidationPanel.tsx     # Test case manager & run status
│   │   ├── HistoryDrawer.tsx       # Searchable session history
│   │   ├── SettingsModal.tsx       # Provider & model configuration
│   │   └── SupportedLanguagesModal.tsx # Languages directory
│   ├── data/sampleCodes.ts         # Preloaded realistic buggy programs
│   ├── services/api.ts             # Frontend REST API client
│   ├── types/debugger.ts           # TypeScript type definitions
│   ├── App.tsx                     # Main layout & state orchestrator
│   └── main.tsx                    # React DOM entry point
├── server.ts                       # Full-stack Node/Express server (Port 3000)
├── .env.example                    # Environment variable template
├── package.json                    # Node dependencies & npm scripts
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # Comprehensive system documentation
```

---

## 5. Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python** (optional for standalone FastAPI): Python 3.10+
- **OpenRouter API Key** (optional, for Qwen2.5 Coder): Get one at [openrouter.ai](https://openrouter.ai/)

---

## 6. Environment Variable Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set the variables inside `.env`:

```env
# Google Gemini API key (Pre-injected in Google AI Studio)
GEMINI_API_KEY="your_gemini_api_key_here"

# OpenRouter API Key (for Qwen2.5 Coder 32B Instruct)
OPENROUTER_API_KEY="sk-or-v1-..."

# Configurable OpenRouter model
OPENROUTER_MODEL="qwen/qwen-2.5-coder-32b-instruct"

# Preferred default provider ('gemini' or 'openrouter')
AI_PROVIDER="gemini"

PORT=3000
```

---

## 7. How to Run the Application

### Option A: Full-Stack Node Server (Frontend + REST API on Port 3000)

**Windows PowerShell:**
```powershell
# 1. Install dependencies
npm install

# 2. Launch full-stack dev server
npm run dev
```

**VS Code Terminal (bash/zsh):**
```bash
npm install
npm run dev
```

The application will start on **http://localhost:3000** with hot middleware reloads.

---

### Option B: Standalone Python FastAPI Backend

To run the Python backend separately on port 8000:

**Windows PowerShell:**
```powershell
# 1. Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 2. Install Python requirements
pip install -r backend/requirements.txt

# 3. Start FastAPI server with Uvicorn
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive Swagger documentation is available at **http://localhost:8000/docs**.

---

## 8. REST API Documentation

### 1. `GET /api/health`
Checks backend connectivity and active AI provider status.
```json
{
  "status": "healthy",
  "service": "Smart Code Debugger & Automated Bug Fixing System",
  "providers": {
    "openrouter": { "configured": true, "model": "qwen/qwen-2.5-coder-32b-instruct" },
    "gemini": { "configured": true, "model": "gemini-3.8-flash" }
  },
  "activeProvider": "openrouter"
}
```

### 2. `GET /api/languages`
Retrieves supported programming languages and preloaded buggy test snippets.

### 3. `POST /api/debug`
Submits code for AI bug localization and surgical remediation.
- **Request Body**:
  ```json
  {
    "code": "def calc(data, cache=[]): ...",
    "language": "python",
    "fileName": "calc.py",
    "provider": "openrouter",
    "model": "qwen/qwen-2.5-coder-32b-instruct",
    "testCases": [
      { "id": "1", "input": "calc(10)", "expectedOutput": "[10]" }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "id": "dbg_1728901234_abc12",
    "timestamp": "2026-10-14T06:30:00.000Z",
    "language": "python",
    "summary": "Detected 1 critical logical error: mutable default argument",
    "issues": [
      {
        "id": "issue-1",
        "type": "logical",
        "severity": "critical",
        "line": 1,
        "title": "Mutable Default Argument Trap",
        "description": "Default argument 'cache=[]' is evaluated once at function definition time.",
        "root_cause": "Python binds default arguments when the def statement executes, creating a shared object.",
        "suggestion": "Use None as the default argument and initialize 'cache = []' inside the function body."
      }
    ],
    "fixed_code": "def calc(data, cache=None):\n    if cache is None:\n        cache = []\n    ...",
    "changes": [
      "Replaced mutable default parameter 'cache=[]' with 'cache=None'"
    ],
    "validation": {
      "status": "passed",
      "details": "All test cases verified successfully.",
      "syntaxValid": true
    }
  }
  ```

### 4. `POST /api/validate`
Executes syntax checks and evaluates test cases against submitted code.

### 5. `GET /api/history`
Returns previous debugging sessions stored in `.data/history.json`.

### 6. `DELETE /api/history/{id}` & `DELETE /api/history`
Deletes a specific session or clears all stored debugging records.

---

## 9. Automated Testing Instructions

### Backend Tests (Pytest)
```bash
pytest backend/tests/test_api.py -v
```
Tests cover:
- Empty code submission rejection (HTTP 400)
- Unsupported language validation
- Python AST syntax checking (valid code, missing colons, unclosed brackets)
- Test-case evaluation engine
- History CRUD operations
- Structured prompt template generation

### Frontend Lint & Compilation
```bash
npm run lint
npm run build
```

---

## 10. Security Limitations & Sandbox Discipline

- **No Arbitrary Code Execution on Server**: The system performs static AST validation and simulated test runner evaluations. It does **not** execute arbitrary submitted C/C++/Python binaries directly on the host operating system.
- **Strict Payload Limits**: Code submissions are limited to a maximum of 500KB to protect against buffer exhaustion.
- **Zero Client-Side Secrets**: API keys are accessed exclusively on the server side via environment variables.

---

## 11. Future Enhancements

1. **Docker Containerized Sandbox**: Integrate Docker / gVisor micro-containers to execute compiled binaries safely in an isolated environment.
2. **Multi-File Project Debugging**: Support ZIP archives containing multi-file repositories with dependency graph resolution.
3. **Automated Unit Test Generation**: Auto-generate pytest/vitest test suites covering uncovered edge cases.
