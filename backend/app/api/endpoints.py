import time
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from ..schemas.debug import (
    DebugRequest,
    DebugResponse,
    ValidationResultModel,
    HistorySessionModel,
    CodeIssueModel,
)
from ..services.openrouter_service import openrouter_service
from ..services.validator_service import validator_service
from ..services.history_service import history_service
from ..core.config import settings

router = APIRouter()

@router.get("/health")
def check_health():
    has_key = bool(settings.OPENROUTER_API_KEY and settings.OPENROUTER_API_KEY != "your_api_key_here")
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": settings.PROJECT_NAME,
        "providers": {
            "openrouter": {
                "configured": has_key,
                "model": settings.OPENROUTER_MODEL,
            }
        },
        "activeProvider": "openrouter" if has_key else "none",
    }

@router.get("/languages")
def get_languages():
    return {
        "languages": [
            {"id": "python", "name": "Python", "extension": ".py", "monacoLanguage": "python", "version": "3.12+"},
            {"id": "javascript", "name": "JavaScript", "extension": ".js", "monacoLanguage": "javascript", "version": "ES2024"},
            {"id": "typescript", "name": "TypeScript", "extension": ".ts", "monacoLanguage": "typescript", "version": "5.x"},
            {"id": "java", "name": "Java", "extension": ".java", "monacoLanguage": "java", "version": "17 / 21 LTS"},
            {"id": "cpp", "name": "C++", "extension": ".cpp", "monacoLanguage": "cpp", "version": "C++20"},
            {"id": "c", "name": "C", "extension": ".c", "monacoLanguage": "c", "version": "C17"},
            {"id": "go", "name": "Go", "extension": ".go", "monacoLanguage": "go", "version": "1.22+"},
            {"id": "rust", "name": "Rust", "extension": ".rs", "monacoLanguage": "rust", "version": "2021 Edition"},
            {"id": "ruby", "name": "Ruby", "extension": ".rb", "monacoLanguage": "ruby", "version": "3.3+"},
            {"id": "php", "name": "PHP", "extension": ".php", "monacoLanguage": "php", "version": "8.3+"},
        ]
    }

@router.post("/debug", response_model=DebugResponse)
async def debug_code(request: DebugRequest):
    if not request.code or not request.code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Source code is required and cannot be empty."
        )

    if len(request.code.encode("utf-8")) > settings.MAX_CODE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code exceeds the maximum allowed payload size of 500KB."
        )

    try:
        ai_data = await openrouter_service.debug_code(request)
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(val_err))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"AI model error: {str(exc)}")

    # Extract fields
    raw_issues = ai_data.get("issues", [])
    formatted_issues = []
    for idx, iss in enumerate(raw_issues):
        formatted_issues.append(CodeIssueModel(
            id=iss.get("id", f"issue-{idx+1}"),
            type=iss.get("type", "logical"),
            severity=iss.get("severity", "medium"),
            line=iss.get("line"),
            column=iss.get("column"),
            title=iss.get("title", "Detected Issue"),
            description=iss.get("description", "No description provided"),
            root_cause=iss.get("root_cause", "Root cause could not be determined"),
            suggestion=iss.get("suggestion", "Review code")
        ))

    fixed_code = ai_data.get("fixed_code", request.code)

    # Validate the fixed code
    validation = validator_service.validate_code(
        code=fixed_code,
        language=request.language,
        test_cases=request.testCases or []
    )

    session_id = f"dbg_{int(time.time())}_{str(uuid.uuid4())[:6]}"
    now_iso = datetime.utcnow().isoformat()

    response_payload = DebugResponse(
        id=session_id,
        timestamp=now_iso,
        language=request.language,
        summary=ai_data.get("summary", "Code analysis complete"),
        issues=formatted_issues,
        fixed_code=fixed_code,
        original_code=request.code,
        changes=ai_data.get("changes", []),
        assumptions=ai_data.get("assumptions", []),
        uncertainties=ai_data.get("uncertainties", []),
        validation=validation,
        model_used=settings.OPENROUTER_MODEL,
        provider_used="openrouter"
    )

    # Persist session in history
    history_item = HistorySessionModel(
        id=session_id,
        timestamp=now_iso,
        language=request.language,
        fileName=request.fileName,
        summary=response_payload.summary,
        issueCount=len(formatted_issues),
        criticalCount=sum(1 for i in formatted_issues if i.severity == "critical" or i.type == "syntax"),
        originalCode=request.code,
        fixedCode=fixed_code,
        changes=response_payload.changes,
        validationStatus=validation.status,
        modelUsed=settings.OPENROUTER_MODEL,
        providerUsed="openrouter"
    )
    history_service.add(history_item)

    return response_payload

@router.post("/validate", response_model=ValidationResultModel)
def validate_code(req: dict):
    code = req.get("code", "")
    language = req.get("language", "python")
    test_cases = req.get("testCases", [])
    return validator_service.validate_code(code, language, test_cases)

@router.get("/history")
def get_all_history():
    return {"sessions": history_service.get_all()}

@router.get("/history/{session_id}")
def get_history_by_id(session_id: str):
    item = history_service.get_by_id(session_id)
    if not item:
        raise HTTPException(status_code=404, detail="Session not found")
    return item

@router.delete("/history/{session_id}")
def delete_history_session(session_id: str):
    success = history_service.delete(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"success": True, "message": "Session deleted"}

@router.delete("/history")
def clear_all_history():
    history_service.clear()
    return {"success": True, "message": "History cleared"}
