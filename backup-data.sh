#!/bin/bash
# 备份服务器上的配方数据

echo "📦 备份配方数据..."

# 创建备份目录
BACKUP_DIR="/var/www/peifang.ayakoai.com/backups"
mkdir -p $BACKUP_DIR

# 备份当前数据
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
if [ -f "/var/www/peifang.ayakoai.com/recipes.json" ]; then
    cp /var/www/peifang.ayakoai.com/recipes.json $BACKUP_DIR/recipes_backup_$TIMESTAMP.json
    echo "✅ 配方数据已备份到: $BACKUP_DIR/recipes_backup_$TIMESTAMP.json"
else
    echo "⚠️ 未找到现有配方数据文件"
fi

# 保留最近10个备份
cd $BACKUP_DIR
ls -t recipes_backup_*.json | tail -n +11 | xargs -r rm
echo "🧹 清理旧备份文件（保留最近10个）"
