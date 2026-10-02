@echo off
title StudyRoom - Detener IA local
powershell.exe -NoProfile -File "%~dp0scripts\local-ai\stop.ps1"
echo.
echo Puedes volver a iniciarla con Iniciar-IA.cmd.
pause
