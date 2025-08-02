@echo off
echo ======================================
echo Starting Knowledge Transfer Platform
echo ======================================
echo.
echo Starting Backend (FastAPI)...
start /min cmd /c "cd backend && python main.py"
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul
echo.
echo Starting Frontend (React)...
start /min cmd /c "cd frontend && npm start"
echo.
echo ======================================
echo Platform Starting...
echo ======================================
echo.
echo Backend API: http://localhost:8000/docs
echo Frontend UI: http://localhost:3000
echo.
echo Demo Users (password: demo123):
echo - demo_ceo (Full access)
echo - demo_engineer (Standard access)
echo - demo_intern (Limited access)
echo.
echo Press any key to stop all services...
pause
taskkill /f /im python.exe 2>nul
taskkill /f /im node.exe 2>nul
echo All services stopped.
pause
