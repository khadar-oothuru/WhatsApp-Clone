@echo off
echo Starting WhatsApp Clone...
echo.

echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm run dev"

echo Waiting for backend to start...
timeout /t 5 /nobreak

echo Starting Frontend Development Server...
cd ../frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause
