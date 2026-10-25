@echo off
echo Starting CampusSphere React Frontend Dev Server...
cd /d "%~dp0frontend"
call cmd /c npm run dev
pause
