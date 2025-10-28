# 🚀 快速参考

## 常用命令

```bash
# 生成 Prisma Client
npm run prisma:generate

# 创建并应用迁移
npm run prisma:migrate

# 启动开发服务器
npm run dev

# 查看数据库（Prisma Studio）
npm run prisma:studio
```

## 环境变量

```env
# backend/.env
DATABASE_URL="postgresql://user:password@localhost:5432/visitdb"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

## API 端点速查

### 认证
- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册
- `GET /api/auth/me` - 获取当前用户

### 客户
- `GET /api/customers` - 获取列表
- `GET /api/customers/:id` - 获取详情
- `POST /api/customers` - 创建
- `PUT /api/customers/:id` - 更新
- `DELETE /api/customers/:id` - 删除

### 拜访计划
- `GET /api/visit-plans` - 获取列表（支持 ?date=YYYY-MM-DD 或 ?month=YYYY-MM）
- `GET /api/visit-plans/:id` - 获取详情
- `POST /api/visit-plans` - 创建
- `PUT /api/visit-plans/:id` - 更新
- `DELETE /api/visit-plans/:id` - 删除
- `POST /api/visit-plans/:id/check-in` - 签到

### 拜访报告
- `GET /api/visit-reports` - 获取列表
- `GET /api/visit-reports/:id` - 获取详情
- `POST /api/visit-reports` - 创建
- `PUT /api/visit-reports/:id` - 更新
- `DELETE /api/visit-reports/:id` - 删除

### 文章
- `GET /api/articles` - 获取列表
- `GET /api/articles/:id` - 获取详情
- `POST /api/articles` - 创建
- `PUT /api/articles/:id` - 更新
- `DELETE /api/articles/:id` - 删除

### 邀请（需管理员）
- `GET /api/invitations` - 获取列表
- `GET /api/invitations/verify/:token` - 验证令牌
- `POST /api/invitations` - 创建
- `DELETE /api/invitations/:id` - 删除

## 请求头

```javascript
// 认证请求
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

## 响应格式

### 成功
```json
{
  "id": "uuid",
  // ... data
}
```

### 错误
```json
{
  "error": "Error message"
}
```

## 状态码

- `200` - 成功
- `400` - 请求错误
- `401` - 未授权
- `403` - 禁止访问
- `404` - 未找到
- `500` - 服务器错误

## 数据类型

### VisitStatus
- `PENDING`
- `CHECKED_IN`
- `COMPLETED`
- `CANCELLED`

### Role
- `ADMIN`
- `MANAGER`
- `USER`

## 数据库表

- `users` - 用户
- `invitations` - 邀请
- `customers` - 客户
- `visit_plans` - 拜访计划
- `visit_reports` - 拜访报告
- `articles` - 文章

## 常用查询

```typescript
// 获取当前用户的客户
const customers = await prisma.customer.findMany({
  where: { createdBy: req.userId! }
});

// 获取特定日期的拜访计划
const plans = await prisma.visitPlan.findMany({
  where: { plannedDate: new Date('2024-01-15') }
});

// 获取用户的拜访报告
const reports = await prisma.visitReport.findMany({
  where: { createdBy: req.userId! },
  include: { customer: true, visitPlan: true }
});
```

## 开发流程

1. 修改 `prisma/schema.prisma`
2. 运行 `npm run prisma:migrate`
3. 更新 API 路由
4. 测试接口
5. 更新前端

