# 客户拜访管理系统

一个基于 **React + TypeScript + Express + Prisma** 的全栈客户拜访管理系统，支持客户管理、拜访计划、签到打卡、报告记录等功能。

## 🚀 功能特性

### 核心功能
- **用户认证**: 邀请制注册、邮箱密码登录、JWT 令牌认证
- **客户管理**: 添加、查看、编辑、删除客户信息
- **拜访计划**: 创建和管理拜访计划，支持日历视图
- **签到打卡**: GPS定位 + 拍照签到
- **拜访报告**: 记录拜访详情和客户反馈
- **文章管理**: 发布和管理文章内容
- **数据统计**: 拜访统计和记录查看

### 技术特性
- 📱 移动端优先设计
- 🎨 现代化UI界面
- 🔄 RESTful API
- 📍 GPS定位支持
- 📷 相机拍照功能
- 🔐 JWT 认证
- 👥 基于角色的权限控制

## 🛠 技术栈

### 前端
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Lucide React** - 图标库
- **Axios** - HTTP 客户端

### 后端
- **Node.js** - 运行时
- **Express** - Web 框架
- **TypeScript** - 类型安全
- **Prisma** - ORM 和数据库管理
- **PostgreSQL** - 数据库
- **bcrypt** - 密码加密
- **JWT** - 认证令牌
- **Zod** - 数据验证

## 📁 项目结构

```
project 2/
├── backend/                 # 后端应用
│   ├── src/
│   │   ├── index.ts        # 应用入口
│   │   ├── routes/         # API 路由
│   │   │   ├── auth.ts     # 认证路由
│   │   │   ├── customers.ts
│   │   │   ├── visitPlans.ts
│   │   │   ├── visitReports.ts
│   │   │   ├── articles.ts
│   │   │   └── invitations.ts
│   │   └── middleware/     # 中间件
│   ├── prisma/
│   │   └── schema.prisma   # 数据库模型
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── src/                     # 前端应用
│   ├── pages/              # 页面组件
│   ├── components/         # 共用组件
│   ├── lib/               # 工具库
│   │   └── api.ts         # API 客户端
│   └── main.tsx
├── package.json
└── README.md
```

## 📋 数据库设计

### 数据表结构

#### 1. users (用户表)
```sql
- id: uuid (主键)
- email: string (邮箱，唯一)
- password: string (加密密码)
- name: string (姓名)
- role: enum (ADMIN | MANAGER | USER)
- created_at: timestamp
- updated_at: timestamp
```

#### 2. invitations (邀请表)
```sql
- id: uuid (主键)
- email: string (被邀请人邮箱)
- token: string (邀请令牌，唯一)
- role: enum (权限级别)
- invited_by: uuid (邀请人)
- accepted_at: timestamp (接受时间)
- created_at: timestamp
- expires_at: timestamp (过期时间，默认7天)
```

#### 3. customers (客户表)
```sql
- id: uuid (主键)
- name: string (客户姓名)
- phone: string (联系电话)
- address: string (客户地址)
- latitude: decimal (纬度)
- longitude: decimal (经度)
- notes: text (备注)
- created_by: uuid (创建人)
- created_at: timestamp
- updated_at: timestamp
```

#### 4. visit_plans (拜访计划表)
```sql
- id: uuid (主键)
- customer_id: uuid (客户ID)
- planned_date: date (计划日期)
- status: enum (PENDING | CHECKED_IN | COMPLETED | CANCELLED)
- check_in_time: timestamp (签到时间)
- check_in_latitude: decimal (签到纬度)
- check_in_longitude: decimal (签到经度)
- check_in_photo_url: string (签到照片)
- check_in_notes: text (签到备注)
- check_out_time: timestamp (签退时间)
- created_by: uuid (创建人)
- created_at: timestamp
- updated_at: timestamp
```

#### 5. visit_reports (拜访报告表)
```sql
- id: uuid (主键)
- visit_plan_id: uuid (拜访计划ID)
- customer_id: uuid (客户ID)
- start_time: timestamp (开始时间)
- end_time: timestamp (结束时间)
- communication_points: text (沟通要点)
- customer_feedback: text (客户反馈)
- follow_up_tasks: text (后续任务)
- attachments: json (附件数组)
- created_by: uuid (创建人)
- created_at: timestamp
- updated_at: timestamp
```

#### 6. articles (文章表)
```sql
- id: uuid (主键)
- title: string (标题)
- content: text (内容)
- created_by: uuid (创建人)
- created_at: timestamp
- updated_at: timestamp
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- PostgreSQL >= 14
- npm 或 yarn

### 后端设置

1. **进入后端目录**
```bash
cd backend
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
创建 `.env` 文件：
```env
DATABASE_URL="postgresql://user:password@localhost:5432/visit_management?schema=public"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

4. **初始化数据库**
```bash
# 生成 Prisma Client
npm run prisma:generate

# 运行数据库迁移
npm run prisma:migrate

# (可选) 填充测试数据
npm run prisma:seed
```

5. **启动后端服务**
```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

后端服务将运行在 http://localhost:3001

### 前端设置

1. **安装依赖**
```bash
npm install
```

2. **配置 API 地址**
创建或更新 `.env` 文件：
```env
VITE_API_URL=http://localhost:3001
```

3. **启动开发服务器**
```bash
npm run dev
```

前端应用将运行在 http://localhost:5173

## 📡 API 文档

### 认证 API

#### POST /api/auth/login
登录
```json
// Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER"
  }
}
```

#### POST /api/auth/register
注册（需要邀请令牌）
```json
// Request
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "invitationToken": "invitation-token"
}
```

#### GET /api/auth/me
获取当前用户信息
```
Headers: Authorization: Bearer <token>
```

### 客户 API

#### GET /api/customers
获取所有客户
```
Headers: Authorization: Bearer <token>
```

#### POST /api/customers
创建客户
```json
// Request
{
  "name": "Company Name",
  "phone": "13800138000",
  "address": "Address",
  "latitude": 39.9042,
  "longitude": 116.4074,
  "notes": "Notes"
}
```

#### PUT /api/customers/:id
更新客户

#### DELETE /api/customers/:id
删除客户

### 拜访计划 API

#### GET /api/visit-plans
获取拜访计划
```
Query params:
- date: 日期 (YYYY-MM-DD)
- month: 月份 (YYYY-MM)
```

#### POST /api/visit-plans
创建拜访计划
```json
// Request
{
  "customerId": "customer-uuid",
  "plannedDate": "2024-01-15"
}
```

#### PUT /api/visit-plans/:id
更新拜访计划

#### DELETE /api/visit-plans/:id
删除拜访计划

#### POST /api/visit-plans/:id/check-in
签到
```json
// Request
{
  "latitude": 39.9042,
  "longitude": 116.4074,
  "photoUrl": "https://...",
  "notes": "Notes"
}
```

### 拜访报告 API

#### GET /api/visit-reports
获取拜访报告

#### POST /api/visit-reports
创建拜访报告
```json
// Request
{
  "visitPlanId": "uuid",
  "customerId": "uuid",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z",
  "communicationPoints": "Points",
  "customerFeedback": "Feedback",
  "followUpTasks": "Tasks",
  "attachments": []
}
```

### 文章 API

#### GET /api/articles
获取所有文章

#### POST /api/articles
创建文章
```json
// Request
{
  "title": "Article Title",
  "content": "Article Content"
}
```

#### PUT /api/articles/:id
更新文章

#### DELETE /api/articles/:id
删除文章

### 邀请 API

#### GET /api/invitations
获取所有邀请（仅管理员）

#### POST /api/invitations
创建邀请
```json
// Request
{
  "email": "user@example.com",
  "role": "USER"
}
```

#### GET /api/invitations/verify/:token
验证邀请令牌

#### DELETE /api/invitations/:id
删除邀请

## 🔐 认证机制

### JWT Token

所有需要认证的 API 请求都需要在请求头中包含 JWT token：
```
Authorization: Bearer <token>
```

### 角色权限

- **ADMIN**: 超级管理员，可以管理所有数据
- **MANAGER**: 经理，可以查看和管理拜访记录
- **USER**: 普通用户，只能查看和管理自己的数据

## 🧪 测试

### 后端测试
```bash
cd backend
npm test
```

### 前端测试
```bash
npm test
```

## 📝 开发指南

### 代码规范
- 使用 ESLint 进行代码检查
- 遵循 TypeScript 最佳实践
- 使用 Prettier 格式化代码

### Git 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具链
```

## 🚢 部署

### 后端部署

1. 构建项目
```bash
cd backend
npm run build
```

2. 设置环境变量

3. 运行迁移
```bash
npx prisma migrate deploy
```

4. 启动服务
```bash
npm start
```

### 前端部署

1. 构建项目
```bash
npm run build
```

2. 部署到静态托管服务（Vercel, Netlify 等）

## 📄 许可证

MIT

## 👥 贡献者

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题，请通过 GitHub Issues 联系。
