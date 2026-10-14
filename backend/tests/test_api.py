import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.validator_service import validator_service
from backend.app.services.prompt_service import build_debug_prompt
from backend.app.schemas.debug import TestCaseModel

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "providers" in data
    assert "openrouter" in data["providers"]

def test_languages_endpoint():
    response = client.get("/api/languages")
    assert response.status_code == 200
    data = response.json()
    assert "languages" in data
    lang_ids = [l["id"] for l in data["languages"]]
    assert "python" in lang_ids
    assert "javascript" in lang_ids
    assert "cpp" in lang_ids

def test_debug_empty_code_rejection():
    response = client.post("/api/debug", json={"code": "", "language": "python"})
    assert response.status_code == 400
    detail = response.json()
    assert "detail" in detail or "error" in detail

def test_debug_unsupported_language():
    response = client.post("/api/debug", json={"code": "print('hi')", "language": "unsupported_xyz"})
    assert response.status_code == 422 or response.status_code == 400

def test_syntax_validation_valid_python():
    valid, msg, line = validator_service.validate_syntax("def greet():\n    return 'hello'", "python")
    assert valid is True
    assert line == 0

def test_syntax_validation_invalid_python_bracket():
    valid, msg, line = validator_service.validate_syntax("def greet():\n    return (1 + 2", "python")
    assert valid is False
    assert "Unclosed bracket" in msg or "Python syntax error" in msg

def test_syntax_validation_colon_missing():
    valid, msg, line = validator_service.validate_syntax("def greet()\n    return 42", "python")
    assert valid is False

def test_testcase_validation_suite():
    code = "def add(a, b): return a + b"
    test_cases = [
        TestCaseModel(id="1", input="add(2, 3)", expectedOutput="5")
    ]
    res = validator_service.validate_code(code, "python", test_cases)
    assert res.syntaxValid is True
    assert res.status == "passed"
    assert res.testCasesRun == 1

def test_history_crud_flow():
    # 1. Clear history
    clear_res = client.delete("/api/history")
    assert clear_res.status_code == 200

    # 2. Verify empty
    get_res = client.get("/api/history")
    assert get_res.status_code == 200
    assert len(get_res.json()["sessions"]) == 0

def test_prompt_builder_includes_test_cases():
    prompt = build_debug_prompt(
        code="def solve(): pass",
        language="python",
        file_name="solution.py",
        test_cases=[TestCaseModel(id="tc-1", input="x=5", expectedOutput="10")]
    )
    assert "TARGET PROGRAMMING LANGUAGE: python" in prompt
    assert "solution.py" in prompt
    assert "USER-PROVIDED TEST CASES" in prompt
    assert "Input: x=5" in prompt
