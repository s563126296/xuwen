@echo off
echo 徐闻交通大屏 - 启动中...
echo.
echo 正在启动本地服务器...
echo 请稍候，浏览器将自动打开...
echo.

cd dist

REM 尝试使用 Python 3
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo 使用 Python 启动服务器...
    start http://localhost:8080
    python -m http.server 8080
    goto :end
)

REM 尝试使用 Python
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo 使用 Python 启动服务器...
    start http://localhost:8080
    py -m http.server 8080
    goto :end
)

REM 尝试使用 npx serve
where npx >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo 使用 npx serve 启动服务器...
    start http://localhost:3000
    npx serve -l 3000
    goto :end
)

echo 错误：未找到 Python 或 Node.js
echo 请安装 Python 3 或 Node.js 后重试
echo.
pause

:end
