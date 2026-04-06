#!/bin/bash
# 在服务器上执行安全部署

echo "🔒 执行安全部署..."

# 1. 备份现有数据
./backup-data.sh

# 2. 停止API服务器
echo "🛑 停止API服务器..."
pkill -f "node.*recipes-api.js" || true
sleep 2

# 3. 部署新文件（不覆盖数据文件）
echo "📦 部署新文件..."
# 只复制非数据文件
cp index.html /var/www/peifang.ayakoai.com/
cp manage.html /var/www/peifang.ayakoai.com/
cp version.json /var/www/peifang.ayakoai.com/
cp recipes-api.js /var/www/peifang.ayakoai.com/
cp README.md /var/www/peifang.ayakoai.com/
cp start-api.sh /var/www/peifang.ayakoai.com/

# 4. 设置权限
chown -R www-data:www-data /var/www/peifang.ayakoai.com
chmod -R 755 /var/www/peifang.ayakoai.com

# 5. 启动API服务器
echo "🚀 启动API服务器..."
./start-api.sh

echo "✅ 安全部署完成！"
echo "📊 数据状态："
if [ -f "/var/www/peifang.ayakoai.com/recipes.json" ]; then
    RECIPE_COUNT=$(jq length /var/www/peifang.ayakoai.com/recipes.json 2>/dev/null || echo "0")
    echo "   - 配方数量: $RECIPE_COUNT"
else
    echo "   - 配方数量: 0 (使用默认配方)"
fi
