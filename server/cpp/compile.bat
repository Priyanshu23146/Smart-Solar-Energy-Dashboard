@echo off
if not exist "bin" mkdir bin
g++ energy_predict.cpp -o bin\energy_predict.exe
if %errorlevel% neq 0 (
    echo Compilation failed!
    exit /b %errorlevel%
)
echo Compilation successful. Executable created in bin\energy_predict.exe
