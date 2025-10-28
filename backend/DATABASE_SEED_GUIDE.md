# 数据库种子数据指南

## 📋 概述

本指南说明如何初始化数据库的基础数据，包括默认管理员账号和测试数据。

## 🌱 种子数据内容

### 1. 管理员用户
- **邮箱**: `admin@example.com`
- **密码**: `admin123456`
- **角色**: `ADMIN`
- **姓名**: 系统管理员

### 2. 测试用户
- **邮箱**: `user@example.com`
- **密码**: `user123456`
- **角色**: `USER`
- **姓名**: 测试用户

### 3. 测试客户
- **名称**: 测试客户
- **电话**: 13800138000
- **地址**: 上海市浦东新区世纪大道1000号
- **坐标**: 31.2304, 121.4737

### 4. 测试拜访计划
- **客户**: 借助测试客户
- **计划日期**: 明天
- **状态**: PENDING

### 5. 测试文章
- **标题**: 欢迎使用拜访管理系统
- **内容**: 系统功能介绍

## 🚀 使用方法

### 方式 1: 使用 npm script（推荐）

```bash
cd backend
npm run prisma:seed
```

### 方式 2: 直接运行

```bash
cd backend
npx tsx prisma/seed.ts
```

### 方式 3: 与迁移一起运行

```bash
cd backend
npx prisma migrate dev
# Prisma 会自动运行 seed（如果配置了）
```

## ⚠️ 重要注意事项

### 1. 幂等性保护

种子脚本包含检查逻辑，如果管理员用户已存在，将跳过整个种子过程，避免重复插入数据。

### 2. 密码安全

⚠️ **默认密码仅用于开发环境！**

生产环境中：
1. 必须修改默认密码
2. 建议删除测试用户
3. 使用强密码策略

### 3. 数据清理

如果需要重新运行种子：

```bash
# 方式 A: 重置数据库（会删除所有数据）
npx prisma migrate reset

# 方式 B: 手动删除用户后重新运行
# 在 Prisma Studio 或数据库中删除用户，然后：
npm run prisma:seed
```

## 📝 自定义种子数据

编辑 `backend/prisma/seed.ts` 文件来自定义初始数据：

```typescript
// 修改默认邮箱
const admin = await prisma.user.create({
  data: {
    email: 'your-admin@example.com',  // 修改这里
    password: hashedPassword,
    name: 'Your Name',                // 修改这里
    role: 'ADMIN',
  },
});

// 修改默认密码
const hashedPassword = await bcrypt.hash('your-password', 10);  // 修改这里
```

## 🔍 验证种子数据

### 方式 1: 使用 Prisma Studio

```bash
npm run prisma:studio
```

打开浏览器访问 `http://localhost:5555`，查看所有表和数据。

### 方式 2: 使用 SQL 查询

```sql
-- 查看用户
SELECT id, email, name, role, created_at FROM users;

-- 查看客户
SELECT id, name, phone, created_by FROM customers;

-- 查看拜访计划
SELECT id, customer_id, planned_date, status FROM visit_plans;
五位
```

### 方式 3: 测试登录

```bash
# 测试管理员登录
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123456"}'

# 测试普通用户登录
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123456"}'
```

## 📊 预期输出

成功运行后，你应该看到类似输出：

```
🌱 Starting database seeding...
✅ Created admin user: admin@example.com
   - Email: admin@example.com
   - Password: admin123456
   - Role: ADMIN

✅ Created test user: user@example.com
   - Email: user@example.com
   - Password: user123456
   - Role: USER

✅ Created test customer: 测试客户

✅ Created test visit plan: uuid

✅ Created test article: 欢迎使用拜访管理系统

🎉 Database seeding completed successfully!

📋 初始用户账号：
   管理员：admin@example.com / admin123456
   测试用户：user@example.com / user123456

⚠️  请在生产环境中立即修改这些默认密码！
```

## 🐛 常见问题

### Q: 种子脚本报错 "Module not found"

A: 确保已安装依赖：
```bash
cd backend
npm install
```

### Q: 数据库连接失败

A: 检查 `backend/.env` 文件中的 `DATABASE_URL` 是否正确配置。

### Q: 提示用户已存在

A: 这是正常的幂等性保护。如果需要重新运行，请先删除现有数据或重置数据库。

### Q: 密码验证失败

A: 确保密码完全匹配（包括大小写）：
- admin 密码: `admin123456`
- user 密码: `user123456`

## 📚 相关文档

- `MIGRATION_GUIDE.md` - 数据库迁移指南
- `API_DOCUMENTATION.md` - API 接口文档
- `README.md` - 项目整体说明

## 🎯 下一步

1. ✅ 运行数据库迁移
2. ✅ 运行种子脚本
3. ⏳ 测试登录功能
4. ⏳ 开始开发

