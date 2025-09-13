import os
import logging
from typing import List, Optional
from pydantic import BaseSettings, Field
from pythonjsonlogger import jsonlogger


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # API Configuration
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    DEBUG: bool = Field(default=False, env="DEBUG")
    
    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173"],
        env="ALLOWED_ORIGINS"
    )
    
    # Google Gemini Configuration
    GOOGLE_API_KEY: str = Field(..., env="GOOGLE_API_KEY")
    GEMINI_MODEL: str = Field(default="gemini-pro", env="GEMINI_MODEL")
    
    # LLM Configuration
    MAX_TOKENS: int = Field(default=2048, env="MAX_TOKENS")
    TEMPERATURE: float = Field(default=0.7, env="TEMPERATURE")
    TIMEOUT_SECONDS: int = Field(default=30, env="TIMEOUT_SECONDS")
    MAX_RETRIES: int = Field(default=3, env="MAX_RETRIES")
    
    # Rate Limiting
    MAX_CONCURRENT_REQUESTS: int = Field(default=10, env="MAX_CONCURRENT_REQUESTS")
    RATE_LIMIT_PER_MINUTE: int = Field(default=60, env="RATE_LIMIT_PER_MINUTE")
    
    # Request Limits
    MAX_PAYLOAD_SIZE: int = Field(default=1024 * 1024, env="MAX_PAYLOAD_SIZE")  # 1MB
    
    # Cache Configuration
    ENABLE_CACHE: bool = Field(default=True, env="ENABLE_CACHE")
    CACHE_TTL_SECONDS: int = Field(default=3600, env="CACHE_TTL_SECONDS")  # 1 hour
    
    # Logging Configuration
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = Field(default="json", env="LOG_FORMAT")  # json or text
    
    # Application Metadata
    APP_NAME: str = Field(default="Property Debate Service", env="APP_NAME")
    APP_VERSION: str = Field(default="1.0.0", env="APP_VERSION")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    def get_allowed_origins_list(self) -> List[str]:
        """Parse ALLOWED_ORIGINS if it's a comma-separated string"""
        if isinstance(self.ALLOWED_ORIGINS, str):
            return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
        return self.ALLOWED_ORIGINS


def setup_logging(settings: Settings) -> None:
    """Configure structured logging"""
    
    # Set log level
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    
    # Create logger
    logger = logging.getLogger()
    logger.setLevel(log_level)
    
    # Remove existing handlers
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
    
    # Create handler
    handler = logging.StreamHandler()
    
    if settings.LOG_FORMAT.lower() == "json":
        # JSON formatter for structured logging
        formatter = jsonlogger.JsonFormatter(
            fmt='%(asctime)s %(name)s %(levelname)s %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    else:
        # Standard text formatter
        formatter = logging.Formatter(
            fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    # Set specific logger levels
    logging.getLogger("uvicorn").setLevel(log_level)
    logging.getLogger("fastapi").setLevel(log_level)
    logging.getLogger("httpx").setLevel(logging.WARNING)


def get_gemini_config(settings: Settings) -> dict:
    """Get Gemini model configuration"""
    return {
        "model": settings.GEMINI_MODEL,
        "api_key": settings.GOOGLE_API_KEY,
        "max_tokens": settings.MAX_TOKENS,
        "temperature": settings.TEMPERATURE,
        "timeout": settings.TIMEOUT_SECONDS,
        "max_retries": settings.MAX_RETRIES,
    }


# Global settings instance
settings = Settings()

# Setup logging on import
setup_logging(settings)

# Get logger for this module
logger = logging.getLogger(__name__)
logger.info(f"Configuration loaded: {settings.APP_NAME} v{settings.APP_VERSION}")
