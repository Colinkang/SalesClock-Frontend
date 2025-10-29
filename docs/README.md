# 📚 项目文档

## 🚀 快速开始

### 开发环境启动
```bash
# 前端
npm run dev

# 后端
cd backend && npm run dev
```

### Docker 部署
```bash
# 使用 Docker Compose
docker-compose up -d

# 或使用快速启动脚本
./docs/deployment/docker-start.sh
```

## 📖 主要文档

- [后端 API 文档](backend/API_ROUTES_GUIDE.md) - 完整的 API 接口说明
- [数据库快速参考](backend/QUICK_REFERENCE.md) - 数据库操作指南
- [Docker 部署指南](deployment/DOCKER_DEPLOYMENT_GUIDE.md) - 容器化部署
- [地图功能修复](frontend/MAP_DISPLAY_FIX.md) - 签到地图显示解决方案
- [Git 设置完成](general/GIT_SETUP_COMPLETE.md) - 版本控制配置

## 🏗️ 项目结构

```
├── src/                 # 前端源码
├── backend/            # 后端 API
├── docs/              # 项目文档
├── docker-compose.yml # Docker 编排
└── Dockerfile         # 前端容器
```

## 🔧 技术栈

- **前端**: React + TypeScript + Tailwind CSS
- **后端**: Node.js + Express + Prisma
- **数据库**: PostgreSQL
- **部署**: Docker + Docker Compose
- **地图**: 高德地图 + 多服务备用

## 📝 更新日志

- ✅ 完成 Supabase 到 Express 迁移
- ✅ 实现签到地图显示
- ✅ 添加 Docker 部署支持
- ✅ 精简项目文档结构