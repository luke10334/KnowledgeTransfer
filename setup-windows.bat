@echo off
echo ======================================
echo Knowledge Transfer Platform Setup
echo ======================================
echo.
echo Installing Python dependencies...
cd backend
pip install -r requirements.txt
echo.
echo Creating demo database...
python create_demo_data.py
cd ..
echo.
echo Installing Node.js dependencies...
cd frontend
npm install
cd ..
echo.
echo ======================================
echo Setup completed successfully!
echo ======================================
echo.
echo To start the platform, run: start-windows.bat
pause
