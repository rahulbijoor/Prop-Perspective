@echo off
echo Starting AI Property Debate Service Demo...
echo ==========================================

REM Check if npm is available
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: npm is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Starting all services concurrently...
npm run demo

pause
