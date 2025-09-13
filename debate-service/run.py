#!/usr/bin/env python3
"""
Property Debate Service Runner

This script provides a convenient way to run the debate service with proper
configuration and error handling.
"""

import sys
import os
import logging
from pathlib import Path

# Add the current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

try:
    import uvicorn
    from config import settings
    from main import app
except ImportError as e:
    print(f"Error importing required modules: {e}")
    print("Please install dependencies: pip install -r requirements.txt")
    sys.exit(1)


def check_environment():
    """Check if required environment variables are set"""
    required_vars = ["GOOGLE_API_KEY"]
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease set these variables in your .env file or environment.")
        print("See .env.example for reference.")
        return False
    
    return True


def main():
    """Main entry point"""
    print(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"📍 Host: {settings.HOST}:{settings.PORT}")
    print(f"🔧 Debug mode: {settings.DEBUG}")
    print(f"🤖 Model: {settings.GEMINI_MODEL}")
    print(f"📊 Log level: {settings.LOG_LEVEL}")
    
    # Check environment
    if not check_environment():
        sys.exit(1)
    
    print("✅ Environment check passed")
    
    # Configure logging for uvicorn
    log_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            },
        },
        "handlers": {
            "default": {
                "formatter": "default",
                "class": "logging.StreamHandler",
                "stream": "ext://sys.stdout",
            },
        },
        "root": {
            "level": settings.LOG_LEVEL,
            "handlers": ["default"],
        },
    }
    
    try:
        print("🌐 Starting server...")
        uvicorn.run(
            app,
            host=settings.HOST,
            port=settings.PORT,
            reload=settings.DEBUG,
            log_level=settings.LOG_LEVEL.lower(),
            access_log=True,
            server_header=False,
            date_header=False,
            log_config=log_config,
        )
    except KeyboardInterrupt:
        print("\n👋 Shutting down gracefully...")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
