#!/bin/bash
# 停止配方API服务器

echo "🛑 停止凉菜配方API服务器..."

# 查找并停止API进程
API_PID=$(pgrep -f "node.*recipes-api.js")
if [ ! -z "$API_PID" ]; then
    kill $API_PID
    echo "API服务器已停止 (PID: $API_PID)"
else
    echo "未找到运行中的API服务器"
fi
