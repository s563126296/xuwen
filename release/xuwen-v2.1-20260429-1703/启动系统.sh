#!/bin/bash

# 设置颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "========================================"
echo "  徐闻智慧交通大屏 v2.1"
echo "  正在启动系统，请稍候..."
echo "========================================"
echo ""

# 检查 Python3
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}[启动方式]${NC} Python3 HTTP Server"
    echo -e "${BLUE}[访问地址]${NC} http://localhost:8080"
    echo ""
    echo "请打开浏览器访问: http://localhost:8080"
    echo "按 Ctrl+C 停止服务"
    echo ""

    # Mac 自动打开浏览器
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sleep 2 && open http://localhost:8080 &
    fi

    python3 -m http.server 8080
    exit 0
fi

# 检查 Python
if command -v python &> /dev/null; then
    echo -e "${GREEN}[启动方式]${NC} Python HTTP Server"
    echo -e "${BLUE}[访问地址]${NC} http://localhost:8080"
    echo ""
    echo "请打开浏览器访问: http://localhost:8080"
    echo "按 Ctrl+C 停止服务"
    echo ""

    # Mac 自动打开浏览器
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sleep 2 && open http://localhost:8080 &
    fi

    python -m http.server 8080
    exit 0
fi

# 检查 Node.js
if command -v npx &> /dev/null; then
    echo -e "${GREEN}[启动方式]${NC} Node.js serve"
    echo -e "${BLUE}[访问地址]${NC} http://localhost:3000"
    echo ""
    echo "请打开浏览器访问: http://localhost:3000"
    echo "按 Ctrl+C 停止服务"
    echo ""

    # Mac 自动打开浏览器
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sleep 2 && open http://localhost:3000 &
    fi

    npx serve .
    exit 0
fi

# 都没有，提示安装
echo ""
echo "========================================"
echo -e "${YELLOW}  未检测到 Python 或 Node.js${NC}"
echo ""
echo "  请安装以下任一工具："
echo "  1. Python: https://www.python.org/downloads/"
echo "  2. Node.js: https://nodejs.org/"
echo ""
echo "  安装后重新运行此文件即可"
echo "========================================"
echo ""
