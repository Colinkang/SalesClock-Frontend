# ✅ 局域网访问配置完成

## 🎉 配置已生效

### ✅ 已完成的配置

#### 1. 前端配置 (Vite)
**文件**: `vite.config.ts`
```typescript
server: {
  host: '0.0.0.0',    // 允许外部访问
  port: 5173,          // 端口
  strictPort: true,    // 严格端口
  cors: true,          // 允许跨域
}
```

#### 2. 后端配置 (Express)
**文件**: `backend/src/index.ts`

**CORS 配置**:
- ✅ 允许 localhost:5173
- ✅ 允许 127.0.0.1:5173
- ✅ 允许 192.168.1.4:5173
- ✅ 监听所有网络接口 (0.0.0.0)

#### 3. 前端 API 配置
**文件**: `.env.local`
```
VITE_API_URL=http://192.168.1.4:3001/api
```

## 🌐 访问地址

### 前端
- 本机访问: `http://localhost:5173`
- 局域网访问: `http://192.168.1.4:5173`

### 后端
- 本机访问: `http://localhost:3001`
- 局域网访问: `http://192.168.1.4:3001`

## 🧪 测试连接

### 1. 测试前端访问
在浏览器中打开:
```
http://192.168.1.4:5173
```

### 2. 测试后端 API
```bash
# 健康检查
curl http://192.168.1.4:3001/health

# 应返回:
# {"status":"ok","timestamp":"..."}
```

### 3. 测试前端到后端的连接
打开浏览器控制台（F12），查看 Network 标签：
- 应该能看到 API 请求
- 状态码应该是 200 或 401（未登录）

## 🔍 故障排查

### 如果出现 Network Error

1. **检查后端是否运行**
   ```bash
   lsof -i :3001
   ```

2. **检查后端日志**
   查看后端终端输出，应该显示：
   ```
   Server is running on 0.0.0.0:3001
   Allowed origins: http://localhost:5173, http://127.0.0.1:5173, http://192.168.1.4:5173
   ```

3. **检查防火墙**
   ```bash
   # macOS 防火墙设置
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
   ```

4. **手动测试后端**
   ```bash
   curl -X POST http://192.168.1.4:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"admin123456"}'
   ```

### 如果前端无法加载

1. **检查前端是否运行**
   ```bash
   lsof -i :5173
   ```

2. **检查 IP 地址**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

3. **清除浏览器缓存**
   - Chrome: Ctrl+Shift+R (Windows) 或 Cmd+Shift+R (Mac)
   - 或使用隐私模式

## 📱 移动设备访问

### 手机浏览器
1. 确保手机连接到同一个 WiFi
2. 打开浏览器，输入: `http://192.168.1.4:5173`
3. 应该能正常访问

### 注意事项
- 如果手机连接的是不同 WiFi，需要连接到同一局域网
- 某些公司网络可能阻止设备间通信

## 🔐 安全提示

⚠️ **开发环境配置**

当前配置允许局域网内所有设备访问。生产环境需要：
1. 使用 HTTPS
2. 限制访问来源
3. 使用反向代理（如 Nginx）
4. 配置防火墙规则

## 📋 配置清单

- [x] Vite 配置允许外部访问
- [x] 后端监听所有网络接口
- [x] 后端 CORS 允许前端 IP
- [x] 前端 API URL 配置为局域网 IP
- [x] 服务器已重启
- [x] 防火墙已检查
- [x] 测试访问成功

## 💡 常见问题

### Q: 只能本机访问，局域网无法访问？
A: 检查防火墙设置和 Vite 配置中的 `host: '0.0.0.0'`

### Q: 前端可以访问，但 API 调用失败？
A: 检查后端的 CORS 配置，确保包含前端 IP 地址

### Q: 移动设备无法访问？
A: 确保手机连接到同一 WiFi 网络

### Q: 出现 CORS 错误？
A: 检查浏览器控制台的错误信息，确认后端允许的 origins 列表

## 🎯 下一步

现在可以通过以下方式访问应用：
1. 本机浏览器: `http://localhost:5173`
2. 同一局域网其他设备: `http://192.168.1.4:5173`
3. 移动设备（同 WiFi）: `http://192.168.1.4:5173`

所有功能应该都能正常工作！🚀

