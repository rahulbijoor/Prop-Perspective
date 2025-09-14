#!/usr/bin/env python3
"""
Local development startup script for the AI Property Debate Service.

This script provides an easy way to start the debate service locally with
development-friendly settings including auto-reload, CORS configuration,
and comprehensive error handling.
"""

import os
import sys
import logging
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

def validate_environment():
    """Validate required environment variables and dependencies."""
    print("🔍 Validating environment...")
    
    # Check for required environment variables
    required_vars = ['GOOGLE_API_KEY']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        print("\n📝 Please create a .env file with the following variables:")
        for var in missing_vars:
            if var == 'GOOGLE_API_KEY':
                print(f"   {var}=your_google_gemini_api_key_here")
            else:
                print(f"   {var}=your_value_here")
        print("\n💡 See .env.example for a template")
        return False
    
    # Test Google API key
    try:
        import google.generativeai as genai
        genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
        model = genai.GenerativeModel('gemini-pro')
        print("✅ Google Gemini API key is valid")
    except Exception as e:
        print(f"❌ Google Gemini API key validation failed: {e}")
        return False
    
    # Check for required Python packages
    try:
        import fastapi
        import uvicorn
        import crewai
        print("✅ All required Python packages are installed")
    except ImportError as e:
        print(f"❌ Missing required Python package: {e}")
        print("💡 Run: pip install -r requirements.txt")
        return False
    
    return True

def setup_logging():
    """Configure logging for development."""
    log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
    log_format = os.getenv('LOG_FORMAT', 'detailed')
    
    if log_format == 'detailed':
        format_string = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    else:
        format_string = '%(levelname)s: %(message)s'
    
    logging.basicConfig(
        level=getattr(logging, log_level),
        format=format_string,
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Reduce noise from some libraries
    logging.getLogger('httpx').setLevel(logging.WARNING)
    logging.getLogger('httpcore').setLevel(logging.WARNING)

def get_server_config():
    """Get server configuration from environment variables."""
    config = {
        'host': os.getenv('HOST', 'localhost'),
        'port': int(os.getenv('PORT', 8000)),
        'reload': os.getenv('DEBUG', 'true').lower() == 'true',
        'log_level': os.getenv('LOG_LEVEL', 'info').lower(),
        'access_log': os.getenv('DEBUG', 'true').lower() == 'true',
    }
    
    return config

def check_port_availability(port):
    """Check if the specified port is available."""
    import socket
    
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('localhost', port))
            return True
    except OSError:
        return False

def find_available_port(start_port, max_attempts=5):
    """Find an available port starting from start_port."""
    for port in range(start_port, start_port + max_attempts):
        if check_port_availability(port):
            return port
    return None

def main():
    """Main startup function."""
    import argparse
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='AI Property Debate Service')
    parser.add_argument('--force', action='store_true', 
                       help='Skip port availability check')
    args = parser.parse_args()
    
    print("🚀 Starting AI Property Debate Service...")
    print("=" * 50)
    
    # Load environment variables from .env file
    try:
        from dotenv import load_dotenv
        env_file = Path(__file__).parent / '.env'
        if env_file.exists():
            load_dotenv(env_file)
            print(f"✅ Loaded environment from {env_file}")
        else:
            print("⚠️  No .env file found, using system environment variables")
    except ImportError:
        print("⚠️  python-dotenv not installed, using system environment variables")
    
    # Validate environment
    if not validate_environment():
        print("\n❌ Environment validation failed. Please fix the issues above.")
        sys.exit(1)
    
    # Setup logging
    setup_logging()
    
    # Get server configuration
    config = get_server_config()
    original_port = config['port']
    
    # Handle port availability with auto-retry or force option
    if args.force:
        print(f"⚠️  Skipping port check (--force flag used)")
    else:
        # Check if auto-increment is enabled
        auto_increment = os.getenv('PORT_AUTO_INCREMENT', 'false').lower() == 'true'
        
        if not check_port_availability(config['port']):
            if auto_increment:
                print(f"⚠️  Port {config['port']} is in use, searching for alternative...")
                available_port = find_available_port(config['port'] + 1)
                if available_port:
                    config['port'] = available_port
                    print(f"✅ Found available port: {config['port']}")
                else:
                    print(f"❌ No available ports found in range {config['port']+1}-{config['port']+5}")
                    print(f"💡 Try setting PORT_AUTO_INCREMENT=false or use --force flag")
                    sys.exit(1)
            else:
                print(f"❌ Port {config['port']} is already in use")
                print(f"💡 Options:")
                print(f"   - Change PORT in your .env file")
                print(f"   - Set PORT_AUTO_INCREMENT=true in .env for auto-retry")
                print(f"   - Use --force flag to skip port check")
                print(f"   - Kill the process using the port")
                sys.exit(1)
        else:
            print(f"✅ Port {config['port']} is available")
    
    # Import and start the server
    try:
        import uvicorn
        from main import app
        
        print("\n🌟 Configuration:")
        print(f"   Host: {config['host']}")
        print(f"   Port: {config['port']}")
        print(f"   Reload: {config['reload']}")
        print(f"   Log Level: {config['log_level']}")
        print(f"   Environment: {os.getenv('ENVIRONMENT', 'development')}")
        
        print(f"\n🔗 Service will be available at:")
        print(f"   API: http://{config['host']}:{config['port']}")
        print(f"   Docs: http://{config['host']}:{config['port']}/docs")
        print(f"   Health: http://{config['host']}:{config['port']}/health")
        
        print("\n🎯 Ready for local development!")
        print("   - Auto-reload is enabled for development")
        print("   - CORS is configured for local frontend")
        print("   - Debug logging is enabled")
        print("\n" + "=" * 50)
        
        # Start the server
        uvicorn.run(
            "main:app",
            host=config['host'],
            port=config['port'],
            reload=config['reload'],
            log_level=config['log_level'],
            access_log=config['access_log'],
            reload_dirs=[str(Path(__file__).parent)],
            reload_excludes=["*.pyc", "__pycache__", ".env"]
        )
        
    except KeyboardInterrupt:
        print("\n\n👋 Shutting down gracefully...")
    except Exception as e:
        print(f"\n❌ Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
