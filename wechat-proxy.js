const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');

const app = express();
const PORT = 3003;

// 启用CORS
app.use(cors());
app.use(express.json());

// 企业微信Webhook代理
app.post('/api/send-webhook', async (req, res) => {
    try {
        console.log('收到webhook请求:', req.body);
        
        const message = req.body;
        
        if (!message || !message.text || !message.text.content) {
            return res.status(400).json({
                errcode: 400,
                errmsg: '消息内容不能为空'
            });
        }

        // 企业微信Webhook URL
        const webhookUrl = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=2ad7b44b-7a40-4eed-9d77-18ebf5b0134a';

        // 发送到企业微信
        const result = await new Promise((resolve, reject) => {
            const postData = JSON.stringify(message);
            
            const options = {
                hostname: 'qyapi.weixin.qq.com',
                port: 443,
                path: '/cgi-bin/webhook/send?key=2ad7b44b-7a40-4eed-9d77-18ebf5b0134a',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                });
            });

            req.on('error', (e) => {
                reject(e);
            });

            req.write(postData);
            req.end();
        });
        
        console.log('企业微信响应:', result);
        res.json(result);
        
    } catch (error) {
        console.error('代理请求失败:', error);
        res.status(500).json({
            errcode: -1,
            errmsg: '代理服务器错误: ' + error.message
        });
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`企业微信代理服务器运行在端口 ${PORT}`);
});
