#!/bin/bash
# 恢复配方数据

echo "🔄 恢复配方数据..."

# 查找最新的备份文件
BACKUP_DIR="/var/www/peifang.ayakoai.com/backups"
LATEST_BACKUP=$(ls -t $BACKUP_DIR/recipes_backup_*.json 2>/dev/null | head -n1)

if [ -n "$LATEST_BACKUP" ]; then
    cp "$LATEST_BACKUP" /var/www/peifang.ayakoai.com/recipes.json
    echo "✅ 配方数据已从备份恢复: $LATEST_BACKUP"
else
    echo "⚠️ 未找到备份文件，使用默认配方"
fi
