@echo off
chcp 65001 >nul
title 徐闻智慧交通大屏 v2.1

echo.
echo ========================================
echo   徐闻智慧交通大屏 v2.1
echo   正在启动系统，请稍候...
echo ========================================
echo.

:: 检查 Python
where python >nul 2>nul
if %errorlevel%==0 (
    echo [启动方式] Python HTTP Server
    echo [访问地址] http://localhost:8080
    echo.
    echo 请打开浏览器访问: http://localhost:8080
    echo 按 Ctrl+C 停止服务
    echo.
    start http://localhost:8080
    python -m http.server 8080
    goto :end
)

:: 检查 Python3
where python3 >nul 2>nul
if %errorlevel%==0 (
    echo [启动方式] Python3 HTTP Server
    echo [访问地址] http://localhost:8080
    echo.
    echo 请打开浏览器访问: http://localhost:8080
    echo 按 Ctrl+C 停止服务
    echo.
    start http://localhost:8080
    python3 -m http.server 8080
    goto :end
)

:: 检查 Node.js
where npx >nul 2>nul
if %errorlevel%==0 (
    echo [启动方式] Node.js serve
    echo [访问地址] http://localhost:3000
    echo.
    echo 请打开浏览器访问: http://localhost:3000
    echo 按 Ctrl+C 停止服务
    echo.
    start http://localhost:3000
    npx serve .
    goto :end
)

:: 都没有，提示安装
echo.
echo ========================================
echo   未检测到 Python 或 Node.js
echo.
echo   请安装以下任一工具：
echo   1. Python: https://www.python.org/downloads/
echo   2. Node.js: https://nodejs.org/
echo.
echo   安装后重新运行此文件即可
echo ========================================
echo.
pause

:end
