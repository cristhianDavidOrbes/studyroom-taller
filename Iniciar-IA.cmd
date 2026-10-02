@echo off
title StudyRoom - Iniciar IA local
powershell.exe -NoProfile -File "%~dp0scripts\local-ai\start.ps1" -Tunnel
if errorlevel 1 (
  echo.
  echo No se pudo iniciar la IA. Revisa el mensaje anterior.
) else (
  echo.
  echo La IA de tu PC esta conectada a StudyRoom.
  echo Abre https://studyroom-sut.onrender.com
  echo Puedes cerrar esta ventana. Mantener el PC encendido para usar la IA.
)
pause
