@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "FRONTEND_DIR=%ROOT_DIR%frontend"
set "XAMPP_ROOT=C:\xampp"
set "XAMPP_START=%XAMPP_ROOT%\xampp_start.exe"
set "APACHE_START=%XAMPP_ROOT%\apache_start.bat"
set "MYSQL_START=%XAMPP_ROOT%\mysql_start.bat"

echo ==============================================
echo   Starting XploreIA with XAMPP and Vite
echo ==============================================

if exist "%XAMPP_START%" (
    echo Starting Apache and MySQL from XAMPP...
    start "" /B "%XAMPP_START%"
) else (
    echo XAMPP launcher not found, trying service scripts...
    if exist "%APACHE_START%" (
        call "%APACHE_START%"
    ) else (
        echo Apache start script not found at %APACHE_START%
    )

    if exist "%MYSQL_START%" (
        call "%MYSQL_START%"
    ) else (
        echo MySQL start script not found at %MYSQL_START%
    )
)

timeout /t 3 /nobreak >nul

echo Starting frontend development server...
pushd "%FRONTEND_DIR%"
npm run dev
popd

echo.
echo XploreIA is starting.
echo Frontend  : http://localhost:5173
echo Backend   : http://localhost/XploreIA/backend/public
echo phpMyAdmin: http://localhost/phpmyadmin
echo.
echo Press Ctrl+C in this terminal to stop Vite and the launcher.
echo Use the XAMPP control panel or xampp_stop.exe to stop Apache and MySQL.

endlocal