# 局域网访问配置指南

## ✅ 已完成的配置

### 前端 Vite 配置
已更新 `vite.config.ts` 文件，添加了以下配置：
```typescript
server: {
  host: '0.0.0.0',    // 允许外部访问
  port: 5173,          // 端口
  strictPort: true,    // 严格端口
  cors: true,          // 允许跨域
}
```

## 🔧 后续步骤

### 1. 重启前端服务器

Vite 配置更改后需要重启服务器：

```bash
# 停止当前运行的服务器（Ctrl+C）
# 然后重新启动
npm run dev
```

### 2. 获取本机 IP 地址

在终端运行：
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# 或使用
ip addr show | grep "inet " | grep -v 127.0.0.1
```

或者查看系统设置中的网络信息。

### 3. 配置后端允许跨域

更新 `backend/src/index.ts` 中的 CORS 配置：

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://192.168.1.4:5173',  // 添加您的 IP
    // 或其他设备 IP
  ],
  credentials: true,
}));
```

或者在 `.env` 文件中配置：
```env
FRONTEND_URL=http://192.168.1.4:5173
```

### 4. 更新前端 API 配置（可选）

如果需要让前端调用后端 API，更新 `.env` 文件：

```env
# 使用本机 IP 作为后端地址
VITE_API_URL=http://192.168.1.4:3001/api
```

### 5. 访问测试

在浏览器中访问：
```
http://192.168.1.4:5173
```

## 🔍 故障排查

### 问题 1: 无法访问
**检查项**:
- [ ] 防火墙是否允许 5173 端口
- [ ] IP 地址是否正确
- [ ] 前端服务器是否运行
- [ ] 是否在同一局域网

**macOS 防火墙设置**:
```bash
# 允许 Node.js 通过防火墙
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
```

### 问题 2: API 调用失败
**检查项**:
- [ ] 后端 CORS 配置是否正确
- [ ] 后端服务器是否运行
- [ ] API URL 是否正确

### 问题 3: 跨域错误
**解决方案**:
1. 确保后端 CORS 配置包含前端 IP
2. 重启后端服务器
3. 清除浏览器缓存

## 📱 移动设备访问

### 方式 1: 通过 IP 访问
1. 确保手机连接到同一 WiFi
2. 在手机浏览器输入: `http://192.168.1.4:5173`

### 方式 2: 使用 ngrok（外网访问）
```bash
# 安装 ngrok
npm install -g ngrok

# 启动隧道
ngrok http 5173
```

## 🌐 局域网内其他设备

### 允许其他 IP 访问后端

更新 `backend/.env`:
```env
FRONTEND_URL=http://192.168.1.4:5173,http://192.168.1.5:5173
```

或更新后端代码支持多源：
```typescript
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.FRONTEND_URL?.split(',') || []),
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

## 🔒 安全提示

⚠️ **仅用于开发环境**

上述配置允许局域网内任意设备访问，生产环境需要：
1. 使用 Nginx 反向代理
2. 配置 HTTPS
3. 限制访问来源
4. 使用域名而非 IP

## 📋 快速检查清单

- [ ] Vite 配置已更新
- [ ] 前端服务器已重启
- [ ] 本机 IP 地址已确认
- [ ] 后端 CORS 配置已更新
- [ ] 后端服务器已重启
- [ ] 防火墙已配置
- [ ] 可以访问前端页面
- [ ] API 调用正常

## 💡 常用命令

```bash
# 查看 IP 地址
ifconfig | grep "inet "

# 查看端口占用
lsof -i :5173
lsof -i :3001

# 重启服务
npm run dev

# 检查网络连接
ping 192.168.1.4
```

