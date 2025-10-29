# 🐳 Docker 部署

## 🚀 快速启动

```bash
# 使用快速启动脚本
./docs/deployment/docker-start.sh

# 或手动启动
docker-compose up -d
```

## 📋 服务说明

- **frontend** - React 前端 (Nginx)
- **backend** - Express API 服务
- **db** - PostgreSQL 数据库

## 🔧 配置

详细配置说明：[DOCKER_DEPLOYMENT_GUIDE.md](DOCKER_DEPLOYMENT_GUIDE.md)

## 🌐 访问地址

- 前端: http://localhost:80
- 后端: http://localhost:3001
- 数据库: localhost:5432