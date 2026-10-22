@echo off
title Launching AuraSpace OS ✨
echo ===================================================
echo     Launching AuraSpace Desktop Application ✨
echo ===================================================
echo.

set APP_PATH=%~dp0StudyOS.html

:: Try launching with Microsoft Edge in standalone App Mode
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="file:///%APP_PATH%"
    exit
)

if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app="file:///%APP_PATH%"
    exit
)

:: Try launching with Google Chrome in standalone App Mode
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="file:///%APP_PATH%"
    exit
)

if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app="file:///%APP_PATH%"
    exit
)

:: Fallback: Open with default system browser
start "" "%APP_PATH%"
exit
