# 🐳 Docker 快速开始

## 📦 已创建的文件

1. **Dockerfile** - 前端容器配置（多阶段构建）
2. **nginx.conf** - Nginx 配置文件
3. **.dockerignore** - Docker 构建忽略文件
4. **backend/Dockerfile** - 后端容器配置
5. **backend/.dockerignore** - 后端构建忽略文件
6. **docker-compose.yml** - 完整服务编排
7. **docker-start.sh** - 快速启动脚本

## 🚀 快速部署（3 步）

### 方法 A: 使用启动脚本（最简单）

```bash
# 1. 给脚本添加执行权限
chmod +x docker-start.sh

# 2. 运行脚本
./docker-start.sh

# 完成！访问 http://localhost
```

### 方法 B: 手动部署

```bash
# 1. 构建并启动
docker-compose up -d

# 2. 数据库迁移和种子数据
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run prisma:seed

# 3. 完成！
# 访问 http://localhost
```

## 🎯 访问应用

部署成功后：

- **前端**: http://localhost
- **后端 API**: http://localhost:3001
- **健康检查**: http://localhost:3001/health

## 📋 常用命令

```bash
# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看特定服务日志
docker-compose logs -f frontend
docker-compose logs -f backend
```

## 🔧 配置说明

### 前端容器
- **基础镜像**: nginx:alpine
- **端口**: 80
- **特性**: 
  - SPA 路由支持
  - Gzip 压缩
  - 静态资源缓存
  - API 代理支持

### 后端容器
- **基础镜像**: node:18-alpine
- **端口**: 3001
- **特性**:
  - TypeScript 编译
  - Prisma Client 生成
  - 健康检查

### 数据库容器
- **镜像**: postgres:15-alpine
- **端口**: 5432（内部）
- **数据持久化**: 使用 Docker volume

## ⚙️ 环境变量

### 后端环境变量（在 docker-compose.yml 中）

```yaml
environment:
  - DATABASE_URL=postgresql://user:password@db:5432/visitdb
  - JWT_SECRET=your-secret-key-here
  - JWT_EXPIRES_IN=7d
  - PORT=3001
  - NODE_ENV=production
  - FRONTEND_URL=http://localhost
```

**⚠️ 生产环境修改**:
- 更改数据库密码
- 更改 JWT_SECRET
- 设置正确的 FRONTEND_URL

## 🔍 故障排查

### 容器无法启动

```bash
# 查看详细错误
docker-compose logs

# 重建容器
docker-compose down
docker-compose up -d --build
```

### 前端无法连接后端

```bash
# 检查后端是否运行
docker-compose ps backend

# 测试后端 API
curl http://localhost:3001/health

# 检查 nginx 配置
docker exec frontend cat /etc/nginx/conf.d/default.conf
```

### 数据库连接失败

```bash
# 检查数据库容器
docker-compose ps db

# 测试连接
docker-compose exec db psql -U user -d visitdb -c "SELECT 1"
```

## 📦 构建镜像

### 单独构建

```bash
# 构建前端
docker build -t visit-frontend .

# 构建后端
cd backend
docker build -t visit-backend .
```

## 🎊 部署完成！

现在您可以通过 Docker 部署整个应用了！

**详细文档**: 查看 `DOCKER_DEPLOYMENT_GUIDE.md`

