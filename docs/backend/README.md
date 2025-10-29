# ⚙️ 后端 API

## 🚀 快速开始

```bash
cd backend
npm install
npm run dev
```

## 📋 API 接口

详细接口文档：[API_ROUTES_GUIDE.md](API_ROUTES_GUIDE.md)

### 主要路由
- `/api/auth` - 认证相关
- `/api/customers` - 客户管理
- `/api/visit-plans` - 拜访计划
- `/api/visit-reports` - 拜访报告
- `/api/articles` - 文章管理
- `/api/invitations` - 邀请管理

## 🗄️ 数据库

**技术栈**: PostgreSQL + Prisma

**快速参考**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

### 主要表结构
- `users` - 用户信息
- `customers` - 客户信息
- `visit_plans` - 拜访计划
- `visit_reports` - 拜访报告
- `articles` - 文章内容
- `invitations` - 邀请记录

## 🔐 认证

- JWT Token 认证
- 密码加密存储
- 邀请制注册