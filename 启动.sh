#!/bin/bash
echo "徐闻交通大屏 - 启动中..."
echo ""
echo "正在启动本地服务器..."
echo ""

cd "$(dirname "$0")/dist"

# 尝试使用 Python 3
if command -v python3 &> /dev/null; then
    echo "使用 Python 启动服务器..."
    echo "请在浏览器中打开: http://localhost:8080"
    open "http://localhost:8080" 2>/dev/null || xdg-open "http://localhost:8080" 2>/dev/null
    python3 -m http.server 8080
    exit 0
fi

# 尝试使用 npx serve
if command -v npx &> /dev/null; then
    echo "使用 npx serve 启动服务器..."
    echo "请在浏览器中打开: http://localhost:3000"
    open "http://localhost:3000" 2>/dev/null || xdg-open "http://localhost:3000" 2>/dev/null
    npx serve -l 3000
    exit 0
fi

echo "错误：未找到 Python 3 或 Node.js"
echo "请安装 Python 3 或 Node.js 后重试"
