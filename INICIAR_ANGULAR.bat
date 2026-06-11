@echo off
REM ========================================
REM INICIAR FRONTEND ANGULAR
REM ========================================

echo.
echo ╔═════════════════════════════════════════════════════════╗
echo ║  FRONTEND ANGULAR - WORKFLOW DIAGRAM                    ║
echo ╚═════════════════════════════════════════════════════════╝
echo.

REM Verificar ubicación correcta
if not exist "diagram\package.json" (
    echo ❌ ERROR: No estás en la carpeta diagram/
    echo    Ubicación actual: %CD%
    echo    Debes ejecutar desde: D:\Universidad\...\diagram\
    pause
    exit /b 1
)

cd diagram

REM Verificar node_modules
if not exist "node_modules" (
    echo [1/2] Instalando dependencias...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ ERROR instalando dependencias
        pause
        exit /b 1
    )
    echo ✓ Dependencias instaladas
) else (
    echo ✓ Dependencias ya instaladas
)

echo.
echo [2/2] Iniciando servidor de desarrollo...
echo.
echo ⚠️  El servidor Angular se ejecutará en esta ventana
echo    URL: http://localhost:4200
echo.
echo    Rutas disponibles:
echo    - /                       → Diagramas UML
echo    - /dashboard              → Dashboard predictivo
echo    - /editor/doc-001         → Editor colaborativo
echo.
echo    Presiona Ctrl+C para detener
echo.

npm start

REM Si llegó aquí, el usuario detuvo el servidor
echo.
echo ✓ Servidor Angular detenido
pause
