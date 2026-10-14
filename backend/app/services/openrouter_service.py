import json
import logging
import httpx
from typing import Dict, Any
from ..core.config import settings
from .prompt_service import build_system_instruction, build_debug_prompt
from ..schemas.debug import DebugRequest

logger = logging.getLogger("smart_debugger.openrouter")

class OpenRouterService:
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.model = settings.OPENROUTER_MODEL
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"

    def clean_json_response(self, text: str) -> Dict[str, Any]:
        cleaned = text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            start = cleaned.find("{")
            end = cleaned.rfind("}")
            if start != -1 and end != -1 and end > start:
                return json.loads(cleaned[start : end + 1])
            raise

    async def debug_code(self, req: DebugRequest) -> Dict[str, Any]:
        if not self.api_key or self.api_key == "your_api_key_here":
            logger.warning("OpenRouter API key is not configured")
            raise ValueError("OpenRouter API key is not configured in backend environment")

        system_prompt = build_system_instruction()
        user_prompt = build_debug_prompt(
            code=req.code,
            language=req.language,
            file_name=req.fileName,
            test_cases=req.testCases,
        )

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": settings.FRONTEND_URL,
            "X-Title": settings.PROJECT_NAME,
        }

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.1,
            "response_format": {"type": "json_object"},
        }

        logger.info(f"Submitting debug request to OpenRouter model: {self.model}")
        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT_SECONDS) as client:
            response = await client.post(self.base_url, headers=headers, json=payload)
            if response.status_code != 200:
                logger.error(f"OpenRouter error response [{response.status_code}]: {response.text}")
                raise RuntimeError(f"OpenRouter API error ({response.status_code}): {response.text}")

            data = response.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            return self.clean_json_response(content)

openrouter_service = OpenRouterService()
