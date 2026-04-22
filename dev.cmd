@echo off
setlocal
cd /d "%~dp0"

set "NPM_CMD=%ProgramFiles%\nodejs\npm.cmd"
if not exist "%NPM_CMD%" set "NPM_CMD=%ProgramFiles(x86)%\nodejs\npm.cmd"
if not exist "%NPM_CMD%" set "NPM_CMD=%LocalAppData%\Programs\nodejs\npm.cmd"

if not exist "%NPM_CMD%" (
  echo [오류] npm.cmd 을 찾지 못했습니다. Node.js LTS 를 설치했는지 확인하세요.
  exit /b 1
)

echo npm: %NPM_CMD%
call "%NPM_CMD%" run dev
