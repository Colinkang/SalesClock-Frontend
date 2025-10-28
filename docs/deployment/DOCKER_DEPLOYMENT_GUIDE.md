# Docker 部署指南

## 📦 项目结构

本项目包含两个 Docker 容器：
1. **前端容器** - React + Vite + Nginx
2. **后端容器** - Node.js + Express + Prisma

## 🚀 快速开始

### 方式 1: 使用 Docker Compose（推荐）

```bash
# 1. 构建并启动所有服务
docker-compose up -d

# 2. 运行数据库迁移
docker-compose exec backend npx prisma migrate deploy

# 3. 初始化种子数据
docker-compose exec backend npm run prisma:seed

# 4. 查看日志
docker-compose logs -f

# 5. 访问应用
# 前端: http://localhost
# 后端 API: http://localhost:3001
```

### 方式 2: 单独构建前端

```bash
# 1. 构建镜像
docker build -t visit-management-frontend .

# 2. 运行容器
docker run -d -p 80:80 --name frontend visit-management-frontend

# 3. 访问应用
# http://localhost
```

## 🔧 配置

### 环境变量

#### 前端可以不使用环境变量
Nginx 会直接提供静态文件，API URL 在构建时已嵌入。

#### 后端环境变量

创建 `backend/.env` 文件：

```env
DATABASE_URL=postgresql://user:password@db:5432/visitdb
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost
```

### 自定义 nginx 配置

如果需要修改前端配置，编辑 `nginx.conf`：

```nginx
# 修改监听端口
listen 8080;

# 修改 API 代理地址
proxy_pass http://your-backend:3001/api/;
```

## 📋 Docker 命令

### 构建镜像

```bash
# 前端
docker build -t visit-management-frontend .

# 后端
cd backend
docker build -t visit-management-backend .
```

### 运行容器

```bash
# 前端
docker run -d -p 80:80 --name frontend visit-management-frontend

# 后端
docker run -d -p 3001:3001 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=... \
  --name backend visit-management-backend
```

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f frontend
docker-compose logs -f backend

# 查看容器日志
docker logs frontend
docker logs backend
```

### 停止和清理

```bash
# 停止服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v

# 删除镜像
docker rmi visit-management-frontend
docker rmi visit-management-backend
```

## 🌐 生产环境部署

### 1. 配置 HTTPS

使用 Let's Encrypt 配置 HTTPS：

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # ... 其他配置
}
```

### 2. 使用 Docker Swarm 或 Kubernetes

对于生产环境，建议使用：
- **Docker Swarm** - 适合小规模部署
- **Kubernetes** - 适合大规模高可用部署

### 3. 数据库持久化

确保数据库数据持久化：

```yaml
volumes:
  postgres_data:
    driver: local
```

## 🔍 故障排查

### 前端无法访问

```bash
# 检查容器状态
docker ps

# 检查端口
lsof -i :80

# 查看日志
docker logs frontend
```

### 后端 API 调用失败

```bash
# 检查容器连接
docker-compose ps

# 测试数据库连接
docker-compose exec backend npx prisma db pull

# 查看后端日志
docker logs backend
```

### 数据库连接错误

```bash
# 检查数据库状态
docker-compose exec db psql -U user -d visitdb -c "SELECT 1"

# 查看数据库日志
docker-compose logs db
```

## 📦 镜像优化

当前多阶段构建已经优化：
- ✅ 使用 Alpine Linux（小镜像）
- ✅ 分离构建和运行阶段
- ✅ 只包含生产依赖
- ✅ 使用 .dockerignore 排除无用文件

## 🔐 安全建议

1. **更改默认密码**
   - 数据库密码
   - JWT_SECRET

2. **使用 HTTPS**
   - 生产环境必须使用 HTTPS

3. **限制网络访问**
   - 只暴露必要端口
   - 使用防火墙规则

4. **定期更新镜像**
   ```bash
   docker pull node:18-alpine
   docker pull nginx:alpine
   docker pull postgres:15-alpine
   ```

## 📊 资源使用

### 镜像大小（预期）

- 前端镜像: ~25MB（不含 node_modules）
- 后端镜像: ~150MB
- 数据库镜像: ~50MB

### 内存使用

- 前端: ~50MB
- 后端: ~100MB
- 数据库: ~200MB

## 🎯 快速命令参考

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启服务
docker-compose restart

# 查看服务状态
docker-compose ps

# 执行数据库迁移
docker-compose exec backend npx prisma migrate deploy

# 查看实时日志
docker-compose logs -f

# 进入容器
docker-compose exec frontend sh
docker-compose exec backend sh
```

## 📝 注意事项

1. **首次运行**: 记得运行数据库迁移和种子数据
2. **环境变量**: 确保所有必需的环境变量都已设置
3. **端口冲突**: 确保 80 和 3001 端口未被占用
4. **数据备份**: 定期备份 PostgreSQL 数据卷

