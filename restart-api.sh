#!/bin/bash
# 重启配方API服务器

echo "🔄 重启凉菜配方API服务器..."

./stop-api.sh
sleep 2
./start-api.sh
