# 从 Supabase 迁移到 Express + Prisma 指南

## 概述

本指南将帮助您将应用从 Supabase 完全迁移到使用 Express + Prisma + PostgreSQL 的后端架构。

## 已完成的工作

### 1. ✅ 后端基础设施
- ✅ 创建 `backend/` 项目结构
- ✅ Prisma schema 定义（`backend/prisma/schema.prisma`）
- ✅ Express 应用入口（`backend/src/index.ts`）
- ✅ 认证中间件（`backend/src/middleware/auth.ts`）
- ✅ 认证路由（`backend/src/routes/auth.ts`）
- ✅ 更新 README.md

### 2. ✅ 前端更新
- ✅ 更新 `package.json`（移除 Supabase，添加 axios）
- ✅ 创建 API 客户端（`src/lib/api.ts`）
- ✅ 创建 API 路由指南（`backend/API_ROUTES_GUIDE.md`）

## 待完成的工作

### 1. 完成后端 API Routes

需要在 `backend/src/routes/` 目录下创建以下路由文件（参考 `API_ROUTES_GUIDE.md`）：

- `customers.ts` - 客户管理
- `visitPlans.ts` - 拜访计划
- `visitReports.ts` - 拜访报告
- `articles.ts` - 文章管理
- `invitations.ts` - 邀请管理

### 2. 更新前端页面组件

需要更新以下文件，将 Supabase 调用替换为 API 调用：

- `src/pages/LoginPage.tsx` - 使用 `authApi`
- `src/pages/CustomersPage.tsx` - 使用 `customersApi`
- `src/pages/PlansPage.tsx` - 使用 `visitPlansApi`
- `src/pages/ArticlesPage.tsx` - 使用 `articlesApi`
- `src/pages/ProfilePage.tsx` - 更新数据源

### 3. 数据库迁移

1. 创建 PostgreSQL 数据库
2. 配置 `backend/.env` 文件
3. 运行 Prisma 迁移：

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

## 快速启动步骤

### 1. 后端设置

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 创建 .env 文件
cat > .env << EOF
DATABASE_URL="postgresql://user:password@localhost:5432/visit_management?schema=public"
JWT_SECRET="your-secret-key-change-this"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
EOF

# 初始化数据库
npm run prisma:generate
npm run prisma:migrate

# 启动服务
npm run dev
```

### 2. 前端设置

```bash
# 安装新依赖
npm install

# 创建 .env 文件
cat > .env << EOF
VITE_API_URL=http://localhost:3001/api
EOF

# 启动开发服务器
npm run dev
```

## API 使用示例

### 认证

```typescript
import { authApi } from './lib/api';

// 登录
const response = await authApi.login('user@example.com', 'password');
// 响应包含 token 和 user 信息

// 获取当前用户
const user = await authApi.getMe();

// 登出
authApi.logout();
```

### 客户管理

```typescript
import { customersApi } from './lib/api';

// 获取所有客户
const customers = await customersApi.getAll();

// 创建客户
const customer = await customersApi.create({
  name: 'Company Name',
  explanation phone: '13800138000',
  address: 'Address',
  notes: 'Notes',
});

// 更新客户
await customersApi.update(customerId, { name: 'New Name' });

// 删除客户
await customersApi.delete(customerId);
```

### 拜访计划

```typescript
import { visitPlansApi } from './lib/api';

// 获取今天的拜访计划
const plans = await visitPlansApi.getAll({ date: '2024-01-15' });

// 签到
await visitPlansApi.checkIn(planId, {
  latitude: 39.9042,
  longitude: 116.4074,
  photoUrl: 'https://...',
  notes: 'Notes',
});
```

## 主要变化

### 1. 认证机制
- **之前**: Supabase Auth + Session
- **现在**: JWT Token + localStorage

### 2. 数据查询
- **之前**: `supabase.from('table').select()`
- **现在**: `api.get('/api/table')`

### 3. 数据修改
- **之前**: `supabase.from('table').insert()`
- **现在**: `api.post('/api/table', data)`

### 4. 实时更新
- **之前**: Supabase Realtime
- **现在**: 需要手动刷新或实现 WebSocket

## 注意事项

1. **CORS 配置**: 确保后端允许前端域名访问
2. **Token 存储**: 使用 localStorage 存储 JWT token
3. **Token 过期**: 需要实现 token 刷新机制
4. **错误处理**: API 返回错误需要在前端适当处理
5. **文件上传**: 照片上传需要单独处理（建议使用云存储）

## 测试建议

1. 测试所有认证流程（登录、注册、登出）
2. 测试 CRUD 操作（创建、读取、更新、删除）
3. 测试权限控制
4. 测试错误处理

## 后续优化

1. 添加请求重试机制
2. 实现 token 自动刷新
3. 添加请求/响应日志
4. 实现请求防重复提交
5. 添加数据缓存

## 需要帮助？

如果遇到问题，请查看：
- `backend/API_ROUTES_GUIDE.md` - API 路由实现指南
- `README.md` - 完整文档
- `backend/prisma/schema.prisma` - 数据库结构

