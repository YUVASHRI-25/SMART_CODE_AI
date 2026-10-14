from typing import List, Optional, Literal
from pydantic import BaseModel, Field

SupportedLanguage = Literal[
    'python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'go', 'rust', 'ruby', 'php'
]

IssueCategory = Literal['syntax', 'logical', 'runtime', 'edge_case', 'performance', 'security']
IssueSeverity = Literal['critical', 'high', 'medium', 'low']
ValidationStatus = Literal['passed', 'failed', 'syntax_error', 'not_run', 'skipped']

class CodeIssueModel(BaseModel):
    id: str = Field(..., description="Unique issue identifier")
    type: IssueCategory = Field(..., description="Category of detected issue")
    severity: IssueSeverity = Field(default="medium", description="Severity level")
    line: Optional[int] = Field(default=None, description="1-indexed line number")
    column: Optional[int] = Field(default=None, description="Column number")
    title: str = Field(..., description="Short descriptive title of the issue")
    description: str = Field(..., description="Clear explanation of the error")
    root_cause: str = Field(..., description="Why the problem occurs in this language")
    suggestion: str = Field(..., description="Suggested correction")

class TestCaseModel(BaseModel):
    id: str
    input: str
    expectedOutput: str
    actualOutput: Optional[str] = None
    passed: Optional[bool] = None
    executionTimeMs: Optional[float] = None
    error: Optional[str] = None

class ValidationResultModel(BaseModel):
    status: ValidationStatus
    details: str
    syntaxValid: bool
    syntaxMessage: Optional[str] = None
    testCasesRun: int = 0
    testCasesPassed: int = 0
    testResults: List[TestCaseModel] = []
    executionTimeMs: Optional[float] = None

class DebugRequest(BaseModel):
    code: str = Field(..., description="Source code submitted for debugging", min_length=1)
    language: SupportedLanguage = Field(..., description="Target programming language")
    fileName: Optional[str] = Field(default=None, description="Optional original file name")
    testCases: Optional[List[TestCaseModel]] = Field(default=[], description="User-supplied test cases")

class DebugResponse(BaseModel):
    id: str
    timestamp: str
    language: SupportedLanguage
    summary: str
    issues: List[CodeIssueModel]
    fixed_code: str
    original_code: str
    changes: List[str]
    assumptions: List[str]
    uncertainties: Optional[List[str]] = []
    validation: ValidationResultModel
    model_used: str
    provider_used: str

class HistorySessionModel(BaseModel):
    id: str
    timestamp: str
    language: SupportedLanguage
    fileName: Optional[str] = None
    summary: str
    issueCount: int
    criticalCount: int
    originalCode: str
    fixedCode: str
    changes: List[str]
    validationStatus: ValidationStatus
    modelUsed: str
    providerUsed: str
