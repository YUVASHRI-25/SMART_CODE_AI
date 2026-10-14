import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Code Debugging and Automated Bug Fixing System"
    API_V1_STR: str = "/api"
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "qwen/qwen-2.5-coder-32b-instruct")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    MAX_CODE_SIZE_BYTES: int = 500 * 1024  # 500 KB limit
    REQUEST_TIMEOUT_SECONDS: int = 45

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
