@echo off
echo MongoDB를 실행합니다...
start "" "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe"
timeout /t 3 >nul
exit
