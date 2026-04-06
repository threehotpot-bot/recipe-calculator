#!/bin/bash
# 启动配方API服务器

echo "🍳 启动凉菜配方API服务器..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "错误：未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查端口是否被占用
if lsof -Pi :8087 -sTCP:LISTEN -t >/dev/null ; then
    echo "端口8087已被占用，正在停止现有进程..."
    pkill -f "node.*recipes-api.js"
    sleep 2
fi

# 启动API服务器
nohup node recipes-api.js > api.log 2>&1 &
API_PID=$!

echo "API服务器已启动，PID: $API_PID"
echo "日志文件: api.log"
echo "健康检查: curl http://localhost:8087/api/health"

# 等待服务器启动
sleep 3

# 健康检查
if curl -s http://localhost:8087/api/health > /dev/null; then
    echo "✅ API服务器启动成功"
else
    echo "❌ API服务器启动失败"
    exit 1
fi
