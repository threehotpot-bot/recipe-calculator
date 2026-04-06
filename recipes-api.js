#!/usr/bin/env node

/**
 * 凉菜配方比例计算器 - 服务器端API
 * 提供统一的配方数据管理
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8087;
const RECIPES_FILE = path.join(__dirname, 'recipes.json');
const RECORDS_FILE = path.join(__dirname, 'production-records.json');

// 默认配方数据
const defaultRecipes = [
  {
    "id": "liangcai-cucumber-001",
    "name": "拍黄瓜（基础版）",
    "tags": ["黄瓜", "爽口", "家常"],
    "category": "凉菜",
    "yield_unit": "份",
    "default_yield": 2,
    "main_dims": [
      {
        "key": "cucumber",
        "name": "黄瓜",
        "unit": "g",
        "water_loss_pct": 0.03
      }
    ],
    "ingredients": [
      {
        "name": "盐",
        "bind_to": "cucumber",
        "rule": {"type": "pct_of_main", "value": 1.2},
        "round": {"step": 0.5, "mode": "nearest"},
        "min": 2,
        "max": 8,
        "notes": "先杀水，后冲洗",
        "unit": "g"
      },
      {
        "name": "蒜末",
        "bind_to": "total",
        "rule": {"type": "per_serving", "value": 3},
        "unit": "g"
      },
      {
        "name": "陈醋",
        "bind_to": "cucumber",
        "rule": {"type": "ratio", "num": 1, "den": 40},
        "unit": "g"
      },
      {
        "name": "辣椒油",
        "bind_to": "total",
        "rule": {"type": "fixed", "value": 8},
        "unit": "g"
      }
    ],
    "steps": [
      "黄瓜拍裂切段；按盐{盐}拌匀，静置10-15分钟出水{water_loss}左右。",
      "倒去苦水，快速清水过一下并甩干；加入蒜末{蒜末}、陈醋{陈醋}、辣椒油{辣椒油}拌匀。",
      "尝味微调：酸度±10%，咸度±0.2%；装盘即食。"
    ]
  },
  {
    "id": "liangcai-tomato-001",
    "name": "糖拌西红柿",
    "tags": ["西红柿", "甜味", "简单"],
    "category": "凉菜",
    "yield_unit": "份",
    "default_yield": 2,
    "main_dims": [
      {
        "key": "tomato",
        "name": "西红柿",
        "unit": "g",
        "water_loss_pct": 0.05
      }
    ],
    "ingredients": [
      {
        "name": "白糖",
        "bind_to": "tomato",
        "rule": {"type": "pct_of_main", "value": 8},
        "round": {"step": 1, "mode": "nearest"},
        "unit": "g"
      },
      {
        "name": "盐",
        "bind_to": "tomato",
        "rule": {"type": "pct_of_main", "value": 0.5},
        "round": {"step": 0.5, "mode": "nearest"},
        "unit": "g"
      }
    ],
    "steps": [
      "西红柿洗净切块，去蒂；",
      "加入白糖{白糖}、盐{盐}拌匀，静置15分钟；",
      "装盘即可，可冷藏后食用。"
    ]
  },
  {
    "id": "liangcai-cabbage-001",
    "name": "凉拌圆白菜",
    "tags": ["圆白菜", "爽脆", "家常"],
    "category": "凉菜",
    "yield_unit": "份",
    "default_yield": 3,
    "main_dims": [
      {
        "key": "cabbage",
        "name": "圆白菜",
        "unit": "g",
        "water_loss_pct": 0.02
      }
    ],
    "ingredients": [
      {
        "name": "盐",
        "bind_to": "cabbage",
        "rule": {"type": "pct_of_main", "value": 1.5},
        "round": {"step": 0.5, "mode": "nearest"},
        "unit": "g"
      },
      {
        "name": "香油",
        "bind_to": "cabbage",
        "rule": {"type": "pct_of_main", "value": 2},
        "round": {"step": 0.5, "mode": "nearest"},
        "unit": "g"
      },
      {
        "name": "醋",
        "bind_to": "cabbage",
        "rule": {"type": "pct_of_main", "value": 3},
        "round": {"step": 1, "mode": "nearest"},
        "unit": "g"
      }
    ],
    "steps": [
      "圆白菜洗净切丝，用盐{盐}腌制10分钟；",
      "挤去多余水分，加入香油{香油}、醋{醋}拌匀；",
      "静置5分钟入味即可。"
    ]
  }
];

// 读取配方数据
function loadRecipes() {
  try {
    if (fs.existsSync(RECIPES_FILE)) {
      const data = fs.readFileSync(RECIPES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('读取配方文件失败:', error);
  }
  
  // 如果文件不存在或读取失败，创建默认配方文件
  saveRecipes(defaultRecipes);
  return defaultRecipes;
}

// 保存配方数据
function saveRecipes(recipes) {
  try {
    fs.writeFileSync(RECIPES_FILE, JSON.stringify(recipes, null, 2));
    return true;
  } catch (error) {
    console.error('保存配方文件失败:', error);
    return false;
  }
}

// 读取制作记录数据
function loadRecords() {
  try {
    if (fs.existsSync(RECORDS_FILE)) {
      const data = fs.readFileSync(RECORDS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('读取制作记录文件失败:', error);
  }
  
  // 如果文件不存在或读取失败，返回空数组
  return [];
}

// 保存制作记录数据
function saveRecords(records) {
  try {
    fs.writeFileSync(RECORDS_FILE, JSON.stringify(records, null, 2));
    return true;
  } catch (error) {
    console.error('保存制作记录文件失败:', error);
    return false;
  }
}

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  console.log(`${new Date().toISOString()} - ${req.method} ${pathname}`);

  try {
    if (pathname === '/api/recipes' && req.method === 'GET') {
      // 获取所有配方
      const recipes = loadRecipes();
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: recipes,
        count: recipes.length
      }));
    }
    else if (pathname === '/api/recipes' && req.method === 'POST') {
      // 添加新配方
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const newRecipe = JSON.parse(body);
          const recipes = loadRecipes();
          
          // 生成新ID
          newRecipe.id = `recipe-${Date.now()}`;
          newRecipe.created_at = new Date().toISOString();
          
          recipes.push(newRecipe);
          
          if (saveRecipes(recipes)) {
            res.writeHead(201);
            res.end(JSON.stringify({
              success: true,
              data: newRecipe,
              message: '配方添加成功'
            }));
          } else {
            res.writeHead(500);
            res.end(JSON.stringify({
              success: false,
              message: '保存配方失败'
            }));
          }
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            message: '无效的配方数据'
          }));
        }
      });
    }
    else if (pathname.startsWith('/api/recipes/') && req.method === 'PUT') {
      // 更新配方
      const recipeId = pathname.split('/')[3];
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const updatedRecipe = JSON.parse(body);
          const recipes = loadRecipes();
          const index = recipes.findIndex(r => r.id === recipeId);
          
          if (index !== -1) {
            updatedRecipe.id = recipeId;
            updatedRecipe.updated_at = new Date().toISOString();
            recipes[index] = updatedRecipe;
            
            if (saveRecipes(recipes)) {
              res.writeHead(200);
              res.end(JSON.stringify({
                success: true,
                data: updatedRecipe,
                message: '配方更新成功'
              }));
            } else {
              res.writeHead(500);
              res.end(JSON.stringify({
                success: false,
                message: '保存配方失败'
              }));
            }
          } else {
            res.writeHead(404);
            res.end(JSON.stringify({
              success: false,
              message: '配方不存在'
            }));
          }
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            message: '无效的配方数据'
          }));
        }
      });
    }
    else if (pathname.startsWith('/api/recipes/') && req.method === 'DELETE') {
      // 删除配方
      const recipeId = pathname.split('/')[3];
      const recipes = loadRecipes();
      const index = recipes.findIndex(r => r.id === recipeId);
      
      if (index !== -1) {
        recipes.splice(index, 1);
        if (saveRecipes(recipes)) {
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            message: '配方删除成功'
          }));
        } else {
          res.writeHead(500);
          res.end(JSON.stringify({
            success: false,
            message: '删除配方失败'
          }));
        }
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({
          success: false,
          message: '配方不存在'
        }));
      }
    }
    else if (pathname === '/api/health') {
      // 健康检查
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: '配方API服务正常',
        timestamp: new Date().toISOString()
      }));
    }
    else if (pathname === '/api/records' && req.method === 'GET') {
      // 获取所有制作记录
      const records = loadRecords();
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        data: records,
        count: records.length
      }));
    }
    else if (pathname === '/api/records' && req.method === 'POST') {
      // 添加制作记录
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const newRecord = JSON.parse(body);
          const records = loadRecords();
          
          // 生成新ID和时间戳（使用客户端传入的时间，不重新生成）
          newRecord.id = `record-${Date.now()}`;
          // 保持客户端传入的时间，不重新生成
          
          records.unshift(newRecord); // 新记录放在前面
          
          // 只保留最近100条记录
          if (records.length > 100) {
            records.splice(100);
          }
          
          if (saveRecords(records)) {
            res.writeHead(201);
            res.end(JSON.stringify({
              success: true,
              data: newRecord,
              message: '制作记录添加成功'
            }));
          } else {
            res.writeHead(500);
            res.end(JSON.stringify({
              success: false,
              message: '保存制作记录失败'
            }));
          }
        } catch (error) {
          console.error('解析制作记录数据失败:', error);
          res.writeHead(400);
          res.end(JSON.stringify({
            success: false,
            message: '数据格式错误'
          }));
        }
      });
    }
    else if (pathname.startsWith('/api/records/') && req.method === 'DELETE') {
      // 删除制作记录
      const recordId = pathname.split('/')[3];
      const records = loadRecords();
      const initialLength = records.length;
      const filteredRecords = records.filter(record => record.id !== recordId);
      
      if (filteredRecords.length === initialLength) {
        res.writeHead(404);
        res.end(JSON.stringify({
          success: false,
          message: '制作记录未找到'
        }));
      } else {
        if (saveRecords(filteredRecords)) {
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            message: '制作记录删除成功'
          }));
        } else {
          res.writeHead(500);
          res.end(JSON.stringify({
            success: false,
            message: '删除制作记录失败'
          }));
        }
      }
    }
    else {
      // 404
      res.writeHead(404);
      res.end(JSON.stringify({
        success: false,
        message: '接口不存在'
      }));
    }
  } catch (error) {
    console.error('API错误:', error);
    res.writeHead(500);
    res.end(JSON.stringify({
      success: false,
      message: '服务器内部错误'
    }));
  }
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`🍳 凉菜配方API服务器启动成功！`);
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`📋 API接口:`);
  console.log(`   GET  /api/recipes     - 获取所有配方`);
  console.log(`   POST /api/recipes     - 添加新配方`);
  console.log(`   PUT  /api/recipes/:id - 更新配方`);
  console.log(`   DELETE /api/recipes/:id - 删除配方`);
  console.log(`   GET  /api/records     - 获取所有制作记录`);
  console.log(`   POST /api/records     - 添加制作记录`);
  console.log(`   DELETE /api/records/:id - 删除制作记录`);
  console.log(`   GET  /api/health      - 健康检查`);
  console.log(`📁 配方文件: ${RECIPES_FILE}`);
  console.log(`⏰ 启动时间: ${new Date().toISOString()}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

