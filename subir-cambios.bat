@echo off
echo ===================================================
echo     Subiendo cambios de Antigravity Nucleamiento...
echo ===================================================
echo.

:: 1. Agrega todos los archivos modificados
echo Registrando archivos modificados...
git add .

:: 2. Crea un commit con la fecha actual
echo Creando punto de guardado (commit)...
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set mydate=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%
git commit -m "Auto-deploy: Cambios guardados el %mydate%"

:: 3. Sube a GitHub (Esto dispara Vercel automáticamente)
echo.
echo Subiendo código a la nube...
git push

echo.
echo ===================================================
echo  ¡Listo! Los cambios ya están en camino a Producción.
echo  Vercel los publicará automáticamente en 1 o 2 minutos.
echo ===================================================
pause
