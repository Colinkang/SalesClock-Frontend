# 🏢 客户拜访管理系统

基于 **React + Express + Prisma** 的全栈客户拜访管理平台

## ✨ 核心功能

- 👥 **客户管理** - 客户信息维护
- 📅 **拜访计划** - 计划创建和日历视图
- 📍 **签到打卡** - GPS定位 + 拍照签到
- 📝 **拜访报告** - 记录拜访详情
- 📰 **文章管理** - 内容发布管理
- 📊 **数据统计** - 拜访统计和记录

## 🚀 快速开始

### 开发环境
```bash
# 安装依赖
npm install

# 启动前端
npm run dev

# 启动后端
cd backend && npm install && npm run dev
```

### Docker 部署
```bash
# 一键启动
docker-compose up -d

# 访问应用
open http://localhost
```

## 🛠 技术栈

- **前端**: React + TypeScript + Tailwind CSS
- **后端**: Node.js + Express + Prisma
- **数据库**: PostgreSQL
- **部署**: Docker + Docker Compose
- **地图**: 高德地图 + 多服务备用

## 📚 文档

- [API 文档](docs/backend/API_ROUTES_GUIDE.md)
- [Docker 部署](docs/deployment/DOCKER_DEPLOYMENT_GUIDE.md)
- [地图功能](docs/frontend/MAP_DISPLAY_FIX.md)

## 🔧 环境要求

- Node.js 18+
- PostgreSQL 14+
- Docker (可选)

## 📱 功能截图

### 主要页面
- 客户列表和详情
- 拜访计划日历
- 签到地图显示
- 数据统计面板

## 🤝 贡献

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License